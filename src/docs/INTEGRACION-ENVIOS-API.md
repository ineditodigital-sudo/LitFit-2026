# 🚚 Integración Completa - API de Envíos (enviosinternacionales.com)

## 📋 Descripción General

Este documento describe la integración completa del sistema de envíos para LITFIT usando la API de **enviosinternacionales.com**. La implementación sigue el mismo patrón de seguridad que Mercado Pago: las credenciales están en el **backend PHP (cPanel)** y el **frontend (Figma Make)** solo hace llamadas HTTP seguras.

---

## 🔐 Credenciales (NUNCA exponerlas en frontend)

```
API Key: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0
API Secret Key: Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog
```

**⚠️ IMPORTANTE:** Estas credenciales deben estar SOLO en el backend PHP, nunca en el código frontend.

---

## 🏗️ Arquitectura del Sistema

```
Frontend (litfit.inedito.digital - Figma Make)
    ↓ HTTPS
Backend PHP (inedito.digital/api/envios/ - cPanel)
    ↓ HTTPS + API Keys
enviosinternacionales.com API
```

---

## 📁 Estructura de Archivos en cPanel

Crear los siguientes archivos en tu servidor cPanel:

```
/public_html/api/envios/
├── cotizar.php          # Endpoint: Cotización de envío
├── crear-guia.php       # Endpoint: Crear guía después del pago
└── rastrear.php         # Endpoint: Rastrear estado del envío
```

---

## 📄 Archivo 1: `/api/envios/cotizar.php`

**Propósito:** Obtener cotizaciones de envío en tiempo real según el destino

```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// 🔐 CREDENCIALES (NUNCA exponerlas en frontend)
define('ENVIOS_API_KEY', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_API_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');

// Base URL de la API
define('ENVIOS_API_URL', 'https://api.enviosinternacionales.com/v1');

// Leer datos del frontend
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['destination']) || !isset($input['weight'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$destination = $input['destination'];
$weight = floatval($input['weight']);
$dimensions = $input['dimensions'] ?? ['length' => 30, 'width' => 20, 'height' => 10];

// Preparar datos para la API
$apiData = [
    'origin' => [
        'zipCode' => '03100', // Tu código postal (cambiar según tu ubicación)
        'country' => 'MX'
    ],
    'destination' => [
        'zipCode' => $destination['zipCode'],
        'city' => $destination['city'],
        'state' => $destination['state'],
        'country' => $destination['country']
    ],
    'parcel' => [
        'weight' => $weight,
        'length' => $dimensions['length'],
        'width' => $dimensions['width'],
        'height' => $dimensions['height']
    ]
];

// Headers con autenticación
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode(ENVIOS_API_KEY . ':' . ENVIOS_API_SECRET)
];

// Hacer petición a la API
$ch = curl_init(ENVIOS_API_URL . '/quotes');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($apiData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("Error en cotización de envíos: " . $response);
    
    // Enviar opción de respaldo
    echo json_encode([
        'success' => true,
        'options' => [
            [
                'carrier' => 'Estándar',
                'service' => 'Envío Nacional',
                'price' => 150,
                'deliveryDays' => '5-7 días hábiles'
            ]
        ]
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

// Formatear respuesta para el frontend
$shippingOptions = [];
if (isset($apiResponse['quotes']) && is_array($apiResponse['quotes'])) {
    foreach ($apiResponse['quotes'] as $quote) {
        $shippingOptions[] = [
            'carrier' => $quote['carrier'] ?? 'Desconocido',
            'service' => $quote['service_level'] ?? 'Estándar',
            'price' => floatval($quote['total_price'] ?? 150),
            'deliveryDays' => $quote['delivery_time'] ?? '5-7 días hábiles',
            'quoteId' => $quote['id'] ?? null
        ];
    }
}

// Si no hay opciones, usar respaldo
if (empty($shippingOptions)) {
    $shippingOptions[] = [
        'carrier' => 'Estándar',
        'service' => 'Envío Nacional',
        'price' => 150,
        'deliveryDays' => '5-7 días hábiles'
    ];
}

echo json_encode([
    'success' => true,
    'options' => $shippingOptions
]);
?>
```

---

## 📄 Archivo 2: `/api/envios/crear-guia.php`

**Propósito:** Crear guía de envío automáticamente después de un pago exitoso

