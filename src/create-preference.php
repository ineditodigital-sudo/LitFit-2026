<?php
/**
 * ============================================
 * API DE MERCADO PAGO - CREAR PREFERENCIA DE PAGO
 * ============================================
 * 
 * Este archivo crea una preferencia de pago en Mercado Pago
 * y devuelve la URL de checkout para redirigir al usuario.
 * 
 * 📍 UBICACIÓN EN CPANEL:
 * /home/inedito/public_html/cdn/mercadopago/create-preference.php
 * 
 * 🌐 URL DE ACCESO:
 * https://cdn.inedito.digital/mercadopago/create-preference.php
 * 
 * Frontend en: https://litfit.inedito.digital (Figma Make)
 */

// ============================================
// CONFIGURACIÓN DE HEADERS Y CORS
// ============================================

// Permitir acceso desde Figma Make (todos los previews) y dominio personalizado
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

// Lista de dominios permitidos
$allowedDomains = [
    'https://litfit.inedito.digital',
    'figmaiframepreview.figma.site', // Permite todos los previews de Figma
    'figma.site' // Permite todos los dominios de Figma Make
];

// Verificar si el origen está permitido
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

// Habilitar logging de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("====== Nueva solicitud a create-preference.php ======");

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir método POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("❌ Método no permitido: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode([
        'success' => false,
        'message' => 'Método no permitido. Use POST.'
    ]);
    exit;
}

// ============================================
// CARGAR CONFIGURACIÓN
// ============================================

// Definir constante para permitir la carga del archivo de configuración
define('MP_CONFIG_LOADED', true);

// Intentar múltiples rutas posibles
$possiblePaths = [
    // Opción 1: En el mismo directorio (recomendado)
    __DIR__ . '/mercadopago-config.php',
    
    // Opción 2: En /private/config/ (relativo)
    __DIR__ . '/../../private/config/mercadopago-config.php',
    
    // Opción 3: Ruta absoluta (ajustar según tu servidor)
    '/home/inedito/private/config/mercadopago-config.php',
    
    // Opción 4: Alternativa en home
    $_SERVER['DOCUMENT_ROOT'] . '/../private/config/mercadopago-config.php'
];

$configPath = null;
$triedPaths = [];

foreach ($possiblePaths as $path) {
    $triedPaths[] = $path;
    if (file_exists($path)) {
        $configPath = $path;
        error_log("✅ Archivo de configuración encontrado en: " . $path);
        break;
    }
}

// Verificar que existe el archivo de configuración
if (!$configPath) {
    error_log("❌ ERROR: No se encuentra el archivo de configuración");
    error_log("Rutas intentadas:");
    foreach ($triedPaths as $path) {
        error_log("  - " . $path);
    }
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de configuración del servidor. El archivo mercadopago-config.php no se encuentra.',
        'debug' => [
            'error' => 'Config file not found',
            'tried_paths' => $triedPaths,
            'solution' => 'Mueve mercadopago-config.php al mismo directorio que create-preference.php'
        ]
    ]);
    exit;
}

// Cargar configuración
require_once $configPath;

error_log("✅ Configuración cargada correctamente desde: " . $configPath);

// ============================================
// LEER Y VALIDAR DATOS DEL FRONTEND
// ============================================

$rawInput = file_get_contents('php://input');
error_log("📥 Input recibido: " . substr($rawInput, 0, 500) . "...");

$input = json_decode($rawInput, true);

if (!$input) {
    error_log("❌ Error: No se pudo decodificar JSON");
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos inválidos. JSON no válido.'
    ]);
    exit;
}

// Validar que se recibieron los datos necesarios
if (!isset($input['items']) || !isset($input['formData']) || !isset($input['total'])) {
    error_log("❌ Error: Datos incompletos");
    error_log("Datos recibidos: " . print_r(array_keys($input), true));
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'message' => 'Datos incompletos. Se requieren: items, formData, total'
    ]);
    exit;
}

// Extraer datos
$items = $input['items'];
$formData = $input['formData'];
$total = floatval($input['total']);
$shippingCost = floatval($input['shippingCost'] ?? 0);
$totalPrice = floatval($input['totalPrice'] ?? 0);
$orderId = $input['orderId'] ?? 'LITFIT-' . time();

error_log("📦 Pedido: " . $orderId);
error_log("💰 Total: $" . $total);
error_log("📦 Items: " . count($items));

// ============================================
// PREPARAR ITEMS PARA MERCADO PAGO
// ============================================

$mpItems = [];

// Agregar cada producto del carrito
foreach ($items as $item) {
    // Construir título descriptivo
    $title = $item['name'];
    if (!empty($item['variant'])) {
        $title .= ' - ' . $item['variant'];
    }
    if (!empty($item['size'])) {
        $title .= ' (' . $item['size'] . ')';
    }

    $mpItems[] = [
        'title' => $title,
        'description' => $item['name'],
        'quantity' => intval($item['quantity']),
        'unit_price' => floatval($item['price']),
        'currency_id' => 'MXN'
    ];
}

