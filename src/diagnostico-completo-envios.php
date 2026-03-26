<?php
/**
 * DIAGNÓSTICO COMPLETO - AUTENTICACIÓN + CREACIÓN DE ENVÍO
 * 
 * Este archivo prueba TODO EL FLUJO:
 * 1. Obtener token de autenticación
 * 2. Crear un envío de prueba con ese token
 * 
 * INSTRUCCIONES:
 * 1. Sube este archivo a: /public_html/cdn.inedito.digital/envios/
 * 2. Accede desde: https://cdn.inedito.digital/envios/diagnostico-completo-envios.php
 */

header('Content-Type: text/html; charset=UTF-8');

// ============================================
// CREDENCIALES
// ============================================
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('AUTH_URL', 'https://app.enviosinternacionales.com/api/v1/oauth/token');
define('CREATE_ORDER_URL', 'https://app.enviosinternacionales.com/api/v1/orders');

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Diagnóstico Completo - Envíos Internacionales</title>
    <style>
        body {
            font-family: 'Courier New', monospace;
            background: #1a1a1a;
            color: #00ff00;
            padding: 20px;
            margin: 0;
        }
        .container {
            max-width: 1200px;
            margin: 0 auto;
            background: #0a0a0a;
            padding: 30px;
            border: 2px solid #00AAC7;
            border-radius: 10px;
        }
        h1 {
            color: #00AAC7;
            text-align: center;
            font-size: 28px;
            margin-bottom: 30px;
            text-transform: uppercase;
        }
        .test-section {
            background: #1a1a1a;
            border: 1px solid #333;
            padding: 20px;
            margin: 20px 0;
            border-radius: 5px;
        }
        .test-title {
            color: #FFD700;
            font-size: 18px;
            font-weight: bold;
            margin-bottom: 15px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .success {
            color: #00ff00;
            font-weight: bold;
        }
        .error {
            color: #ff4444;
            font-weight: bold;
        }
        .warning {
            color: #ffaa00;
            font-weight: bold;
        }
        .info {
            color: #00AAC7;
        }
        pre {
            background: #000;
            padding: 15px;
            border-left: 4px solid #00AAC7;
            overflow-x: auto;
            font-size: 12px;
            line-height: 1.5;
            max-height: 400px;
            overflow-y: auto;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnóstico Completo - Autenticación + Creación</h1>

<?php

// ============================================
// PASO 1: OBTENER TOKEN
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">🔐 PASO 1: Obtener Token de Autenticación</div>';

$postData = http_build_query([
    'grant_type' => 'client_credentials',
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET
]);

$ch1 = curl_init(AUTH_URL);
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_POST, true);
curl_setopt($ch1, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);
curl_setopt($ch1, CURLOPT_POSTFIELDS, $postData);
curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch1, CURLOPT_TIMEOUT, 15);

$response1 = curl_exec($ch1);
$httpCode1 = curl_getinfo($ch1, CURLINFO_HTTP_CODE);
$curlError1 = curl_error($ch1);
curl_close($ch1);

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode1 == 200 ? 'success' : 'error') . '">' . $httpCode1 . '</span></p>';

if ($curlError1) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError1) . '</p>';
}

echo '<p><span class="info">📥 Response:</span></p>';
echo '<pre>' . htmlspecialchars($response1) . '</pre>';

$json1 = json_decode($response1, true);
$token = null;

if ($httpCode1 == 200 && isset($json1['access_token'])) {
    $token = $json1['access_token'];
    echo '<p class="success">✅ Token obtenido exitosamente!</p>';
    echo '<p><span class="info">🎟️ Token (primeros 50 caracteres):</span> <code>' . substr($token, 0, 50) . '...</code></p>';
    
    if (isset($json1['expires_in'])) {
        echo '<p><span class="info">⏰ Expira en:</span> ' . $json1['expires_in'] . ' segundos</p>';
    }
} else {
    echo '<p class="error">❌ NO se pudo obtener el token. Proceso detenido.</p>';
    echo '</div></div></body></html>';
    exit;
}

echo '</div>';

// ============================================
// PASO 2: CREAR ENVÍO DE PRUEBA
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">📦 PASO 2: Crear Envío de Prueba con el Token</div>';

