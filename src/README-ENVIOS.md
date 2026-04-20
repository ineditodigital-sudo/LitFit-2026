# 🚀 Sistema de Envíos - Instrucciones

## ✅ Archivos Actualizados

He mejorado `cotizar.php` con:
- ✅ Logging detallado en cada paso
- ✅ Mejor manejo de errores HTTP 401
- ✅ Información de debug completa
- ✅ Sin fallbacks, sin mockups (solo API real)

---

## 📋 Qué Hacer Ahora

### Paso 1: Sube el archivo al servidor
```
Archivo: cotizar.php
Ubicación: /public_html/api/envios/cotizar.php
Permisos: 644
```

### Paso 2: Prueba con el HTML
1. Descarga `test-api-simple.html`
2. Abre en tu navegador
3. Click en "🚀 Probar Backend PHP"
4. Lee los resultados

---

## 🔍 Qué Esperar

### ✅ Si funciona:
```
✅ ¡ÉXITO! 3 opciones de envío encontradas
1. FedEx - Económico - $150 - 4-6 días hábiles
2. DHL - Express - $225 - 2-3 días hábiles
3. Estafeta - Terrestre - $112 - 6-9 días hábiles
```

### ❌ Si da error 401:
```
❌ Error: Error de autenticación con la API (401)
🔐 ERROR 401: Problema de autenticación

Posibles causas:
1. Las credenciales API Key/Secret son incorrectas
2. El formato de autenticación no es el correcto
3. La cuenta no tiene permisos activos
```

---

## 📊 Revisa Los Logs

### En cPanel → Metrics → Errors

Busca estos mensajes:

#### Si funciona:
```
=== COTIZAR ENVÍO ===
📍 CP: 06600, Peso: 1.5kg
📤 API URL: https://app.enviosinternacionales.com/api/v1/quotations
📥 HTTP Code: 200
✅ Respuesta JSON válida
✅ Found quotes in: data.quotes
✅ Quote: FedEx - Económico - $150
✅ Total opciones: 3
=== FIN ===
```

#### Si falla:
```
=== COTIZAR ENVÍO ===
📍 CP: 06600, Peso: 1.5kg
📤 API URL: https://app.enviosinternacionales.com/api/v1/quotations
📥 HTTP Code: 401
❌ Error HTTP 401
🔐 Error 401: Problema de autenticación
=== FIN ===
```

---

## 🔐 Credenciales Configuradas

```
API Key: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0
API Secret: Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog
Endpoint: https://app.enviosinternacionales.com/api/v1/quotations
Auth Method: Basic Auth (base64 de API_KEY:API_SECRET)
```

---

## 📞 Si Sigue Sin Funcionar

### Contacta a: soporte@enviosinternacionales.com

Mensaje sugerido:

```
Asunto: Error 401 al usar API de cotizaciones

Hola,

Estoy recibiendo error HTTP 401 al intentar obtener cotizaciones.

Mis credenciales:
- API Key: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0
- API Secret: Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog

Endpoint que uso:
POST https://app.enviosinternacionales.com/api/v1/quotations

Método de autenticación:
Authorization: Basic [base64 de API_KEY:API_SECRET]

Request de ejemplo:
{
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
}

Respuesta que recibo:
HTTP 401 Unauthorized

¿Pueden ayudarme a verificar?:
1. ¿Estas credenciales son correctas y están activas?
2. ¿El endpoint /api/v1/quotations es el correcto?
3. ¿El método de autenticación Basic Auth es correcto?
4. ¿Mi cuenta tiene los permisos necesarios?
5. ¿Podrían darme un ejemplo de cURL que funcione?

Muchas gracias,
[Tu nombre]
```

---

## 🎯 Información Técnica

### Request que enviamos:
```json
POST https://app.enviosinternacionales.com/api/v1/quotations

Headers:
Content-Type: application/json
Accept: application/json
Authorization: Basic [base64 de "API_KEY:API_SECRET"]

Body:
{
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
}
```

### Auth Token Generado:
```
API_KEY + ":" + API_SECRET → base64_encode
= YnJ2THRaSVdKYUpUT1p4RVd4VWxPQTZkWmtzZkxPTURmUzladkVIQkxHMDpMaDVNZG9LeGdjZ24tUGZRaTcxNDFLVHEtU2RraWZnOHRfcGE4N1FtQm9n
```

---

## ✅ Checklist

- [ ] Subir `cotizar.php` al servidor
- [ ] Verificar permisos 644
- [ ] Abrir `test-api-simple.html` en navegador
- [ ] Probar con código postal 06600
- [ ] Revisar resultado en el HTML
- [ ] Revisar logs en cPanel → Metrics → Errors
- [ ] Si error 401 → Contactar a enviosinternacionales.com
- [ ] Compartir los logs del servidor con soporte

---

## 💡 Necesitas Algo Más?

Dime qué información adicional necesitas:
- ¿Documentación de la API?
- ¿Acceso a tu cuenta de enviosinternacionales.com?
- ¿Verificar que la cuenta esté activa?
- ¿Revisar qué plan tienes contratado?

Estoy aquí para ayudarte! 🚀
