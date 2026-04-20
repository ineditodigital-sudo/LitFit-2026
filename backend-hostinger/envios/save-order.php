<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

$pdo = getDbConnection();

$input = file_get_contents('php://input');
$data  = json_decode($input, true);

if (!$data || !isset($data['orderId'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos de pedido inválidos.']);
    exit;
}

$orderId = $data['orderId'];
$customerName = ($data['formData']['firstName'] ?? '') . ' ' . ($data['formData']['lastName'] ?? '');
$customerEmail = $data['formData']['email'] ?? '';
$total = (float)($data['total'] ?? 0);
$status = $data['status'] ?? 'PENDING';

try {
    // 💾 RESPALDO EN DISCO (Paracaídas por si falla MySQL)
    $backupDir = __DIR__ . '/backups-pedidos';
    if (!is_dir($backupDir)) mkdir($backupDir, 0777, true);
    file_put_contents($backupDir . '/' . $orderId . '.json', json_encode($data, JSON_PRETTY_PRINT));

    $pdo = getDbConnection();
    // Usamos INSERT ON DUPLICATE KEY UPDATE para actualizar si ya existe (ej: de PENDING a PAID)
    $stmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_email, total, status, order_data) 
        VALUES (?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
        status = VALUES(status), 
        order_data = VALUES(order_data)");
    
    $stmt->execute([
        $orderId, 
        $customerName, 
        $customerEmail, 
        $total, 
        $status, 
        json_encode($data)
    ]);

    echo json_encode(['success' => true, 'message' => 'Pedido guardado con éxito', 'id' => $orderId]);
} catch (Exception $e) {
    // Si llegamos aquí, al menos el respaldo en disco ya se intentó guardar
    error_log("Error guardando en BD (pero intentamos respaldo): " . $e->getMessage());
    echo json_encode(['success' => true, 'message' => 'Pedido guardado (Respaldo en disco)', 'id' => $orderId, 'db_error' => $e->getMessage()]);
}
?>
