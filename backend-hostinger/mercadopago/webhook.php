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
                        // Actualizar a PAID
                        $upd = $pdo->prepare("UPDATE orders SET status = 'PAID' WHERE order_id = ?");
                        $upd->execute([$orderId]);
                        error_log("✅ Orden $orderId actualizada a PAID en Base de Datos por Webhook.");

                        // Extraer datos para correos y envíos
                        $orderData = json_decode($orderRow['order_data'], true);
                        if ($orderData && isset($orderData['items'])) {
                            // Actualizar también el order_data
                            $orderData['status'] = 'PAID';
                            $orderData['paymentMethod'] = 'MERCADOPAGO';
                            $updJson = $pdo->prepare("UPDATE orders SET order_data = ? WHERE order_id = ?");
                            $updJson->execute([json_encode($orderData), $orderId]);

                            $items = $orderData['items'] ?? [];
                            $formData = $orderData['formData'] ?? [];
                            $totalPrice = $orderData['totalPrice'] ?? 0;
                            $shippingCost = $orderData['shippingCost'] ?? 0;
                            $total = $orderData['total'] ?? 0;
                            
                            // Texto para admin
                            $orderDetails = "";
                            foreach($items as $item) {
                                $variant = !empty($item['variant']) ? " ({$item['variant']})" : "";
                                $size = !empty($item['size']) ? " - {$item['size']}" : "";
                                $sub = number_format(($item['price'] ?? 0) * ($item['quantity'] ?? 1), 2);
                                $orderDetails .= "- {$item['name']}{$variant}{$size} x{$item['quantity']} - $$sub\n";
                            }
                            
                            // HTML para cliente
                            $orderItemsHtml = '<table width="100%" style="border-collapse: collapse;">';
                            foreach($items as $item) {
                                $variant = !empty($item['variant']) ? " ({$item['variant']})" : "";
                                $sub = number_format(($item['price'] ?? 0) * ($item['quantity'] ?? 1), 2);
                                $name = $item['name'] ?? '';
                                $qty = $item['quantity'] ?? 1;
                                $orderItemsHtml .= '<tr>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #222;">
                                        <p style="color: #FFFFFF; font-size: 14px; margin: 0; font-weight: 700;">'.$name.' '.$variant.'</p>
                                        <p style="color: #888; font-size: 11px; margin: 5px 0 0;">CANTIDAD: '.$qty.'</p>
                                    </td>
                                    <td style="padding: 15px 0; border-bottom: 1px solid #222; text-align: right;">
                                        <p style="color: #00AAC7; font-size: 14px; margin: 0; font-weight: 900;">$'.$sub.'</p>
                                    </td>
                                </tr>';
                            }
                            $orderItemsHtml .= '</table>';
                            
                            $street = $formData['street'] ?? '';
                            $colonia = $formData['colonia'] ?? '';
                            $city = $formData['city'] ?? '';
                            $state = $formData['state'] ?? '';
                            $zipCode = $formData['zipCode'] ?? '';
                            $country = $formData['country'] ?? 'México';
                            $shippingAddress = "{$street}, Col. {$colonia}, {$city}, {$state}, CP {$zipCode}, {$country}";
                            
                            $t1 = number_format($totalPrice, 2);
                            $t2 = number_format($shippingCost, 2);
                            $t3 = number_format($total, 2);

                            $firstName = $formData['firstName'] ?? '';
                            $lastName = $formData['lastName'] ?? '';
                            $email = $formData['email'] ?? '';
                            $phone = $formData['phone'] ?? '';
                            $notes = $formData['notes'] ?? 'Sin notas';

                            // URL de los endpoints en producción
                            $sendEmailUrl = 'https://litfitmexico.com/envios/send-email.php';
                            
                            // 1. Email Admin
                            $adminPayload = json_encode([
                                'type' => 'order_admin',
                                'data' => [
                                    'customer_name' => trim("$firstName $lastName"),
                                    'customer_email' => $email,
                                    'customer_phone' => $phone,
                                    'shipping_address' => $shippingAddress,
                                    'order_items' => $orderDetails,
                                    'subtotal' => "$$t1",
                                    'shipping' => "$$t2",
                                    'total' => "$$t3",
                                    'notes' => $notes
                                ]
                            ]);
                            
                            $ch = curl_init($sendEmailUrl);
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch, CURLOPT_POST, true);
                            curl_setopt($ch, CURLOPT_POSTFIELDS, $adminPayload);
                            curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                            curl_setopt($ch, CURLOPT_TIMEOUT, 5);
                            curl_exec($ch); curl_close($ch);

                            // 2. Email Customer
                            $customerPayload = json_encode([
                                'type' => 'order_customer',
                                'data' => [
                                    'customer_name' => $firstName,
                                    'customer_email' => $email,
                                    'order_id' => $orderId,
                                    'shipping_address' => $shippingAddress,
                                    'payment_method' => 'Mercado Pago',
                                    'payment_status' => 'PAGADO',
                                    'order_items_html' => $orderItemsHtml,
                                    'total' => "$$t3"
                                ]
                            ]);
                            $ch2 = curl_init($sendEmailUrl);
                            curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch2, CURLOPT_POST, true);
                            curl_setopt($ch2, CURLOPT_POSTFIELDS, $customerPayload);
                            curl_setopt($ch2, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                            curl_setopt($ch2, CURLOPT_TIMEOUT, 5);
                            curl_exec($ch2); curl_close($ch2);

                            // 3. Enviar a Envíos Internacionales
                            $crearOrdenUrl = 'https://litfitmexico.com/envios/crear-orden.php';
                            $enviosPayload = json_encode([
                                'orderId' => $orderId,
                                'items' => $items,
                                'formData' => $formData,
                                'total' => $total,
                                'shippingCost' => $shippingCost,
                                'totalPrice' => $totalPrice,
                                'paymentMethod' => 'Mercado Pago',
                                'shippingOption' => $orderData['selectedShippingOption'] ?? null
                            ]);
                            
                            $ch3 = curl_init($crearOrdenUrl);
                            curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
                            curl_setopt($ch3, CURLOPT_POST, true);
                            curl_setopt($ch3, CURLOPT_POSTFIELDS, $enviosPayload);
                            curl_setopt($ch3, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
                            curl_setopt($ch3, CURLOPT_TIMEOUT, 5);
                            curl_exec($ch3); curl_close($ch3);
                            
                            error_log("📬 Correos y Envíos generados exitosamente por webhook.");
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
