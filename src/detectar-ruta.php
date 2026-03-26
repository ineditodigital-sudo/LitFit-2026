<?php
/**
 * ============================================
 * DETECTOR DE RUTA - Herramienta de diagnóstico
 * ============================================
 * 
 * Este archivo detecta las rutas correctas de tu servidor
 * para configurar mercadopago-config.php de forma segura.
 * 
 * 📍 UBICACIÓN:
 * Sube este archivo temporalmente a:
 * /home/inedito/public_html/cdn/mercadopago/detectar-ruta.php
 * 
 * 🌐 LUEGO ABRE EN NAVEGADOR:
 * https://cdn.inedito.digital/mercadopago/detectar-ruta.php
 * 
 * ⚠️ IMPORTANTE: BORRA ESTE ARCHIVO después de usarlo
 */

header('Content-Type: text/html; charset=UTF-8');
?>
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Detector de Rutas - Mercado Pago</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            min-height: 100vh;
            padding: 20px;
        }
        .container {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
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
        .info-box {
            background: #f8f9fa;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 20px;
            border-left: 4px solid #00AAC7;
        }
        .info-box h3 {
            color: #333;
            margin-bottom: 15px;
            font-size: 16px;
        }
        .code-block {
            background: #282c34;
            color: #abb2bf;
            padding: 15px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 13px;
            overflow-x: auto;
            margin: 10px 0;
            white-space: pre-wrap;
            word-break: break-all;
        }
        .success {
            background: #d4edda;
            border-left-color: #28a745;
        }
        .warning {
            background: #fff3cd;
            border-left-color: #ffc107;
        }
        .error {
            background: #f8d7da;
            border-left-color: #dc3545;
        }
        .step {
            background: white;
            border: 2px solid #e9ecef;
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 15px;
        }
        .step h3 {
            color: #00AAC7;
            margin-bottom: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin: 15px 0;
        }
        table td {
            padding: 10px;
            border-bottom: 1px solid #dee2e6;
        }
        table td:first-child {
            font-weight: bold;
            color: #666;
            width: 200px;
        }
        .exists {
            color: #28a745;
            font-weight: bold;
        }
        .not-exists {
            color: #dc3545;
            font-weight: bold;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>🔍 Detector de Rutas del Servidor</h1>
        <p class="subtitle">Esta herramienta detecta las rutas correctas para tu configuración de Mercado Pago</p>
        
        <?php
        // Información del sistema
        $currentDir = __DIR__;
        $documentRoot = $_SERVER['DOCUMENT_ROOT'] ?? 'No disponible';
        $scriptFilename = $_SERVER['SCRIPT_FILENAME'] ?? 'No disponible';
        
        // Rutas posibles para mercadopago-config.php
        $possiblePaths = [
            'Mismo directorio' => $currentDir . '/mercadopago-config.php',
            'Private relativo 1' => $currentDir . '/../../private/config/mercadopago-config.php',
            'Private relativo 2' => $currentDir . '/../../../private/config/mercadopago-config.php',
            'Private absoluto 1' => '/home/inedito/private/config/mercadopago-config.php',
            'Private desde DOCUMENT_ROOT' => $documentRoot . '/../private/config/mercadopago-config.php',
        ];
        
        // Detectar cuál ruta existe
        $foundPath = null;
        $pathResults = [];
        
        foreach ($possiblePaths as $label => $path) {
            $exists = file_exists($path);
            $pathResults[$label] = [
                'path' => $path,
                'exists' => $exists
            ];
            
            if ($exists && !$foundPath) {
                $foundPath = $path;
            }
        }
        ?>
        
        <div class="info-box">
            <h3>📂 Información del Servidor</h3>
            <table>
                <tr>
                    <td>Directorio actual (__DIR__):</td>
                    <td><code><?php echo htmlspecialchars($currentDir); ?></code></td>
                </tr>
                <tr>
                    <td>DOCUMENT_ROOT:</td>
                    <td><code><?php echo htmlspecialchars($documentRoot); ?></code></td>
                </tr>
                <tr>
                    <td>Script actual:</td>
                    <td><code><?php echo htmlspecialchars($scriptFilename); ?></code></td>
                </tr>
            </table>
        </div>
        
        <div class="info-box">
            <h3>🔍 Rutas Posibles para mercadopago-config.php</h3>
            <table>
                <?php foreach ($pathResults as $label => $result): ?>
                <tr>
                    <td><?php echo htmlspecialchars($label); ?>:</td>
                    <td>
                        <code><?php echo htmlspecialchars($result['path']); ?></code>
                        <?php if ($result['exists']): ?>
                            <span class="exists">✅ EXISTE</span>
                        <?php else: ?>
                            <span class="not-exists">❌ NO EXISTE</span>
                        <?php endif; ?>
                    </td>
                </tr>
                <?php endforeach; ?>
            </table>
        </div>
        
        <?php if ($foundPath): ?>
            <div class="info-box success">
                <h3>✅ ¡Archivo Encontrado!</h3>
                <p>El archivo <code>mercadopago-config.php</code> fue encontrado en:</p>
                <div class="code-block"><?php echo htmlspecialchars($foundPath); ?></div>
            </div>
            
            <div class="step">
                <h3>📝 SOLUCIÓN: Actualiza create-preference.php</h3>
                <p>Abre el archivo <code>create-preference.php</code> en cPanel y busca la sección de "CARGAR CONFIGURACIÓN".</p>
                <p style="margin-top: 10px;">Cambia esta línea:</p>
                <div class="code-block">$configPath = __DIR__ . '/mercadopago-config.php';</div>
                <p>Por esta (usando la ruta encontrada):</p>
                <div class="code-block">$configPath = '<?php echo $foundPath; ?>';</div>
                
                <p style="margin-top: 20px;"><strong>O más simple, usa esta ruta absoluta:</strong></p>
                <div class="code-block">$configPath = '/home/inedito/private/config/mercadopago-config.php';</div>
            </div>
            
        <?php else: ?>
            <div class="info-box error">
                <h3>❌ Archivo No Encontrado</h3>
                <p>El archivo <code>mercadopago-config.php</code> no se encuentra en ninguna de las rutas verificadas.</p>
            </div>
            
            <div class="step">
                <h3>📝 SOLUCIÓN: Sube el archivo</h3>
                <p><strong>Opción 1 (Recomendada - Más segura):</strong></p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Ve a cPanel → File Manager</li>
                    <li>Navega a: <code>/home/inedito/</code></li>
                    <li>Crea la carpeta <code>private</code> si no existe</li>
                    <li>Dentro de <code>private</code>, crea la carpeta <code>config</code></li>
                    <li>Sube <code>mercadopago-config.php</code> ahí</li>
                    <li>La ruta final debe ser: <code>/home/inedito/private/config/mercadopago-config.php</code></li>
                </ol>
                
                <p style="margin-top: 20px;"><strong>Opción 2 (Más simple - Menos segura):</strong></p>
                <ol style="margin-left: 20px; margin-top: 10px;">
                    <li>Sube <code>mercadopago-config.php</code> al mismo directorio que <code>create-preference.php</code></li>
                    <li>Ubicación: <code><?php echo htmlspecialchars($currentDir); ?>/mercadopago-config.php</code></li>
                </ol>
            </div>
        <?php endif; ?>
        
        <div class="info-box warning">
            <h3>⚠️ Después de Usar Esta Herramienta</h3>
            <p><strong>IMPORTANTE: BORRA este archivo (detectar-ruta.php) por seguridad.</strong></p>
            <ol style="margin-left: 20px; margin-top: 10px;">
                <li>Ve a cPanel → File Manager</li>
                <li>Navega a: <code><?php echo htmlspecialchars($currentDir); ?></code></li>
                <li>Elimina: <code>detectar-ruta.php</code></li>
            </ol>
        </div>
        
        <div class="step">
            <h3>🔄 Próximos Pasos</h3>
            <ol style="margin-left: 20px;">
                <li>✅ Anota la ruta correcta encontrada arriba</li>
                <li>✅ Actualiza <code>create-preference.php</code> con esa ruta</li>
                <li>✅ Borra este archivo (<code>detectar-ruta.php</code>)</li>
                <li>✅ Prueba el pago de nuevo en tu sitio</li>
            </ol>
        </div>
        
    </div>
</body>
</html>
