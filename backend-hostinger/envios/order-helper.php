<?php
/**
 * Helper para procesamiento centralizado de pedidos (LITFIT)
 * Maneja base de datos, correos y integración con envíos.
 */

require_once __DIR__ . '/admin-config.php';

use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

// Carga opcional de PHPMailer
if (!class_exists('PHPMailer\PHPMailer\PHPMailer')) {
    $exceptionPath = __DIR__ . '/php-mailer/src/Exception.php';
    if (file_exists($exceptionPath)) {
        require $exceptionPath;
        require __DIR__ . '/php-mailer/src/PHPMailer.php';
        require __DIR__ . '/php-mailer/src/SMTP.php';
        define('MAILER_ACTIVE', true);
    } else {
        define('MAILER_ACTIVE', false);
    }
} else {
    define('MAILER_ACTIVE', true);
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

    $items = $orderData['items'];
    $formData = $orderData['formData'];
    $shippingOption = $orderData['shippingOption'] ?? ($orderData['selectedShippingOption'] ?? null);
    
    // 🚀 LÓGICA DE AUTENTICACIÓN OAUTH CORRECTA (Como en crear-orden-FINAL.php)
    $postAuthData = http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => ENVIOS_CLIENT_ID,
        'client_secret' => ENVIOS_CLIENT_SECRET
    ]);

    $chAuth = curl_init(ENVIOS_API_BASE . '/oauth/token');
    curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chAuth, CURLOPT_POST, true);
    curl_setopt($chAuth, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ]);
    curl_setopt($chAuth, CURLOPT_POSTFIELDS, $postAuthData);
    $authResp = curl_exec($chAuth);
    $authData = json_decode($authResp, true);
    curl_close($chAuth);
    
    $token = $authData['access_token'] ?? '';

    if (!$token) {
        error_log("❌ Error de OAuth en Envíos: " . $authResp);
        return false;
    }

    $pesoTotal = 0;
    $productosTexto = '';
    $apiProducts = [];

    foreach ($items as $item) {
        $nombreLower = strtolower($item['name']);
        $cantidad = intval($item['quantity'] ?? 1);
        if (strpos($nombreLower, 'proteína') !== false || strpos($nombreLower, 'protein') !== false) {
            $pesoTotal += 1.2 * $cantidad;
        } elseif (strpos($nombreLower, 'barra') !== false || strpos($nombreLower, 'bar') !== false) {
            $pesoTotal += 0.1 * $cantidad;
        } else {
            $pesoTotal += 0.5 * $cantidad;
        }
        
        $descripcion = $item['name'];
        if (!empty($item['variant'])) $descripcion .= " - " . $item['variant'];
        if (!empty($item['size'])) $descripcion .= " (" . $item['size'] . ")";
        $productosTexto .= "• " . $descripcion . " x" . $cantidad . " ";

        $apiProducts[] = [
            'name' => $item['name'],
            'sku' => $item['sku'] ?? 'LITFIT-' . substr(md5($descripcion), 0, 8),
            'price' => strval($item['price'] ?? 0),
            'quantity' => $cantidad,
            'weight' => 1.0,
            'length' => 10, 'width' => 10, 'height' => 15,
            'hs_code' => '2106909900'
        ];
    }
    
    $pesoTotal = max(0.5, min($pesoTotal, 30));

    $selectedCarrier = $shippingOption['carrier'] ?? 'ESTÁNDAR';
    $selectedService = $shippingOption['service'] ?? 'NACIONAL';
    $selectedRateId = $shippingOption['id'] ?? $shippingOption['quoteId'] ?? null;
    $paymentMethod = $orderData['paymentMethod'] ?? 'Mercado Pago';

    $shipmentData = [
        'order' => [
            'reference' => $orderId,
            'reference_number' => $orderId,
            'payment_status' => 'paid',
            'total_price' => strval($orderData['total']),
            'platform' => 'custom',
            'package_type' => 'box',
            'carrier' => $selectedCarrier,
            'service' => $selectedService,
            'rate_id' => $selectedRateId,
            'payment_method' => $paymentMethod,
            'parcels' => [
                [
                    'weight' => floatval($pesoTotal),
                    'length' => 30, 'width' => 20, 'height' => 15,
                    'quantity' => 1,
                    'dimension_unit' => 'cm', 'mass_unit' => 'kg',
                    'package_type' => 'box',
                    'consignment_note' => 'Suplementos alimenticios - ' . substr($productosTexto, 0, 80)
                ]
            ],
            'products' => $apiProducts,
            'shipper_address' => [
                'address' => 'Av. Constitución 123, Col. Centro',
                'internal_number' => '', 'reference' => 'Almacén LITFIT',
                'sector' => 'Centro', 'city' => 'Aguascalientes', 'state' => 'Nuevo León',
                'postal_code' => '20020', 'country' => 'MX',
                'person_name' => 'LITFIT - Almacén Principal', 'company' => 'LITFIT',
                'phone' => '4491952361', 'email' => 'mmedellin_89@hotmail.com'
            ],
            'recipient_address' => [
                'address' => $formData['street'] ?? '',
                'internal_number' => '', 'reference' => $formData['notes'] ?? '',
                'sector' => $formData['colonia'] ?? '',
                'city' => $formData['city'] ?? '', 'state' => $formData['state'] ?? '',
                'postal_code' => $formData['zipCode'] ?? '', 'country' => 'MX',
                'person_name' => trim(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? '')),
                'company' => '',
                'phone' => $formData['phone'] ?? '', 'email' => $formData['email'] ?? ''
            ]
        ]
    ];

    $chS = curl_init(ENVIOS_API_BASE . '/orders');
    curl_setopt($chS, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chS, CURLOPT_POST, true);
    curl_setopt($chS, CURLOPT_POSTFIELDS, json_encode($shipmentData));
    curl_setopt($chS, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Accept: application/json', 'Authorization: Bearer ' . $token]);
    $response = curl_exec($chS);
    $httpCode = curl_getinfo($chS, CURLINFO_HTTP_CODE);
    $curlError = curl_error($chS);
    curl_close($chS);
    
    $apiResponse = json_decode($response, true);

    $logMsg = "[" . date('Y-m-d H:i:s') . "] Pedido: $orderId | HTTP: $httpCode | Resp: $response";
    if ($curlError) $logMsg .= " | cURL Error: $curlError";
    file_put_contents(__DIR__ . '/debug-envios.log', $logMsg . PHP_EOL, FILE_APPEND);

    if ($httpCode === 200 || $httpCode === 201) {
        $tracking = $apiResponse['tracking_number'] ?? 'N/A';
        $label = $apiResponse['label_url'] ?? null;
        
        $orderData['trackingNumber'] = $tracking;
        $orderData['label_url'] = $label;

        $jsonDir = __DIR__ . '/pedidos-json';
        if (!is_dir($jsonDir)) mkdir($jsonDir, 0777, true);
        file_put_contents($jsonPath, json_encode($orderData));
        
        db_update_order_status($orderId, 'PAID', [
            'trackingNumber' => $tracking,
            'carrier' => $selectedCarrier
        ]);
        return true;
    }
    
    error_log("Error API Envíos /orders ($httpCode): " . $response);
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
