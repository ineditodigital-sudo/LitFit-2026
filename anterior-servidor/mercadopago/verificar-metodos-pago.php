<?php
/**
 * ============================================
 * SCRIPT DE DIAGNÓSTICO - MERCADO PAGO
 * ============================================
 * 
 * Este script verifica qué métodos de pago están
 * disponibles con tus credenciales de Mercado Pago
 * 
 * 📍 SUBIR A:
 * /home/inedito/public_html/cdn.inedito.digital/mercadopago/verificar-metodos-pago.php
 * 
 * 🌐 ACCEDER EN:
 * https://cdn.inedito.digital/mercadopago/verificar-metodos-pago.php
 */

header('Content-Type: text/html; charset=UTF-8');

// Cargar configuración
define('MP_CONFIG_LOADED', true);

$possiblePaths = [
    __DIR__ . '/mercadopago-config.php',
    __DIR__ . '/../../private/config/mercadopago-config.php',
    '/home/inedito/private/config/mercadopago-config.php',
    $_SERVER['DOCUMENT_ROOT'] . '/../private/config/mercadopago-config.php'
];

$configPath = null;
foreach ($possiblePaths as $path) {
    if (file_exists($path)) {
        $configPath = $path;
        break;
    }
}

if (!$configPath) {
    die('<h1>❌ Error</h1><p>No se encontró mercadopago-config.php</p>');
}

require_once $configPath;

