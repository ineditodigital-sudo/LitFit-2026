<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Obtener Bearer Token
$ch = curl_init(ENVIOS_API_BASE . '/oauth/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
    'client_id'     => ENVIOS_CLIENT_ID,
    'client_secret' => ENVIOS_CLIENT_SECRET,
    'grant_type'    => 'client_credentials'
]));
$authData = json_decode(curl_exec($ch), true);
curl_close($ch);
$token = $authData['access_token'] ?? '';

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Error de autenticación con API de envíos']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);

// Soporte para cotización directa o via 'destination'
$quotationData = isset($input['quotation']) ? $input['quotation'] : $input;

if (!isset($quotationData['address_to']) && isset($input['destination'])) {
    $quotationData['address_to'] = [
        'country_code'  => 'MX',
        'postal_code'   => $input['destination']['zipCode'],
        'area_level1'   => $input['destination']['state'],
        'area_level2'   => $input['destination']['city'],
        'area_level3'   => 'Centro',
        'address_line_1'=> 'Dirección de Entrega'
    ];
}

$requestBody = ['quotation' => $quotationData];

$ch = curl_init('https://app.enviosinternacionales.com/api/v1/quotations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
