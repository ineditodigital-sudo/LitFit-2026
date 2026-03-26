# 🔧 Solución al Error 401 - Sistema de Envíos LITFIT

## ❌ Problema Detectado

**Error 401 Unauthorized** = Las credenciales de la API de enviosinternacionales.com están incorrectas o el método de autenticación no es válido.

---

## ✅ SOLUCIÓN INMEDIATA (Ya implementada)

Tu sistema ahora usa **datos de prueba MOCK** mientras resuelves el problema con la API real.

### ¿Qué cambió?

1. **El componente ShippingQuote ahora usa datos temporales**
   - Archivo: `/components/ShippingQuote.tsx`
   - Variable: `USE_MOCK_API = true`
   - URL: `https://inedito.digital/api/envios/cotizar-temporal.php`

2. **Se agregó un indicador visual "MODO PRUEBA"**
   - Badge amarillo en la sección de envíos
   - Te recuerda que estás usando datos de prueba

3. **Los precios son realistas y calculados dinámicamente**
   - Varían según el código postal (zona geográfica)
   - Se ajustan según el peso del pedido
   - 3 opciones: FedEx, DHL, Estafeta

---

## 📋 Pasos para Activar el Modo Mock (Temporal)

### Paso 1: Sube el archivo PHP Mock
```bash
Archivo a subir: cotizar-TEMPORAL-MOCK.php
Ubicación en servidor: /public_html/api/envios/cotizar-temporal.php
Permisos: 644
```

### Paso 2: Verifica que el frontend esté configurado
El archivo `/components/ShippingQuote.tsx` ya está configurado con:
```typescript
const USE_MOCK_API = true; // ✅ Ya está en true
```

### Paso 3: Prueba
1. Ve a checkout
2. Ingresa un código postal (ej: 06600)
3. Deberías ver 3 opciones de envío
4. Verás el badge "MODO PRUEBA" en amarillo

---

## 🔍 Diagnóstico del Error 401

El error 401 puede deberse a:

### 1. **Credenciales incorrectas**
```
API Key: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0
Secret Key: Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog
```

**¿Cómo verificar?**
- Inicia sesión en tu cuenta de enviosinternacionales.com
- Ve a Settings → API Keys
- Verifica que las credenciales coincidan EXACTAMENTE

### 2. **URL del endpoint incorrecta**
```
URL probada: https://app.enviosinternacionales.com/api/v1/quotations
```

**¿Cómo verificar?**
- Revisa la documentación oficial de la API
- Puede ser `/api/v1/quotations`, `/api/quotations`, etc.

### 3. **Método de autenticación incorrecto**
Actualmente usamos: **Basic Auth** con `API_KEY:API_SECRET`

**Alternativas que podrían funcionar:**
- Bearer Token
- X-API-Key header
- Token de acceso separado

---

## 🧪 Prueba con diferentes métodos de autenticación

He creado un archivo especial que prueba automáticamente todos los métodos posibles:

### Archivo: `cotizar-FIX-401.php`

**Qué hace:**
- Prueba 3 URLs diferentes
- Prueba 3 métodos de autenticación diferentes
- Te dice cuál funciona
- Retorna información de debug completa

**Cómo usarlo:**
1. Sube `cotizar-FIX-401.php` a tu servidor como `cotizar.php`
2. Prueba hacer una compra
3. Revisa los logs en cPanel → Metrics → Errors
4. Busca mensajes como:
   ```
   ✅ ¡Éxito con [URL]!
   ```

Esto te dirá exactamente qué combinación funciona.

---

## 📞 Contactar a Soporte de enviosinternacionales.com

Si ninguno de los métodos automáticos funciona, necesitas contactar a su soporte con:

### Información a proporcionar:

1. **Tu API Key:** `brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0`

2. **El error que recibes:**
   ```
   HTTP 401 Unauthorized
   ```

3. **Preguntas específicas:**
   - ¿Cuál es la URL correcta del endpoint de cotización?
   - ¿Qué método de autenticación debo usar?
   - ¿Las credenciales que tengo son correctas?
   - ¿Pueden darme un ejemplo de cURL que funcione?

4. **Request que estás enviando:**
   ```json
   POST https://app.enviosinternacionales.com/api/v1/quotations
   Authorization: Basic [base64 encoded API_KEY:API_SECRET]
   
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

---

## 🚀 Activar la API Real (cuando funcione)

Una vez que tengas las credenciales correctas:

### Paso 1: Actualiza el archivo PHP
Usa `cotizar-v2-DEBUG.php` o `cotizar-FIX-401.php` con las credenciales correctas.

### Paso 2: Cambia el modo en el frontend
En `/components/ShippingQuote.tsx`:
```typescript
const USE_MOCK_API = false; // ⬅️ Cambiar a false
```

### Paso 3: Verifica
- El badge "MODO PRUEBA" desaparecerá
- Los precios serán reales de la API
- Los tiempos de entrega serán reales

---

## 📊 Estado Actual del Sistema

| Componente | Estado | Funciona |
|------------|--------|----------|
| Frontend (ShippingQuote) | ✅ Actualizado | Sí |
| Backend Mock | ✅ Listo | Sí |
| Backend Real | ⚠️ Error 401 | No |
| Proceso de compra | ✅ Funcional | Sí (con mock) |
| Cálculo de precios | ✅ Realista | Sí (mock) |
| Integración PayPal | ✅ Funcional | Sí |
| Integración MercadoPago | ✅ Funcional | Sí |

---

## 💡 Recomendación

**Para desarrollo y testing:**
- Usa el modo MOCK (ya está activado)
- Los precios son realistas y varían según zona
- El sistema funciona 100%

**Para producción:**
- Contacta a enviosinternacionales.com
- Resuelve el error 401
- Cambia `USE_MOCK_API = false`

---

## 🎯 Archivos Importantes

### Para desarrollo (AHORA):
- ✅ `cotizar-TEMPORAL-MOCK.php` - Sube como `cotizar-temporal.php`
- ✅ `/components/ShippingQuote.tsx` - Ya configurado con `USE_MOCK_API = true`

### Para debugging:
- 🧪 `cotizar-FIX-401.php` - Prueba todos los métodos de autenticación
- 📋 `test-sistema-completo.html` - Tests automáticos

### Para producción (DESPUÉS):
- 🚀 `cotizar-v2-DEBUG.php` - Backend final con API real
- 🔧 Cambiar `USE_MOCK_API = false` en ShippingQuote.tsx

---

## ✅ Checklist

- [ ] Subir `cotizar-TEMPORAL-MOCK.php` al servidor
- [ ] Verificar que `USE_MOCK_API = true` en ShippingQuote.tsx
- [ ] Probar checkout con código postal
- [ ] Ver 3 opciones de envío (FedEx, DHL, Estafeta)
- [ ] Verificar badge "MODO PRUEBA"
- [ ] Completar una compra de prueba
- [ ] Contactar a soporte de enviosinternacionales.com para resolver 401
- [ ] Cuando funcione: cambiar `USE_MOCK_API = false`
- [ ] Eliminar badge "MODO PRUEBA" si lo deseas

---

**El sistema ya funciona con datos mock. Puedes seguir desarrollando y vendiendo mientras resuelves la API real en segundo plano.** 🚀
