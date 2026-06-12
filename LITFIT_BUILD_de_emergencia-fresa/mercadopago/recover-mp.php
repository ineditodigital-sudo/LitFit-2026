<?php
require_once __DIR__ . '/../envios/admin-config.php';
define('MP_CONFIG_LOADED', true);
require_once __DIR__ . '/mercadopago-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

header('Content-Type: application/json; charset=UTF-8');

$paymentId = $_GET['payment_id'] ?? '';
$paymentId = preg_replace('/\D/', '', $paymentId);

if (empty($paymentId)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Falta el payment_id en la solicitud']);
    exit;
}

$ch = curl_init(MP_API_URL . '/v1/payments/' . $paymentId);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Authorization: Bearer ' . MP_ACCESS_TOKEN,
    'Content-Type: application/json'
]);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200 || !$response) {
    http_response_code(404);
    echo json_encode(['success' => false, 'message' => 'No se encontró el pago en Mercado Pago o hubo un error.', 'httpCode' => $httpCode]);
    exit;
}

$payment = json_decode($response, true);

if (empty($payment['metadata'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'El pago existe, pero NO contiene datos de metadatos (no se generó desde esta web).', 'payment' => $payment]);
    exit;
}

// Reconstruir el objeto de orden tal como lo espera el frontend
$meta = $payment['metadata'];
$items = [];
if (!empty($payment['additional_info']['items'])) {
    foreach ($payment['additional_info']['items'] as $item) {
        $items[] = [
            'name' => $item['title'] ?? 'Producto Desconocido',
            'quantity' => intval($item['quantity'] ?? 1),
            'price' => floatval($item['unit_price'] ?? 0)
        ];
    }
}

// Transformar "Juan Perez" a firstName y lastName (aproximación)
$nameParts = explode(' ', $meta['customer_name'] ?? '');
$firstName = array_shift($nameParts) ?? 'Cliente';
$lastName = count($nameParts) > 0 ? implode(' ', $nameParts) : '';

$orderId = $meta['order_id'] ?? ('LITFIT-REC-' . $paymentId);

$orderData = [
    'orderId' => $orderId,
    'status' => 'PAID', // O PENDING si el estado fue rechazado
    'total' => floatval($payment['transaction_amount'] ?? 0),
    'totalPrice' => floatval($payment['transaction_amount'] ?? 0),
    'paymentMethod' => 'MERCADOPAGO',
    'timestamp' => $payment['date_approved'] ?? $payment['date_created'] ?? date('c'),
    'items' => $items,
    'formData' => [
        'firstName' => $firstName,
        'lastName' => $lastName,
        'email' => $meta['customer_email'] ?? '',
        'phone' => $meta['customer_phone'] ?? '',
        'street' => ltrim(explode(',', $meta['shipping_address'] ?? '')[0] ?? ''),
        'zipCode' => '', // MP metadata didn't have strict zipCode mapped individually, but it's in string
        'raw_address' => $meta['shipping_address'] ?? ''
    ]
];

// Tratar de extraer el CP si está en el string
preg_match('/\b\d{5}\b/', $meta['shipping_address'] ?? '', $matches);
if (!empty($matches)) {
    $orderData['formData']['zipCode'] = $matches[0];
}

// 💾 RESPALDO EN DISCO
$backupDir = __DIR__ . '/../envios/backups-pedidos';
if (!is_dir($backupDir)) mkdir($backupDir, 0777, true);
file_put_contents($backupDir . '/' . $orderId . '.json', json_encode($orderData, JSON_PRETTY_PRINT));

// GUARDAR EN MYSQL
$pdo = getDbConnection();
$customerName = trim($firstName . ' ' . $lastName);
$stmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_email, total, status, order_data) 
    VALUES (?, ?, ?, ?, ?, ?) 
    ON DUPLICATE KEY UPDATE 
    status = 'PAID', 
    order_data = VALUES(order_data)");

$stmt->execute([
    $orderId, 
    $customerName, 
    $meta['customer_email'] ?? '', 
    floatval($payment['transaction_amount'] ?? 0), 
    'PAID', 
    json_encode($orderData)
]);

echo json_encode([
    'success' => true, 
    'message' => 'Orden recuperada y guardada con éxito.', 
    'order' => $orderData
]);
?>
