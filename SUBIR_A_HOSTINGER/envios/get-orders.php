<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

// Forzar cabecera JSON desde el inicio
header('Content-Type: application/json');

$pdo = getDbConnection();

try {
    // 1. Obtener de la Base de Datos
    // Intentamos obtener status y order_data (campos básicos)
    $stmt = $pdo->query("SELECT * FROM orders ORDER BY order_id DESC");
    $orders = [];
    $registeredIds = [];
    
    while ($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
        if (!empty($row['order_data'])) {
            $orderData = json_decode($row['order_data'], true);
            if ($orderData) {
                $orderData['status'] = $row['status'];
                $orderData['tracking_number'] = $row['tracking_number'];
                $orderData['label_url'] = $row['label_url'];
                $orders[] = $orderData;
                if (isset($orderData['orderId'])) {
                    $registeredIds[] = $orderData['orderId'];
                }
            }
        }
    }

    // 2. Obtener de Respaldos en Disco
    $backupDir = __DIR__ . '/backups-pedidos';
    if (is_dir($backupDir)) {
        $files = glob($backupDir . '/*.json');
        foreach ($files as $file) {
            $content = file_get_contents($file);
            $data = json_decode($content, true);
            if ($data && isset($data['orderId']) && !in_array($data['orderId'], $registeredIds)) {
                $orders[] = $data;
            }
        }
    }
    
    echo json_encode($orders);
} catch (Exception $e) {
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
?>
