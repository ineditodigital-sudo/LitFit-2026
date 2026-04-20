<?php
/**
 * ============================================
 * WEBHOOK DE MERCADO PAGO - LITFIT
 * ============================================
 * 
 * Este archivo recibe notificaciones IPN (Instant Payment Notification)
 * de Mercado Pago cuando hay cambios en el estado de un pago.
 * 
 * 📍 UBICACIÓN EN CPANEL:
 * /home/inedito/public_html/cdn/mercadopago/webhook.php
 * 
 * 🌐 URL DE ACCESO:
 * https://cdn.inedito.digital/mercadopago/webhook.php
 * 
 * ⚠️ Esta URL debe estar configurada en tu cuenta de Mercado Pago
 * en: Configuración → Notificaciones → Webhooks
 */

// ============================================
// CONFIGURACIÓN DE HEADERS
// ============================================

header('Content-Type: application/json; charset=UTF-8');

// Habilitar logging
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// Log de inicio
error_log("====== Webhook de Mercado Pago recibido ======");
error_log("Método: " . $_SERVER['REQUEST_METHOD']);
error_log("IP origen: " . ($_SERVER['REMOTE_ADDR'] ?? 'Desconocida'));

// ============================================
// CARGAR CONFIGURACIÓN
// ============================================

define('MP_CONFIG_LOADED', true);

// Ruta al archivo de configuración
$configPath = __DIR__ . '/../../private/config/mercadopago-config.php';

if (!file_exists($configPath)) {
    $configPath = __DIR__ . '/mercadopago-config.php';
}

if (!file_exists($configPath)) {
    error_log("❌ ERROR: No se encuentra el archivo de configuración");
    http_response_code(500);
    echo json_encode(['error' => 'Configuration error']);
    exit;
}

require_once $configPath;

// ============================================
// VALIDAR ORIGEN DE LA PETICIÓN
// ============================================

// IPs de Mercado Pago (actualizar según documentación oficial)
$mercadoPagoIPs = [
    '209.225.49.0/24',
    '216.33.197.0/24',
    '216.33.196.0/24'
];

// Nota: En producción, deberías validar que la IP viene de Mercado Pago
// Por ahora, solo registramos la IP

// ============================================
// OBTENER DATOS DE LA NOTIFICACIÓN
// ============================================

$rawInput = file_get_contents('php://input');
error_log("📥 Datos recibidos: " . $rawInput);

// Obtener datos de la query string
$topic = $_GET['topic'] ?? $_GET['type'] ?? null;
$id = $_GET['id'] ?? null;

error_log("📋 Topic: " . ($topic ?? 'N/A'));
error_log("🆔 ID: " . ($id ?? 'N/A'));

// Si no hay topic ni id en GET, intentar desde el body
if (!$topic || !$id) {
    $jsonData = json_decode($rawInput, true);
    if ($jsonData) {
        $topic = $jsonData['topic'] ?? $jsonData['type'] ?? null;
        $id = $jsonData['id'] ?? $jsonData['data']['id'] ?? null;
    }
}

// ============================================
// PROCESAR SEGÚN EL TIPO DE NOTIFICACIÓN
// ============================================

if (!$topic || !$id) {
    error_log("⚠️ Notificación sin topic o id, ignorando");
    http_response_code(200);
    echo json_encode(['status' => 'ignored', 'reason' => 'missing_data']);
    exit;
}

error_log("🔔 Procesando notificación: Topic=$topic, ID=$id");

// Procesar según el tipo de notificación
switch ($topic) {
    case 'payment':
        error_log("💳 Notificación de pago");
        processPaymentNotification($id);
        break;
        
    case 'merchant_order':
        error_log("📦 Notificación de orden");
        processMerchantOrderNotification($id);
        break;
        
    default:
        error_log("⚠️ Tipo de notificación no manejado: " . $topic);
        break;
}

// Responder siempre con 200 OK para que MP no reintente
http_response_code(200);
echo json_encode(['status' => 'received']);

// ============================================
// FUNCIÓN: Procesar notificación de pago
// ============================================

