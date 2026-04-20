<?php
/**
 * DIAGNÓSTICO DE AUTENTICACIÓN - API ENVÍOS INTERNACIONALES
 * 
 * Este archivo prueba diferentes métodos de autenticación OAuth2
 * para identificar cuál funciona con la API de enviosinternacionales.com
 * 
 * INSTRUCCIONES:
 * 1. Sube este archivo a: /public_html/cdn.inedito.digital/envios/
 * 2. Accede desde: https://cdn.inedito.digital/envios/diagnostico-api-envios.php
 * 3. Verás los resultados de cada método de autenticación
 */

header('Content-Type: text/html; charset=UTF-8');

// ============================================
// CREDENCIALES
// ============================================
define('CLIENT_ID', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('CLIENT_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('AUTH_URL', 'https://app.enviosinternacionales.com/api/v1/oauth/token');

?>
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Diagnóstico API - Envíos Internacionales</title>
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
        }
        .credential-box {
            background: #2a2a2a;
            padding: 15px;
            border-radius: 5px;
            margin: 10px 0;
        }
        .button {
            background: #00AAC7;
            color: white;
            border: none;
            padding: 10px 20px;
            font-size: 16px;
            cursor: pointer;
            border-radius: 5px;
            text-decoration: none;
            display: inline-block;
            margin: 10px 0;
        }
        .button:hover {
            background: #008fb0;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnóstico de API - Envíos Internacionales</h1>
        
        <div class="credential-box">
            <p><span class="info">📋 Client ID:</span> <?php echo substr(CLIENT_ID, 0, 15); ?>...</p>
            <p><span class="info">🔑 Client Secret:</span> <?php echo substr(CLIENT_SECRET, 0, 15); ?>...</p>
            <p><span class="info">🌐 Endpoint:</span> <?php echo AUTH_URL; ?></p>
        </div>

<?php

// ============================================
// MÉTODO 1: application/x-www-form-urlencoded
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">📡 MÉTODO 1: application/x-www-form-urlencoded (Estándar OAuth2)</div>';

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

echo '<p><span class="info">📤 Request Headers:</span></p>';
echo '<pre>Content-Type: application/x-www-form-urlencoded
Accept: application/json</pre>';

echo '<p><span class="info">📤 Request Body:</span></p>';
echo '<pre>' . htmlspecialchars($postData) . '</pre>';

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode1 == 200 ? 'success' : 'error') . '">' . $httpCode1 . '</span></p>';

if ($curlError1) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError1) . '</p>';
}

echo '<p><span class="info">📥 Response Body:</span></p>';
echo '<pre>' . htmlspecialchars($response1) . '</pre>';

$json1 = json_decode($response1, true);
if ($httpCode1 == 200 && isset($json1['access_token'])) {
    echo '<p class="success">✅ ¡MÉTODO EXITOSO! Token obtenido.</p>';
    echo '<p><span class="info">🎟️ Token:</span> <code>' . substr($json1['access_token'], 0, 50) . '...</code></p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó.</p>';
}

echo '</div>';

// ============================================
// MÉTODO 2: application/json
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">📡 MÉTODO 2: application/json</div>';

$jsonData = json_encode([
    'grant_type' => 'client_credentials',
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET
]);

$ch2 = curl_init(AUTH_URL);
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_POST, true);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Accept: application/json'
]);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $jsonData);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch2, CURLOPT_TIMEOUT, 15);

$response2 = curl_exec($ch2);
$httpCode2 = curl_getinfo($ch2, CURLINFO_HTTP_CODE);
$curlError2 = curl_error($ch2);
curl_close($ch2);

echo '<p><span class="info">📤 Request Headers:</span></p>';
echo '<pre>Content-Type: application/json
Accept: application/json</pre>';

echo '<p><span class="info">📤 Request Body:</span></p>';
echo '<pre>' . htmlspecialchars($jsonData) . '</pre>';

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode2 == 200 ? 'success' : 'error') . '">' . $httpCode2 . '</span></p>';

