<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Leer el body
$rawInput = file_get_contents('php://input');
$input = json_decode($rawInput, true);

// Responder con lo que recibimos
http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'cotizar.php está funcionando',
    'received_data' => $input,
    'timestamp' => date('Y-m-d H:i:s')
], JSON_UNESCAPED_UNICODE);
?>
