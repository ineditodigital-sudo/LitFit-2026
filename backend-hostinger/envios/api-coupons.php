<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// GET es público para validación de cupones, pero con diferencias si el admin solicita la lista completa
$isAdminRequest = false;
$authHeader = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
$token = trim(str_replace('Bearer ', '', $authHeader));

if (!empty($token)) {
    $currentSlot = floor(time() / (8 * 3600));
    $currentToken = hash_hmac('sha256', $currentSlot . '|' . ADMIN_USERNAME, ADMIN_SECRET_KEY);
    
    $prevSlot = floor((time() - 8 * 3600) / (8 * 3600));
    $prevToken = hash_hmac('sha256', $prevSlot . '|' . ADMIN_USERNAME, ADMIN_SECRET_KEY);
    
    if (hash_equals($currentToken, $token) || hash_equals($prevToken, $token)) {
        $isAdminRequest = true;
    }
}

if ($_SERVER['REQUEST_METHOD'] !== 'GET' && !$isAdminRequest) {
    http_response_code(401);
    die(json_encode(['success' => false, 'message' => 'No autorizado']));
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        if ($isAdminRequest && !isset($_GET['code'])) {
            // Admin: Listar todos
            $stmt = $pdo->query("SELECT * FROM coupons ORDER BY created_at DESC");
            $coupons = $stmt->fetchAll();
            foreach ($coupons as &$c) {
                $c['value'] = (float)$c['value'];
                $c['min_purchase'] = (float)$c['min_purchase'];
                $c['allow_shaker'] = (bool)$c['allow_shaker'];
                $c['is_active'] = (bool)$c['is_active'];
            }
            echo json_encode($coupons);
        } else {
            // Cliente: Validar un cupón
            if (!isset($_GET['code'])) {
                http_response_code(400);
                die(json_encode(['success' => false, 'message' => 'Código no proporcionado']));
            }
            
            $code = strtoupper(trim($_GET['code']));
            $stmt = $pdo->prepare("SELECT * FROM coupons WHERE code = ? AND is_active = 1");
            $stmt->execute([$code]);
            $coupon = $stmt->fetch();
            
            if (!$coupon) {
                die(json_encode(['success' => false, 'message' => 'Cupón inválido o inactivo']));
            }
            
            $now = date('Y-m-d H:i:s');
            if ($coupon['valid_from'] && $coupon['valid_from'] > $now) {
                die(json_encode(['success' => false, 'message' => 'El cupón aún no es válido']));
            }
            if ($coupon['valid_until'] && $coupon['valid_until'] < $now) {
                die(json_encode(['success' => false, 'message' => 'El cupón ha expirado']));
            }
            
            // Si el monto de compra es provisto, validar monto mínimo
            if (isset($_GET['cart_total'])) {
                $cartTotal = (float)$_GET['cart_total'];
                if ($coupon['min_purchase'] > 0 && $cartTotal < $coupon['min_purchase']) {
                    die(json_encode([
                        'success' => false, 
                        'message' => 'Monto mínimo no alcanzado ($' . number_format($coupon['min_purchase'], 2) . ')'
                    ]));
                }
            }
            
            echo json_encode([
                'success' => true,
                'data' => [
                    'code' => $coupon['code'],
                    'type' => $coupon['type'],
                    'value' => (float)$coupon['value'],
                    'min_purchase' => (float)$coupon['min_purchase'],
                    'allow_shaker' => (bool)$coupon['allow_shaker']
                ]
            ]);
        }
        break;

    case 'POST':
        // Crear cupón
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['code']) || !isset($data['value'])) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'Datos incompletos']));
        }
        
        $code = strtoupper(trim($data['code']));
        
        // Verificar si ya existe
        $stmt = $pdo->prepare("SELECT id FROM coupons WHERE code = ?");
        $stmt->execute([$code]);
        if ($stmt->fetch()) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'El código ya existe']));
        }
        
        $stmt = $pdo->prepare("INSERT INTO coupons (code, type, value, min_purchase, valid_from, valid_until, allow_shaker, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $code,
            $data['type'] ?? 'percent',
            $data['value'],
            $data['min_purchase'] ?? 0,
            empty($data['valid_from']) ? null : $data['valid_from'],
            empty($data['valid_until']) ? null : $data['valid_until'],
            isset($data['allow_shaker']) ? (int)$data['allow_shaker'] : 1,
            isset($data['is_active']) ? (int)$data['is_active'] : 1
        ]);
        
        echo json_encode(['success' => $success]);
        break;

    case 'PUT':
        // Editar cupón
        $json = file_get_contents('php://input');
        $data = json_decode($json, true);
        
        if (!$data || !isset($data['id'])) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'ID de cupón requerido']));
        }
        
        $stmt = $pdo->prepare("UPDATE coupons SET code=?, type=?, value=?, min_purchase=?, valid_from=?, valid_until=?, allow_shaker=?, is_active=? WHERE id=?");
        $success = $stmt->execute([
            strtoupper(trim($data['code'])),
            $data['type'] ?? 'percent',
            $data['value'],
            $data['min_purchase'] ?? 0,
            empty($data['valid_from']) ? null : $data['valid_from'],
            empty($data['valid_until']) ? null : $data['valid_until'],
            isset($data['allow_shaker']) ? (int)$data['allow_shaker'] : 1,
            isset($data['is_active']) ? (int)$data['is_active'] : 1,
            $data['id']
        ]);
        
        echo json_encode(['success' => $success]);
        break;
        
    case 'DELETE':
        if (!isset($_GET['id'])) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'ID de cupón requerido']));
        }
        
        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
        $success = $stmt->execute([$_GET['id']]);
        
        echo json_encode(['success' => $success]);
        break;
}
?>