// Datos de prueba simplificados
$shipmentData = [
    'order' => [
        'reference' => 'TEST-DIAGNOSTICO-' . time(),
        'reference_number' => 'TEST-' . time(),
        'payment_status' => 'paid',
        'total_price' => '1049.00',
        'platform' => 'custom',
        'package_type' => 'box',
        
        'parcels' => [
            [
                'weight' => 1.2,
                'length' => 30,
                'width' => 20,
                'height' => 15,
                'quantity' => 1,
                'dimension_unit' => 'cm',
                'mass_unit' => 'kg',
                'package_type' => 'box',
                'consignment_note' => 'Prueba de diagnóstico - Suplementos alimenticios'
            ]
        ],
        
        'products' => [
            [
                'name' => 'Proteína ISO - Prueba',
                'sku' => 'TEST-SKU-123',
                'price' => '899.00',
                'quantity' => 1,
                'weight' => 1.0,
                'length' => 10,
                'width' => 10,
                'height' => 15,
                'hs_code' => '2106909900'
            ]
        ],
        
        'shipper_address' => [
            'address' => 'Av. Constitución 123, Col. Centro',
            'internal_number' => '',
            'reference' => 'Almacén LITFIT',
            'sector' => 'Centro',
            'city' => 'Monterrey',
            'state' => 'Nuevo León',
            'postal_code' => '64000',
            'country' => 'MX',
            'person_name' => 'LITFIT - Almacén Principal',
            'company' => 'LITFIT',
            'phone' => '8112345678',
            'email' => 'ricoro845@gmail.com'
        ],
        
        'recipient_address' => [
            'address' => 'Vallarta 216 #8',
            'internal_number' => '',
            'reference' => 'Prueba de diagnóstico',
            'sector' => 'Vistas de Oriente',
            'city' => 'Aguascalientes',
            'state' => 'Aguascalientes',
            'postal_code' => '20196',
            'country' => 'MX',
            'person_name' => 'Ricardo Ledesma',
            'company' => '',
            'phone' => '4492610335',
            'email' => 'ricoro845@gmail.com'
        ]
    ]
];

echo '<p><span class="info">📤 Datos del envío:</span></p>';
echo '<pre>' . htmlspecialchars(json_encode($shipmentData, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';

// PROBANDO 3 FORMAS DIFERENTES DE ENVIAR EL AUTHORIZATION HEADER

// ============================================
// INTENTO 1: Authorization: Bearer {token}
// ============================================
echo '<div style="background: #2a2a2a; padding: 15px; margin: 20px 0; border-radius: 5px;">';
echo '<h3 style="color: #FFD700;">🧪 INTENTO 1: Authorization: Bearer {token}</h3>';

$ch2 = curl_init(CREATE_ORDER_URL);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'Authorization: Bearer ' . $token
]);
curl_setopt($ch2, CURLOPT_POSTFIELDS, json_encode($shipmentData));
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 30);

echo '<p><span class="info">📤 Headers:</span></p>';
echo '<pre>Content-Type: application/json
Accept: application/json
Authorization: Bearer ' . substr($token, 0, 30) . '...</pre>';

$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$curlError2 = curl_error($ch2);
curl_close($ch2);

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode2 == 200 || $httpCode2 == 201 ? 'success' : 'error') . '">' . $httpCode2 . '</span></p>';

if ($curlError2) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError2) . '</p>';
}

echo '<p><span class="info">📥 Response:</span></p>';
echo '<pre>' . htmlspecialchars(substr($response2, 0, 1000)) . '</pre>';

if ($httpCode2 == 200 || $httpCode2 == 201) {
    echo '<p class="success">✅ ¡ÉXITO! Este método funcionó.</p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó (HTTP ' . $httpCode2 . ')</p>';
    // MOSTRAR ANÁLISIS DETALLADO
    if (empty($response2)) {
        echo '<p class="warning">⚠️ La API NO devolvió ningún mensaje de error (respuesta vacía)</p>';
    }
    $responseJson = json_decode($response2, true);
    if ($responseJson) {
        echo '<p class="info">📋 Error parseado:</p>';
        echo '<pre>' . htmlspecialchars(json_encode($responseJson, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE)) . '</pre>';
    }
}

echo '</div>';

// ============================================
// INTENTO 2: Usando access_token en query string
// ============================================
echo '<div style="background: #2a2a2a; padding: 15px; margin: 20px 0; border-radius: 5px;">';
echo '<h3 style="color: #FFD700;">🧪 INTENTO 2: Token en URL (?access_token=...)</h3>';

$ch3 = curl_init(CREATE_ORDER_URL . '?access_token=' . urlencode($token));
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch3, CURLOPT_POSTFIELDS, json_encode($shipmentData));
curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch3, CURLOPT_TIMEOUT, 30);

echo '<p><span class="info">📤 URL:</span></p>';
echo '<pre>' . CREATE_ORDER_URL . '?access_token=...</pre>';

