<?php
/**
 * ============================================
 * ADMIN API - CANAL DE DATOS FINAL (V50)
 * ============================================
 * Ahora incluye el campo 'reference' (Order ID) 
 * para conectar cada envío con su JSON de productos.
 */

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');
set_time_limit(120);

$cid  = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
$sec  = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';
$base = 'https://app.enviosinternacionales.com/api/v1';

// TOKEN 
$chAuth = curl_init($base . "/oauth/token");
curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAuth, CURLOPT_POST, true);
curl_setopt($chAuth, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chAuth, CURLOPT_POSTFIELDS, http_build_query(['grant_type' => 'client_credentials', 'client_id' => $cid, 'client_secret' => $sec]));
$auth = json_decode(curl_exec($chAuth), true);
curl_close($chAuth);
$tok = $auth['access_token'] ?? null;

if (!$tok) exit(json_encode(['error' => 'Auth Fail']));

$allData = [];
$allIncluded = [];
$page = 1;

do {
    // 💡 IMPORTANTE: Pedimos shipments con address y packages
    $url = "$base/shipments?include=address_to,packages&page=$page";
    $ch = curl_init($url);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_HTTPHEADER, ["Authorization: Bearer $tok", "Accept: application/json"]);
    $res = json_decode(curl_exec($ch), true);
    curl_close($ch);

    if (isset($res['data'])) {
        $allData = array_merge($allData, $res['data']);
        if (isset($res['included'])) $allIncluded = array_merge($allIncluded, $res['included']);
    }
    
    $total = intval($res['meta']['total_pages'] ?? 1);
    $page++;
    if ($page > 20) break;
} while ($page <= $total);

echo json_encode(['data' => $allData, 'included' => $allIncluded]);
exit;
