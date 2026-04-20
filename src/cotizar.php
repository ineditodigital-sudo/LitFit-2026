<?php
// ============================================
// API de Cotización de Envíos - LITFIT
// Solo API real de enviosinternacionales.com
// ============================================

error_reporting(E_ALL);
ini_set('display_errors', 0);
ini_set('log_errors', 1);

// CORS: Permitir múltiples orígenes
$allowedOrigins = [
    'https://litfit.inedito.digital',
    'https://figma-make.app',
    'http://localhost:3000',
    'http://localhost:5173',
];

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
if (in_array($origin, $allowedOrigins)) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    // Fallback: permitir cualquier origen en desarrollo
    header('Access-Control-Allow-Origin: *');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

try {
    error_log("=== COTIZAR ENVÍO ===");
    
    // Leer input
    $rawInput = file_get_contents('php://input');
    $input = json_decode($rawInput, true);
    
    if (!$input || !isset($input['destination']) || !isset($input['weight'])) {
        throw new Exception("Datos incompletos");
    }
    
    $destination = $input['destination'];
    $weight = floatval($input['weight']);
    $dimensions = $input['dimensions'] ?? ['length' => 30, 'width' => 20, 'height' => 10];
    
    error_log("📍 CP: {$destination['zipCode']}, Peso: {$weight}kg");
    
    // 🔐 CREDENCIALES API
    $apiKey = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
    $apiSecret = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';
    $apiUrl = 'https://app.enviosinternacionales.com/api/v1/quotations';
    
    // Preparar datos para la API
    $apiData = [
        'origin' => [
            'zipCode' => '64000',
            'country' => 'MX'
        ],
        'destination' => [
            'zipCode' => $destination['zipCode'],
            'city' => $destination['city'] ?? '',
            'state' => $destination['state'] ?? '',
            'country' => 'MX'
        ],
        'parcel' => [
            'weight' => $weight,
            'length' => floatval($dimensions['length']),
            'width' => floatval($dimensions['width']),
            'height' => floatval($dimensions['height'])
        ]
    ];
    
    error_log("📤 Request data: " . json_encode($apiData));
    error_log("📤 API URL: {$apiUrl}");
    
    // Preparar autenticación Basic
    $authToken = base64_encode($apiKey . ':' . $apiSecret);
    error_log("🔐 Auth token (first 20 chars): " . substr($authToken, 0, 20) . "...");
    
    $headers = [
        'Content-Type: application/json',
        'Accept: application/json',
        'Authorization: Basic ' . $authToken
    ];
    
    // Llamar a la API con logging detallado
    $ch = curl_init($apiUrl);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST => true,
        CURLOPT_HTTPHEADER => $headers,
        CURLOPT_POSTFIELDS => json_encode($apiData),
        CURLOPT_SSL_VERIFYPEER => true,
        CURLOPT_TIMEOUT => 30,
        CURLOPT_VERBOSE => false
    ]);
    
    $response = curl_exec($ch);
    $httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
    $curlError = curl_error($ch);
    $curlErrno = curl_errno($ch);
    $curlInfo = curl_getinfo($ch);
    curl_close($ch);
    
    error_log("📥 HTTP Code: {$httpCode}");
    error_log("📥 Response length: " . strlen($response));
    error_log("📥 Response preview: " . substr($response, 0, 500));
    
    // Error de CURL
    if ($curlErrno !== 0) {
        error_log("❌ CURL Error #{$curlErrno}: {$curlError}");
        throw new Exception("Error de conexión: {$curlError}");
    }
    
    // Error HTTP
    if ($httpCode >= 400) {
        error_log("❌ Error HTTP {$httpCode}");
        error_log("❌ Full response: {$response}");
        
        $errorData = json_decode($response, true);
        
        if ($httpCode === 401) {
            error_log("🔐 Error 401: Problema de autenticación");
            error_log("🔐 Verificar credenciales y método de auth");
            
            $errorMsg = "Error de autenticación con la API (401). ";
            if (isset($errorData['message'])) {
                $errorMsg .= $errorData['message'];
            } else {
                $errorMsg .= "Verifica las credenciales de la API.";
            }
        } elseif ($httpCode === 404) {
            error_log("🔍 Error 404: Endpoint no encontrado");
            $errorMsg = "El endpoint de la API no existe (404). URL: {$apiUrl}";
        } else {
            $errorMsg = $errorData['message'] ?? "Error HTTP {$httpCode}";
        }
        
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => $errorMsg,
            'httpCode' => $httpCode,
            'debug' => [
                'url' => $apiUrl,
                'responsePreview' => substr($response, 0, 200)
            ]
        ]);
        exit;
    }
    
    // Parsear respuesta exitosa
    $apiResponse = json_decode($response, true);
    
    if (json_last_error() !== JSON_ERROR_NONE) {
        error_log("❌ JSON inválido: " . json_last_error_msg());
        error_log("❌ Response: {$response}");
        throw new Exception("Respuesta inválida de la API");
    }
    
    error_log("✅ Respuesta JSON válida");
    error_log("✅ Response keys: " . implode(', ', array_keys($apiResponse)));
    
    // Buscar cotizaciones en la respuesta
    $quotes = null;
    
    if (isset($apiResponse['data']['quotes'])) {
        $quotes = $apiResponse['data']['quotes'];
        error_log("✅ Found quotes in: data.quotes");
    } elseif (isset($apiResponse['quotes'])) {
        $quotes = $apiResponse['quotes'];
        error_log("✅ Found quotes in: quotes");
    } elseif (isset($apiResponse['data']) && is_array($apiResponse['data'])) {
        $quotes = $apiResponse['data'];
        error_log("✅ Found quotes in: data");
    } elseif (is_array($apiResponse) && isset($apiResponse[0])) {
        $quotes = $apiResponse;
        error_log("✅ Found quotes in: root array");
    }
    
    if (!$quotes || !is_array($quotes) || empty($quotes)) {
        error_log("⚠️ No se encontraron cotizaciones");
        error_log("⚠️ Response structure: " . json_encode($apiResponse));
        
        http_response_code(200);
        echo json_encode([
            'success' => false,
            'message' => 'No hay cotizaciones disponibles para este código postal',
            'debug' => [
                'responseKeys' => array_keys($apiResponse),
                'fullResponse' => $apiResponse
            ]
        ]);
        exit;
    }
    
    // Formatear opciones de envío
    $shippingOptions = [];
    
    foreach ($quotes as $quote) {
        $option = [
            'carrier' => $quote['carrier'] ?? $quote['provider'] ?? 'Transportista',
            'service' => $quote['provider_service_name'] ?? $quote['service_name'] ?? $quote['service'] ?? 'Servicio estándar',
            'price' => floatval($quote['total'] ?? $quote['price'] ?? 0),
            'deliveryDays' => ($quote['days'] ?? $quote['delivery_days'] ?? '5-7') . ' días hábiles',
            'quoteId' => $quote['id'] ?? null
        ];
        
        $shippingOptions[] = $option;
        error_log("✅ Quote: {$option['carrier']} - {$option['service']} - \${$option['price']}");
    }
    
    error_log("✅ Total opciones: " . count($shippingOptions));
    
    // Respuesta exitosa
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'options' => $shippingOptions
    ]);
    
} catch (Exception $e) {
    error_log("❌ Exception: " . $e->getMessage());
    error_log("❌ Stack trace: " . $e->getTraceAsString());
    
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'message' => $e->getMessage()
    ]);
}

error_log("=== FIN ===");
?>
