<?php
/**
 * 🔄 ACTUALIZAR ESTADO DE PEDIDO
 * Utilizado por el Dashboard de Admin
 */
require_once __DIR__ . '/order-helper.php';

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

$pdo = getDbConnection();
$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data || !isset($data['orderId']) || !isset($data['status'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
    exit;
}

$orderId = $data['orderId'];
$newStatus = $data['status']; // Ejemplo: 'SHIPPED', 'CANCELLED', 'PAID'
$trackingNumber = $data['trackingNumber'] ?? '';
$carrier = $data['carrier'] ?? 'Estándar';

try {
    // 1. Actualizar en Base de Datos usando el helper
    $extraData = [];
    if ($trackingNumber) $extraData['trackingNumber'] = $trackingNumber;
    if ($carrier) $extraData['carrier'] = $carrier;
    
    $updated = db_update_order_status($orderId, $newStatus, $extraData);

    if (!$updated) {
        http_response_code(404);
        echo json_encode(['success' => false, 'message' => 'Pedido no encontrado']);
        exit;
    }

    // 2. Enviar correos según el nuevo estado usando el helper centralizado
    if ($newStatus === 'PAID') {
        // Si el admin lo marca como PAGADO manualmente, disparamos el flujo completo
        order_process_complete($orderId);
    } 
    elseif ($newStatus === 'CANCELLED') {
        email_send_cancellation($orderId);
    } 
    elseif ($newStatus === 'SHIPPED' && $trackingNumber) {
        email_send_shipping_update($orderId, $trackingNumber, $carrier);
    }

    echo json_encode(['success' => true, 'message' => 'Estado actualizado y correo enviado']);

} catch (Exception $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error: ' . $e->getMessage()]);
}
?>
