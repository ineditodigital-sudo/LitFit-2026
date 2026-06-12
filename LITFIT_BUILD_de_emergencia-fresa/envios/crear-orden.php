<?php
/**
 * 📦 CREAR ORDEN (Frontend Success Page Handler)
 * Adaptado para usar el orquestador central (LITFIT)
 */
require_once __DIR__ . '/order-helper.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

$input = json_decode(file_get_contents('php://input'), true);
if (!$input || !isset($input['orderId'])) {
    exit(json_encode(['success' => false, 'message' => 'Sin datos']));
}

$orderId = $input['orderId'];

// Usar el orquestador central que maneja DB, Emails y Envíos
$result = order_process_complete($orderId);

echo json_encode($result);
?>