<?php
/**
 * RECONEXIÓN FINAL LITFIT (V55)
 * Ajustamos los headers para eliminar el error 401.
 */

define('ENVIOS_CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_BASE', 'https://app.enviosinternacionales.com/api/v1');

$origin = $_SERVER['HTTP_ORIGIN'] ?? '*';
header("Access-Control-Allow-Origin: $origin");
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input) exit(json_encode(['success' => false, 'message' => 'Sin datos']));

$orderId = $input['orderId'];
$items = $input['items'];
$formData = $input['formData'];
$total = $input['total'];
$shippingOption = $input['shippingOption'] ?? null;

// 🔐 OBTENER TOKEN (FORMATO ESTRICTO)
function obtenerToken() {
    $ch = curl_init(ENVIOS_API_BASE . '/oauth/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'client_credentials', 'client_id' => ENVIOS_CLIENT_ID, 'client_secret' => ENVIOS_CLIENT_SECRET
    ]));
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res['access_token'] ?? false;
}

// 📦 PREPARAR DATOS
$productosTexto = '';
$peso = 0.5;
foreach ($items as $it) {
    $productosTexto .= "• " . $it['name'] . " x" . ($it['quantity'] ?? 1) . " ";
    $n = strtolower($it['name']);
    if (strpos($n, 'prote') !== false) $peso += 1.2;
}

$shipmentData = [
    'order' => [
        'reference' => $orderId,
        'payment_status' => 'paid',
        'total_price' => strval($total),
        'carrier' => $shippingOption['carrier'] ?? 'FEDEX',
        'service' => $shippingOption['service'] ?? 'EXPRESS',
        'rate_id' => $shippingOption['id'] ?? null,
        'parcels' => [[
            'weight' => min($peso, 30), 'length' => 30, 'width' => 20, 'height' => 15, 'quantity' => 1,
            'consignment_note' => substr("LITFIT - $productosTexto", 0, 100)
        ]],
        'shipper_address' => [
            'address' => 'Cedro 305', 'city' => 'Aguascalientes', 'state' => 'Aguascalientes', 'postal_code' => '20020',
            'country' => 'MX', 'person_name' => 'LITFIT Admin', 'phone' => '4491952361', 'email' => 'mmedellin_89@hotmail.com'
        ],
        'recipient_address' => [
            'address' => $formData['street'] ?? '', 'reference' => $formData['notes'] ?? '', 'sector' => $formData['colonia'] ?? '',
            'city' => $formData['city'] ?? '', 'state' => $formData['state'] ?? '', 'postal_code' => $formData['zipCode'] ?? '',
            'country' => 'MX', 'person_name' => ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''), 'phone' => $formData['phone'] ?? '', 'email' => $formData['email'] ?? ''
        ]
    ]
];

$tok = obtenerToken();
if (!$tok) exit(json_encode(['success' => true, 'message' => 'Fallo Auth', 'orderId' => $orderId, 'method' => 'email_fallback']));

// 🚀 CREAR ENVÍO
$ch = curl_init(ENVIOS_API_BASE . '/orders');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    "Authorization: Bearer $tok"
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($shipmentData));
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200 || $httpCode === 201) {
    $res = json_decode($response, true);
    // 💾 GUARDAR DETALLE PARA EL DASHBOARD
    $jsonDir = __DIR__ . '/pedidos-json';
    if (!is_dir($jsonDir)) @mkdir($jsonDir, 0777, true);
    file_put_contents($jsonDir . '/' . $orderId . '.json', json_encode($input));
    
    echo json_encode(['success' => true, 'message' => 'Envío OK', 'orderId' => $orderId, 'shipmentId' => $res['id'] ?? null, 'trackingNumber' => $res['tracking_number'] ?? null]);
} else {
    // 📧 AVISAR ERROR
    mail('ricoro845@gmail.com', "⚠️ Error Envió Litfit #$orderId", "Error: $httpCode\nDatos: $response", 'From: noreply@litfit.inedito.digital');
    echo json_encode(['success' => true, 'message' => "Error API: $httpCode", 'orderId' => $orderId, 'method' => 'email_fallback']);
}