// Agregar envío como item adicional (si hay costo de envío)
if ($shippingCost > 0) {
    $mpItems[] = [
        'title' => 'Envío a domicilio',
        'description' => 'Costo de envío',
        'quantity' => 1,
        'unit_price' => floatval($shippingCost),
        'currency_id' => 'MXN'
    ];
}

error_log("📋 Items preparados: " . json_encode($mpItems));

// ============================================
// CREAR PREFERENCIA DE PAGO
// ============================================

// ⚠️ IMPORTANTE: Enviar payment_methods con arrays VACÍOS
// para SOBRESCRIBIR la configuración de la aplicación en Mercado Pago
// que tiene excluded_payment_methods y excluded_payment_types con IDs vacíos

$preferenceData = [
    'items' => $mpItems,
    'payer' => [
        'name' => $formData['firstName'] ?? '',
        'surname' => $formData['lastName'] ?? '',
        'email' => $formData['email'] ?? '',
        'phone' => [
            'number' => $formData['phone'] ?? ''
        ],
        'address' => [
            'street_name' => $formData['street'] ?? '',
            'street_number' => '',
            'zip_code' => $formData['zipCode'] ?? ''
        ]
    ],
    'back_urls' => [
        'success' => MP_SUCCESS_URL,
        'failure' => MP_FAILURE_URL,
        'pending' => MP_PENDING_URL
    ],
    'auto_return' => 'approved',
    'external_reference' => $orderId,
    'statement_descriptor' => 'LITFIT',
    'notification_url' => MP_WEBHOOK_URL,
    
    // 🔥 SOLUCIÓN: Sobrescribir configuración de la aplicación
    // Tu app tiene excluded_payment_methods con {"id": ""} configurado
    // Esto fuerza arrays VACÍOS para permitir TODOS los métodos
    'payment_methods' => [
        'excluded_payment_methods' => [],  // Array VACÍO = permitir todos
        'excluded_payment_types' => []     // Array VACÍO = permitir todos
    ],
    
    'metadata' => [
        'order_id' => $orderId,
        'customer_name' => ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''),
        'customer_email' => $formData['email'] ?? '',
        'customer_phone' => $formData['phone'] ?? '',
        'shipping_address' => ($formData['street'] ?? '') . ', ' . 
                             ($formData['city'] ?? '') . ', ' . 
                             ($formData['state'] ?? '') . ', ' . 
                             ($formData['zipCode'] ?? '')
    ]
];

error_log("📤 Enviando preferencia a Mercado Pago...");
error_log("💳 IMPORTANTE: Permitiendo TODOS los métodos de pago (account_money incluido)");
error_log("🔓 Sobrescribiendo excluded_payment_methods y excluded_payment_types con arrays vacíos");

// ============================================
// ENVIAR PETICIÓN A MERCADO PAGO API
// ============================================

$ch = curl_init(MP_API_URL . '/checkout/preferences');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . MP_ACCESS_TOKEN
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($preferenceData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, MP_TIMEOUT);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

error_log("📥 Respuesta HTTP: " . $httpCode);

// ============================================
// MANEJAR ERRORES DE CURL
// ============================================

if ($curlError) {
    error_log("❌ CURL Error: " . $curlError);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión con Mercado Pago',
        'error' => $curlError
    ]);
    exit;
}

// ============================================
// PROCESAR RESPUESTA DE MERCADO PAGO
// ============================================

error_log("📥 Respuesta completa: " . substr($response, 0, 1000) . "...");

$mpResponse = json_decode($response, true);

if (!$mpResponse) {
    error_log("❌ Error al decodificar respuesta JSON");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Respuesta inválida de Mercado Pago',
        'raw_response' => substr($response, 0, 500)
    ]);
    exit;
}

// Verificar si hubo error en la respuesta de MP
if ($httpCode !== 200 && $httpCode !== 201) {
    error_log("❌ Error HTTP " . $httpCode . " de Mercado Pago");
    error_log("Mensaje de error: " . ($mpResponse['message'] ?? 'Sin mensaje'));
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error al crear preferencia de pago',
        'error' => $mpResponse['message'] ?? 'Error desconocido',
        'status' => $httpCode
    ]);
    exit;
}

// Verificar que se recibió el init_point (URL de checkout)
if (!isset($mpResponse['init_point']) || empty($mpResponse['init_point'])) {
    error_log("❌ No se recibió init_point en la respuesta");
    error_log("Respuesta completa: " . print_r($mpResponse, true));
    
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo obtener la URL de pago',
        'response' => $mpResponse
    ]);
    exit;
}

// ============================================
// RESPUESTA EXITOSA
// ============================================

$checkoutUrl = $mpResponse['init_point'];
$preferenceId = $mpResponse['id'] ?? '';

error_log("✅ Preferencia creada exitosamente");
error_log("🔗 URL de checkout: " . $checkoutUrl);
error_log("🆔 Preference ID: " . $preferenceId);

http_response_code(200);
echo json_encode([
    'success' => true,
    'checkoutUrl' => $checkoutUrl,
    'preferenceId' => $preferenceId,
    'orderId' => $orderId
]);

error_log("✅ Respuesta enviada al frontend");
?>
