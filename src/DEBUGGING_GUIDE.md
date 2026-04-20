# 🔧 Guía de Debugging - Sistema de Envíos LITFIT

## Problema Actual
El sistema no puede conectarse con la API de enviosinternacionales.com

---

## ✅ PASO 1: Reemplazar el archivo PHP

**Archivo:** `BACKEND_PHP_CORRECTED.php`  
**Ubicación en servidor:** `https://inedito.digital/api/envios/cotizar.php`

### Cambios principales vs. tu versión:
1. ✅ **Logging completo** - Cada paso registra información
2. ✅ **Manejo de errores de CURL** - Detecta problemas de conexión
3. ✅ **URL corregida** - Ya no duplica `/quotes`
4. ✅ **Múltiples formatos de respuesta** - Maneja diferentes estructuras de la API
5. ✅ **Headers mejorados** - Incluye `Accept: application/json`
6. ✅ **Timeout** - Evita que se quede colgado

---

## ✅ PASO 2: Verificar que el archivo esté accesible

### Test 1: Archivo existe
Abre en el navegador:
```
https://inedito.digital/api/envios/cotizar.php
```

**Resultado esperado:**
```json
{"success":false,"message":"Método no permitido"}
```

Si ves esto, el archivo está bien ubicado. Si da error 404, el archivo no está en la ruta correcta.

---

### Test 2: Test con CURL desde terminal

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

**Resultado esperado (éxito):**
```json
{
  "success": true,
  "options": [
    {
      "carrier": "FedEx",
      "service": "Económico",
      "price": 180,
      "deliveryDays": "5-7 días hábiles"
    }
  ]
}
```

**Resultado esperado (error):**
```json
{
  "success": false,
  "message": "...",
  "debug": {...}
}
```

---

## ✅ PASO 3: Revisar los LOGS del servidor

### En cPanel:
1. Ve a **Metrics → Errors**
2. O busca el archivo `error_log` en `/public_html/api/envios/`

### Logs a buscar:

```
====== Nueva solicitud a cotizar.php ======
📥 Input recibido: {...}
📍 Destino: CP=06600
⚖️ Peso: 1.5 kg
📤 Datos enviados a API: {...}
🔐 Auth header generado...
🚀 Llamando a: https://app.enviosinternacionales.com/api/v1/quotations
📥 HTTP Code: 200
📥 Respuesta API: {...}
✅ Opciones formateadas: 2
✅ Respuesta enviada al frontend: 2 opciones
```

### Si hay errores, busca:
- `❌ CURL Error:` - Problema de conexión
- `❌ Error HTTP 401:` - Credenciales incorrectas
- `❌ Error HTTP 404:` - URL incorrecta
- `⚠️ Estructura de respuesta no reconocida` - Formato de respuesta diferente

---

## ✅ PASO 4: Verificar credenciales de la API

### Probar manualmente con Postman o cURL:

```bash
curl -X POST https://app.enviosinternacionales.com/api/v1/quotations \
  -H "Content-Type: application/json" \
  -H "Authorization: Basic $(echo -n 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0:Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog' | base64)" \
  -d '{
    "origin": {
      "zipCode": "64000",
      "country": "MX"
    },
    "destination": {
      "zipCode": "06600",
      "city": "CDMX",
      "state": "Ciudad de México",
      "country": "MX"
    },
    "parcel": {
      "weight": 1.5,
      "length": 30,
      "width": 20,
      "height": 10
    }
  }'
```

**Posibles respuestas:**

### ✅ Éxito (HTTP 200):
```json
{
  "quotes": [...]
}
```

### ❌ Error 401 (Credenciales incorrectas):
```json
{
  "error": "Unauthorized"
}
```

### ❌ Error 400 (Datos incorrectos):
```json
{
  "error": "Invalid data",
  "details": {...}
}
```

---

## ✅ PASO 5: Verificar documentación oficial

**IMPORTANTE:** La API de enviosinternacionales.com podría usar un formato diferente.

