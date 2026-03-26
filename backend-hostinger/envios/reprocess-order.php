<?php
/**
 * REPROCESAR PEDIDO MANUAL - LITFIT (VERSIÓN CON DEBUG)
 * Permite seleccionar qué pasos ejecutar y muestra errores de la API.
 */

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    echo '
    <!DOCTYPE html>
    <html lang="es">
    <head>
        <meta charset="UTF-8">
        <title>LITFIT - Reprocesar Pedido</title>
        <style>
            body { font-family: sans-serif; padding: 40px; line-height: 1.6; }
            textarea { width: 100%; height: 200px; margin-bottom: 20px; font-family: monospace; }
            button { padding: 12px 24px; cursor: pointer; background: #00AAC7; border: none; color: white; font-weight: bold; border-radius: 8px; }
            .option { margin-bottom: 15px; display: flex; align-items: center; gap: 10px; }
            input[type="checkbox"] { width: 18px; height: 18px; }
            label { font-weight: bold; font-size: 14px; }
        </style>
    </head>
    <body>
        <h1>Reprocesar Pedido Manual</h1>
        <p>Pega el JSON completo del pedido y selecciona qué pasos realizar:</p>
        <form method="POST">
            <textarea name="order_json" placeholder=\'{"orderId": "LITFIT-...", ...}\'></textarea>
            
            <div class="option">
                <input type="checkbox" name="step_db" id="step_db" checked>
                <label for="step_db">1. Registrar/Actualizar en Base de Datos (PAID)</label>
            </div>
            
            <div class="option">
                <input type="checkbox" name="step_email" id="step_email" checked>
                <label for="step_email">2. Enviar correos (Admin y Cliente)</label>
            </div>
            
            <div class="option">
                <input type="checkbox" name="step_ship" id="step_ship" checked>
                <label for="step_ship">3. Crear envío internacional (Guía automática)</label>
            </div>

            <div class="option">
                <input type="checkbox" name="debug_api" id="debug_api">
                <label for="debug_api" style="color: #d9480f;">🔍 Mostrar depuración detallada de errores de API</label>
            </div>

            <button type="submit">PROCESAR PEDIDO SELECCIONADO</button>
        </form>
    </body>
    </html>';
    exit;
}

require_once __DIR__ . '/order-helper.php';

$json = $_POST['order_json'] ?? '';
$data = json_decode($json, true);

if (!$data || !isset($data['orderId'])) {
    die("❌ Error: JSON inválido o sin orderId.");
}

$orderId = $data['orderId'];
$pdo = getDbConnection();

$doDb = isset($_POST['step_db']);
$doEmail = isset($_POST['step_email']);
$doShip = isset($_POST['step_ship']);
$debug = isset($_POST['debug_api']);

if ($debug) {
    define('SHIPPING_DEBUG_MODE', true);
}

echo "<h1>Resultado del Procesamiento</h1>";
echo "<pre>";
echo "--- INICIANDO PROCESO PARA: $orderId ---\n";

try {
    // 1. DATABASE
    if ($doDb) {
        $data['status'] = 'PAID';
        $jsonToSave = json_encode($data);
        $stmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_email, total, status, order_data) 
            VALUES (?, ?, ?, ?, ?, ?) 
            ON DUPLICATE KEY UPDATE status = VALUES(status), order_data = VALUES(order_data)");
        
        $stmt->execute([
            $orderId, 
            ($data['formData']['firstName'] ?? '') . ' ' . ($data['formData']['lastName'] ?? ''), 
            $data['formData']['email'] ?? '', 
            $data['total'] ?? 0, 
            'PAID', 
            $jsonToSave
        ]);
        echo "✅ Base de datos actualizada.\n";
    }

    // 2. EMAILS
    if ($doEmail) {
        echo "📧 Enviando correos...\n";
        $conf = email_send_order_confirmation($orderId);
        $adm = email_send_admin_notification($orderId);
        echo ($conf ? "✅ Correo cliente enviado.\n" : "❌ Error correo cliente.\n");
        echo ($adm ? "✅ Correo admin enviado.\n" : "❌ Error correo admin.\n");
    }

    // 3. SHIPPING
    if ($doShip) {
        echo "🚚 Creando envío internacional...\n";
        // Si activó debug, mostramos la respuesta que da la API antes de retornar
        $ship = shipping_create_externally($orderId);
        
        if ($ship === true) {
            echo "✅ ORDEN DE ENVÍO GENERADA CORRECTAMENTE.\n";
        } else {
            echo "❌ ERROR EN LA API DE ENVÍOS.\n";
            echo "Sugerencia: Revisa que la dirección no tenga caracteres especiales o sea demasiado larga.\n";
        }
    }

} catch (Exception $e) {
    echo "❌ ERROR INTERNO: " . $e->getMessage() . "\n";
}

echo "\n--- TERMINADO ---";
echo "</pre>";
echo '<br><a href="reprocess-order.php">Volver</a>';