if ($curlError2) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError2) . '</p>';
}

echo '<p><span class="info">📥 Response Body:</span></p>';
echo '<pre>' . htmlspecialchars($response2) . '</pre>';

$json2 = json_decode($response2, true);
if ($httpCode2 == 200 && isset($json2['access_token'])) {
    echo '<p class="success">✅ ¡MÉTODO EXITOSO! Token obtenido.</p>';
    echo '<p><span class="info">🎟️ Token:</span> <code>' . substr($json2['access_token'], 0, 50) . '...</code></p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó.</p>';
}

echo '</div>';

// ============================================
// MÉTODO 3: Basic Authentication
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">📡 MÉTODO 3: Basic Authentication</div>';

$basicAuth = base64_encode(CLIENT_ID . ':' . CLIENT_SECRET);

$ch3 = curl_init(AUTH_URL);
curl_setopt($ch3, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch3, CURLOPT_POST, true);
curl_setopt($ch3, CURLOPT_HTTPHEADER, [
    'Authorization: Basic ' . $basicAuth,
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);
curl_setopt($ch3, CURLOPT_POSTFIELDS, 'grant_type=client_credentials');
curl_setopt($ch3, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch3, CURLOPT_TIMEOUT, 15);

$response3 = curl_exec($ch3);
$httpCode3 = curl_getinfo($ch3, CURLINFO_HTTP_CODE);
$curlError3 = curl_error($ch3);
curl_close($ch3);

echo '<p><span class="info">📤 Request Headers:</span></p>';
echo '<pre>Authorization: Basic [base64_encoded_credentials]
Content-Type: application/x-www-form-urlencoded
Accept: application/json</pre>';

echo '<p><span class="info">📤 Request Body:</span></p>';
echo '<pre>grant_type=client_credentials</pre>';

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode3 == 200 ? 'success' : 'error') . '">' . $httpCode3 . '</span></p>';

if ($curlError3) {
    echo '<p class="error">❌ CURL Error: ' . htmlspecialchars($curlError3) . '</p>';
}

echo '<p><span class="info">📥 Response Body:</span></p>';
echo '<pre>' . htmlspecialchars($response3) . '</pre>';

$json3 = json_decode($response3, true);
if ($httpCode3 == 200 && isset($json3['access_token'])) {
    echo '<p class="success">✅ ¡MÉTODO EXITOSO! Token obtenido.</p>';
    echo '<p><span class="info">🎟️ Token:</span> <code>' . substr($json3['access_token'], 0, 50) . '...</code></p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó.</p>';
}

echo '</div>';

// ============================================
// MÉTODO 4: Sin grant_type (algunas APIs custom)
// ============================================
echo '<div class="test-section">';
echo '<div class="test-title">📡 MÉTODO 4: Sin grant_type (API Custom)</div>';

$postData4 = http_build_query([
    'client_id' => CLIENT_ID,
    'client_secret' => CLIENT_SECRET
]);

$ch4 = curl_init(AUTH_URL);
curl_setopt($ch4, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch4, CURLOPT_POST, true);
curl_setopt($ch4, CURLOPT_HTTPHEADER, [
    'Content-Type: application/x-www-form-urlencoded',
    'Accept: application/json'
]);
curl_setopt($ch4, CURLOPT_POSTFIELDS, $postData4);
curl_setopt($ch4, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch4, CURLOPT_TIMEOUT, 15);

$response4 = curl_exec($ch4);
$httpCode4 = curl_getinfo($ch4, CURLINFO_HTTP_CODE);
$curlError4 = curl_error($ch4);
curl_close($ch4);

echo '<p><span class="info">📤 Request Body:</span></p>';
echo '<pre>' . htmlspecialchars($postData4) . '</pre>';

echo '<p><span class="info">📥 HTTP Status Code:</span> <span class="' . ($httpCode4 == 200 ? 'success' : 'error') . '">' . $httpCode4 . '</span></p>';

