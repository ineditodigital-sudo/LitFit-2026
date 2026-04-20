<?php
/**
 * ============================================
 * API DE MERCADO PAGO - CREAR PREFERENCIA DE PAGO
 * ============================================
 * UBICACIÓN EN HOSTINGER:
 * /public_html/mercadopago/create-preference.php
 *
 * URL PÚBLICA: https://tienda.litfitmexico.com/mercadopago/create-preference.php
 */

// Permitir acceso desde el nuevo dominio del cliente
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowedDomains = [
    'https://tienda.litfitmexico.com',
    'http://localhost:3000',
    'http://localhost:5173',
];

$isAllowed = false;
foreach ($allowedDomains as $domain) {
    if (strpos($origin, $domain) !== false) {
        $isAllowed = true;
        break;
    }
}

if ($isAllowed && $origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('log_errors', 1);

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido. Use POST.']);
    exit;
}

// Cargar configuración (en el mismo directorio)
define('MP_CONFIG_LOADED', true);
require_once __DIR__ . '/mercadopago-config.php';

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input || !isset($input['items']) || !isset($input['formData']) || !isset($input['total'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos o incompletos.']);
    exit;
}

$items        = $input['items'];
$formData     = $input['formData'];
$total        = floatval($input['total']);
$shippingCost = floatval($input['shippingCost'] ?? 0);
$orderId      = $input['orderId'] ?? 'LITFIT-' . time();

// Preparar items para Mercado Pago
$mpItems = [];
foreach ($items as $item) {
    $title = $item['name'];
    if (!empty($item['variant'])) $title .= ' - ' . $item['variant'];
    if (!empty($item['size']))    $title .= ' (' . $item['size'] . ')';

    $mpItems[] = [
        'title'      => $title,
        'description'=> $item['name'],
        'quantity'   => intval($item['quantity']),
        'unit_price' => floatval($item['price']),
        'currency_id'=> 'MXN'
    ];
}

if ($shippingCost > 0) {
    $mpItems[] = [
        'title'      => 'Envío a domicilio',
        'description'=> 'Costo de envío',
        'quantity'   => 1,
        'unit_price' => $shippingCost,
        'currency_id'=> 'MXN'
    ];
}

$preferenceData = [
    'items' => $mpItems,
    'payer' => [
        'name'    => $formData['firstName'] ?? '',
        'surname' => $formData['lastName']  ?? '',
        'email'   => $formData['email']     ?? '',
        'phone'   => ['number' => $formData['phone'] ?? ''],
        'address' => [
            'street_name'   => $formData['street']  ?? '',
            'street_number' => '',
            'zip_code'      => $formData['zipCode'] ?? ''
        ]
    ],
    'back_urls' => [
        'success' => MP_SUCCESS_URL,
        'failure' => MP_FAILURE_URL,
        'pending' => MP_PENDING_URL
    ],
    'auto_return'          => 'approved',
    'external_reference'   => $orderId,
    'statement_descriptor' => 'LITFIT',
    'notification_url'     => MP_WEBHOOK_URL,
    'payment_methods' => [
        'excluded_payment_methods' => [],
        'excluded_payment_types'   => []
    ],
    'metadata' => [
        'order_id'        => $orderId,
        'customer_name'   => trim(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? '')),
        'customer_email'  => $formData['email'] ?? '',
        'customer_phone'  => $formData['phone'] ?? '',
        'shipping_address'=> trim(($formData['street'] ?? '') . ', ' . ($formData['city'] ?? '') . ', ' . ($formData['state'] ?? '') . ' ' . ($formData['zipCode'] ?? ''))
    ]
];

$ch = curl_init(MP_API_URL . '/checkout/preferences');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . MP_ACCESS_TOKEN
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($preferenceData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, MP_TIMEOUT);

$response  = curl_exec($ch);
$httpCode  = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error de conexión con Mercado Pago', 'error' => $curlError]);
    exit;
}

$mpResponse = json_decode($response, true);

if (!$mpResponse || ($httpCode !== 200 && $httpCode !== 201)) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al crear preferencia', 'error' => $mpResponse['message'] ?? 'Error desconocido', 'status' => $httpCode]);
    exit;
}

if (empty($mpResponse['init_point'])) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'No se pudo obtener la URL de pago.']);
    exit;
}

http_response_code(200);
echo json_encode([
    'success'      => true,
    'checkoutUrl'  => $mpResponse['init_point'],
    'preferenceId' => $mpResponse['id'] ?? '',
    'orderId'      => $orderId
]);
?>
