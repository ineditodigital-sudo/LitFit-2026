<?php
header('Content-Type: application/json');

// CORS mejorado - permite producción Y Figma Make
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
        'message' => 'JSON inválido recibido',
        'raw_input' => $rawInput
    ]);
    exit;
}

// ⚠️ Credenciales de la API
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// 1️⃣ Pedir Bearer Token automáticamente
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
$authError = curl_error($ch);
curl_close($ch);

if ($authError || $authCode !== 200) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'Error al obtener token',
        'http_code' => $authCode,
        'raw_response' => $authResponse
    ]);
    exit;
}

$authData = json_decode($authResponse, true);
if (!isset($authData['access_token'])) {
    http_response_code(401);
    echo json_encode([
        'success' => false,
        'message' => 'No se recibió access_token válido',
        'raw_response' => $authResponse
    ]);
    exit;
}
$token = $authData['access_token'];

// 2️⃣ Usar Bearer Token para cotización
$requestBody = $input;

$ch = curl_init('https://app.enviosinternacionales.com/api/v1/quotations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody, JSON_UNESCAPED_UNICODE));
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$error = curl_error($ch);
curl_close($ch);

if ($error) {
    http_response_code(503);
    echo json_encode([
        'success' => false,
        'message' => 'Error al conectar con la API',
        'curl_error' => $error
    ]);
    exit;
}

// 🔍 DEVOLVER DEBUG INFO
$responseData = json_decode($response, true);

// Agregar información de debugging
$debugResponse = [
    'api_http_code' => $httpCode,
    'api_response' => $responseData,
    'sent_to_api' => $requestBody,
    'received_from_frontend' => $input,
    'token_obtained' => substr($token, 0, 20) . '...'
];

http_response_code(200); // Siempre 200 para que el frontend pueda leer la respuesta
echo json_encode($debugResponse, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT);
?>
