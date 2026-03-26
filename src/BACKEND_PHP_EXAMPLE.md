# Backend PHP para Cotización de Envíos

## Ubicación del archivo
Sube este archivo a: `https://inedito.digital/api/envios/cotizar.php`

## Código PHP (cotizar.php)

```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Log para debugging
error_log('📦 Solicitud recibida en cotizar.php');

// Obtener datos del request
$input = file_get_contents('php://input');
error_log('📤 Input recibido: ' . $input);

$data = json_decode($input, true);

if (!$data) {
    error_log('❌ Error: No se pudo decodificar JSON');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Datos inválidos'
    ]);
    exit;
}

// Validar datos requeridos
if (!isset($data['destination']['zipCode'])) {
    error_log('❌ Error: Código postal no proporcionado');
    http_response_code(400);
    echo json_encode([
        'success' => false,
        'error' => 'Código postal requerido'
    ]);
    exit;
}

// Credenciales de la API de enviosinternacionales.com
$API_KEY = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
$SECRET_KEY = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';
$API_URL = 'https://api.enviosinternacionales.com/v1/quote'; // Ajusta según la documentación real

error_log('🚀 Llamando a API de envíos...');

// Preparar request para la API externa
$apiRequest = [
    'origin' => [
        'zipCode' => '01000', // Tu código postal de origen
        'country' => 'MX'
    ],
    'destination' => [
        'zipCode' => $data['destination']['zipCode'],
        'city' => $data['destination']['city'] ?? '',
        'state' => $data['destination']['state'] ?? '',
        'country' => $data['destination']['country'] ?? 'México'
    ],
    'package' => [
        'weight' => $data['weight'] ?? 1.5,
        'length' => $data['dimensions']['length'] ?? 30,
        'width' => $data['dimensions']['width'] ?? 20,
        'height' => $data['dimensions']['height'] ?? 10
    ]
];

// Hacer request a la API de envíos
$ch = curl_init($API_URL);
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiRequest));
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'Content-Type: application/json',
    'X-API-Key: ' . $API_KEY,
    'X-Secret-Key: ' . $SECRET_KEY
]);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

error_log('📥 Respuesta de API externa (HTTP ' . $httpCode . '): ' . $response);

if ($httpCode !== 200) {
    error_log('❌ Error en API externa: HTTP ' . $httpCode);
    
    // Retornar error pero con estructura válida
    http_response_code(200); // Importante: retornar 200 para que el frontend procese el error
    echo json_encode([
        'success' => false,
        'error' => 'No se pudieron obtener cotizaciones de envío',
        'options' => []
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

if (!$apiResponse || !isset($apiResponse['rates'])) {
    error_log('⚠️ API respondió pero sin rates');
    
    http_response_code(200);
    echo json_encode([
        'success' => false,
        'error' => 'No hay opciones de envío disponibles',
        'options' => []
    ]);
    exit;
}

// Transformar respuesta de la API al formato esperado por el frontend
$options = [];
foreach ($apiResponse['rates'] as $rate) {
    $options[] = [
        'carrier' => $rate['carrier_name'] ?? 'Transportista',
        'service' => $rate['service_name'] ?? 'Servicio estándar',
        'price' => floatval($rate['total_price'] ?? 0),
        'deliveryDays' => $rate['delivery_days'] ?? '5-7 días hábiles'
    ];
}

error_log('✅ Opciones procesadas: ' . count($options));

// Retornar opciones al frontend
http_response_code(200);
echo json_encode([
    'success' => true,
    'options' => $options
]);
?>
```

## Instrucciones de Instalación

1. **Crear la estructura de directorios en cPanel:**
   ```
   public_html/
   └── api/
       └── envios/
           └── cotizar.php
   ```

2. **Permisos del archivo:**
   - Asignar permisos 644 al archivo PHP
   - Asegurar que el directorio tenga permisos 755

3. **Probar el endpoint:**
   ```bash
   curl -X POST https://inedito.digital/api/envios/cotizar.php \
     -H "Content-Type: application/json" \
     -d '{
       "destination": {
         "zipCode": "06600",
         "city": "CDMX",
         "state": "Ciudad de México",
         "country": "México"
       },
       "weight": 1.5,
       "dimensions": {
         "length": 30,
         "width": 20,
         "height": 10
       }
     }'
   ```

4. **Revisar logs de PHP:**
   - En cPanel → Metrics → Errors
   - O revisar el archivo `error_log` en el mismo directorio

## Documentación de la API de Envíos

**IMPORTANTE:** Debes ajustar el código según la documentación oficial de enviosinternacionales.com

Variables a confirmar:
- ✅ URL del endpoint de cotización
- ✅ Formato de autenticación (API Key, Bearer token, etc.)
- ✅ Estructura del request
- ✅ Estructura del response
- ✅ Campos requeridos

## Solución Temporal para Testing

Si necesitas probar el frontend AHORA mientras configuras el backend, puedes crear un PHP simple que retorne datos de prueba:

```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// SOLO PARA TESTING - Retornar opciones de prueba
echo json_encode([
    'success' => true,
    'options' => [
        [
            'carrier' => 'FedEx',
            'service' => 'Económico',
            'price' => 180,
            'deliveryDays' => '5-7 días hábiles'
        ],
        [
            'carrier' => 'DHL',
            'service' => 'Express',
            'price' => 250,
            'deliveryDays' => '2-3 días hábiles'
        ]
    ]
]);
?>
```

## Checklist de Debugging

- [ ] El archivo PHP existe en la ruta correcta
- [ ] Los headers CORS están configurados
- [ ] Las credenciales de API son correctas
- [ ] La URL de la API externa es correcta
- [ ] El servidor tiene cURL habilitado
- [ ] Los logs de PHP muestran las solicitudes
- [ ] El endpoint responde a requests curl desde terminal
