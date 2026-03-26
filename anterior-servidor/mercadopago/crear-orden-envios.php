<?php
/**
 * ============================================
 * INTEGRACIÓN CON ENVÍOS INTERNACIONALES
 * ============================================
 * 
 * Este archivo envía automáticamente los pedidos a enviosinternacionales.com
 * cuando un pago es exitoso.
 * 
 * 📍 UBICACIÓN EN CPANEL:
 * /home/inedito/public_html/cdn.inedito.digital/envios/crear-orden.php
 * 
 * 🌐 URL DE ACCESO:
 * https://cdn.inedito.digital/envios/crear-orden.php
 */

// ============================================
// CONFIGURACIÓN DE HEADERS Y CORS
// ============================================

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

$allowedDomains = [
    'https://litfitmexico.com',
    'figmaiframepreview.figma.site',
    'figma.site'
];

$isAllowed = false;
foreach ($allowedDomains as $domain) {
    if (strpos($origin, $domain) !== false) {
        $isAllowed = true;
        break;
    }
}

if ($isAllowed && $origin) {
    header('Access-Control-Allow-Origin: ' . $origin);
    header('Access-Control-Allow-Credentials: true');
}

header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');
header('Content-Type: application/json; charset=UTF-8');

ini_set('display_errors', 0);
ini_set('log_errors', 1);
error_log("====== Nueva solicitud a crear-orden.php ======");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// ============================================
// LEER DATOS DEL PEDIDO
// ============================================

$rawInput = file_get_contents('php://input');
error_log("📥 Datos recibidos: " . substr($rawInput, 0, 500));

$input = json_decode($rawInput, true);

if (!$input) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'JSON inválido']);
    exit;
}

// Validar datos requeridos
$required = ['orderId', 'items', 'formData', 'total'];
foreach ($required as $field) {
    if (!isset($input[$field])) {
        http_response_code(400);
        echo json_encode(['success' => false, 'message' => "Campo requerido: $field"]);
        exit;
    }
}

$orderId = $input['orderId'];
$items = $input['items'];
$formData = $input['formData'];
$total = $input['total'];
$shippingCost = $input['shippingCost'] ?? 0;
$paymentMethod = $input['paymentMethod'] ?? 'Mercado Pago';

error_log("📦 Procesando orden: " . $orderId);

// ============================================
// PREPARAR DATOS PARA ENVÍOS INTERNACIONALES
// ============================================

// Construir lista de productos
$productosTexto = '';
foreach ($items as $item) {
    $productosTexto .= "• " . $item['name'];
    if (!empty($item['variant'])) {
        $productosTexto .= " - " . $item['variant'];
    }
    if (!empty($item['size'])) {
        $productosTexto .= " (" . $item['size'] . ")";
    }
    $productosTexto .= " x" . $item['quantity'] . "\n";
}

// Preparar dirección completa
$direccionCompleta = sprintf(
    "%s, %s, %s, CP %s, %s",
    $formData['street'] ?? '',
    $formData['city'] ?? '',
    $formData['state'] ?? '',
    $formData['zipCode'] ?? '',
    $formData['country'] ?? 'México'
);

// ============================================
// OPCIÓN 1: ENVIAR A API DE ENVÍOS INTERNACIONALES
// ============================================

// ⚠️ IMPORTANTE: Necesitas obtener las credenciales de API de enviosinternacionales.com
// Si tienen API REST, usa esta sección. Si no, usa la Opción 2 (email).

// Ejemplo de estructura (ajustar según su API real):
$apiData = [
    'origen' => [
        'nombre' => 'LITFIT',
        'direccion' => 'Tu dirección de almacén/oficina',
        'ciudad' => 'Ciudad',
        'estado' => 'Estado',
        'codigo_postal' => '00000',
        'telefono' => 'Tu teléfono'
    ],
    'destino' => [
        'nombre' => ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''),
        'direccion' => $formData['street'] ?? '',
        'ciudad' => $formData['city'] ?? '',
        'estado' => $formData['state'] ?? '',
        'codigo_postal' => $formData['zipCode'] ?? '',
        'pais' => $formData['country'] ?? 'México',
        'telefono' => $formData['phone'] ?? '',
        'email' => $formData['email'] ?? ''
    ],
    'paquete' => [
        'peso' => 1.0, // kg - ajustar según producto real
        'largo' => 30, // cm
        'ancho' => 20,
        'alto' => 10,
        'valor_declarado' => floatval($total),
        'contenido' => $productosTexto
    ],
    'referencia_cliente' => $orderId,
    'notas' => $formData['notes'] ?? ''
];

error_log("📤 Datos preparados para API de Envíos Internacionales");

// ⚠️ SI ENVÍOS INTERNACIONALES TIENE API:
// Descomenta esto y ajusta la URL y headers según su documentación


