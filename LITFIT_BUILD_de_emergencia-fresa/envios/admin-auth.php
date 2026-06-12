<?php
/**
 * ============================================
 * ADMIN AUTH - LITFIT
 * Login seguro: valida credenciales en servidor
 * y devuelve un token HMAC firmado.
 *
 * URL: https://tienda.litfitmexico.com/envios/admin-auth.php
 * ============================================
 */

require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
    exit;
}

$input = json_decode(file_get_contents('php://input'), true);
$username = trim($input['username'] ?? '');
$password = trim($input['password'] ?? '');

// Rate limiting simple: 3 intentos fallidos en 60s bloquea por IP
$ipFile = sys_get_temp_dir() . '/litfit_attempts_' . md5($_SERVER['REMOTE_ADDR'] ?? 'x') . '.json';
$attempts = file_exists($ipFile) ? json_decode(file_get_contents($ipFile), true) : ['count' => 0, 'reset' => time() + 60];

if ($attempts['count'] >= 5 && time() < $attempts['reset']) {
    http_response_code(429);
    $wait = $attempts['reset'] - time();
    echo json_encode(['success' => false, 'message' => "Demasiados intentos. Espera {$wait} segundos."]);
    exit;
}

if ($username !== ADMIN_USERNAME || $password !== ADMIN_PASSWORD) {
    // Registrar intento fallido
    if (time() > $attempts['reset']) {
        $attempts = ['count' => 1, 'reset' => time() + 60];
    } else {
        $attempts['count']++;
    }
    file_put_contents($ipFile, json_encode($attempts));

    // Delay de seguridad para frustrar ataques de fuerza bruta
    usleep(500000); // 0.5 segundos
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Credenciales incorrectas.']);
    exit;
}

// Login exitoso: resetear contador y generar token
file_put_contents($ipFile, json_encode(['count' => 0, 'reset' => 0]));

$token = generateAdminToken(ADMIN_USERNAME);
$expiresIn = 8 * 3600; // 8 horas en segundos

echo json_encode([
    'success'   => true,
    'token'     => $token,
    'expiresIn' => $expiresIn,
    'message'   => 'Bienvenido, administrador.'
]);
?>
