<?php
/**
 * ============================================
 * ADMIN API - SCANNER FINAL DE RED (V16)
 * ============================================
 */

header('Access-Control-Allow-Origin: *');
header('Content-Type: text/plain; charset=UTF-8');

echo "--- MONITOR DE LOGÍSTICA LITFIT (V16) ---\n\n";

// TEST 1
echo "1. VERIFICANDO CONEXIÓN A GOOGLE: ";
$ch1 = curl_init("https://www.google.com");
curl_setopt($ch1, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch1, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch1, CURLOPT_TIMEOUT, 5);
curl_exec($ch1);
$err1 = curl_error($ch1);
curl_close($ch1);
echo $err1 ? "❌ FALLO ($err1)" : "✅ ÉXITO (Internet OK)";
echo "\n";

// TEST 2
echo "2. VERIFICANDO ACCESO A LA API DE ENVÍOS: ";
$ch2 = curl_init("https://app.enviosinternacionales.com/api/v1/oauth/token");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch2, CURLOPT_SSL_VERIFYPEER, false);
curl_setopt($ch2, CURLOPT_TIMEOUT, 10);
curl_exec($ch2);
$err2 = curl_error($ch2);
curl_close($ch2);
echo $err2 ? "❌ BLOQUEADO (Motivo: $err2)" : "✅ ÉXITO (Portal Accesible)";
echo "\n\n";

echo "--- INFORME FINAL ---\n";
if ($err2) {
    echo "RESULTADO: Es probable que tu servidor (Firewall/ModSecurity) esté bloqueando la web de envíos.\n";
} else {
    echo "RESULTADO: Todo parece estar bien de red. El fallo es probablemente interno en PHP.\n";
}
