<?php
header('Content-Type: application/json');

// CORS mejorado
$allowed_origins = [
    'https://litfitmexico.com',
    'https://www.litfitmexico.com',
    'https://litfit.inedito.digital'
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if (in_array($origin, $allowed_origins) || strpos($origin, '.figma.site') !== false || strpos($origin, 'makeproxy') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Leer el body enviado desde React
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'JSON inválido recibido'
    ]);
    exit;
}

// ⚠️ Credenciales de la API
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// 1️⃣ Pedir Bearer Token
$authBody = http_build_query([
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET,
    'grant_type' => 'client_credentials',
    'redirect_uri' => 'urn:ietf:wg:oauth:2.0:oob',
    'scope' => 'default'
]);

$ch = curl_init('https://app.enviosinternacionales.com/api/v1/oauth/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authBody);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$authResponse = curl_exec($ch);
$authCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($authCode !== 200) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener token'
    ]);
    exit;
}

$authData = json_decode($authResponse, true);
if (!isset($authData['access_token'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No se recibió access_token'
    ]);
    exit;
}
$token = $authData['access_token'];

// 2️⃣ ✅ WRAPPER "quotation" - La API espera esta estructura
$requestBody = [
    'quotation' => [
        'order_id' => $input['order_id'],
        'address_from' => [
            'country_code' => $input['address_from']['country_code'],
            'postal_code' => $input['address_from']['postal_code'],
            'area_level1' => $input['address_from']['area_level1'],
            'area_level2' => $input['address_from']['area_level2'],
            'area_level3' => $input['address_from']['area_level3'],
            'address_line_1' => $input['address_from']['address_line_1'] ?? '',
            'address_line_2' => $input['address_from']['address_line_2'] ?? ''
        ],
        'address_to' => [
            'country_code' => $input['address_to']['country_code'],
            'postal_code' => $input['address_to']['postal_code'],
            'area_level1' => $input['address_to']['area_level1'],
            'area_level2' => $input['address_to']['area_level2'],
            'area_level3' => $input['address_to']['area_level3'],
            'address_line_1' => $input['address_to']['address_line_1'] ?? '',
            'address_line_2' => $input['address_to']['address_line_2'] ?? ''
        ],
        'parcel' => [
            'length' => (float)$input['parcel']['length'],
            'width' => (float)$input['parcel']['width'],
            'height' => (float)$input['parcel']['height'],
            'weight' => (float)$input['parcel']['weight'],
            'package_protected' => (bool)$input['parcel']['package_protected'],
            'declared_value' => (float)$input['parcel']['declared_value']
        ],
        'requested_carriers' => $input['requested_carriers']
    ]
];

// 3️⃣ Llamar a la API
$ch = curl_init('https://app.enviosinternacionales.com/api/v1/quotations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody, JSON_UNESCAPED_UNICODE));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 && $httpCode !== 201) {
    http_response_code($httpCode);
    echo $response; // Devolver el error de la API tal cual
    exit;
}

// ✅ Éxito
http_response_code(200);
echo $response;
?>
