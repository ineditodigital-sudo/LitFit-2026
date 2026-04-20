<?php
/**
 * ============================================
 * API DE COTIZACIÓN - LITFIT (Versión Final Corregida)
 * ============================================
 */

// 1. Configuración de Headers y CORS
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed_origins = [
    'https://litfitmexico.com',
    'https://www.litfitmexico.com',
    'https://litfit.inedito.digital',
    'http://localhost:3000',
    'http://localhost:5173'
];

if (in_array($origin, $allowed_origins) || strpos($origin, '.figma.site') !== false) {
    header("Access-Control-Allow-Origin: $origin");
} else {
    header('Access-Control-Allow-Origin: *');
}

header('Content-Type: application/json; charset=UTF-8');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');
header('Access-Control-Allow-Credentials: true');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// 2. Credenciales
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// 3. Obtener Bearer Token
$authBody = http_build_query([
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET,
    'grant_type' => 'client_credentials'
]);

$ch = curl_init('https://app.enviosinternacionales.com/api/v1/oauth/token');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($ch, CURLOPT_POSTFIELDS, $authBody);
$authResponse = curl_exec($ch);
$authData = json_decode($authResponse, true);
$token = $authData['access_token'] ?? '';

if (!$token) {
    http_response_code(401);
    echo json_encode(['success' => false, 'message' => 'Error de autenticación API']);
    exit;
}

// 4. Leer y Procesar Petición
$input = json_decode(file_get_contents('php://input'), true);

// Si el frontend ya mandó el objeto "quotation", lo usamos directamente
// Si no, lo extraemos o lo creamos.
$quotationData = isset($input['quotation']) ? $input['quotation'] : $input;

// Asegurar que address_to tenga los datos del código postal/ciudad
// Esto previene el error 422 de campos en blanco
if (!isset($quotationData['address_to']) && isset($input['destination'])) {
    $quotationData['address_to'] = [
        'country_code' => 'MX',
        'postal_code' => $input['destination']['zipCode'],
        'area_level1' => $input['destination']['state'],
        'area_level2' => $input['destination']['city'],
        'area_level3' => 'Centro',
        'address_line_1' => 'Dirección de Entrega'
    ];
}

// La API espera un objeto raíz "quotation"
$requestBody = ['quotation' => $quotationData];

// 5. Consultar Cotizaciones
$ch = curl_init('https://app.enviosinternacionales.com/api/v1/quotations');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($requestBody));

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

// 6. Enviar respuesta al frontend
http_response_code($httpCode);
echo $response;
