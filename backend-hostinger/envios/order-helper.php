<?php
/**
 * Helper para procesamiento centralizado de pedidos (LITFIT)
 * Maneja base de datos, correos y integración con envíos.
 */

require_once __DIR__ . '/admin-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Solo cargar si no se ha cargado antes
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    require __DIR__ . '/php-mailer/src/Exception.php';
    require __DIR__ . '/php-mailer/src/PHPMailer.php';
    require __DIR__ . '/php-mailer/src/SMTP.php';
}

/**
 * Actualiza el estado de un pedido en la base de datos
 */
function db_update_order_status($orderId, $newStatus, $extraData = []) {
    $pdo = getDbConnection();
    
    // 1. Obtener datos actuales
    $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
    $stmt->execute([$orderId]);
    $row = $stmt->fetch();
    
    if (!$row) return false;
    
    $orderData = json_decode($row['order_data'], true);
    $orderData['status'] = $newStatus;
    
    // Mezclar datos extra (tracking, carrier, etc)
    if (!empty($extraData)) {
        foreach ($extraData as $key => $val) {
            $orderData[$key] = $val;
            if ($key === 'trackingNumber') $orderData['trackingNumber'] = $val;
            if ($key === 'carrier') $orderData['carrier'] = $val;
        }
    }
    
    // 2. Actualizar DB
    $updateStmt = $pdo->prepare("UPDATE orders SET status = ?, order_data = ? WHERE order_id = ?");
    return $updateStmt->execute([$newStatus, json_encode($orderData), $orderId]);
}

/**
 * Envía correo de confirmación al cliente
 */
function email_send_order_confirmation($orderId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        if (!$row) return false;
        
        $orderData = json_decode($row['order_data'], true);
        $customerEmail = $orderData['formData']['email'] ?? '';
        
        if (empty($customerEmail)) return false;
        
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_SMTP_USER;
        $mail->Password   = MAIL_SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = MAIL_SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_SMTP_USER, 'LITFIT México');
        $mail->addAddress($customerEmail);
        $mail->addEmbeddedImage(__DIR__ . '/logo.png', 'logo_litfit');
        
        $mail->Subject = '✨ Confirmación de Pedido - LITFIT';
        
        // Generar HTML de items
        $itemsHtml = '<table style="width:100%; border-collapse:collapse;">';
        foreach ($orderData['items'] as $it) {
            $itemsHtml .= "<tr><td style='padding:5px; border-bottom:1px solid #eee;'>{$it['name']} x {$it['quantity']}</td><td style='text-align:right;'>$" . number_format($it['price'] * $it['quantity'], 2) . "</td></tr>";
        }
        $itemsHtml .= "</table>";
        
        $template = file_get_contents(__DIR__ . '/tpl-order-customer.html');
        $template = str_replace('{{order_id}}', $orderId, $template);
        $template = str_replace('{{customer_name}}', $orderData['formData']['firstName'], $template);
        $template = str_replace('{{order_items_html}}', $itemsHtml, $template);
        $template = str_replace('{{total}}', number_format($orderData['total'], 2), $template);
        
        $mail->msgHTML($template);
        return $mail->send();
    } catch (Exception $e) {
        error_log("Error enviando email cliente: " . $e->getMessage());
        return false;
    }
}

/**
 * Envía correo de aviso al administrador
 */
function email_send_admin_notification($orderId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        if (!$row) return false;
        
        $orderData = json_decode($row['order_data'], true);
        
        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_SMTP_USER;
        $mail->Password   = MAIL_SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = MAIL_SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_SMTP_USER, 'LITFIT México');
        $mail->addAddress(MAIL_ADMIN_RECIPIENT);
        $mail->addEmbeddedImage(__DIR__ . '/logo.png', 'logo_litfit');
        
        $mail->Subject = '🛒 Nuevo Pedido Recibido - LITFIT';
        
        $itemsText = "";
        foreach ($orderData['items'] as $it) {
            $itemsText .= "• {$it['name']} x {$it['quantity']} \n";
        }
        
        $template = file_get_contents(__DIR__ . '/tpl-order-admin.html');
        $template = str_replace('{{order_id}}', $orderId, $template);
        $template = str_replace('{{customer_name}}', $orderData['formData']['firstName'] . ' ' . $orderData['formData']['lastName'], $template);
        $template = str_replace('{{customer_email}}', $orderData['formData']['email'], $template);
        $template = str_replace('{{customer_phone}}', $orderData['formData']['phone'] ?? 'N/A', $template);
        $template = str_replace('{{order_items}}', nl2br(htmlspecialchars($itemsText)), $template);
        $template = str_replace('{{total}}', number_format($orderData['total'], 2), $template);
        
        $mail->msgHTML($template);
        return $mail->send();
    } catch (Exception $e) {
        error_log("Error enviando email admin: " . $e->getMessage());
        return false;
    }
}

/**
 * Crea el envío en Envíos Internacionales
 */
