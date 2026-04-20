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
    header('Access-Control-Allow-Origin: https://litfitmexico.com');
}

header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// ⚠️ Credenciales de la API
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// Obtener el ID de la cotización desde la URL
$quotationId = $_GET['id'] ?? null;

if (!$quotationId) {
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Falta el parámetro id'
    ]);
    exit;
}

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

// 2️⃣ Consultar la cotización por ID (GET request)
$ch = curl_init('https://app.enviosinternacionales.com/api/v1/quotations/' . $quotationId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
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
        'raw_response' => $response
    ]);
    exit;
}

// Devolver la respuesta de la API
http_response_code($httpCode);
echo $response;
?>
