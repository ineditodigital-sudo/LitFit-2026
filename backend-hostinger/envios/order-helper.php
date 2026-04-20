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
    
    // 🚀 LÓGICA DE AUTENTICACIÓN OAUTH (Igual que cotizar.php)
    $chAuth = curl_init(ENVIOS_API_BASE . '/oauth/token');
    curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chAuth, CURLOPT_POST, true);
    curl_setopt($chAuth, CURLOPT_POSTFIELDS, http_build_query([
        'client_id'     => ENVIOS_CLIENT_ID,
        'client_secret' => ENVIOS_CLIENT_SECRET,
        'grant_type'    => 'client_credentials'
    ]));
    $authResp = curl_exec($chAuth);
    $authData = json_decode($authResp, true);
    curl_close($chAuth);
    
    $token = $authData['access_token'] ?? '';

    if (!$token) {
        error_log("❌ Error de OAuth en Envíos: " . $authResp);
        return false;
    }

    $peso = 1.0;
    foreach ($items as $it) {
        if (strpos(strtolower($it['name']), 'prote') !== false) $peso += 1.0;
    }

    // --- NUEVO FLUJO DE 2 PASOS (Cotizar -> Crear) ---
    error_log("🔍 Iniciando flujo de 2 pasos para orderId: $orderId");

    // PASO 1: COTIZAR PARA OBTENER UN RATE_ID
    $quotePayload = [
        'quotation' => [
            'address_from' => [
                'country_code' => 'MX', 'postal_code' => '20020',
                'area_level1' => 'Aguascalientes', 'area_level2' => 'Aguascalientes',
                'area_level3' => 'Centro', // Colonia obligatoria
                'address_line_1' => 'Cedro 305'
            ],
            'address_to' => [
                'country_code' => 'MX', 'postal_code' => ($formData['zipCode'] ?? '20000'),
                'area_level1' => ($formData['state'] ?? 'Aguascalientes'),
                'area_level2' => ($formData['city'] ?? 'Aguascalientes'),
                'area_level3' => ($formData['colonia'] ?? 'Centro'), // Colonia obligatoria
                'address_line_1' => ($formData['street'] ?? 'Conocido 1')
            ],
            'parcels' => [[
                'weight' => 1.0, 'length' => 15.0, 'width' => 15.0, 'height' => 15.0
            ]]
        ]
    ];

    $chQ = curl_init(ENVIOS_API_BASE . '/quotations');
    curl_setopt($chQ, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chQ, CURLOPT_POST, true);
    curl_setopt($chQ, CURLOPT_POSTFIELDS, json_encode($quotePayload));
    curl_setopt($chQ, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $token]);
    // PASO 1: COTIZAR
    $quoteRespRaw = curl_exec($chQ);
    $quoteResp = json_decode($quoteRespRaw, true);
    curl_close($chQ);

    // Buscar la primera tarifa exitosa
    $rateId = null;
    if (isset($quoteResp['rates']) && is_array($quoteResp['rates'])) {
        foreach ($quoteResp['rates'] as $rate) {
            if (isset($rate['success']) && $rate['success'] === true && !empty($rate['id'])) {
                $rateId = $rate['id'];
                break;
            }
        }
    }

    $packagesFromQuote = $quoteResp['packages'] ?? []; 

    if (!$rateId || empty($packagesFromQuote)) {
        $errorMsg = "❌ ERROR EN COTIZACIÓN: No se encontró tarifa válida o paquetes. " . ($quoteResp['message'] ?? '');
        file_put_contents(__DIR__ . '/debug-envios.log', "[" . date('Y-m-d H:i:s') . "] $errorMsg" . PHP_EOL, FILE_APPEND);
        return false;
    }

    // PASO 2: CREAR ENVÍO COPIANDO LOS PAQUETES
    $packagesForShipment = [];
    foreach ($packagesFromQuote as $p) {
        $packagesForShipment[] = [
            'package_number'    => $p['package_number'] ?? 1,
            'package_type'      => '4G', // SAT CODE: Caja de cartón (Requerido por Carta Porte)
            'content'           => 'Suplementos alimenticios',
            'consignment_note'  => '51191900', // SAT CODE: Suplementos alimenticios
            'weight' => floatval($p['weight']), 'length' => floatval($p['length']), 
            'width' => floatval($p['width']), 'height' => floatval($p['height'])
        ];
    }

    $shipmentPayload = [
        'shipment' => [
            'rate_id' => $rateId,
            'address_from' => [
                'name' => 'LITFIT MEXICO', 'email' => 'mmedellin_89@hotmail.com', 'phone' => '4491952361',
                'street1' => 'Cedro 305', 'postal_code' => '20020', 'reference' => 'Frente a parque'
            ],
            'address_to' => [
                'name' => ($formData['firstName'] ?? 'Cliente') . ' ' . ($formData['lastName'] ?? 'Final'),
                'email' => $formData['email'] ?? 'compra@litfit.com',
                'phone' => substr(preg_replace('/[^0-9]/', '', $formData['phone'] ?? '4491000000'), 0, 10),
                'street1' => ($formData['street'] ?? 'Dirección Conocida') . ' ' . ($formData['number'] ?? 'SN'),
                'postal_code' => ($formData['zipCode'] ?? '20000'), 'reference' => 'Entrega LITFIT'
            ],
            'packages' => $packagesForShipment
        ]
    ];

    $chS = curl_init(ENVIOS_API_BASE . '/shipments/');
    curl_setopt($chS, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($chS, CURLOPT_POST, true);
    curl_setopt($chS, CURLOPT_POSTFIELDS, json_encode($shipmentPayload));
    curl_setopt($chS, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $token]);
    $response = curl_exec($chS);
    $httpCode = curl_getinfo($chS, CURLINFO_HTTP_CODE);
    curl_close($chS);
    
    $apiResponse = json_decode($response, true);

    // LOG DE SEGURIDAD (Para que la usuaria vea qué pasó si algo falla)
    $logMsg = "[" . date('Y-m-d H:i:s') . "] Pedido: $orderId | HTTP: $httpCode | Resp: $response";
    if ($curlError) $logMsg .= " | cURL Error: $curlError";
    file_put_contents(__DIR__ . '/debug-envios.log', $logMsg . PHP_EOL, FILE_APPEND);

    if ($httpCode === 200 || $httpCode === 201) {
        // Éxito: Guardamos el tracking y marcamos como procesado
        $tracking = $apiResponse['tracking_number'] ?? 'N/A';
        $label = $apiResponse['label_url'] ?? null;
        
        // Actualizar la data local con la info de la guía
        $orderData['trackingNumber'] = $tracking;
        $orderData['label_url'] = $label;

        $jsonDir = __DIR__ . '/pedidos-json';
        if (!is_dir($jsonDir)) mkdir($jsonDir, 0777, true);
        file_put_contents($jsonPath, json_encode($orderData));
        
        // Actualizar en DB
        db_update_order_status($orderId, 'PAID', [
            'trackingNumber' => $tracking,
            'carrier' => $shippingOption['carrier'] ?? 'N/A'
        ]);

        return true;
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