$ch = curl_init('https://api.enviosinternacionales.com/v1/ordenes'); // Ajustar URL
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'Authorization: Bearer TU_API_KEY_AQUI' // Ajustar según su API
]);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);
curl_setopt($ch, CURLOPT_TIMEOUT, 30);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($curlError) {
    error_log("❌ Error enviando a Envíos Internacionales: " . $curlError);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error conectando con Envíos Internacionales'
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

if ($httpCode === 200 || $httpCode === 201) {
    error_log("✅ Orden creada en Envíos Internacionales");
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden creada exitosamente',
        'orderId' => $orderId,
        'shippingResponse' => $apiResponse
    ]);
} else {
    error_log("❌ Error HTTP de Envíos Internacionales: " . $httpCode);
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error creando orden de envío',
        'details' => $apiResponse
    ]);
}
*/

// ============================================
// OPCIÓN 2: ENVIAR POR EMAIL (TEMPORAL)
// ============================================
// Si enviosinternacionales.com NO tiene API, enviamos los datos por email
// y ellos los crean manualmente en su sistema

$emailDestino = 'ordenes@enviosinternacionales.com'; // Ajustar email real

$asunto = "Nueva Orden de Envío - LITFIT - #" . $orderId;

$mensaje = "
<!DOCTYPE html>
<html>
<head>
    <meta charset='UTF-8'>
    <style>
        body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
        .container { max-width: 800px; margin: 0 auto; padding: 20px; }
        .header { background: #00AAC7; color: white; padding: 20px; text-align: center; }
        .section { background: #f9f9f9; padding: 20px; margin: 20px 0; border-radius: 8px; }
        .label { font-weight: bold; color: #00AAC7; }
        .value { margin-bottom: 10px; }
        .products { background: white; padding: 15px; border-left: 4px solid #00AAC7; }
        .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
    </style>
</head>
<body>
    <div class='container'>
        <div class='header'>
            <h1>Nueva Orden de Envío - LITFIT</h1>
            <p>Orden #" . htmlspecialchars($orderId) . "</p>
        </div>
        
        <div class='section'>
            <h2>📦 INFORMACIÓN DEL DESTINATARIO</h2>
            <div class='value'><span class='label'>Nombre:</span> " . htmlspecialchars(($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? '')) . "</div>
            <div class='value'><span class='label'>Teléfono:</span> " . htmlspecialchars($formData['phone'] ?? '') . "</div>
            <div class='value'><span class='label'>Email:</span> " . htmlspecialchars($formData['email'] ?? '') . "</div>
            <div class='value'><span class='label'>Dirección:</span> " . htmlspecialchars($direccionCompleta) . "</div>
        </div>
        
        <div class='section'>
            <h2>📦 PRODUCTOS A ENVIAR</h2>
            <div class='products'>
                <pre>" . htmlspecialchars($productosTexto) . "</pre>
            </div>
        </div>
        
        <div class='section'>
            <h2>💰 INFORMACIÓN DEL PAGO</h2>
            <div class='value'><span class='label'>Método de pago:</span> " . htmlspecialchars($paymentMethod) . "</div>
            <div class='value'><span class='label'>Total productos:</span> $" . number_format($total - $shippingCost, 2) . " MXN</div>
            <div class='value'><span class='label'>Costo de envío:</span> $" . number_format($shippingCost, 2) . " MXN</div>
            <div class='value'><span class='label'>Total pagado:</span> <strong>$" . number_format($total, 2) . " MXN</strong></div>
            <div class='value'><span class='label'>Estado:</span> <span style='color: green; font-weight: bold;'>✅ PAGADO</span></div>
        </div>
        
        <div class='section'>
            <h2>📝 NOTAS ADICIONALES</h2>
            <p>" . htmlspecialchars($formData['notes'] ?? 'Sin notas') . "</p>
        </div>
        
        <div class='footer'>
            <p>Este email fue generado automáticamente por el sistema de LITFIT</p>
            <p>Por favor, crea el envío en tu sistema usando estos datos</p>
        </div>
    </div>
</body>
</html>
";

$headers = [
    'MIME-Version: 1.0',
    'Content-type: text/html; charset=UTF-8',
    'From: LITFIT <noreply@litfit.inedito.digital>',
    'Reply-To: reenviadorlitfit@inedito.digital'
];

$emailEnviado = mail($emailDestino, $asunto, $mensaje, implode("\r\n", $headers));

if ($emailEnviado) {
    error_log("✅ Email enviado a Envíos Internacionales");
    http_response_code(200);
    echo json_encode([
        'success' => true,
        'message' => 'Orden enviada a Envíos Internacionales',
        'orderId' => $orderId,
        'method' => 'email'
    ]);
} else {
    error_log("❌ Error enviando email");
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'message' => 'Error enviando notificación a Envíos Internacionales'
    ]);
}

// ============================================
// GUARDAR LOG LOCAL (OPCIONAL)
// ============================================

$logFile = __DIR__ . '/ordenes-log.txt';
$logEntry = sprintf(
    "[%s] Orden: %s | Cliente: %s | Total: $%s | Método: %s\n",
    date('Y-m-d H:i:s'),
    $orderId,
    ($formData['firstName'] ?? '') . ' ' . ($formData['lastName'] ?? ''),
    number_format($total, 2),
    $paymentMethod
);

file_put_contents($logFile, $logEntry, FILE_APPEND);

error_log("✅ Log guardado localmente");
?>
