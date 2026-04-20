<?php
/**
 * ============================================
 * VERSIÓN QUE FUERZA TODOS LOS MÉTODOS DE PAGO
 * ============================================
 * 
 * Esta versión envía EXPLÍCITAMENTE payment_methods con arrays vacíos
 * para SOBRESCRIBIR la configuración de la aplicación en Mercado Pago
 */

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedDomains = [
    'https://litfit.inedito.digital',
    'figmaiframepreview.figma.site',
    'figma.site'
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
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("====== FORZANDO TODOS LOS MÉTODOS DE PAGO ======");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// ============================================
// CARGAR CONFIGURACIÓN
// ============================================

define('MP_CONFIG_LOADED', true);

$possiblePaths = [
    __DIR__ . '/mercadopago-config.php',
    __DIR__ . '/../../private/config/mercadopago-config.php',
    '/home/inedito/private/config/mercadopago-config.php',
    $_SERVER['DOCUMENT_ROOT'] . '/../private/config/mercadopago-config.php'
];

$configPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $configPath = $path;
        break;
    }
}

if (!$configPath) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Config no encontrado']);
    exit;
}

require_once $configPath;

// ============================================
// LEER DATOS
// ============================================

$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input || !isset($input['items']) || !isset($input['formData']) || !isset($input['total'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$items = $input['items'];
$formData = $input['formData'];
$total = floatval($input['total']);
$shippingCost = floatval($input['shippingCost'] ?? 0);
$orderId = $input['orderId'] ?? 'LITFIT-' . time();

error_log("📦 Pedido: " . $orderId . " | Total: $" . $total);

// ============================================
// PREPARAR ITEMS
// ============================================

$mpItems = [];

foreach ($items as $item) {
    $title = $item['name'];
    if (!empty($item['variant'])) {
        $title .= ' - ' . $item['variant'];
    }
    if (!empty($item['size'])) {
        $title .= ' (' . $item['size'] . ')';
    }

    $mpItems[] = [
        'title' => $title,
        'description' => $item['name'],
        'quantity' => intval($item['quantity']),
        'unit_price' => floatval($item['price']),
        'currency_id' => 'MXN'
    ];
}

if ($shippingCost > 0) {
    $mpItems[] = [
        'title' => 'Envío a domicilio',
        'description' => 'Costo de envío',
        'quantity' => 1,
        'unit_price' => floatval($shippingCost),
        'currency_id' => 'MXN'
    ];
}

// ============================================
// CREAR PREFERENCIA CON PAYMENT_METHODS EXPLÍCITO
// ============================================

// 🔥 SOLUCIÓN: Enviar payment_methods con arrays VACÍOS
// para SOBRESCRIBIR la configuración de la aplicación

$preferenceData = [
    'items' => $mpItems,
    
    'payer' => [
        'name' => $formData['firstName'] ?? '',
        'surname' => $formData['lastName'] ?? '',
        'email' => $formData['email'] ?? '',
        'phone' => [
            'number' => $formData['phone'] ?? ''
        ],
        'address' => [
            'street_name' => $formData['street'] ?? '',
            'street_number' => '',
            'zip_code' => $formData['zipCode'] ?? ''
        ]
    ],
    
    'back_urls' => [
        'success' => MP_SUCCESS_URL,
        'failure' => MP_FAILURE_URL,
        'pending' => MP_PENDING_URL
    ],
    
    'auto_return' => 'approved',
    'external_reference' => $orderId,
    'statement_descriptor' => 'LITFIT',
    'notification_url' => MP_WEBHOOK_URL,
    
    // 🔥 AQUÍ ESTÁ LA CLAVE: Sobrescribir la configuración de la app
    'payment_methods' => [
        'excluded_payment_methods' => [],  // Array VACÍO = permitir todos
        'excluded_payment_types' => [],    // Array VACÍO = permitir todos
        'installments' => null,
        'default_installments' => null
    ],
    
    'metadata' => [
        'order_id' => $orderId,
        'customer_name' => ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''),
        'customer_email' => $formData['email'] ?? '',
        'customer_phone' => $formData['phone'] ?? '',
        'shipping_address' => ($formData['street'] ?? '') . ', ' . 
                             ($formData['city'] ?? '') . ', ' . 
                             ($formData['state'] ?? '') . ', ' . 
                             ($formData['zipCode'] ?? '')
    ]
];

error_log("📤 Enviando preferencia con payment_methods EXPLÍCITO");
error_log("🔓 excluded_payment_methods: [] (vacío)");
error_log("🔓 excluded_payment_types: [] (vacío)");
error_log("📋 Datos: " . json_encode($preferenceData));

// ============================================
// ENVIAR A MERCADO PAGO
// ============================================

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

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

error_log("📥 Respuesta HTTP: " . $httpCode);
error_log("📥 Respuesta completa: " . $response);

if ($curlError) {
    error_log("❌ CURL Error: " . $curlError);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión con Mercado Pago',
        'error' => $curlError
    ]);
    exit;
}

$mpResponse = json_decode($response, true);

if (!$mpResponse) {
    error_log("❌ Error al decodificar JSON");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Respuesta inválida de Mercado Pago'
    ]);
    exit;
}

if ($httpCode !== 200 && $httpCode !== 201) {
    error_log("❌ Error HTTP " . $httpCode);
    error_log("Detalles: " . print_r($mpResponse, true));
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear preferencia',
        'error' => $mpResponse['message'] ?? 'Error desconocido',
        'details' => $mpResponse
    ]);
    exit;
}

if (!isset($mpResponse['init_point'])) {
    error_log("❌ No init_point");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo obtener URL de pago'
    ]);
    exit;
}

// ============================================
// VERIFICAR QUE SE APLICÓ CORRECTAMENTE
// ============================================

$checkoutUrl = $mpResponse['init_point'];
$preferenceId = $mpResponse['id'] ?? '';

error_log("✅ Preferencia creada: " . $preferenceId);
error_log("🔗 URL: " . $checkoutUrl);

// Verificar payment_methods en la respuesta
if (isset($mpResponse['payment_methods'])) {
    error_log("💳 Payment methods en respuesta:");
    error_log("  - excluded_payment_methods: " . json_encode($mpResponse['payment_methods']['excluded_payment_methods'] ?? []));
    error_log("  - excluded_payment_types: " . json_encode($mpResponse['payment_methods']['excluded_payment_types'] ?? []));
    
    // Verificar si están vacíos
    $excludedMethods = $mpResponse['payment_methods']['excluded_payment_methods'] ?? [];
    $excludedTypes = $mpResponse['payment_methods']['excluded_payment_types'] ?? [];
    
    if (empty($excludedMethods) && empty($excludedTypes)) {
        error_log("✅ PERFECTO: Todos los métodos están permitidos");
    } else {
        error_log("⚠️ ADVERTENCIA: Aún hay exclusiones");
    }
}

http_response_code(200);
echo json_encode([
    'success' => true,
    'checkoutUrl' => $checkoutUrl,
    'preferenceId' => $preferenceId,
    'orderId' => $orderId,
    'debug_payment_methods' => $mpResponse['payment_methods'] ?? null
]);

error_log("✅ Respuesta enviada");
?>