### Cosas a verificar en la documentación:

1. **URL del endpoint:**
   - ¿Es `https://app.enviosinternacionales.com/api/v1/quotations`?
   - ¿O es `/quotes`, `/rate`, `/shipment/quote`?

2. **Método de autenticación:**
   - ¿Basic Auth con API Key:Secret?
   - ¿Bearer Token?
   - ¿API Key en headers (`X-API-Key`)?

3. **Formato del request:**
   - ¿Campo `parcel` o `package`?
   - ¿Campo `zipCode` o `postal_code` o `zip`?
   - ¿Campo `country` o `country_code`?

4. **Formato de la respuesta:**
   - ¿Campo `quotes`, `rates`, `options`?
   - ¿Está dentro de `data`?

---

## ✅ PASO 6: Solución temporal para desarrollo

Si necesitas seguir desarrollando mientras resuelves la API, crea un archivo temporal:

### `cotizar-temporal.php`:
```php
<?php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    exit;
}

// SOLO PARA TESTING - Retornar datos de prueba
sleep(1); // Simular latencia de red

echo json_encode([
    'success' => true,
    'options' => [
        [
            'carrier' => 'FedEx',
            'service' => 'Económico',
            'price' => 180,
            'deliveryDays' => '5-7 días hábiles',
            'quoteId' => 'test-123'
        ],
        [
            'carrier' => 'DHL',
            'service' => 'Express',
            'price' => 250,
            'deliveryDays' => '2-3 días hábiles',
            'quoteId' => 'test-456'
        ],
        [
            'carrier' => 'Estafeta',
            'service' => 'Terrestre',
            'price' => 150,
            'deliveryDays' => '7-10 días hábiles',
            'quoteId' => 'test-789'
        ]
    ]
]);
?>
```

Luego actualiza el frontend temporalmente:
```typescript
const ENVIOS_BACKEND_URL = "https://inedito.digital/api/envios/cotizar-temporal.php";
```

---

## 🔍 Checklist de Debugging

- [ ] Archivo PHP subido a la ruta correcta
- [ ] Archivo retorna JSON cuando se accede directamente
- [ ] Headers CORS configurados correctamente
- [ ] Test con CURL desde terminal funciona
- [ ] Logs del servidor muestran las solicitudes
- [ ] Credenciales de API verificadas
- [ ] URL de la API verificada en documentación oficial
- [ ] Formato del request coincide con la documentación
- [ ] El servidor tiene cURL habilitado (verifica con `php -m | grep curl`)

---

## 🆘 Errores Comunes y Soluciones

### Error: "Failed to fetch"
**Causa:** El navegador no puede conectarse al servidor PHP
**Solución:**
- Verifica que la URL sea correcta
- Verifica headers CORS
- Verifica que el archivo exista

### Error: "CURL Error: SSL certificate problem"
**Causa:** Problema con certificados SSL
**Solución:**
```php
curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false); // Solo para testing
```

### Error: "Error HTTP 401"
**Causa:** Credenciales incorrectas
**Solución:**
- Verifica API Key y Secret
- Verifica método de autenticación (Basic, Bearer, etc.)
- Revisa la documentación oficial

### Error: "No se encontraron cotizaciones"
**Causa:** La API respondió pero sin datos
**Solución:**
- Revisa el formato de la respuesta en los logs
- Ajusta el código para parsear la estructura correcta
- Verifica que el código postal sea válido

---

## 📞 Contacto con Soporte de enviosinternacionales.com

Si nada funciona, contacta a su soporte con:

1. Tu API Key
2. El error específico que recibes
3. El request que estás enviando
4. La respuesta que recibes

Pregunta específicamente:
- ¿Cuál es la URL correcta del endpoint de cotización?
- ¿Qué método de autenticación debo usar?
- ¿Cuál es el formato exacto del request?
- ¿Pueden darme un ejemplo de cURL funcionando?
