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
    http_response_code(200);
    echo json_encode([
        'error' => 'JSON inválido recibido',
        'raw_input' => $rawInput
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
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
    http_response_code(200);
    echo json_encode([
        'error' => 'Error al obtener token',
        'http_code' => $authCode,
        'raw_response' => $authResponse
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}

$authData = json_decode($authResponse, true);
if (!isset($authData['access_token'])) {
    http_response_code(200);
    echo json_encode([
        'error' => 'No se recibió access_token',
        'raw_response' => $authResponse
    ], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
    exit;
}
$token = $authData['access_token'];

// 2️⃣ 🔍 SUPER DEBUG - Construir el body EXACTAMENTE como la API espera
// Según la documentación, intentemos diferentes estructuras

// Opción 1: Sin wrapper
$requestBody = [
    'order_id' => $input['order_id'],
    'address_from' => [
        'country_code' => $input['address_from']['country_code'],
        'postal_code' => $input['address_from']['postal_code'],
        'area_level1' => $input['address_from']['area_level1'],
        'area_level2' => $input['address_from']['area_level2'],
        'area_level3' => $input['address_from']['area_level3'],
        'address_line_1' => $input['address_from']['address_line_1'],
        'address_line_2' => $input['address_from']['address_line_2']
    ],
    'address_to' => [
        'country_code' => $input['address_to']['country_code'],
        'postal_code' => $input['address_to']['postal_code'],
        'area_level1' => $input['address_to']['area_level1'],
        'area_level2' => $input['address_to']['area_level2'],
        'area_level3' => $input['address_to']['area_level3'],
        'address_line_1' => $input['address_to']['address_line_1'],
        'address_line_2' => $input['address_to']['address_line_2']
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
];

$jsonBody = json_encode($requestBody, JSON_UNESCAPED_UNICODE);

// 🔍 Guardar para debug
$debugInfo = [
    'step' => '1-before-api-call',
    'received_from_frontend' => $input,
    'constructed_body' => $requestBody,
    'json_string' => $jsonBody,
    'json_length' => strlen($jsonBody),
    'token' => substr($token, 0, 20) . '...'
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
curl_setopt($ch, CURLOPT_POSTFIELDS, $jsonBody);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

// 🔍 Habilitar información de debug de cURL
curl_setopt($ch, CURLOPT_VERBOSE, true);
$verbose = fopen('php://temp', 'w+');
curl_setopt($ch, CURLOPT_STDERR, $verbose);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlInfo = curl_getinfo($ch);

// Leer verbose output
rewind($verbose);
$verboseLog = stream_get_contents($verbose);
fclose($verbose);

curl_close($ch);

// 🔍 Agregar info de la respuesta
$debugInfo['step'] = '2-after-api-call';
$debugInfo['api_http_code'] = $httpCode;
$debugInfo['api_raw_response'] = $response;
$debugInfo['api_parsed_response'] = json_decode($response, true);
$debugInfo['curl_info'] = $curlInfo;
$debugInfo['curl_verbose'] = $verboseLog;

http_response_code(200);
echo json_encode($debugInfo, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
