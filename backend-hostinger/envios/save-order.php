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

    echo json_encode(['success' => true, 'message' => 'Pedido guardado en MySQL', 'id' => $orderId]);
} catch (PDOException $e) {
    http_response_code(500);
    echo json_encode(['success' => false, 'message' => 'Error BD: ' . $e->getMessage()]);
}
?>
