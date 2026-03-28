<?php
/**
 * ============================================
 * INTEGRACIÃ“N CON ENVÃOS INTERNACIONALES - API REAL
 * ============================================
 * VERSIÃ“N CORREGIDA - Usa el mÃ©todo exacto que funcionÃ³ en el diagnÃ³stico
 */

// ============================================
// CREDENCIALES DE LA API
// ============================================
define('ENVIOS_CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// Endpoints de la API
define('ENVIOS_API_BASE', 'https://app.enviosinternacionales.com/api/v1');
define('ENVIOS_AUTH_URL', ENVIOS_API_BASE . '/oauth/token');
define('ENVIOS_CREATE_ORDER_URL', ENVIOS_API_BASE . '/orders');

// Datos de origen
define('ORIGIN_NAME', 'LITFIT - AlmacÃ©n Principal');
define('ORIGIN_STREET', 'Av. ConstituciÃ³n 123, Col. Centro');
define('ORIGIN_CITY', 'Aguascalientes');
define('ORIGIN_STATE', 'Nuevo LeÃ³n');
define('ORIGIN_ZIP', '20020');
define('ORIGIN_COUNTRY', 'MX');
define('ORIGIN_PHONE', '4491952361');
define('ORIGIN_EMAIL', 'mmedellin_89@hotmail.com');

// ============================================
// CONFIGURACIÃ“N DE HEADERS Y CORS
// ============================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedDomains = [
    'https://litfitmexico.com',
    'figmaiframepreview.figma.site',
    'figma.site'
];

$isAllowed = false;
foreach ($allowedDomains as $domain) {
    if (strpos($origin, $domain) !== false) {
        $isAllowed = true;
        break;
    }
}

if ($isAllowed && $origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("====== Nueva solicitud a crear-orden.php ======");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'MÃ©todo no permitido']);
    exit;
}

// ============================================
// LEER DATOS DEL PEDIDO
// ============================================

$rawInput = file_get_contents('php://input');
error_log("ðŸ“¥ Datos recibidos: " . substr($rawInput, 0, 500));

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON invÃ¡lido']);
    exit;
}

// Validar datos requeridos
$required = ['orderId', 'items', 'formData', 'total'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: $field"]);
        exit;
    }
}

$orderId = $input['orderId'];
$items = $input['items'];
$formData = $input['formData'];
$total = $input['total'];
$shippingCost = $input['shippingCost'] ?? 0;
$totalPrice = $input['totalPrice'] ?? ($total - $shippingCost);
$paymentMethod = $input['paymentMethod'] ?? 'Mercado Pago';
$shippingOption = $input['shippingOption'] ?? null;

error_log("ðŸ“¦ Procesando orden: " . $orderId);

// ============================================
// FUNCIÃ“N PARA OBTENER TOKEN - MÃ‰TODO QUE FUNCIONÃ“ EN DIAGNÃ“STICO
// ============================================
function obtenerTokenFresco() {
    error_log("ðŸ” Obteniendo token con mÃ©todo application/x-www-form-urlencoded...");
    
    // âœ… ESTE ES EL CÃ“DIGO EXACTO QUE FUNCIONÃ“ EN EL DIAGNÃ“STICO
    $postData = http_build_query([
        'grant_type' => 'client_credentials',
        'client_id' => ENVIOS_CLIENT_ID,
        'client_secret' => ENVIOS_CLIENT_SECRET
    ]);

    $ch = curl_init(ENVIOS_AUTH_URL);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_POST, true);
    curl_setopt($ch, CURLOPT_HTTPHEADER, [
        'Content-Type: application/x-www-form-urlencoded',
        'Accept: application/json'
    ]);
    curl_setopt($ch, CURLOPT_POSTFIELDS, $postData);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 15);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    curl_close($ch);

    error_log("ðŸ“¥ Respuesta autenticaciÃ³n - HTTP: " . $httpCode);
    error_log("ðŸ“¥ Respuesta body: " . substr($response, 0, 300));

    if ($httpCode === 200) {
        $json = json_decode($response, true);
        if (isset($json['access_token'])) {
            error_log("âœ… Token obtenido exitosamente");
            return $json['access_token'];
        }
    }
    
    if ($curlError) {
        error_log("âŒ CURL Error: " . $curlError);
    }
    
    error_log("âŒ Error obteniendo Token. HTTP Code: " . $httpCode);
    return false;
}

