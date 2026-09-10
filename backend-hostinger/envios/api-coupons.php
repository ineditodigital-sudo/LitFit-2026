<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

/**
 * Identifica a quien aplica un cupon. Se prefiere el correo, que es lo que
 * llena en el checkout; si todavia no lo escribio, se usa el identificador que
 * genera su navegador. Sirve para dos cosas: que reintentar no gaste el cupon
 * dos veces, y que un codigo de un solo uso quede tomado en cuanto alguien lo
 * aplica, sin esperar a que pague.
 */
function claveDeQuienUsa($email, $navegador) {
    $email = strtolower(trim((string)$email));
    if ($email !== '' && filter_var($email, FILTER_VALIDATE_EMAIL)) return 'mail:' . $email;
    $navegador = preg_replace('/[^A-Za-z0-9_-]/', '', (string)$navegador);
    return $navegador !== '' ? 'nav:' . substr($navegador, 0, 60) : '';
}

/** Consumos de un cupon: los reservados (aun sin pedido) y los ya comprados. */
function consumosDelCupon(PDO $pdo, $codigo) {
    $stmt = $pdo->prepare("SELECT holder, order_id FROM coupon_uses WHERE coupon_code = ?");
    $stmt->execute([$codigo]);
    return $stmt->fetchAll(PDO::FETCH_ASSOC);
}

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
                $c['usage_limit'] = $c['usage_limit'] ?? 'none';

                // Cuantos lo tienen tomado y cuantos ya compraron con el.
                $usos = consumosDelCupon($pdo, $c['code']);
                $c['taken_count'] = count($usos);
                $c['redeemed_count'] = count(array_filter($usos, function ($u) { return !empty($u['order_id']); }));
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
            
            // ── Limite de uso ─────────────────────────────────────────
            $limite = $coupon['usage_limit'] ?? 'none';
            if ($limite !== 'none') {
                $correo = $_GET['email'] ?? '';
                $navegador = $_GET['visitor'] ?? '';
                $quien = claveDeQuienUsa($correo, $navegador);

                if ($limite === 'per_customer' && strpos($quien, 'mail:') !== 0) {
                    die(json_encode([
                        'success' => false,
                        'message' => 'Escribe tu correo antes de aplicar este cupón'
                    ]));
                }
                if ($quien === '') {
                    die(json_encode([
                        'success' => false,
                        'message' => 'No pudimos identificar tu sesión. Recarga la página e inténtalo de nuevo.'
                    ]));
                }

                $usos = consumosDelCupon($pdo, $coupon['code']);

                if ($limite === 'total') {
                    // Lo bloquea cualquier otra persona que ya lo tenga tomado,
                    // haya pagado o no. Quien lo tomo puede reaplicarlo.
                    foreach ($usos as $u) {
                        if ($u['holder'] !== $quien) {
                            die(json_encode(['success' => false, 'message' => 'Este cupón ya fue utilizado']));
                        }
                    }
                } else {
                    // Por cliente: solo bloquea si ESE correo ya completo un pedido.
                    // Mientras su uso siga sin pedido asociado, puede reaplicarlo.
                    foreach ($usos as $u) {
                        if ($u['holder'] === $quien && !empty($u['order_id'])) {
                            die(json_encode(['success' => false, 'message' => 'Ya usaste este cupón antes']));
                        }
                    }
                }

                // Queda tomado desde este momento. La clave unica hace que
                // reaplicar no genere un segundo consumo.
                $reservar = $pdo->prepare("INSERT IGNORE INTO coupon_uses (coupon_code, holder) VALUES (?, ?)");
                $reservar->execute([$coupon['code'], $quien]);
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
        
        $limitesValidos = ['none', 'total', 'per_customer'];
        $limite = in_array($data['usage_limit'] ?? 'none', $limitesValidos, true) ? $data['usage_limit'] : 'none';

        $stmt = $pdo->prepare("INSERT INTO coupons (code, type, value, min_purchase, valid_from, valid_until, allow_shaker, usage_limit, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $success = $stmt->execute([
            $code,
            $data['type'] ?? 'percent',
            $data['value'],
            $data['min_purchase'] ?? 0,
            empty($data['valid_from']) ? null : $data['valid_from'],
            empty($data['valid_until']) ? null : $data['valid_until'],
            isset($data['allow_shaker']) ? (int)$data['allow_shaker'] : 1,
            $limite,
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
        
        $limitesValidos = ['none', 'total', 'per_customer'];
        $limite = in_array($data['usage_limit'] ?? 'none', $limitesValidos, true) ? $data['usage_limit'] : 'none';

        $stmt = $pdo->prepare("UPDATE coupons SET code=?, type=?, value=?, min_purchase=?, valid_from=?, valid_until=?, allow_shaker=?, usage_limit=?, is_active=? WHERE id=?");
        $success = $stmt->execute([
            strtoupper(trim($data['code'])),
            $data['type'] ?? 'percent',
            $data['value'],
            $data['min_purchase'] ?? 0,
            empty($data['valid_from']) ? null : $data['valid_from'],
            empty($data['valid_until']) ? null : $data['valid_until'],
            isset($data['allow_shaker']) ? (int)$data['allow_shaker'] : 1,
            $limite,
            isset($data['is_active']) ? (int)$data['is_active'] : 1,
            $data['id']
        ]);
        
        echo json_encode(['success' => $success]);
        break;
        
    case 'DELETE':
        // Liberar los consumos sin borrar el cupon. Sirve cuando alguien aplico
        // un codigo de un solo uso y abandono el carrito, dejandolo tomado.
        if (isset($_GET['liberar_usos'])) {
            $codigo = strtoupper(trim($_GET['liberar_usos']));
            // Solo los apartados, es decir los que no llegaron a pedido. Los
            // consumos de una compra real se conservan: borrarlos permitiria
            // volver a usar un cupon que ya se canjeo.
            $stmt = $pdo->prepare("DELETE FROM coupon_uses WHERE coupon_code = ? AND order_id IS NULL");
            $stmt->execute([$codigo]);
            echo json_encode(['success' => true, 'liberados' => $stmt->rowCount()]);
            break;
        }

        if (!isset($_GET['id'])) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'ID de cupón requerido']));
        }

        // Al borrar el cupon se van tambien sus consumos, para no dejar basura
        // que bloquee un codigo futuro con el mismo nombre.
        $stmt = $pdo->prepare("SELECT code FROM coupons WHERE id = ?");
        $stmt->execute([$_GET['id']]);
        $codigoBorrado = $stmt->fetchColumn();

        $stmt = $pdo->prepare("DELETE FROM coupons WHERE id = ?");
        $success = $stmt->execute([$_GET['id']]);
        if ($success && $codigoBorrado) {
            $pdo->prepare("DELETE FROM coupon_uses WHERE coupon_code = ?")->execute([$codigoBorrado]);
        }

        echo json_encode(['success' => $success]);
        break;
}
?>
