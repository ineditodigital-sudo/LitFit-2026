<?php
require_once 'admin-config.php';
secureCorsHeaders();

$pdo = getDbConnection();
$method = $_SERVER['REQUEST_METHOD'];

// GET: Obtener configuraciones
if ($method === 'GET') {
    $stmt = $pdo->query("SELECT setting_key, setting_value FROM settings");
    $settings = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
    echo json_encode($settings);
    exit;
}

// POST: Actualizar configuraciones (Requiere Admin Token)
if ($method === 'POST') {
    verifyAdminToken();
    
    $data = json_decode(file_get_contents('php://input'), true);
    if (!$data || !is_array($data)) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => 'Datos inválidos']);
        exit;
    }

    $stmt = $pdo->prepare("INSERT INTO settings (setting_key, setting_value) VALUES (?, ?) ON DUPLICATE KEY UPDATE setting_value = ?");
    
    try {
        foreach ($data as $key => $value) {
            $stmt->execute([$key, $value, $value]);
        }
        echo json_encode(['success' => true, 'message' => 'Configuraciones actualizadas']);
    } catch (PDOException $e) {
        http_response_code(500);
        echo json_encode(['success' => false, 'message' => 'Error al guardar: ' . $e->getMessage()]);
    }
    exit;
}
?>