// ============================================
// CALCULAR PESO Y DIMENSIONES DEL PAQUETE
// ============================================

function calcularPesoTotal($items) {
    $pesoTotal = 0;
    
    foreach ($items as $item) {
        $nombreLower = strtolower($item['name']);
        $cantidad = intval($item['quantity'] ?? 1);
        
        if (strpos($nombreLower, 'proteÃ­na') !== false || strpos($nombreLower, 'protein') !== false) {
            $pesoTotal += 1.2 * $cantidad;
        } elseif (strpos($nombreLower, 'barra') !== false || strpos($nombreLower, 'bar') !== false) {
            $pesoTotal += 0.1 * $cantidad;
        } else {
            $pesoTotal += 0.5 * $cantidad;
        }
    }
    
    return max(0.5, min($pesoTotal, 30));
}

$pesoTotal = calcularPesoTotal($items);
error_log("âš–ï¸ Peso calculado: " . $pesoTotal . " kg");

$dimensions = [
    'length' => 30,
    'width' => 20,
    'height' => 15
];

// ============================================
// PREPARAR DESCRIPCIÃ“N DE PRODUCTOS
// ============================================

$productosTexto = '';
$productosArray = [];

foreach ($items as $item) {
    $descripcion = $item['name'];
    if (!empty($item['variant'])) {
        $descripcion .= " - " . $item['variant'];
    }
    if (!empty($item['size'])) {
        $descripcion .= " (" . $item['size'] . ")";
    }
    
    $productosTexto .= "â€¢ " . $descripcion . " x" . $item['quantity'] . "\n";
    
    $productosArray[] = [
        'name' => $item['name'],
        'variant' => $item['variant'] ?? '',
        'quantity' => $item['quantity']
    ];
}

// ============================================
// PREPARAR DATOS PARA LA API
// ============================================

$apiProducts = [];
foreach ($items as $item) {
    $apiProducts[] = [
        'name' => $item['name'],
        'sku' => $item['sku'] ?? 'LITFIT-' . substr(md5($item['name'] . ($item['variant'] ?? '') . ($item['size'] ?? '')), 0, 8),
        'price' => strval($item['price'] ?? 0),
        'quantity' => intval($item['quantity'] ?? 1),
        'weight' => 1.0,
        'length' => 10,
        'width' => 10,
        'height' => 15,
        'hs_code' => '2106909900'
    ];
}

// Extraer carrier y service del shippingOption si existe
$selectedCarrier = $shippingOption['carrier'] ?? 'ESTÃNDAR';
$selectedService = $shippingOption['service'] ?? 'NACIONAL';
$selectedRateId = $shippingOption['id'] ?? $shippingOption['quoteId'] ?? null;

$shipmentData = [
    'order' => [
        'reference' => $orderId,
        'reference_number' => $orderId,
        'payment_status' => 'paid',
        'total_price' => strval($total),
        'platform' => 'custom',
        'package_type' => 'box',
        'carrier' => $selectedCarrier,
        'service' => $selectedService,
        'rate_id' => $selectedRateId,
        'payment_method' => $paymentMethod,
        
        'parcels' => [
            [
                'weight' => floatval($pesoTotal),
                'length' => intval($dimensions['length']),
                'width' => intval($dimensions['width']),
                'height' => intval($dimensions['height']),
                'quantity' => 1,
                'dimension_unit' => 'cm',
                'mass_unit' => 'kg',
                'package_type' => 'box',
                'consignment_note' => 'Suplementos alimenticios - ' . substr($productosTexto, 0, 100)
            ]
        ],
        
        'products' => $apiProducts,
        
        'shipper_address' => [
            'address' => ORIGIN_STREET,
            'internal_number' => '',
            'reference' => 'AlmacÃ©n LITFIT',
            'sector' => 'Centro',
            'city' => ORIGIN_CITY,
            'state' => ORIGIN_STATE,
            'postal_code' => ORIGIN_ZIP,
            'country' => ORIGIN_COUNTRY,
            'person_name' => ORIGIN_NAME,
            'company' => 'LITFIT',
            'phone' => ORIGIN_PHONE,
            'email' => ORIGIN_EMAIL
        ],
        
        'recipient_address' => [
            'address' => $formData['street'] ?? '',
            'internal_number' => '',
            'reference' => $formData['notes'] ?? '',
            'sector' => $formData['colonia'] ?? '',
            'city' => $formData['city'] ?? '',
            'state' => $formData['state'] ?? '',
            'postal_code' => $formData['zipCode'] ?? '',
            'country' => 'MX',
            'person_name' => trim(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? '')),
            'company' => '',
            'phone' => $formData['phone'] ?? '',
            'email' => $formData['email'] ?? ''
        ]
    ]
];