```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir POST
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// 🔐 CREDENCIALES
define('ENVIOS_API_KEY', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_API_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_URL', 'https://api.enviosinternacionales.com/v1');

// Leer datos del frontend
$input = json_decode(file_get_contents('php://input'), true);

if (!$input || !isset($input['order']) || !isset($input['shipping'])) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Datos incompletos']);
    exit;
}

$order = $input['order'];
$shipping = $input['shipping'];
$formData = $order['formData'];

// Preparar datos para crear la guía
$shipmentData = [
    'origin' => [
        'name' => 'LITFIT',
        'company' => 'LITFIT',
        'phone' => '+52 55 1234 5678', // Tu teléfono
        'email' => 'reenviadorlitfit@inedito.digital',
        'street' => 'Tu dirección', // Cambiar por tu dirección real
        'city' => 'Ciudad de México',
        'state' => 'CDMX',
        'zipCode' => '03100', // Tu código postal
        'country' => 'MX'
    ],
    'destination' => [
        'name' => $formData['firstName'] . ' ' . $formData['lastName'],
        'phone' => $formData['phone'],
        'email' => $formData['email'],
        'street' => $formData['street'],
        'city' => $formData['city'],
        'state' => $formData['state'],
        'zipCode' => $formData['zipCode'],
        'country' => 'MX'
    ],
    'parcel' => [
        'weight' => 1.5, // Peso estimado de productos LITFIT
        'length' => 30,
        'width' => 20,
        'height' => 10
    ],
    'service' => [
        'carrier' => $shipping['carrier'],
        'service_level' => $shipping['service']
    ],
    'reference' => $order['orderId'] ?? 'LITFIT-' . time(),
    'notes' => $formData['notes'] ?? ''
];

// Headers con autenticación
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode(ENVIOS_API_KEY . ':' . ENVIOS_API_SECRET)
];

// Crear la guía en la API
$ch = curl_init(ENVIOS_API_URL . '/shipments');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_POST, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($shipmentData));
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
$curlError = curl_error($ch);
curl_close($ch);

if ($httpCode !== 200 && $httpCode !== 201) {
    error_log("Error creando guía de envío: " . $response . " | cURL Error: " . $curlError);
    
    // Aún así responder con éxito pero sin tracking
    echo json_encode([
        'success' => false,
        'message' => 'No se pudo crear la guía automáticamente',
        'error' => $response
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

// Extraer información de la guía creada
$trackingNumber = $apiResponse['tracking_number'] ?? 'Pendiente';
$labelUrl = $apiResponse['label_url'] ?? null;

// Enviar email con el tracking (integrar con tu sistema de emails)
// Puedes usar EmailJS desde aquí o PHP mail()

echo json_encode([
    'success' => true,
    'trackingNumber' => $trackingNumber,
    'labelUrl' => $labelUrl,
    'carrier' => $shipping['carrier'],
    'message' => 'Guía creada exitosamente'
]);
?>
```

---

## 📄 Archivo 3: `/api/envios/rastrear.php`

**Propósito:** Consultar el estado de un envío por número de guía

```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

// Manejar preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

// Solo permitir GET
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    exit;
}

// 🔐 CREDENCIALES
define('ENVIOS_API_KEY', 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0');
define('ENVIOS_API_SECRET', 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog');
define('ENVIOS_API_URL', 'https://api.enviosinternacionales.com/v1');

// Obtener número de tracking
$trackingNumber = $_GET['tracking'] ?? '';

if (empty($trackingNumber)) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => 'Número de guía requerido']);
    exit;
}

// Headers con autenticación
$headers = [
    'Content-Type: application/json',
    'Authorization: Basic ' . base64_encode(ENVIOS_API_KEY . ':' . ENVIOS_API_SECRET)
];

// Consultar tracking en la API
$ch = curl_init(ENVIOS_API_URL . '/track/' . urlencode($trackingNumber));
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, $headers);
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, true);

$response = curl_exec($ch);
$httpCode = curl_getinfo($ch, CURLINFO_HTTP_CODE);
curl_close($ch);

if ($httpCode !== 200) {
    error_log("Error en rastreo: " . $response);
    echo json_encode([
        'success' => false,
        'message' => 'No se encontró información para este número de guía'
    ]);
    exit;
}

$apiResponse = json_decode($response, true);

// Formatear eventos de tracking
$events = [];
if (isset($apiResponse['events']) && is_array($apiResponse['events'])) {
    foreach ($apiResponse['events'] as $event) {
        $events[] = [
            'date' => date('d/m/Y', strtotime($event['timestamp'] ?? 'now')),
            'time' => date('H:i', strtotime($event['timestamp'] ?? 'now')),
            'status' => $event['status'] ?? 'Procesando',
            'location' => $event['location'] ?? 'México',
            'description' => $event['description'] ?? ''
        ];
    }
}

// Respuesta formateada
echo json_encode([
    'success' => true,
    'tracking' => [
        'trackingNumber' => $trackingNumber,
        'carrier' => $apiResponse['carrier'] ?? 'Desconocido',
        'status' => $apiResponse['status'] ?? 'En proceso',
        'estimatedDelivery' => $apiResponse['estimated_delivery'] ?? 'Por confirmar',
        'origin' => $apiResponse['origin_city'] ?? 'México',
        'destination' => $apiResponse['destination_city'] ?? 'Destino',
        'events' => $events
    ]
]);
?>
```

