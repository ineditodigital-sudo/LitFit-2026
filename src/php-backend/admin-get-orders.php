<?php
/**
 * ============================================
 * ADMIN API - MODO SUPER-ESTABLE (V19)
 * ============================================
 */

// 1. PERMISOS CRÍTICOS (Headers) - Al inicio sin espacios antes de <?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

// Resolver preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

header('Content-Type: application/json; charset=UTF-8');

// 2. CONFIGURACIÓN SIN CONSTANTES (Para evitar colisiones)
$client_id = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
$client_secret = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';
$base_url = 'https://app.enviosinternacionales.com/api/v1';

/**
 * 🔐 PASO 1: Obtención de Token con protocolo seguro (Form-URL-Encoded)
 */
$chAuth = curl_init($base_url . "/oauth/token");
curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAuth, CURLOPT_POST, true);
curl_setopt($chAuth, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chAuth, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $client_id,
    'client_secret' => $client_secret
]));

$auth_raw = curl_exec($chAuth);
$auth_data = json_decode($auth_raw, true);
$token = $auth_data['access_token'] ?? null;

if (!$token) {
    http_response_code(401);
    exit(json_encode([
        'success' => false, 
        'error' => 'No se pudo obtener el token de acceso.',
        'debug' => substr($auth_raw ?? 'Respuesta vacía', 0, 100)
    ]));
}

/**
 * 📦 PASO 2: Recupear Órdenes (Listado reducido a 3 para evitar Timeouts)
 */
$chOrders = curl_init($base_url . "/orders?include=shipments&page[size]=3");
curl_setopt($chOrders, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chOrders, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chOrders, CURLOPT_HTTPHEADER, [
    "Authorization: Bearer $token",
    "Accept: application/json"
]);

$response_raw = curl_exec($chOrders);
curl_close($chOrders);

// IMPORTANTE: Devolvemos la respuesta para que la procese el Dashboard
echo $response_raw;

exit;