error_log("ðŸ“¤ Datos preparados para API");
error_log("ðŸ“¦ Destino: " . $shipmentData['order']['recipient_address']['city'] . ", " . $shipmentData['order']['recipient_address']['state']);
error_log("ðŸ“‹ Colonia: " . ($formData['colonia'] ?? 'N/A'));

// ============================================
// LLAMAR A LA API PARA CREAR EL ENVÃO
// ============================================

error_log("ðŸ”„ Obteniendo token de autorizaciÃ³n...");
$tokenFresco = obtenerTokenFresco();

if (!$tokenFresco) {
    error_log("âŒ No se pudo autenticar con la API de envÃ­os.");
    enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden guardada (Fallo de autenticaciÃ³n API, notificaciÃ³n por email)',
        'orderId' => $orderId,
        'method' => 'email_fallback'
    ]);
    exit;
}

error_log("âœ… Token obtenido, creando envÃ­o...");

$authHeader = 'Authorization: Bearer ' . $tokenFresco;

$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    $authHeader
];

error_log("ðŸš€ Llamando a API: " . ENVIOS_CREATE_ORDER_URL);

$ch = curl_init(ENVIOS_CREATE_ORDER_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($shipmentData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

error_log("ðŸ“¥ HTTP Code de creaciÃ³n: " . $httpCode);

// ============================================
// MANEJAR RESPUESTA DE LA API
// ============================================

if ($curlError) {
    error_log("âŒ CURL Error: " . $curlError);
    enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden guardada (API no disponible, notificaciÃ³n por email)',
        'orderId' => $orderId,
        'method' => 'email_fallback',
        'apiError' => $curlError
    ]);
    exit;
}

error_log("ðŸ“¥ Respuesta API: " . substr($response, 0, 500));

$apiResponse = json_decode($response, true);

// ============================================
// PROCESAR RESPUESTA EXITOSA
// ============================================

if ($httpCode === 200 || $httpCode === 201) {
    error_log("âœ… EnvÃ­o creado exitosamente en EnvÃ­os Internacionales");
    
    guardarLog($orderId, $formData, $total, $paymentMethod, 'API', $apiResponse);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'EnvÃ­o creado exitosamente',
        'orderId' => $orderId,
        'method' => 'api',
        'shipmentId' => $apiResponse['id'] ?? null,
        'trackingNumber' => $apiResponse['tracking_number'] ?? null,
        'carrier' => $apiResponse['carrier'] ?? null,
        'apiResponse' => $apiResponse
    ]);
    exit;
}

// ============================================
// MANEJAR ERRORES DE LA API
// ============================================

error_log("âŒ Error HTTP " . $httpCode . " de EnvÃ­os Internacionales");
error_log("ðŸ“‹ Respuesta completa: " . $response);

enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod);

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Orden guardada (error en API, notificaciÃ³n por email)',
    'orderId' => $orderId,
    'method' => 'email_fallback',
    'apiError' => [
        'httpCode' => $httpCode,
        'response' => $apiResponse
    ]
]);

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod) {
    error_log("ðŸ“§ Enviando email de fallback...");
    
    $emailDestino = 'ricoro845@gmail.com';
    
    $direccionCompleta = sprintf(
        "%s, Col. %s, %s, %s, CP %s, MÃ©xico",
        $formData['street'] ?? '',
        $formData['colonia'] ?? '',
        $formData['city'] ?? '',
        $formData['state'] ?? '',
        $formData['zipCode'] ?? ''
    );
    
    $asunto = "âš ï¸ Nueva Orden de EnvÃ­o - LITFIT - #" . $orderId . " (Crear Manualmente)";
    
    $mensaje = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #FF5722; color: white; padding: 20px; text-align: center; }
        .alert { background: #FFF3CD; border: 2px solid #FFC107; padding: 15px; margin: 20px 0; border-radius: 5px; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .label { font-weight: bold; color: #00AAC7; }
        .value { margin-bottom: 10px; }
        .products { background: white; padding: 15px; border-left: 4px solid #00AAC7; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>âš ï¸ Nueva Orden de EnvÃ­o - LITFIT</h1>
            <p>Orden #" . htmlspecialchars($orderId) . "</p>
        </div>
        
        <div class='alert'>
            <strong>âš ï¸ ATENCIÃ“N:</strong> Esta orden no pudo ser creada automÃ¡ticamente en la API de EnvÃ­os Internacionales.
            Por favor, crÃ©ala manualmente en su sistema usando los siguientes datos.
        </div>
        
        <div class='section'>
            <h2>ðŸ“¦ INFORMACIÃ“N DEL DESTINATARIO</h2>
            <div class='value'><span class='label'>Nombre:</span> " . htmlspecialchars(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? '')) . "</div>
            <div class='value'><span class='label'>TelÃ©fono:</span> " . htmlspecialchars($formData['phone'] ?? '') . "</div>
            <div class='value'><span class='label'>Email:</span> " . htmlspecialchars($formData['email'] ?? '') . "</div>
            <div class='value'><span class='label'>DirecciÃ³n:</span> " . htmlspecialchars($direccionCompleta) . "</div>
            <div class='value'><span class='label'>CÃ³digo Postal:</span> <strong>" . htmlspecialchars($formData['zipCode'] ?? '') . "</strong></div>
            <div class='value'><span class='label'>Colonia:</span> <strong>" . htmlspecialchars($formData['colonia'] ?? 'N/A') . "</strong></div>
        </div>
        
        <div class='section'>
            <h2>ðŸ“¦ PRODUCTOS A ENVIAR</h2>
            <div class='products'>
                <pre>" . htmlspecialchars($productosTexto) . "</pre>
            </div>
        </div>
        
        <div class='section'>
            <h2>ðŸ’° INFORMACIÃ“N DEL PAGO</h2>
            <div class='value'><span class='label'>MÃ©todo de pago:</span> " . htmlspecialchars($paymentMethod) . "</div>
            <div class='value'><span class='label'>Total productos:</span> $" . number_format($total - $shippingCost, 2) . " MXN</div>
            <div class='value'><span class='label'>Costo de envÃ­o:</span> $" . number_format($shippingCost, 2) . " MXN</div>
            <div class='value'><span class='label'>Total pagado:</span> <strong>$" . number_format($total, 2) . " MXN</strong></div>
            <div class='value'><span class='label'>Estado:</span> <span style='color: green; font-weight: bold;'>âœ… PAGADO</span></div>
        </div>
        
        <div class='section'>
            <h2>ðŸ“ NOTAS ADICIONALES</h2>
            <p>" . htmlspecialchars($formData['notes'] ?? 'Sin notas') . "</p>
        </div>
        
        <div class='footer'>
            <p>Este email fue generado automÃ¡ticamente por el sistema de LITFIT</p>
            <p><strong>Por favor, crea el envÃ­o manualmente en su sistema</strong></p>
            <p>NÃºmero de referencia: " . htmlspecialchars($orderId) . "</p>
        </div>
    </div>
</body>
</html>
";
    
    $headers = [
        'MIME-Version: 1.0',
        'Content-type: text/html; charset=UTF-8',
        'From: LITFIT Automatizado <noreply@litfit.inedito.digital>',
        'Reply-To: reenviadorlitfit@inedito.digital',
        'X-Priority: 1 (Highest)'
    ];
    
    $emailEnviado = mail($emailDestino, $asunto, $mensaje, implode("\r\n", $headers));
    
    if ($emailEnviado) {
        error_log("âœ… Email de fallback enviado correctamente");
    } else {
        error_log("âŒ Error enviando email de fallback");
    }
}

function guardarLog($orderId, $formData, $total, $paymentMethod, $metodo, $apiResponse = null) {
    $logFile = __DIR__ . '/ordenes-log.txt';
    
    $logEntry = sprintf(
        "[%s] Orden: %s | Cliente: %s | Total: $%s | MÃ©todo Pago: %s | MÃ©todo EnvÃ­o: %s | Tracking: %s\n",
        date('Y-m-d H:i:s'),
        $orderId,
        ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''),
        number_format($total, 2),
        $paymentMethod,
        $metodo,
        $apiResponse['tracking_number'] ?? 'N/A'
    );
    
    file_put_contents($logFile, $logEntry, FILE_APPEND);
    error_log("âœ… Log guardado localmente");
}
?>