function processPaymentNotification($paymentId) {
    error_log("🔍 Consultando pago ID: " . $paymentId);
    
    // Consultar los detalles del pago a la API de Mercado Pago
    $ch = curl_init(MP_API_URL . '/v1/payments/' . $paymentId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . MP_ACCESS_TOKEN
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log("📥 Respuesta HTTP: " . $httpCode);
    
    if ($httpCode !== 200) {
        error_log("❌ Error al consultar pago: HTTP " . $httpCode);
        return;
    }
    
    $payment = json_decode($response, true);
    
    if (!$payment) {
        error_log("❌ Error al decodificar respuesta de pago");
        return;
    }
    
    error_log("💳 Estado del pago: " . ($payment['status'] ?? 'desconocido'));
    error_log("💰 Monto: " . ($payment['transaction_amount'] ?? 0));
    error_log("📝 Referencia externa: " . ($payment['external_reference'] ?? 'N/A'));
    
    // Guardar en un log de pagos (opcional)
    $logEntry = date('Y-m-d H:i:s') . " | " . 
                "Payment ID: " . $paymentId . " | " .
                "Status: " . ($payment['status'] ?? 'unknown') . " | " .
                "Amount: " . ($payment['transaction_amount'] ?? 0) . " | " .
                "Order: " . ($payment['external_reference'] ?? 'N/A') . "\n";
    
    $logFile = __DIR__ . '/payments.log';
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    
    // Aquí puedes agregar lógica adicional según el estado:
    // - approved: Pago aprobado
    // - pending: Pago pendiente
    // - rejected: Pago rechazado
    // - refunded: Pago reembolsado
    
    switch ($payment['status']) {
        case 'approved':
            $orderId = $payment['external_reference'] ?? 'N/A';
            error_log("✅ Pago aprobado - Order: " . $orderId);
            
            if ($orderId !== 'N/A') {
                try {
                    require_once __DIR__ . '/../envios/admin-config.php';
                    $pdo = getDbConnection();

                    // Obtener la orden antes de actualizar para evitar doble procesamiento
                    $stmt = $pdo->prepare("SELECT status, order_data FROM orders WHERE order_id = ?");
                    $stmt->execute([$orderId]);
                    $orderRow = $stmt->fetch();

                    if ($orderRow && $orderRow['status'] !== 'PAID') {
                        // Importar el helper para procesar todo el flujo (DB, Correos, Guía)
                        require_once __DIR__ . '/../envios/order-helper.php';
                        $process = order_process_complete($orderId);
                        
                        if ($process['success']) {
                            error_log("📬 Flujo de pedido $orderId procesado correctamente por webhook.");
                        } else {
                            error_log("⚠️ Webhook proceso incompleto para $orderId: " . ($process['message'] ?? 'Error desconocido'));
                        }
                    } else {
                        error_log("⚠️ Orden $orderId ya procesada previamente, se ignoran acciones duplicadas.");
                    }
                } catch (Exception $e) {
                    error_log("❌ Error procesando orden en base de datos: " . $e->getMessage());
                }
            }
            break;
            
        case 'pending':
            error_log("⏳ Pago pendiente");
            break;
            
        case 'rejected':
            error_log("❌ Pago rechazado - Razón: " . ($payment['status_detail'] ?? 'N/A'));
            break;
            
        case 'refunded':
            error_log("↩️ Pago reembolsado");
            break;
            
        default:
            error_log("⚠️ Estado desconocido: " . ($payment['status'] ?? 'N/A'));
            break;
    }
}

// ============================================
// FUNCIÓN: Procesar notificación de orden
// ============================================

function processMerchantOrderNotification($orderId) {
    error_log("🔍 Consultando orden ID: " . $orderId);
    
    // Consultar los detalles de la orden
    $ch = curl_init(MP_API_URL . '/merchant_orders/' . $orderId);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Authorization: Bearer ' . MP_ACCESS_TOKEN
    ]);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    error_log("📥 Respuesta HTTP: " . $httpCode);
    
    if ($httpCode !== 200) {
        error_log("❌ Error al consultar orden: HTTP " . $httpCode);
        return;
    }
    
    $order = json_decode($response, true);
    
    if (!$order) {
        error_log("❌ Error al decodificar respuesta de orden");
        return;
    }
    
    error_log("📦 Estado de la orden: " . ($order['status'] ?? 'desconocido'));
    error_log("💰 Total: " . ($order['total_amount'] ?? 0));
    
    // Guardar en log
    $logEntry = date('Y-m-d H:i:s') . " | " . 
                "Order ID: " . $orderId . " | " .
                "Status: " . ($order['status'] ?? 'unknown') . " | " .
                "Amount: " . ($order['total_amount'] ?? 0) . "\n";
    
    $logFile = __DIR__ . '/orders.log';
    file_put_contents($logFile, $logEntry, FILE_APPEND);
}

?>