---

## 🔄 Flujo Completo de Integración

### 1️⃣ **Cotización (al llenar dirección)**
```
Usuario llena dirección en checkout
    ↓
Frontend llama: POST /api/envios/cotizar.php
    ↓
Backend consulta API de envíos
    ↓
Retorna opciones de paquetería
    ↓
Usuario selecciona opción y continúa al pago
```

### 2️⃣ **Pago y Generación de Guía**
```
Usuario paga con PayPal/Mercado Pago
    ↓
Pago exitoso → Frontend llama: POST /api/envios/crear-guia.php
    ↓
Backend crea guía en la API
    ↓
Retorna número de tracking
    ↓
Se envía email con tracking al cliente
```

### 3️⃣ **Rastreo de Pedido**
```
Cliente visita: litfit.inedito.digital/rastreo
    ↓
Ingresa número de guía
    ↓
Frontend llama: GET /api/envios/rastrear.php?tracking=XXXXX
    ↓
Backend consulta API de envíos
    ↓
Muestra timeline de eventos
```

---

## ✅ Checklist de Implementación

### Backend (cPanel)
- [ ] Crear directorio `/api/envios/`
- [ ] Subir archivo `cotizar.php`
- [ ] Subir archivo `crear-guia.php`
- [ ] Subir archivo `rastrear.php`
- [ ] Verificar que las credenciales estén correctas
- [ ] Cambiar dirección de origen en `crear-guia.php` por tu dirección real
- [ ] Probar endpoints con Postman o similar

### Frontend (Figma Make)
- [x] Componente `ShippingQuote.tsx` creado
- [x] Página `/rastreo` creada
- [x] Checkout actualizado con integración
- [ ] Agregar llamada a `crear-guia.php` después de pagos exitosos

### Emails
- [ ] Actualizar template de EmailJS para incluir número de tracking
- [ ] Configurar envío automático de tracking después de crear guía

---

## 📧 Template de Email con Tracking

Actualiza tu template en EmailJS para incluir:

```
Estimado {{customer_name}},

¡Tu pedido ha sido confirmado!

NÚMERO DE GUÍA: {{tracking_number}}
PAQUETERÍA: {{carrier}}

Puedes rastrear tu pedido aquí:
https://litfit.inedito.digital/rastreo

...resto del email...
```

---

## 🧪 Pruebas

### Probar Cotización
```bash
curl -X POST https://inedito.digital/api/envios/cotizar.php \
  -H "Content-Type: application/json" \
  -d '{
    "destination": {
      "zipCode": "06700",
      "city": "Ciudad de México",
      "state": "CDMX",
      "country": "México"
    },
    "weight": 1.5,
    "dimensions": {"length": 30, "width": 20, "height": 10}
  }'
```

### Probar Rastreo
```bash
curl https://inedito.digital/api/envios/rastrear.php?tracking=1234567890
```

---

## 🛡️ Seguridad

✅ **Implementado correctamente:**
- Credenciales SOLO en backend PHP
- CORS configurado solo para tu dominio
- Validación de métodos HTTP
- Logs de errores sin exponer credenciales

❌ **NUNCA hacer:**
- Poner API Keys en el código frontend
- Permitir CORS desde cualquier origen
- Exponer credenciales en respuestas de error

---

## 📞 Soporte

Si tienes problemas con la integración:
1. Revisar logs de error en cPanel
2. Verificar que las credenciales sean correctas
3. Consultar documentación oficial: https://enviosinternacionales.com/docs/api

---

**Última actualización:** Enero 2026
**Versión:** 1.0
**Autor:** Sistema LITFIT
