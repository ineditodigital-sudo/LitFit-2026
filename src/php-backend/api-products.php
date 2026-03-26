<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$file = __DIR__ . '/../data/products.json';

// Ensure the directory exists
if (!is_dir(dirname($file))) {
    mkdir(dirname($file), 0777, true);
}

// Ensure the file exists with an array if missing
if (!file_exists($file)) {
    file_put_contents($file, json_encode([]));
}

$method = $_SERVER['REQUEST_METHOD'];

switch ($method) {
    case 'GET':
        echo file_get_contents($file);
        break;

    case 'POST':
    case 'PUT':
        // Save full list (for simplicity in this admin)
        $data = file_get_contents('php://input');
        if (json_decode($data)) {
            if (file_put_contents($file, $data)) {
                echo json_encode(['success' => true, 'message' => 'Productos actualizados']);
            } else {
                http_response_code(500);
                echo json_encode(['success' => false, 'message' => 'Error al escribir el archivo']);
            }
        } else {
            http_response_code(400);
            echo json_encode(['success' => false, 'message' => 'JSON inválido']);
        }
        break;

    default:
        http_response_code(405);
        echo json_encode(['error' => 'Método no permitido']);
        break;
}
