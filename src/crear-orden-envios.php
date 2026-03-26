<?php
/**
 * ============================================
 * INTEGRACIÓN CON ENVÍOS INTERNACIONALES - API REAL
 * ============================================
 * 
 * Este archivo crea automáticamente envíos en enviosinternacionales.com
 * usando su API REST después de un pago exitoso, con autenticación dinámica.
 * 
 * 📍 UBICACIÓN EN CPANEL:
 * /home/inedito/public_html/cdn.inedito.digital/envios/crear-orden.php
 */

// ============================================
// CREDENCIALES DE LA API (PERMANENTES)
// ============================================

// ⚠️ PEGA AQUÍ TUS CREDENCIALES (Desde Integraciones > API)
define('ENVIOS_CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// Endpoints de la API
define('ENVIOS_API_BASE', 'https://app.enviosinternacionales.com/api/v1');
define('ENVIOS_AUTH_URL', ENVIOS_API_BASE . '/oauth/token');
define('ENVIOS_CREATE_ORDER_URL', ENVIOS_API_BASE . '/orders');

// Datos de origen (tu almacén/oficina) - AJUSTAR SEGÚN TU UBICACIÓN
define('ORIGIN_NAME', 'LITFIT - Almacén Principal');
define('ORIGIN_STREET', 'Av. Constitución 123, Col. Centro');
define('ORIGIN_CITY', 'Monterrey');
define('ORIGIN_STATE', 'Nuevo León');
define('ORIGIN_ZIP', '64000');
define('ORIGIN_COUNTRY', 'MX');
define('ORIGIN_PHONE', '8112345678');
define('ORIGIN_EMAIL', 'ricoro845@gmail.com');

// ============================================
// CONFIGURACIÓN DE HEADERS Y CORS
// ============================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedDomains = [
    'https://litfitmexico.com',
    'https://www.litfitmexico.com',
    'https://litfit.inedito.digital',
    'figmaiframepreview.figma.site',
    'figma.site'
];

$isAllowed = false;
foreach ($allowedDomains as $domain) {
    if ($origin && strpos($origin, $domain) !== false) {
        $isAllowed = true;
        break;
    }
}

if ($isAllowed && $origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
} else {
    header('Access-Control-Allow-Origin: *');
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
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// ============================================
// LEER DATOS DEL PEDIDO
// ============================================

$rawInput = file_get_contents('php://input');
error_log("📥 Datos recibidos: " . substr($rawInput, 0, 500));

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
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

error_log("📦 Procesando orden: " . $orderId);

// ============================================
// FUNCIÓN PARA OBTENER TOKEN FRESCO
// ============================================
function obtenerTokenFresco() {
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
    curl_close($ch);

    if ($httpCode === 200) {
        $json = json_decode($response, true);
        return $json['access_token'] ?? false;
    }
    
    error_log("❌ Error obteniendo Token. HTTP Code: " . $httpCode);
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
        
        if (strpos($nombreLower, 'proteína') !== false || strpos($nombreLower, 'protein') !== false) {
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
error_log("⚖️ Peso calculado: " . $pesoTotal . " kg");

$dimensions = !empty($shippingOption['dimensions']) ? $shippingOption['dimensions'] : [
    'length' => 30,
    'width' => 20,
    'height' => 15
];

// ============================================
// PREPARAR DESCRIPCIÓN DE PRODUCTOS
// ============================================

$productosTexto = '';
foreach ($items as $item) {
    $descripcion = $item['name'];
    if (!empty($item['variant'])) $descripcion .= " - " . $item['variant'];
    if (!empty($item['size'])) $descripcion .= " (" . $item['size'] . ")";
    $productosTexto .= "• " . $descripcion . " x" . $item['quantity'] . "\n";
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
        'hs_code' => '2106909900' // Código genérico para suplementos
    ];
}

$selectedCarrier = $shippingOption['carrier'] ?? 'ESTÁNDAR';
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
            'reference' => 'Almacén LITFIT',
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

// ============================================
// LLAMAR A LA API PARA CREAR EL ENVÍO
// ============================================

error_log("🔄 Obteniendo token de autorización...");
$tokenFresco = obtenerTokenFresco();

if (!$tokenFresco) {
    error_log("❌ No se pudo autenticar con la API de envíos.");
    enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod, $selectedCarrier, $selectedService);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden guardada (Fallo de autenticación API, notificación por email)',
        'orderId' => $orderId,
        'method' => 'email_fallback'
    ]);
    exit;
}

