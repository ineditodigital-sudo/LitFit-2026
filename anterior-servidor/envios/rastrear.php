<?php
header('Access-Control-Allow-Origin: https://litfitmexico.com');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// 🔐 CREDENCIALES
define('ENVIOS_API_KEY', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_API_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_URL', 'https://api.enviosinternacionales.com/v1');

// Obtener número de tracking
$trackingNumber = $_GET['tracking'] ?? '';

if (empty($trackingNumber)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Número de guía requerido']);
    exit;
}

// Headers con autenticación
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode(ENVIOS_API_KEY . ':' . ENVIOS_API_SECRET)
];

// Consultar tracking en la API
$ch = curl_init(ENVIOS_API_URL . '/track/' . urlencode($trackingNumber));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("Error en rastreo: " . $response);
    echo json_encode([
        'success' => false,
        'message' => 'No se encontró información para este número de guía'
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

// Formatear eventos de tracking
$events = [];
if (isset($apiResponse['events']) && is_array($apiResponse['events'])) {
    foreach ($apiResponse['events'] as $event) {
        $events[] = [
            'date' => date('d/m/Y', strtotime($event['timestamp'] ?? 'now')),
            'time' => date('H:i', strtotime($event['timestamp'] ?? 'now')),
            'status' => $event['status'] ?? 'Procesando',
            'location' => $event['location'] ?? 'México',
            'description' => $event['description'] ?? ''
        ];
    }
}

// Respuesta formateada
echo json_encode([
    'success' => true,
    'tracking' => [
        'trackingNumber' => $trackingNumber,
        'carrier' => $apiResponse['carrier'] ?? 'Desconocido',
        'status' => $apiResponse['status'] ?? 'En proceso',
        'estimatedDelivery' => $apiResponse['estimated_delivery'] ?? 'Por confirmar',
        'origin' => $apiResponse['origin_city'] ?? 'México',
        'destination' => $apiResponse['destination_city'] ?? 'Destino',
        'events' => $events
    ]
]);
?>