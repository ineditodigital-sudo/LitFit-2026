<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$input = file_get_contents('php://input');
$data = json_decode($input, true);

if (!$data || !isset($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos de pedido inválidos']);
    exit;
}

$dir = __DIR__ . '/pedidos-json/';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
}

$filename = $dir . $data['orderId'] . '.json';

// Si ya existe, podríamos actualizarlo o ignorarlo.
// Aquí lo guardamos/reemplazamos para tener la versión más reciente (ej: cuando pasa de pendiente a pagado).
if (file_put_contents($filename, json_encode($data, JSON_PRETTY_PRINT))) {
    echo json_encode(['success' => true, 'message' => 'Pedido registrado correctamente', 'id' => $data['orderId']]);
} else {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error al guardar el pedido']);
}
