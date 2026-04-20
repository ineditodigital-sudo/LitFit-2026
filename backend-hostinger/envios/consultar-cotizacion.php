<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if (!isset($_GET['id'])) {
    http_response_code(400);
    echo json_encode(['error' => 'No ID provided']);
    exit;
}

$quotationId = urlencode($_GET['id']);

// Obtener Token
$ch = curl_init(ENVIOS_API_BASE . '/oauth/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
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
    echo json_encode(['error' => 'Auth error']);
    exit;
}

// Consultar Cotización
$ch = curl_init(ENVIOS_API_BASE . '/quotations/' . $quotationId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

http_response_code($httpCode);
echo $response;
