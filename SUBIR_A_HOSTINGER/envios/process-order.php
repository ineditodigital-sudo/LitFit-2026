<?php
/**
 * ENDPOINT PARA PROCESAR PEDIDOS - LITFIT
 * Este archivo centraliza la lógica de post-pago (DB, Correos, Guía).
 * Es IDEMPOTENTE: solo se ejecuta una vez por orderId.
 */

require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();
require_once __DIR__ . '/order-helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data || !isset($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta orderId']);
    exit;
}

$orderId = $data['orderId'];

// Procesar usando el helper centralizado (maneja idempotencia internamente)
$result = order_process_complete($orderId);

echo json_encode($result);