function shipping_create_externally($orderId) {
    $pdo = getDbConnection();
    $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
    $stmt->execute([$orderId]);
    $row = $stmt->fetch();
    if (!$row) return false;
    
    $orderData = json_decode($row['order_data'], true);
    
    // Verificar si ya se creó para evitar duplicados
    $jsonPath = __DIR__ . '/pedidos-json/' . $orderId . '.json';
    if (file_exists($jsonPath)) {
        error_log("Aviso: Intento de duplicar envío para $orderId, ignorado.");
        return true; 
    }

    // Lógica extraída de crear-orden.php
    $items = $orderData['items'];
    $formData = $orderData['formData'];
    $total = $orderData['total'];
    $shippingOption = $orderData['shippingOption'] ?? ($orderData['selectedShippingOption'] ?? null);
    
    // Obtener Token
    $ch = curl_init(ENVIOS_API_BASE . '/oauth/token');
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
    curl_setopt($ch, CURLOPT_POSTFIELDS, http_build_query([
        'grant_type' => 'client_credentials', 
        'client_id' => ENVIOS_CLIENT_ID, 
        'client_secret' => ENVIOS_CLIENT_SECRET
    ]));
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    $tok = $res['access_token'] ?? false;
    
    if (!$tok) return false;
    
    $peso = 1.0;
    foreach ($items as $it) {
        if (strpos(strtolower($it['name']), 'prote') !== false) $peso += 1.0;
    }

    function cleanStr($str, $len = 40) {
        $str = str_replace(['|', '#'], ' ', (string)$str);
        return substr(trim($str), 0, $len);
    }

    if (isset($shippingOption['id']) && !empty($shippingOption['id'])) {
        $apiEndpoint = ENVIOS_API_BASE . '/shipments/';
        $finalPayload = [
            'shipment' => [
                'rate_id' => strval($shippingOption['id']),
                'printing_format' => 'standard',
                'address_from' => [
                    'street1' => 'Cedro 305', 'name' => 'LITFIT Admin', 'company' => 'LITFIT', 
                    'phone' => '4491952361', 'email' => 'mmedellin_89@hotmail.com', 
                    'reference' => 'LITFIT Office', 'postal_code' => '20020', 'country_code' => 'MX'
                ],
                'address_to' => [
                    'street1' => cleanStr($formData['street'] ?? 'No especificada', 45),
                    'name' => cleanStr(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''), 60),
                    'company' => cleanStr($formData['company'] ?? 'Particular', 60),
                    'phone' => cleanStr($formData['phone'] ?? '', 20),
                    'email' => cleanStr($formData['email'] ?? '', 60),
                    'reference' => cleanStr('Col.' . ($formData['colonia'] ?? ''), 40),
                    'city' => cleanStr($formData['city'] ?? '', 60),
                    'state' => cleanStr($formData['state'] ?? '', 60),
                    'postal_code' => cleanStr($formData['zipCode'] ?? '', 10),
                    'country_code' => 'MX'
                ],
                'packages' => [[
                    'package_number' => 1, 'content' => 'Suplementos alimenticios', 'package_type' => '4G',
                    'weight' => $peso, 'length' => 30, 'width' => 20, 'height' => 15, 'consignment_note' => '53102400' 
                ]]
            ]
        ];
    } else {
        $apiEndpoint = ENVIOS_API_BASE . '/orders/';
        $finalPayload = [
            'order' => [
                'reference' => $orderId, 'payment_status' => 'paid', 'total_price' => strval($total),
                'carrier' => $shippingOption['carrier'] ?? 'FEDEX',
                'service' => $shippingOption['service'] ?? 'EXPRESS',
                'parcels' => [[
                    'package_number' => 1, 'weight' => $peso, 'length' => 30, 'width' => 20, 'height' => 15, 
                    'quantity' => 1, 'consignment_note' => '53102400', 'content' => 'Suplementos alimenticios'
                ]],
                'shipper_address' => [
                    'address' => 'Cedro 305', 'postal_code' => '20020', 'reference' => 'LITFIT Office',
                    'country' => 'MX', 'person_name' => 'LITFIT Admin', 'phone' => '4491952361', 'email' => 'mmedellin_89@hotmail.com'
                ],
                'recipient_address' => [
                    'address' => substr($formData['street'] ?? '', 0, 45), 
                    'city' => substr($formData['city'] ?? '', 0, 60), 
                    'state' => substr($formData['state'] ?? '', 0, 60), 
                    'postal_code' => substr($formData['zipCode'] ?? '', 0, 10),
                    'country' => 'MX', 'person_name' => substr(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''), 0, 60), 
                    'phone' => substr($formData['phone'] ?? '', 0, 20), 'email' => substr($formData['email'] ?? '', 0, 60)
                ]
            ]
        ];
    }

    $ch = curl_init($apiEndpoint);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/json',
        'Accept: application/json',
        "Authorization: Bearer $tok"
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($finalPayload));
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    curl_close($ch);
    
    if ($httpCode === 200 || $httpCode === 201 || $httpCode === 202) {
        $jsonDir = __DIR__ . '/pedidos-json';
        if (!is_dir($jsonDir)) mkdir($jsonDir, 0777, true);
        file_put_contents($jsonPath, json_encode($orderData));
        return true;
    }
    
    // Si hay error y estamos en modo depuración, lo mostramos
    if (defined('SHIPPING_DEBUG_MODE') && SHIPPING_DEBUG_MODE) {
        echo "❌ Error API Envíos ($httpCode): " . $response . "\n";
    }
    
    error_log("Error API Envíos ($httpCode): " . $response);
    return false;
}

