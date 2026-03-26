<?php
// ============================================
// API de Cotización de Envíos - LITFIT
// Ubicación: https://inedito.digital/api/envios/cotizar.php
// ============================================

header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Habilitar logging de errores
ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("====== Nueva solicitud a cotizar.php ======");

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    error_log("❌ Método no permitido: " . $_SERVER['REQUEST_METHOD']);
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// 🔐 CREDENCIALES DE LA API
define('ENVIOS_API_KEY', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_API_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_URL', 'https://app.enviosinternacionales.com/api/v1/quotations');

// Leer datos del frontend
$rawInput = file_get_contents('php://input');
error_log("📥 Input recibido: " . $rawInput);

$input = json_decode($rawInput, true);

if (!$input) {
    error_log("❌ Error: No se pudo decodificar JSON");
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

if (!isset($input['destination']) || !isset($input['weight'])) {
    error_log("❌ Error: Datos incompletos");
    error_log("Datos recibidos: " . print_r($input, true));
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos (destination o weight faltante)']);
    exit;
}

$destination = $input['destination'];
$weight = floatval($input['weight']);
$dimensions = $input['dimensions'] ?? ['length' => 30, 'width' => 20, 'height' => 10];

error_log("📍 Destino: CP=" . ($destination['zipCode'] ?? 'N/A'));
error_log("⚖️ Peso: " . $weight . " kg");

// Preparar datos para la API de enviosinternacionales.com
$apiData = [
    'origin' => [
        'zipCode' => '64000', // Tu código postal de origen (Monterrey)
        'country' => 'MX'
    ],
    'destination' => [
        'zipCode' => $destination['zipCode'],
        'city' => $destination['city'] ?? '',
        'state' => $destination['state'] ?? '',
        'country' => 'MX' // La API probablemente solo maneja México
    ],
    'parcel' => [
        'weight' => $weight,
        'length' => floatval($dimensions['length']),
        'width' => floatval($dimensions['width']),
        'height' => floatval($dimensions['height'])
    ]
];

error_log("📤 Datos enviados a API: " . json_encode($apiData));

// Headers con autenticación Basic
$authHeader = 'Authorization: Basic ' . base64_encode(ENVIOS_API_KEY . ':' . ENVIOS_API_SECRET);
error_log("🔐 Auth header generado (primeros 50 chars): " . substr($authHeader, 0, 50) . "...");

$headers = [
    'Content-Type: application/json',
    'Accept: application/json',
    $authHeader
];

// Hacer petición a la API
error_log("🚀 Llamando a: " . ENVIOS_API_URL);

$ch = curl_init(ENVIOS_API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

error_log("📥 HTTP Code: " . $httpCode);

if ($curlError) {
    error_log("❌ CURL Error: " . $curlError);
    http_response_code(200); // Importante: retornar 200 para que el frontend procese el error
    echo json_encode([
        'success' => false,
        'message' => 'Error de conexión con el servicio de envíos',
        'options' => []
    ]);
    exit;
}

error_log("📥 Respuesta API (primeros 500 chars): " . substr($response, 0, 500));

if ($httpCode !== 200 && $httpCode !== 201) {
    error_log("❌ Error HTTP " . $httpCode . ": " . $response);
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'Error del servicio de envíos (HTTP ' . $httpCode . ')',
        'options' => [],
        'debug' => [
            'httpCode' => $httpCode,
            'response' => $response
        ]
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

if (!$apiResponse) {
    error_log("❌ Error al decodificar respuesta JSON");
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'Respuesta inválida del servicio de envíos',
        'options' => []
    ]);
    exit;
}

error_log("✅ Respuesta decodificada: " . print_r($apiResponse, true));

// Formatear respuesta para el frontend
$shippingOptions = [];

// Verificar diferentes estructuras posibles de respuesta
if (isset($apiResponse['data']['quotes']) && is_array($apiResponse['data']['quotes'])) {
    // Estructura: {data: {quotes: [...]}}
    $quotes = $apiResponse['data']['quotes'];
} elseif (isset($apiResponse['quotes']) && is_array($apiResponse['quotes'])) {
    // Estructura: {quotes: [...]}
    $quotes = $apiResponse['quotes'];
} elseif (isset($apiResponse['data']) && is_array($apiResponse['data'])) {
    // Estructura: {data: [...]}
    $quotes = $apiResponse['data'];
} else {
    error_log("⚠️ Estructura de respuesta no reconocida");
    error_log("Claves en respuesta: " . implode(', ', array_keys($apiResponse)));
    
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'No se encontraron cotizaciones disponibles',
        'options' => [],
        'debug' => [
            'apiResponse' => $apiResponse
        ]
    ]);
    exit;
}

foreach ($quotes as $quote) {
    $shippingOptions[] = [
        'carrier' => $quote['carrier'] ?? $quote['provider'] ?? 'Transportista',
        'service' => $quote['provider_service_name'] ?? $quote['service_name'] ?? $quote['service'] ?? 'Servicio estándar',
        'price' => floatval($quote['total'] ?? $quote['price'] ?? 0),
        'deliveryDays' => ($quote['days'] ?? $quote['delivery_days'] ?? '5-7') . ' días hábiles',
        'quoteId' => $quote['id'] ?? null
    ];
}

error_log("✅ Opciones formateadas: " . count($shippingOptions));

if (empty($shippingOptions)) {
    error_log("⚠️ No se generaron opciones de envío");
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => 'No hay opciones de envío disponibles para este destino',
        'options' => []
    ]);
    exit;
}

// Respuesta exitosa
http_response_code(200);
echo json_encode([
    'success' => true,
    'options' => $shippingOptions
]);

error_log("✅ Respuesta enviada al frontend: " . count($shippingOptions) . " opciones");
?>
