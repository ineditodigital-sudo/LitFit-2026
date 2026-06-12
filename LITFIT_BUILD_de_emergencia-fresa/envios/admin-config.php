<?php
/**
 * ============================================
 * CONFIGURACIÓN ADMIN SEGURA - LITFIT
 * Credenciales SOLO en servidor PHP, nunca en frontend
 * ============================================
 */

// Clave secreta para firmar tokens (no la compartas)
define('ADMIN_SECRET_KEY', 'litfit-k8X2-prod-2024!mxSecure');

// Credenciales del administrador
define('ADMIN_USERNAME', 'admin');
define('ADMIN_PASSWORD', 'LitfitAdmin2024!');

// Credenciales Envíos Internacionales (Oauth)
define('ENVIOS_CLIENT_ID',     'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_BASE',      'https://app.enviosinternacionales.com/api/v1');

// Dominio permitido para CORS
define('ALLOWED_ORIGIN', 'https://litfitmexico.com');

// CONFIGURACIÓN SMTP (Hostinger)
define('MAIL_SMTP_HOST', 'smtp.hostinger.com');
define('MAIL_SMTP_USER', 'contacto@litfitmexico.com');
define('MAIL_SMTP_PASS', '@Litfit%1314');
define('MAIL_SMTP_PORT', 465);
define('MAIL_ADMIN_RECIPIENT', 'litfitmexico@outlook.com');

// CONFIGURACIÓN DATABASE (MySQL Hostinger)
define('DB_HOST', 'localhost');
define('DB_NAME', 'u282141363_litfitweb');
define('DB_USER', 'u282141363_litfit');
define('DB_PASS', '@Litfit%1314');

// Función única para conectar a MySQL con PDO
function getDbConnection() {
    try {
        $dsn = "mysql:host=" . DB_HOST . ";dbname=" . DB_NAME . ";charset=utf8mb4";
        $options = [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
            PDO::ATTR_EMULATE_PREPARES   => false,
        ];
        return new PDO($dsn, DB_USER, DB_PASS, $options);
    } catch (PDOException $e) {
        http_response_code(500);
        die(json_encode(['success' => false, 'message' => 'Error de conexion BD: ' . $e->getMessage()]));
    }
}

// ─── Helper: cabeceras CORS seguras ─────────────────────────────────
function secureCorsHeaders() {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    $allowed = [
        ALLOWED_ORIGIN, 
        'http://localhost:3000', 
        'http://localhost:5173'
    ];
    if (in_array($origin, $allowed)) {
        header("Access-Control-Allow-Origin: $origin");
    } else {
        header('Access-Control-Allow-Origin: ' . ALLOWED_ORIGIN);
    }
    header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
    header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Admin-Token');
    header('Access-Control-Allow-Credentials: true');
    header('Content-Type: application/json; charset=UTF-8');
}

// ─── Helper: generar token HMAC (válido 8 horas) ────────────────────
function generateAdminToken($username) {
    // El token cambia cada 8 horas automáticamente
    $slot = floor(time() / (8 * 3600));
    return hash_hmac('sha256', $slot . '|' . $username, ADMIN_SECRET_KEY);
}

// ─── Helper: verificar token de la petición ─────────────────────────
function verifyAdminToken() {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? $_SERVER['HTTP_X_ADMIN_TOKEN'] ?? '';
    $token = str_replace('Bearer ', '', $auth);

    if (empty($token)) {
        http_response_code(401);
        echo json_encode(['success' => false, 'message' => 'No autorizado. Token requerido.']);
        exit;
    }

    $expected = generateAdminToken(ADMIN_USERNAME);
    // Tolerancia: también aceptar el token de la ventana anterior (por si el slot acaba de cambiar)
    $prevSlot = floor((time() - 8 * 3600) / (8 * 3600));
    $prevToken = hash_hmac('sha256', $prevSlot . '|' . ADMIN_USERNAME, ADMIN_SECRET_KEY);

    if (!hash_equals($expected, $token) && !hash_equals($prevToken, $token)) {
        http_response_code(403);
        echo json_encode(['success' => false, 'message' => 'Token inválido o expirado. Vuelve a iniciar sesión.']);
        exit;
    }
}
?>
