<?php
/**
 * DETECTIVE DE GUÍAS V5 - FUERZA BRUTA DE DICCIONARIO
 */
error_reporting(E_ALL);
ini_set('display_errors', 1);

require_once __DIR__ . '/admin-config.php';
require_once __DIR__ . '/order-helper.php';

echo "<h1>Detective de Guías V5 - Adivinando la Contraseña</h1>";
echo "<pre>";

$pdo = getDbConnection();
$stmt = $pdo->query("SELECT order_id FROM orders WHERE status = 'PAID' ORDER BY order_id DESC LIMIT 1");
$order = $stmt->fetch(PDO::FETCH_ASSOC);

if (!$order) { die("❌ No hay pedidos para probar."); }
$orderId = $order['order_id'];

// Obtener Token
$chAuth = curl_init(ENVIOS_API_BASE . '/oauth/token');
curl_setopt($chAuth, CURLOPT_RETURNTRANSFER, true);
curl_setopt($chAuth, CURLOPT_POST, true);
curl_setopt($chAuth, CURLOPT_POSTFIELDS, http_build_query(['client_id' => ENVIOS_CLIENT_ID, 'client_secret' => ENVIOS_CLIENT_SECRET, 'grant_type' => 'client_credentials']));
$authResp = curl_exec($chAuth);
$authData = json_decode($authResp, true);
$token = $authData['access_token'] ?? '';
if (!$token) die("❌ Error Token");

// Obtenemos una cotización rápida
$quotePayload = [
    'quotation' => [
        'address_from' => ['country_code' => 'MX', 'postal_code' => '20020', 'area_level1' => 'Ag', 'area_level2' => 'Ag', 'area_level3' => 'Centro', 'address_line_1' => 'Cedro 305'],
        'address_to' => ['country_code' => 'MX', 'postal_code' => '20000', 'area_level1' => 'Ag', 'area_level2' => 'Ag', 'area_level3' => 'Centro', 'address_line_1' => 'Conocido 1'],
        'parcels' => [['weight' => 1, 'length' => 15, 'width' => 15, 'height' => 15]]
    ]
];
$chQ = curl_init(ENVIOS_API_BASE . '/quotations');
curl_setopt($chQ, CURLOPT_RETURNTRANSFER, true); curl_setopt($chQ, CURLOPT_POST, true);
curl_setopt($chQ, CURLOPT_POSTFIELDS, json_encode($quotePayload));
curl_setopt($chQ, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $token]);
$quoteResp = json_decode(curl_exec($chQ), true);
$rateId = null;
foreach ($quoteResp['rates'] ?? [] as $rate) { if ($rate['success'] === true) { $rateId = $rate['id']; break; } }
if (!$rateId) die("No se obtuvo rateId");

$parcelsFromQuote = $quoteResp['packages'] ?? [];

$diccionarioPaquetes = ['box', 'parcel', 'caja', 'paquete', 'envelope', 'sobre', 'bulto', 'custom', 'tube', 'pallet', 'general'];
$diccionarioNotas = ['Suplementos', 'Suplemento', 'Salud', 'Salud y belleza', 'Mercancia', 'Merchandise', 'Gifts', 'Documents', 'Health', 'general', 'otros', 'other', 'vitaminas'];

echo "Iniciando hackeo a la paquetería...\n";

foreach ($diccionarioPaquetes as $tipoPaquete) {
    foreach ($diccionarioNotas as $nota) {
        $pForShip = [];
        foreach ($parcelsFromQuote as $p) {
            $pForShip[] = [
                'package_number' => $p['package_number'] ?? 1,
                'package_type' => $tipoPaquete,
                'content' => 'Suplementos',
                'consignment_note' => $nota,
                'weight' => floatval($p['weight']), 'length' => floatval($p['length']), 'width' => floatval($p['width']), 'height' => floatval($p['height'])
            ];
        }

        $shipmentPayload = [
            'shipment' => [
                'rate_id' => $rateId,
                'address_from' => ['name' => 'LITFIT MEXICO', 'email' => 'a@b.com', 'phone' => '4491000000', 'street1' => 'Cedro 305', 'postal_code' => '20020', 'reference' => 'Frente'],
                'address_to' => ['name' => 'Cliente', 'email' => 'c@d.com', 'phone' => '4491000000', 'street1' => 'Dir', 'postal_code' => '20000', 'reference' => 'Ent'],
                'packages' => $pForShip
            ]
        ];

        $chS = curl_init(ENVIOS_API_BASE . '/shipments/');
        curl_setopt($chS, CURLOPT_RETURNTRANSFER, true); curl_setopt($chS, CURLOPT_POST, true);
        curl_setopt($chS, CURLOPT_POSTFIELDS, json_encode($shipmentPayload));
        curl_setopt($chS, CURLOPT_HTTPHEADER, ['Content-Type: application/json', 'Authorization: Bearer ' . $token]);
        $resp = curl_exec($chS);
        $code = curl_getinfo($chS, CURLINFO_HTTP_CODE);

        if ($code === 201 || $code === 200) {
            echo "\n🎉 ¡CONTRASEÑA ENCONTRADA!\n";
            echo "Tipo de paquete aceptado: $tipoPaquete\n";
            echo "Nota aceptada: $nota\n";
            exit;
        } else {
            // Evaluamos si el error ya no es de estos campos
            if (strpos($resp, 'package_type') === false && strpos($resp, 'consignment_note') === false) {
                 echo "\n✅ Las palabras pasaron, pero hay otro error: \nPaquete: $tipoPaquete | Nota: $nota\nResp: $resp\n";
            }
        }
    }
}

echo "❌ Ninguna palabra de nuestra lista de fuerza bruta funcionó. El servidor respondió lo siguiente la última vez:\n$resp";
echo "</pre>";
?>
