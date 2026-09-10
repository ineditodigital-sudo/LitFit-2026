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

    // ── Cupon: ligar el consumo a este pedido ─────────────────────────
    //
    // Al aplicar el cupon queda una reserva a nombre de quien lo aplico. Aqui se
    // le pega el numero de pedido, que es lo que distingue "lo tengo apartado en
    // el carrito" de "ya compre con el". El modo por cliente se apoya en esa
    // diferencia para dejar reaplicar y bloquear la segunda compra.
    //
    // La reserva pudo quedar a nombre del navegador si el cupon se aplico antes
    // de escribir el correo. En ese caso se reescribe a nombre del correo, para
    // que el limite siga valiendo aunque el cliente vuelva desde otro equipo.
    $codigoCupon = strtoupper(trim($data['appliedCoupon']['code'] ?? ''));
    if ($codigoCupon !== '') {
        try {
            $correo = strtolower(trim($customerEmail));
            $claveCorreo = (filter_var($correo, FILTER_VALIDATE_EMAIL)) ? 'mail:' . $correo : '';
            $navegador = preg_replace('/[^A-Za-z0-9_-]/', '', (string)($data['visitorId'] ?? ''));
            $claveNavegador = $navegador !== '' ? 'nav:' . substr($navegador, 0, 60) : '';

            $posibles = array_values(array_filter([$claveCorreo, $claveNavegador]));
            if ($posibles) {
                $marcadores = implode(',', array_fill(0, count($posibles), '?'));
                $stmt = $pdo->prepare("UPDATE coupon_uses SET order_id = ?, holder = ? WHERE coupon_code = ? AND holder IN ($marcadores)");
                $stmt->execute(array_merge([$orderId, $claveCorreo ?: $posibles[0], $codigoCupon], $posibles));

                // Si no habia reserva (cupon sin limite, o se aplico antes de
                // que existiera esta funcion) se deja el registro igual, para
                // que el panel pueda contarlo.
                if ($stmt->rowCount() === 0) {
                    $pdo->prepare("INSERT IGNORE INTO coupon_uses (coupon_code, holder, order_id) VALUES (?, ?, ?)")
                        ->execute([$codigoCupon, $claveCorreo ?: $posibles[0], $orderId]);
                }
            }
        } catch (Exception $e) {
            // El cupon no debe impedir que se registre el pedido.
            error_log("No se pudo ligar el cupon $codigoCupon al pedido $orderId: " . $e->getMessage());
        }
    }

    echo json_encode(['success' => true, 'message' => 'Pedido guardado con éxito', 'id' => $orderId]);
} catch (Exception $e) {
    // Si llegamos aquí, al menos el respaldo en disco ya se intentó guardar
    error_log("Error guardando en BD (pero intentamos respaldo): " . $e->getMessage());
    echo json_encode(['success' => true, 'message' => 'Pedido guardado (Respaldo en disco)', 'id' => $orderId, 'db_error' => $e->getMessage()]);
}
?>
