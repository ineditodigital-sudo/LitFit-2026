<?php
/**
 * REPROCESAR PEDIDO - LITFIT
 * Permite generar la guía manualmente desde el panel de admin
 */
require_once __DIR__ . '/admin-config.php';
require_once __DIR__ . '/order-helper.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

$input = file_get_contents('php://input');
$data  = json_decode($input, true);
$orderId = $data['orderId'] ?? null;

if (!$orderId) {
    echo json_encode(['success' => false, 'message' => 'Falta el ID del pedido']);
    exit;
}

// Intentar generar la guía usando el helper que ya tenemos
$result = shipping_create_externally($orderId);

if ($result) {
    echo json_encode([
        'success' => true, 
        'message' => 'Guía generada exitosamente. El panel se actualizará en unos segundos.'
    ]);
} else {
    echo json_encode([
        'success' => false, 
        'message' => 'No se pudo generar la guía. Revisa el archivo debug-envios.log para ver el error de la API.'
    ]);
}
?>
