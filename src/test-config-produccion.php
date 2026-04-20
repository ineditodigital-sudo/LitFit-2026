<?php
/**
 * ============================================
 * TEST DE CONFIGURACIÓN DE MERCADO PAGO
 * ============================================
 * 
 * Este archivo te permite verificar que las credenciales
 * de producción estén configuradas correctamente.
 * 
 * 🚨 IMPORTANTE: BORRA ESTE ARCHIVO después de usarlo
 * ya que muestra información sensible.
 * 
 * 📍 Sube este archivo a:
 * /home/inedito/public_html/cdn.inedito.digital/mercadopago/
 * 
 * 🌐 Luego abre en tu navegador:
 * https://cdn.inedito.digital/mercadopago/test-config-produccion.php
 */

// Cargar archivo de configuración
define('MP_CONFIG_LOADED', true);

// Intentar cargar desde diferentes ubicaciones
$config_paths = [
    __DIR__ . '/mercadopago-config.php',
    '/home/inedito/private/config/mercadopago-config.php',
    '/home/inedito/mercadopago-config.php',
];

$config_loaded = false;
$config_path_used = '';

foreach ($config_paths as $path) {
    if (file_exists($path)) {
        require_once $path;
        $config_loaded = true;
        $config_path_used = $path;
        break;
    }
}

