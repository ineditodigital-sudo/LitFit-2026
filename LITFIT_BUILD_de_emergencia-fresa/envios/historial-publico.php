<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }
verifyAdminToken();

set_time_limit(120);

// Utilizar constantes de admin-config.php
$chAuth = curl_init(ENVIOS_API_BASE . '/oauth/token');
curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAuth, CURLOPT_POST, true);
curl_setopt($chAuth, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chAuth, CURLOPT_HTTPHEADER, ['Content-Type: application/x-www-form-urlencoded']);
curl_setopt($chAuth, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials', 
    'client_id' => ENVIOS_CLIENT_ID, 
    'client_secret' => ENVIOS_CLIENT_SECRET
]));
$auth = json_decode(curl_exec($chAuth), true);
curl_close($chAuth);
$tok = $auth['access_token'] ?? null;

if (!$tok) {
    http_response_code(502);
    echo json_encode(['error' => 'Error de autenticación con Envíos Internacionales']);
    exit;
}

$allData     = [];
$allIncluded = [];

// Función auxiliar para obtener página
function fetchPage($tok, $page) {
    // Ya no usamos sort asumiendo que la API no lo soporta y regresa los más viejos primero
    $url = ENVIOS_API_BASE . "/shipments/?include=address_to,address_from,packages&page=$page";
    $ch  = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $tok", "Accept: application/json"]);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);
    return $res;
}

// 1. Obtener la página 1 para descubrir cuántas páginas hay en total
$firstPageData = fetchPage($tok, 1);
$totalPages = isset($firstPageData['meta']['total_pages']) ? intval($firstPageData['meta']['total_pages']) : 1;

// LIMITAR A ÚLTIMAS 3 PÁGINAS MÁXIMO
$maxPagesToFetch = 3;
$startPage = max(1, $totalPages - $maxPagesToFetch + 1);

// 2. Extraer desde la startPage hasta la totalPages
for ($p = $totalPages; $p >= $startPage; $p--) {
    // Si la página era la 1, ya la tenemos procesada de la línea de arriba
    $res = ($p === 1 && $totalPages === 1) ? $firstPageData : fetchPage($tok, $p);
    
    if (isset($res['data'])) {
        $allData = array_merge($allData, $res['data']);
        if (isset($res['included'])) {
            $allIncluded = array_merge($allIncluded, $res['included']);
        }
    }
}

// Sort localmente de más nuevo a más viejo
usort($allData, function($a, $b) {
    $timeA = strtotime($a['attributes']['created_at'] ?? '0');
    $timeB = strtotime($b['attributes']['created_at'] ?? '0');
    return $timeB - $timeA;
});

echo json_encode(['data' => $allData, 'included' => $allIncluded]);
exit;
?>