echo '<p><span class="info">📥 Response Body:</span></p>';
echo '<pre>' . htmlspecialchars($response4) . '</pre>';

$json4 = json_decode($response4, true);
if ($httpCode4 == 200 && isset($json4['access_token'])) {
    echo '<p class="success">✅ ¡MÉTODO EXITOSO! Token obtenido.</p>';
} else {
    echo '<p class="error">❌ Este método NO funcionó.</p>';
}

echo '</div>';

// ============================================
// RESUMEN
// ============================================
echo '<div class="test-section" style="background: #2a2a2a; border: 2px solid #00AAC7;">';
echo '<div class="test-title" style="color: #00AAC7; font-size: 22px;">📊 RESUMEN DE RESULTADOS</div>';

$exitos = 0;
$metodoExitoso = null;

if ($httpCode1 == 200 && isset($json1['access_token'])) {
    $exitos++;
    $metodoExitoso = 'Método 1: application/x-www-form-urlencoded';
}
if ($httpCode2 == 200 && isset($json2['access_token'])) {
    $exitos++;
    $metodoExitoso = 'Método 2: application/json';
}
if ($httpCode3 == 200 && isset($json3['access_token'])) {
    $exitos++;
    $metodoExitoso = 'Método 3: Basic Authentication';
}
if ($httpCode4 == 200 && isset($json4['access_token'])) {
    $exitos++;
    $metodoExitoso = 'Método 4: Sin grant_type';
}

if ($exitos > 0) {
    echo '<p class="success" style="font-size: 20px;">✅ ¡ÉXITO! ' . $exitos . ' método(s) funcionaron correctamente.</p>';
    echo '<p class="info" style="font-size: 18px;">🎯 Método que funcionó: <strong>' . $metodoExitoso . '</strong></p>';
    echo '<p style="color: #ffaa00;">📋 ACCIÓN REQUERIDA: Copia el código del método exitoso y úsalo en tu archivo crear-orden.php</p>';
} else {
    echo '<p class="error" style="font-size: 20px;">❌ NINGÚN MÉTODO FUNCIONÓ</p>';
    echo '<p class="warning" style="font-size: 16px;">⚠️ Posibles causas:</p>';
    echo '<ul style="color: #ffaa00;">';
    echo '<li>❌ Las credenciales (Client ID o Client Secret) son incorrectas</li>';
    echo '<li>❌ Tu cuenta no tiene acceso a la API</li>';
    echo '<li>❌ La API requiere verificación o activación manual</li>';
    echo '<li>❌ El endpoint de autenticación es diferente</li>';
    echo '<li>❌ La API usa un método de autenticación diferente (API Key, etc.)</li>';
    echo '</ul>';
    echo '<p class="info">📝 SIGUIENTE PASO:</p>';
    echo '<ul style="color: #00AAC7;">';
    echo '<li>1. Verifica tus credenciales en: <a href="https://app.enviosinternacionales.com" target="_blank" style="color: #00AAC7;">Panel de Envíos Internacionales</a></li>';
    echo '<li>2. Contacta al soporte de enviosinternacionales.com</li>';
    echo '<li>3. Solicita documentación actualizada de su API</li>';
    echo '</ul>';
}

echo '</div>';

?>

        <div style="text-align: center; margin-top: 30px;">
            <a href="?" class="button">🔄 Ejecutar Diagnóstico Nuevamente</a>
        </div>

        <div style="margin-top: 30px; padding: 20px; background: #1a1a1a; border: 1px solid #333; border-radius: 5px;">
            <p style="color: #00AAC7; font-weight: bold;">ℹ️ INFORMACIÓN:</p>
            <p style="color: #999; font-size: 14px;">
                Este diagnóstico prueba 4 métodos diferentes de autenticación OAuth2 para identificar 
                cuál funciona con la API de enviosinternacionales.com. Los resultados te dirán exactamente 
                qué método usar en tu integración.
            </p>
        </div>
    </div>
</body>
</html>
