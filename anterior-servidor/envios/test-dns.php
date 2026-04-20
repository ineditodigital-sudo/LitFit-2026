<?php
header('Content-Type: application/json; charset=utf-8');

$results = [];

// 1. Verificar si cURL está habilitado
$results['curl_enabled'] = function_exists('curl_init');

// 2. Verificar resolución DNS
$results['dns_lookup'] = gethostbyname('api.enviosinternacionales.com');

// 3. Intentar conexión simple
$ch = curl_init('https://api.enviosinternacionales.com');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_TIMEOUT => 10,
    CURLOPT_SSL_VERIFYPEER => false, // Deshabilitar verificación SSL temporalmente
    CURLOPT_FOLLOWLOCATION => true,
    CURLOPT_VERBOSE => true
]);

$response = curl_exec($ch);
$curlError = curl_error($ch);
$curlInfo = curl_getinfo($ch);
curl_close($ch);

$results['curl_error'] = $curlError ?: 'Sin error';
$results['curl_info'] = $curlInfo;
$results['response_preview'] = substr($response, 0, 200);

// 4. Verificar configuración PHP
$results['php_version'] = phpversion();
$results['allow_url_fopen'] = ini_get('allow_url_fopen');
$results['open_basedir'] = ini_get('open_basedir') ?: 'Sin restricciones';

echo json_encode($results, JSON_PRETTY_PRINT);
?>