// HTML de la página de prueba
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Configuración - Mercado Pago</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
        }
        .container {
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
            padding: 40px;
            max-width: 800px;
            width: 100%;
        }
        h1 {
            color: #333;
            margin-bottom: 10px;
            font-size: 28px;
        }
        .subtitle {
            color: #666;
            margin-bottom: 30px;
            font-size: 14px;
        }
        .status {
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 20px;
            font-weight: bold;
        }
        .success {
            background: #d4edda;
            border: 2px solid #28a745;
            color: #155724;
        }
        .error {
            background: #f8d7da;
            border: 2px solid #dc3545;
            color: #721c24;
        }
        .warning {
            background: #fff3cd;
            border: 2px solid #ffc107;
            color: #856404;
        }
        .info-box {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 20px 0;
        }
        .info-row {
            display: flex;
            justify-content: space-between;
            padding: 12px 0;
            border-bottom: 1px solid #dee2e6;
        }
        .info-row:last-child {
            border-bottom: none;
        }
        .label {
            font-weight: bold;
            color: #495057;
        }
        .value {
            color: #212529;
            font-family: 'Courier New', monospace;
            background: #e9ecef;
            padding: 4px 8px;
            border-radius: 4px;
        }
        .badge {
            display: inline-block;
            padding: 6px 12px;
            border-radius: 4px;
            font-size: 12px;
            font-weight: bold;
            text-transform: uppercase;
        }
        .badge-test {
            background: #ffc107;
            color: #000;
        }
        .badge-production {
            background: #28a745;
            color: white;
        }
        .badge-invalid {
            background: #dc3545;
            color: white;
        }
        .delete-warning {
            background: #dc3545;
            color: white;
            padding: 20px;
            border-radius: 8px;
            margin-top: 30px;
            text-align: center;
            font-weight: bold;
        }
        .icon {
            font-size: 48px;
            margin-bottom: 20px;
        }
        code {
            background: #f8f9fa;
            padding: 2px 6px;
            border-radius: 3px;
            font-family: 'Courier New', monospace;
            color: #e83e8c;
        }
        .checklist {
            list-style: none;
            padding: 0;
        }
        .checklist li {
            padding: 10px 0;
            padding-left: 30px;
            position: relative;
        }
        .checklist li:before {
            content: "✅";
            position: absolute;
            left: 0;
        }
        .checklist li.error:before {
            content: "❌";
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔐 Test de Configuración - Mercado Pago</h1>
        <p class="subtitle">LITFIT - Verificación de Credenciales</p>

        <?php if (!$config_loaded): ?>
            <div class="status error">
                <div class="icon">❌</div>
                <strong>ERROR: No se pudo cargar el archivo de configuración</strong>
            </div>

            <div class="info-box">
                <h3 style="margin-bottom: 15px;">Rutas verificadas:</h3>
                <ul>
                    <?php foreach ($config_paths as $path): ?>
                        <li><code><?php echo htmlspecialchars($path); ?></code> - ❌ No existe</li>
                    <?php endforeach; ?>
                </ul>
            </div>

            <div class="info-box">
                <h3 style="margin-bottom: 15px;">Solución:</h3>
                <ol>
                    <li>Verifica que hayas subido <code>mercadopago-config.php</code> a cPanel</li>
                    <li>Asegúrate de que esté en una de estas ubicaciones:
                        <ul>
                            <li><code>/home/inedito/public_html/cdn.inedito.digital/mercadopago/</code></li>
                            <li><code>/home/inedito/private/config/</code> (recomendado)</li>
                        </ul>
                    </li>
                    <li>Verifica los permisos del archivo (deben ser 644)</li>
                </ol>
            </div>

        <?php else: ?>
            <div class="status success">
                <div class="icon">✅</div>
                <strong>Archivo de configuración cargado correctamente</strong>
            </div>

            <div class="info-box">
                <div class="info-row">
                    <span class="label">📍 Ubicación del archivo:</span>
                    <span class="value"><?php echo htmlspecialchars($config_path_used); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">🔑 Public Key:</span>
                    <span class="value"><?php echo htmlspecialchars(substr(MP_PUBLIC_KEY, 0, 20)) . '...'; ?></span>
                </div>
                <div class="info-row">
                    <span class="label">🔐 Access Token:</span>
                    <span class="value"><?php echo htmlspecialchars(substr(MP_ACCESS_TOKEN, 0, 20)) . '...'; ?></span>
                </div>
                <div class="info-row">
                    <span class="label">🌐 Modo:</span>
                    <span>
                        <?php if (MP_TEST_MODE): ?>
                            <span class="badge badge-test">TEST / Sandbox</span>
                        <?php else: ?>
                            <span class="badge badge-production">PRODUCCIÓN</span>
                        <?php endif; ?>
                    </span>
                </div>
                <div class="info-row">
                    <span class="label">✅ Success URL:</span>
                    <span class="value"><?php echo htmlspecialchars(MP_SUCCESS_URL); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">❌ Failure URL:</span>
                    <span class="value"><?php echo htmlspecialchars(MP_FAILURE_URL); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">⏳ Pending URL:</span>
                    <span class="value"><?php echo htmlspecialchars(MP_PENDING_URL); ?></span>
                </div>
                <div class="info-row">
                    <span class="label">🔔 Webhook URL:</span>
                    <span class="value"><?php echo htmlspecialchars(MP_WEBHOOK_URL); ?></span>
                </div>
            </div>

            <?php
            // Detectar tipo de credenciales
            $is_test = strpos(MP_PUBLIC_KEY, 'TEST-') === 0;
            $is_production = strpos(MP_PUBLIC_KEY, 'APP_USR-') === 0;
            ?>

            <div class="info-box">
                <h3 style="margin-bottom: 15px;">📊 Análisis de Credenciales:</h3>
                <ul class="checklist">
                    <li class="<?php echo $is_production ? 'success' : 'error'; ?>">
                        Public Key <?php echo $is_production ? 'es de PRODUCCIÓN' : 'NO es de producción'; ?>
                        <?php if ($is_test) echo '(es de TEST)'; ?>
                    </li>
                    <li class="<?php echo strpos(MP_ACCESS_TOKEN, 'APP_USR-') === 0 ? 'success' : 'error'; ?>">
                        Access Token <?php echo strpos(MP_ACCESS_TOKEN, 'APP_USR-') === 0 ? 'es de PRODUCCIÓN' : 'NO es de producción'; ?>
                        <?php if (strpos(MP_ACCESS_TOKEN, 'TEST-') === 0) echo '(es de TEST)'; ?>
                    </li>
                    <li class="<?php echo !MP_TEST_MODE ? 'success' : 'error'; ?>">
                        Modo <?php echo !MP_TEST_MODE ? 'configurado como PRODUCCIÓN' : 'configurado como TEST'; ?>
                    </li>
                    <li class="<?php echo ($is_production && !MP_TEST_MODE) ? 'success' : 'error'; ?>">
                        Configuración <?php echo ($is_production && !MP_TEST_MODE) ? 'CORRECTA para producción' : 'INCORRECTA (revisa credenciales y modo)'; ?>
                    </li>
                </ul>
            </div>

            <?php if ($is_test || MP_TEST_MODE): ?>
                <div class="status warning">
                    <strong>⚠️ ADVERTENCIA: Estás usando credenciales de TEST</strong>
                    <p style="margin-top: 10px; font-weight: normal;">
                        Los pagos serán ficticios. Para aceptar pagos reales, cambia a credenciales de PRODUCCIÓN.
                    </p>
                </div>
            <?php endif; ?>

            <?php if ($is_production && !MP_TEST_MODE): ?>
                <div class="status success">
                    <strong>🎉 ¡CONFIGURACIÓN LISTA PARA PRODUCCIÓN!</strong>
                    <p style="margin-top: 10px; font-weight: normal;">
                        Tu sitio está configurado para aceptar pagos REALES. Los clientes pagarán de verdad.
                    </p>
                </div>
            <?php endif; ?>

        <?php endif; ?>

        <div class="delete-warning">
            🚨 IMPORTANTE: BORRA ESTE ARCHIVO AHORA 🚨
            <p style="margin-top: 10px; font-weight: normal;">
                Este archivo muestra información sensible. Elimínalo de inmediato después de verificar la configuración.
            </p>
            <p style="margin-top: 10px; font-weight: normal;">
                Archivo: <code style="background: rgba(255,255,255,0.2); color: white;">test-config-produccion.php</code>
            </p>
        </div>
    </div>
</body>
</html>
