<?php
/**
 * ============================================
 * ADMIN API - OBTENER URL DE GUÍAS (LABEL)
 * ============================================
 */

header('Access-Control-Allow-Origin: *');

header('Access-Control-Allow-Methods: GET');
header('Content-Type: application/json; charset=UTF-8');

define('ENVIOS_CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_BASE', 'https://app.enviosinternacionales.com/api/v1');

$order_id = $_GET['order_id'] ?? null;
if (!$order_id) {
    http_response_code(400);
    exit(json_encode(['error' => 'No se proporcionó order_id']));
}

function getAuthToken()
{
    $ch = curl_init(ENVIOS_API_BASE . "/oauth/token");
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        "grant_type" => "client_credentials",
        "client_id" => ENVIOS_CLIENT_ID,
        "client_secret" => ENVIOS_CLIENT_SECRET
    ]));
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res['access_token'] ?? false;
}

$token = getAuthToken();
if (!$token) {
    http_response_code(401);
    exit(json_encode(['error' => 'No se pudo autenticar con la API de envíos']));
}

// Obtener la URL de la guía
$ch = curl_init(ENVIOS_API_BASE . "/orders/" . $order_id . "/labels");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode === 200) {
    echo $response;
}
else {
    http_response_code($httpCode);
    echo json_encode(['error' => 'Error al obtener etiquetas de la API', 'api_response' => json_decode($response)]);
}
