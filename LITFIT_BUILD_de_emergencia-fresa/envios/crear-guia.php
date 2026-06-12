<?php
// HEADERS CORS
if (isset($_SERVER['HTTP_ORIGIN'])) {
    header("Access-Control-Allow-Origin: {$_SERVER['HTTP_ORIGIN']}");
    header('Access-Control-Allow-Credentials: true');
    header('Access-Control-Max-Age: 86400');
}

if ($_SERVER['REQUEST_METHOD'] == 'OPTIONS') {
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_METHOD']))
        header("Access-Control-Allow-Methods: GET, POST, OPTIONS");
    if (isset($_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']))
        header("Access-Control-Allow-Headers: {$_SERVER['HTTP_ACCESS_CONTROL_REQUEST_HEADERS']}");
    exit(0);
}

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit(json_encode(['success' => false, 'error' => 'Metodo no permitido']));
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['order']) || !isset($data['shipping'])) {
    http_response_code(400);
    exit(json_encode(['success' => false, 'error' => 'Faltan datos requeridos']));
}

// Credenciales
$API_KEY = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
$SECRET_KEY = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';

$order = $data['order'];
$shipping = $data['shipping'];

// Preparar datos para crear la guia (ORIGEN: AGUASCALIENTES)
$shipmentData = [
    'origin' => [
        'name' => 'LITFIT',
        'company' => 'LITFIT',
        'email' => 'mmedellin_89@hotmail.com',
        'phone' => '4491952361',
        'street' => 'Cedro',
        'number' => '305',
        'district' => 'Circunvalación Nte',
        'city' => 'Aguascalientes',
        'state' => 'Aguascalientes',
        'country' => 'MX',
        'zip_code' => '20020'
    ],
    'destination' => [
        'name' => $order['formData']['firstName'] . ' ' . $order['formData']['lastName'],
        'email' => $order['formData']['email'] ?? '',
        'phone' => $order['formData']['phone'] ?? '',
        'street' => $order['formData']['street'] ?? '',
        'number' => 'S/N',
        'district' => $order['formData']['colonia'] ?? '',
        'city' => $order['formData']['city'] ?? '',
        'state' => $order['formData']['state'] ?? '',
        'country' => 'MX',
        'zip_code' => $order['formData']['zipCode']
    ],
    'parcel' => [
        'weight' => floatval($order['totalWeight'] ?? 1.5),
        'length' => 30,
        'width' => 20,
        'height' => 10,
        'distance_unit' => 'CM',
        'mass_unit' => 'KG'
    ],
    'carrier' => strtolower($shipping['carrier']),
    'service' => strtolower($shipping['service'])
];

// Llamar a la API
$ch = curl_init('https://api.enviosinternacionales.com/v1/shipments');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_POSTFIELDS => json_encode($shipmentData),
    CURLOPT_HTTPHEADER => [
        'Content-Type: application/json',
        'Authorization: Bearer ' . $API_KEY,
        'X-Secret-Key: ' . $SECRET_KEY
    ],
    CURLOPT_TIMEOUT => 30,
    CURLOPT_SSL_VERIFYPEER => true
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    http_response_code(500);
    exit(json_encode(['success' => false, 'error' => 'Error al crear guia', 'details' => $curlError]));
}

$apiResponse = json_decode($response, true);

if ($httpCode !== 200 && $httpCode !== 201) {
    http_response_code($httpCode);
    exit(json_encode(['success' => false, 'error' => 'Error al crear guia', 'response' => $apiResponse]));
}

echo json_encode([
    'success' => true,
    'trackingNumber' => $apiResponse['tracking_number'] ?? 'N/A',
    'label_url' => $apiResponse['label_url'] ?? null,
    'shipment_id' => $apiResponse['id'] ?? null,
    'carrier' => $apiResponse['carrier'] ?? $shipping['carrier']
]);
?>