/**
 * Envía correo de cancelación al cliente
 */
function email_send_cancellation($orderId) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        if (!$row) return false;
        
        $orderData = json_decode($row['order_data'], true);
        $customerEmail = $orderData['formData']['email'] ?? '';
        if (empty($customerEmail)) return false;

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_SMTP_USER;
        $mail->Password   = MAIL_SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = MAIL_SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_SMTP_USER, 'LITFIT México');
        $mail->addAddress($customerEmail);
        $mail->addEmbeddedImage(__DIR__ . '/logo.png', 'logo_litfit');

        $mail->Subject = 'LITFIT – Actualización de tu pedido (Cancelado)';
        $template = file_get_contents(__DIR__ . '/tpl-order-cancelled.html');
        $template = str_replace('{{customer_name}}', $orderData['formData']['firstName'], $template);
        $template = str_replace('{{order_id}}', $orderId, $template);
        $mail->msgHTML($template);
        return $mail->send();
    } catch (Exception $e) {
        error_log("Error enviando email cancelación: " . $e->getMessage());
        return false;
    }
}

/**
 * Envía correo de actualización de envío (con número de guía)
 */
function email_send_shipping_update($orderId, $trackingNumber, $carrier) {
    try {
        $pdo = getDbConnection();
        $stmt = $pdo->prepare("SELECT order_data FROM orders WHERE order_id = ?");
        $stmt->execute([$orderId]);
        $row = $stmt->fetch();
        if (!$row) return false;
        
        $orderData = json_decode($row['order_data'], true);
        $customerEmail = $orderData['formData']['email'] ?? '';
        if (empty($customerEmail)) return false;

        $mail = new PHPMailer(true);
        $mail->isSMTP();
        $mail->Host       = MAIL_SMTP_HOST;
        $mail->SMTPAuth   = true;
        $mail->Username   = MAIL_SMTP_USER;
        $mail->Password   = MAIL_SMTP_PASS;
        $mail->SMTPSecure = PHPMailer::ENCRYPTION_SMTPS;
        $mail->Port       = MAIL_SMTP_PORT;
        $mail->CharSet    = 'UTF-8';
        $mail->setFrom(MAIL_SMTP_USER, 'LITFIT México');
        $mail->addAddress($customerEmail);
        $mail->addEmbeddedImage(__DIR__ . '/logo.png', 'logo_litfit');

        $mail->Subject = '🚚 ¡Tu pedido ya va en camino! – LITFIT';
        $template = file_get_contents(__DIR__ . '/tpl-shipping-update.html');
        $template = str_replace('{{customer_name}}', $orderData['formData']['firstName'], $template);
        $template = str_replace('{{order_id}}', $orderId, $template);
        $template = str_replace('{{tracking_number}}', $trackingNumber, $template);
        $template = str_replace('{{carrier}}', $carrier, $template);
        
        $trackingUrl = "https://www.estafeta.com/Herramientas/Rastreo";
        if (stripos($carrier, 'FedEx') !== false) $trackingUrl = "https://www.fedex.com/es-mx/tracking.html";
        if (stripos($carrier, 'DHL') !== false) $trackingUrl = "https://www.dhl.com/mx-es/home/rastreo.html";

        $template = str_replace('{{tracking_url}}', $trackingUrl, $template);
        $mail->msgHTML($template);
        return $mail->send();
    } catch (Exception $e) {
        error_log("Error enviando email envío: " . $e->getMessage());
        return false;
    }
}

/**
 * Orquestador central: Ejecuta todo el flujo para un pedido pagado
 */
function order_process_complete($orderId, $orderData = null, $debug = false) {
    if (!$orderId) return ['success' => false, 'message' => 'No hay ID de pedido'];
    
    // 🛡️ IDEMPOTENCIA: Verificar si el archivo ya existe (ya fue procesado con éxito)
    $jsonPath = __DIR__ . '/pedidos-json/' . $orderId . '.json';
    if (file_exists($jsonPath)) {
        return ['success' => true, 'message' => 'Pedido ya procesado (Idempotencia)', 'is_duplicate' => true];
    }

    if ($debug) define('SHIPPING_DEBUG_MODE', true);

    $results = ['db' => false, 'email_client' => false, 'email_admin' => false, 'shipping' => false];

    // 1. Actualizar DB
    $results['db'] = db_update_order_status($orderId, 'PAID');

    // 2. Enviar correos
    $results['email_client'] = email_send_order_confirmation($orderId);
    $results['email_admin']  = email_send_admin_notification($orderId);

    // 3. Crear envío
    $results['shipping'] = shipping_create_externally($orderId);

    return [
        'success' => $results['shipping'], // El éxito depende de la creación de la guía
        'message' => $results['shipping'] ? 'Procesado correctamente' : 'Fallo al crear envío',
        'details' => $results
    ];
}
