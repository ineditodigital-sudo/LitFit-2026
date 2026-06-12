<?php
require_once __DIR__ . '/admin-config.php';
require_once __DIR__ . '/order-helper.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

$input = file_get_contents('php://input');
$data  = json_decode($input, true);
$orderId = $data['orderId'] ?? '';

if (!$orderId) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'ID de orden requerido.']);
    exit;
}

// Ensure it's in DB
$pdo = getDbConnection();
$stmt = $pdo->prepare("SELECT status, order_data FROM orders WHERE order_id = ?");
$stmt->execute([$orderId]);
$row = $stmt->fetch();

if (!$row) {
    // Si no está en BD, no lo podemos reenviar a envíos internacionles porque order-helper lo busca allí.
    // Intentemos inyectarlo si está en backups
    $backupDir = __DIR__ . '/backups-pedidos';
    if (file_exists($backupDir . '/' . $orderId . '.json')) {
        $backupData = file_get_contents($backupDir . '/' . $orderId . '.json');
        $bData = json_decode($backupData, true);
        
        $customerName = trim(($bData['formData']['firstName'] ?? '') . ' ' . ($bData['formData']['lastName'] ?? ''));
        $customerEmail = $bData['formData']['email'] ?? '';
        $total = floatval($bData['total'] ?? 0);
        $status = $bData['status'] ?? 'PAID';

        $insStmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_email, total, status, order_data) VALUES (?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE status = VALUES(status)");
        $insStmt->execute([$orderId, $customerName, $customerEmail, $total, $status, $backupData]);
    } else {
        echo json_encode(['success' => false, 'message' => 'La orden no existe en la BD local.']);
        exit;
    }
}

// Ahora invocamos a Envíos Internacionales con nuestro archivo fijo
$result = shipping_create_externally($orderId);

if ($result) {
    // Retornamos los nuevos datos de la orden
    $stmt2 = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
    $stmt2->execute([$orderId]);
    $newRow = $stmt2->fetch();
    echo json_encode([
        'success' => true, 
        'message' => 'Guía generada exitosamente.',
        'order' => json_decode($newRow['order_data'], true)
    ]);
} else {
    echo json_encode(['success' => false, 'message' => 'Fallo al comunicarse con Envíos Internacionales. Revisa el archivo debug-envios.log.']);
}
?>