$response3 = curl_exec($ch3);
$httpCode3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
$curlError3 = curl_error($ch3);
curl_close($ch3);

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode3 == 200 || $httpCode3 == 201 ? 'success' : 'error') . '">' . $httpCode3 . '</span></p>';

if ($curlError3) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError3) . '</p>';
}

echo '<p><span class="info">📥 Response:</span></p>';
echo '<pre>' . htmlspecialchars(substr($response3, 0, 1000)) . '</pre>';

if ($httpCode3 == 200 || $httpCode3 == 201) {
    echo '<p class="success">✅ ¡ÉXITO! Este método funcionó.</p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó (HTTP ' . $httpCode3 . ')</p>';
}

echo '</div>';

// ============================================
// INTENTO 3: Usando X-API-TOKEN header
// ============================================
echo '<div style="background: #2a2a2a; padding: 15px; margin: 20px 0; border-radius: 5px;">';
echo '<h3 style="color: #FFD700;">🧪 INTENTO 3: X-API-TOKEN header</h3>';

$ch4 = curl_init(CREATE_ORDER_URL);
curl_setopt($ch4, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch4, CURLOPT_POST, true);
curl_setopt($ch4, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json',
    'X-API-TOKEN: ' . $token
]);
curl_setopt($ch4, CURLOPT_POSTFIELDS, json_encode($shipmentData));
curl_setopt($ch4, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch4, CURLOPT_TIMEOUT, 30);

echo '<p><span class="info">📤 Headers:</span></p>';
echo '<pre>Content-Type: application/json
Accept: application/json
X-API-TOKEN: ' . substr($token, 0, 30) . '...</pre>';

$response4 = curl_exec($ch4);
$httpCode4 = curl_getinfo($ch4, CURLINFO_HTTP_CODE);
$curlError4 = curl_error($ch4);
curl_close($ch4);

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode4 == 200 || $httpCode4 == 201 ? 'success' : 'error') . '">' . $httpCode4 . '</span></p>';

if ($curlError4) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError4) . '</p>';
}

echo '<p><span class="info">📥 Response:</span></p>';
echo '<pre>' . htmlspecialchars(substr($response4, 0, 1000)) . '</pre>';

if ($httpCode4 == 200 || $httpCode4 == 201) {
    echo '<p class="success">✅ ¡ÉXITO! Este método funcionó.</p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó (HTTP ' . $httpCode4 . ')</p>';
}

echo '</div>';

echo '</div>';

// ============================================
// RESUMEN FINAL
// ============================================
echo '<div class="test-section" style="background: #2a2a2a; border: 2px solid #00AAC7;">';
echo '<div class="test-title" style="color: #00AAC7; font-size: 22px;">📊 RESUMEN FINAL</div>';

$metodoExitoso = null;

if ($httpCode2 == 200 || $httpCode2 == 201) {
    $metodoExitoso = '✅ INTENTO 1: Authorization: Bearer {token}';
}
if ($httpCode3 == 200 || $httpCode3 == 201) {
    $metodoExitoso = '✅ INTENTO 2: Token en URL (?access_token=...)';
}
if ($httpCode4 == 200 || $httpCode4 == 201) {
    $metodoExitoso = '✅ INTENTO 3: X-API-TOKEN header';
}

if ($metodoExitoso) {
    echo '<p class="success" style="font-size: 20px;">🎉 ¡ÉXITO TOTAL!</p>';
    echo '<p class="info" style="font-size: 18px;">🎯 Método que funcionó: <strong>' . $metodoExitoso . '</strong></p>';
    echo '<p style="color: #ffaa00;">📋 ACCIÓN: Usa exactamente este método en tu archivo crear-orden.php</p>';
} else {
    echo '<p class="error" style="font-size: 20px;">❌ NINGÚN MÉTODO FUNCIONÓ</p>';
    echo '<p class="warning">⚠️ Posibles causas:</p>';
    echo '<ul style="color: #ffaa00;">';
    echo '<li>La API requiere permisos adicionales (scopes)</li>';
    echo '<li>Tu cuenta no tiene acceso para crear envíos</li>';
    echo '<li>El formato de los datos está incorrecto</li>';
    echo '<li>Se requiere activación manual de la API</li>';
    echo '</ul>';
    echo '<p class="info">📞 SIGUIENTE PASO: Contacta al soporte de enviosinternacionales.com</p>';
}

echo '</div>';

?>

        <div style="text-align: center; margin-top: 30px;">
            <a href="?" style="background: #00AAC7; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">🔄 Ejecutar Nuevamente</a>
        </div>

    </div>
</body>
</html>