?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Verificación de Mercado Pago - LITFIT</title>
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Arial, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px;
            min-height: 100vh;
        }
        .container {
            max-width: 800px;
            margin: 0 auto;
            background: white;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            padding: 40px;
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
        .section {
            background: #f8f9fa;
            border-radius: 8px;
            padding: 20px;
            margin-bottom: 20px;
        }
        .section h2 {
            color: #00AAC7;
            margin-bottom: 15px;
            font-size: 18px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .status {
            display: inline-block;
            padding: 4px 12px;
            border-radius: 12px;
            font-size: 12px;
            font-weight: 600;
        }
        .status.success { background: #d4edda; color: #155724; }
        .status.error { background: #f8d7da; color: #721c24; }
        .status.warning { background: #fff3cd; color: #856404; }
        .credential {
            font-family: 'Monaco', 'Courier New', monospace;
            background: #2d2d2d;
            color: #00ff00;
            padding: 15px;
            border-radius: 6px;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
        }
        .credential .key {
            color: #ff6b6b;
            font-weight: bold;
        }
        .credential .value {
            color: #4ecdc4;
        }
        .method-list {
            list-style: none;
            margin-top: 15px;
        }
        .method-item {
            background: white;
            padding: 12px;
            margin-bottom: 8px;
            border-radius: 6px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-left: 4px solid #00AAC7;
        }
        .method-name {
            font-weight: 600;
            color: #333;
        }
        .method-id {
            font-size: 12px;
            color: #666;
            font-family: monospace;
        }
        button {
            background: #00AAC7;
            color: white;
            border: none;
            padding: 12px 24px;
            border-radius: 6px;
            font-size: 14px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s;
        }
        button:hover {
            background: #008ca7;
            transform: translateY(-2px);
            box-shadow: 0 4px 12px rgba(0,170,199,0.3);
        }
        .alert {
            background: #fff3cd;
            border: 2px solid #ffc107;
            border-radius: 8px;
            padding: 15px;
            margin: 20px 0;
        }
        .alert h3 {
            color: #856404;
            margin-bottom: 10px;
        }
        .alert p {
            color: #856404;
            line-height: 1.6;
        }
        .loading {
            text-align: center;
            padding: 20px;
            color: #666;
        }
        pre {
            background: #f4f4f4;
            padding: 15px;
            border-radius: 6px;
            overflow-x: auto;
            font-size: 12px;
            line-height: 1.5;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Diagnóstico de Mercado Pago</h1>
        <p class="subtitle">LITFIT - Verificación de métodos de pago disponibles</p>

        <!-- Información de credenciales -->
        <div class="section">
            <h2>🔐 Credenciales Configuradas</h2>
            <div class="credential">
                <div><span class="key">Access Token:</span> <span class="value"><?php echo substr(MP_ACCESS_TOKEN, 0, 20); ?>...<?php echo substr(MP_ACCESS_TOKEN, -10); ?></span></div>
                <div><span class="key">Public Key:</span> <span class="value"><?php echo MP_PUBLIC_KEY; ?></span></div>
                <div><span class="key">Modo:</span> <span class="value"><?php echo MP_TEST_MODE ? 'TEST (Pruebas)' : 'PRODUCCIÓN'; ?></span></div>
            </div>
        </div>

        <!-- Consultar métodos de pago -->
        <div class="section">
            <h2>💳 Métodos de Pago Disponibles</h2>
            <button onclick="consultarMetodos()">Consultar Métodos Disponibles</button>
            <div id="resultados" style="margin-top: 20px;"></div>
        </div>

        <!-- Crear preferencia de prueba -->
        <div class="section">
            <h2>🧪 Crear Preferencia de Prueba</h2>
            <p style="margin-bottom: 15px; color: #666;">Esto creará una preferencia de $0.01 y mostrará qué métodos están configurados.</p>
            <button onclick="crearPreferencia()">Crear Preferencia de Prueba</button>
            <div id="resultados-preferencia" style="margin-top: 20px;"></div>
        </div>

        <!-- Alertas importantes -->
        <div class="alert">
            <h3>⚠️ Posibles causas del error con saldo de Mercado Pago:</h3>
            <p><strong>1. Configuración de la aplicación:</strong> Ve a tu panel de Mercado Pago → Tus integraciones → Configuración de la aplicación → Asegúrate de que NO haya métodos de pago excluidos.</p>
            <p style="margin-top: 10px;"><strong>2. Monto mínimo:</strong> Algunos métodos de pago tienen un monto mínimo (ej: $10 MXN). Prueba con $10 en lugar de $0.01.</p>
            <p style="margin-top: 10px;"><strong>3. Saldo insuficiente:</strong> Verifica que tu cuenta de Mercado Pago tenga saldo disponible mayor a $0.01.</p>
            <p style="margin-top: 10px;"><strong>4. Restricciones de la cuenta:</strong> Tu cuenta vendedor debe tener habilitada la opción de recibir pagos con saldo.</p>
        </div>
    </div>

    <script>
        async function consultarMetodos() {
            const div = document.getElementById('resultados');
            div.innerHTML = '<div class="loading">⏳ Consultando API de Mercado Pago...</div>';

            try {
                const response = await fetch('https://api.mercadopago.com/v1/payment_methods', {
                    headers: {
                        'Authorization': 'Bearer <?php echo MP_ACCESS_TOKEN; ?>'
                    }
                });

                const methods = await response.json();
                
                if (response.ok) {
                    let html = '<ul class="method-list">';
                    
                    methods.forEach(method => {
                        html += `
                            <li class="method-item">
                                <div>
                                    <div class="method-name">${method.name}</div>
                                    <div class="method-id">ID: ${method.id} | Tipo: ${method.payment_type_id}</div>
                                </div>
                                <span class="status success">✓ Disponible</span>
                            </li>
                        `;
                    });
                    
                    html += '</ul>';
                    
                    // Verificar si account_money está disponible
                    const accountMoney = methods.find(m => m.id === 'account_money');
                    if (accountMoney) {
                        html = '<div class="alert" style="background: #d4edda; border-color: #28a745;"><h3 style="color: #155724;">✅ ¡Saldo de Mercado Pago ESTÁ disponible!</h3><p style="color: #155724;">El método "account_money" está habilitado en tu cuenta.</p></div>' + html;
                    } else {
                        html = '<div class="alert" style="background: #f8d7da; border-color: #dc3545;"><h3 style="color: #721c24;">❌ Saldo de Mercado Pago NO disponible</h3><p style="color: #721c24;">El método "account_money" no aparece en los métodos disponibles. Contacta a soporte de Mercado Pago.</p></div>' + html;
                    }
                    
                    div.innerHTML = html;
                } else {
                    div.innerHTML = '<div class="alert" style="background: #f8d7da;"><h3 style="color: #721c24;">❌ Error al consultar</h3><p style="color: #721c24;">' + JSON.stringify(methods) + '</p></div>';
                }
            } catch (error) {
                div.innerHTML = '<div class="alert" style="background: #f8d7da;"><h3 style="color: #721c24;">❌ Error de conexión</h3><p style="color: #721c24;">' + error.message + '</p></div>';
            }
        }

        async function crearPreferencia() {
            const div = document.getElementById('resultados-preferencia');
            div.innerHTML = '<div class="loading">⏳ Creando preferencia de prueba...</div>';

            try {
                const preferenceData = {
                    items: [{
                        title: 'Producto de prueba',
                        quantity: 1,
                        unit_price: 0.01,
                        currency_id: 'MXN'
                    }],
                    back_urls: {
                        success: '<?php echo MP_SUCCESS_URL; ?>',
                        failure: '<?php echo MP_FAILURE_URL; ?>',
                        pending: '<?php echo MP_PENDING_URL; ?>'
                    }
                };

                const response = await fetch('https://api.mercadopago.com/checkout/preferences', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': 'Bearer <?php echo MP_ACCESS_TOKEN; ?>'
                    },
                    body: JSON.stringify(preferenceData)
                });

                const result = await response.json();
                
                if (response.ok) {
                    let html = '<div class="alert" style="background: #d4edda; border-color: #28a745;"><h3 style="color: #155724;">✅ Preferencia creada exitosamente</h3></div>';
                    html += '<pre>' + JSON.stringify(result, null, 2) + '</pre>';
                    
                    if (result.init_point) {
                        html += '<p style="margin-top: 15px;"><a href="' + result.init_point + '" target="_blank" style="color: #00AAC7; font-weight: 600;">🔗 Abrir checkout de Mercado Pago</a></p>';
                    }
                    
                    div.innerHTML = html;
                } else {
                    div.innerHTML = '<div class="alert" style="background: #f8d7da;"><h3 style="color: #721c24;">❌ Error al crear preferencia</h3><pre>' + JSON.stringify(result, null, 2) + '</pre></div>';
                }
            } catch (error) {
                div.innerHTML = '<div class="alert" style="background: #f8d7da;"><h3 style="color: #721c24;">❌ Error</h3><p style="color: #721c24;">' + error.message + '</p></div>';
            }
        }
    </script>
</body>
</html>