$authHeader = 'Authorization: Bearer ' . $tokenFresco;

$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    $authHeader
];

error_log("🚀 Llamando a API: " . ENVIOS_CREATE_ORDER_URL);

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

error_log("📥 HTTP Code: " . $httpCode);

if ($curlError) {
    error_log("❌ CURL Error: " . $curlError);
    enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod, $selectedCarrier, $selectedService);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden guardada (API no disponible)',
        'orderId' => $orderId,
        'method' => 'email_fallback'
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

if ($httpCode === 200 || $httpCode === 201) {
    error_log("✅ Envío creado exitosamente");
    guardarLog($orderId, $formData, $total, $paymentMethod, $selectedCarrier . ' ' . $selectedService, $apiResponse);
    
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Envío creado exitosamente',
        'orderId' => $orderId,
        'shipmentId' => $apiResponse['id'] ?? null,
        'trackingNumber' => $apiResponse['tracking_number'] ?? null,
        'carrier' => $apiResponse['carrier'] ?? $selectedCarrier
    ]);
    exit;
}

error_log("❌ Error en API: " . $response);
enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod, $selectedCarrier, $selectedService);

http_response_code(200);
echo json_encode([
    'success' => true,
    'message' => 'Orden recibida (error en API)',
    'orderId' => $orderId,
    'method' => 'email_fallback'
]);

// ============================================
// FUNCIONES AUXILIARES
// ============================================

function enviarEmailFallback($orderId, $formData, $productosTexto, $total, $shippingCost, $paymentMethod, $carrier = 'No selec.', $service = '') {
    $emailDestino = 'ricoro845@gmail.com';
    $asunto = "⚠️ Nueva Orden (MANUAL) - LITFIT - #" . $orderId;
    
    $mensaje = "
    <h2>📦 NUEVA ORDEN PARA PROCESAR MANUALMENTE</h2>
    <p><strong>Orden ID:</strong> {$orderId}</p>
    <p><strong>Cliente:</strong> {$formData['firstName']} {$formData['lastName']}</p>
    <p><strong>Teléfono:</strong> {$formData['phone']}</p>
    <p><strong>Envío seleccionado:</strong> {$carrier} {$service}</p>
    <p><strong>Dirección:</strong> {$formData['street']}, Col. {$formData['colonia']}, {$formData['city']}, {$formData['state']}, CP {$formData['zipCode']}</p>
    <p><strong>Productos:</strong><br><pre>{$productosTexto}</pre></p>
    <p><strong>Total pagado:</strong> ${$total} MXN ({$paymentMethod})</p>
    ";
    
    $headers = ['MIME-Version: 1.0', 'Content-type: text/html; charset=UTF-8', 'From: LITFIT <noreply@litfit.inedito.digital>'];
    mail($emailDestino, $asunto, $mensaje, implode("\r\n", $headers));
}

function guardarLog($orderId, $formData, $total, $paymentMethod, $metodo, $apiResponse = null) {
    $logEntry = sprintf("[%s] Orden: %s | Cliente: %s | Total: $%s | Pago: %s | Envío: %s | Tracking: %s\n",
        date('Y-m-d H:i:s'), $orderId, $formData['firstName'] . ' ' . $formData['lastName'], number_format($total, 2), $paymentMethod, $metodo, $apiResponse['tracking_number'] ?? 'N/A');
    file_put_contents(__DIR__ . '/ordenes-log.txt', $logEntry, FILE_APPEND);
}
?>
