<?php
// 1. LIMPIEZA TOTAL Y PERMISOS
header('Access-Control-Allow-Origin: *');
header('Content-Type: application/json; charset=UTF-8');

$c_id = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
$c_sec = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';
$base = 'https://app.enviosinternacionales.com/api/v1';

// 🔐 PASO 1: Obtener la llave con técnica súper segura
$chA = curl_init($base . "/oauth/token");
curl_setopt($chA, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chA, CURLOPT_POST, true);
curl_setopt($chA, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chA, CURLOPT_POSTFIELDS, http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => $c_id,
    'client_secret' => $c_sec
]));

$resA = curl_exec($chA);
curl_close($chA);

$tkData = json_decode($resA, true);
$token = $tkData['access_token'] ?? null;

if (!$token) {
    die(json_encode(['success' => false, 'error' => 'La llave de acceso falló: ' . substr($resA, 0, 50)]));
}

// 📦 PASO 2: Cargar pedidos (Mínima carga posible para evitar el error 500)
$chO = curl_init($base . "/orders?include=shipments&page[size]=3"); // Solo 3 pedidos para probar
curl_setopt($chO, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chO, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($chO, CURLOPT_HTTPHEADER, ["Authorization: Bearer $token", "Accept: application/json"]);

$final = curl_exec($chO);
curl_close($chO);

echo $final; // Escupimos el JSON puro de la API al Dashboard
