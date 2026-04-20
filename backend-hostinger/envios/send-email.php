<?php
require_once 'admin-config.php';

// --- SEGURIDAD CORS ---
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [ALLOWED_ORIGIN]; // Restringido a solo ALLOWED_ORIGIN
if (in_array($origin, $allowed_origins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Si el origen no está permitido, se puede optar por no enviar el header
    // o enviar un origen por defecto si se desea permitir uno específico.
    // Para restringir, simplemente no se envía el header o se envía un error.
    // Aquí, se mantiene el comportamiento de enviar ALLOWED_ORIGIN si no coincide.
    header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
}
header("Access-Control-Allow-Methods: POST");
header("Access-Control-Allow-Headers: Content-Type");

// Preflight handle
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { exit; }

// --- PHPMailer Loader ---
$exceptionPath = __DIR__ . '/php-mailer/src/Exception.php';
if (!file_exists($exceptionPath)) {
    // Si no está la librería, salimos con un mensaje de éxito falso o error suave
    header('Content-Type: application/json');
    echo json_encode(["status" => "warning", "message" => "Librería de correo no encontrada. Ignorando envío."]);
    exit;
}

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require $exceptionPath;
require __DIR__ . '/php-mailer/src/PHPMailer.php';
require __DIR__ . '/php-mailer/src/SMTP.php';

$json = file_get_contents('php://input');
$data = json_decode($json, true);

if (!$data || !isset($data['type'])) {
    http_response_code(400);
    echo json_encode(["status" => "error", "message" => "Datos invalidos"]);
    exit;
}

$type = $data['type'];
$payload = $data['data'];

$mail = new PHPMailer(true);

try {
    // Server settings
    $mail->isSMTP();
    $mail->Host       = MAIL_SMTP_HOST;
    $mail->SMTPAuth   = true;
    $mail->Username   = MAIL_SMTP_USER;
    $mail->Password   = MAIL_SMTP_PASS;
    $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
    $mail->Port       = MAIL_SMTP_PORT;
    $mail->CharSet    = 'UTF-8';

    $mail->setFrom(MAIL_SMTP_USER, 'LITFIT México');
    $mail->addEmbeddedImage('logo.png', 'logo_litfit');

    if ($type === 'contact') {
        $mail->addAddress(MAIL_ADMIN_RECIPIENT);
        $mail->Subject = 'Nuevo Mensaje de Contacto - LITFIT';
        
        $template = file_get_contents('tpl-contact.html');
        foreach ($payload as $key => $value) {
            $template = str_replace('{{' . $key . '}}', htmlspecialchars($value), $template);
        }
        $mail->msgHTML($template);
    } 
    elseif ($type === 'order_admin') {
        $mail->addAddress(MAIL_ADMIN_RECIPIENT);
        $mail->Subject = '🛒 Nuevo Pedido Recibido - LITFIT';
        
        $template = file_get_contents('tpl-order-admin.html');
        // Sanitizamos excepto los saltos de línea de los items
        foreach ($payload as $key => $value) {
            $safe_val = ($key === 'order_items') ? nl2br(htmlspecialchars($value)) : htmlspecialchars($value);
            $template = str_replace('{{' . $key . '}}', $safe_val, $template);
        }
        $mail->msgHTML($template);
    }
    elseif ($type === 'order_customer') {
        $mail->addAddress($payload['customer_email']);
        $mail->Subject = '✨ Confirmación de Pedido - LITFIT';
        
        $template = file_get_contents('tpl-order-customer.html');
        foreach ($payload as $key => $value) {
            // El HTML de los items no se escapa pero debe venir pre-procesado
            $safe_val = ($key === 'order_items_html') ? $value : htmlspecialchars($value);
            $template = str_replace('{{' . $key . '}}', $safe_val, $template);
        }
        $mail->msgHTML($template);
    }

    $mail->send();
    echo json_encode(["status" => "success", "message" => "Correo enviado"]);

} catch (Exception $e) {
    echo json_encode(["status" => "error", "message" => "Error de envio"]);
}
?>
