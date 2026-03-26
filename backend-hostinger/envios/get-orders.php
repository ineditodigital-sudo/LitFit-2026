<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

$pdo = getDbConnection();

try {
    // Solo mostramos pedidos que NO estén en PENDING (porque el pago no se completó)
    $stmt = $pdo->query("SELECT status, order_data FROM orders WHERE status != 'PENDING' ORDER BY created_at DESC");
    $orders = [];
    
    while ($row = $stmt->fetch()) {
        $orderData = json_decode($row['order_data'], true);
        // Sincronizar el estado real de la BD con el objeto que verá el administrador
        $orderData['status'] = $row['status'];
        $orders[] = $orderData;
    }
    
    echo json_encode($orders);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
?>
