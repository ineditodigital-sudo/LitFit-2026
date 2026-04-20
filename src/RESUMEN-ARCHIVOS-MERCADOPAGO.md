# 📦 RESUMEN: Archivos para Mercado Pago

## 🎯 OBJETIVO

Configurar Mercado Pago con tus credenciales de prueba para que el sistema de pagos funcione correctamente en **https://litfit.inedito.digital**

---

## 📁 ARCHIVOS GENERADOS

He creado **4 archivos PHP/HTML** que necesitas subir a tu servidor cPanel:

### 1️⃣ `mercadopago-config.php` ⭐ **IMPORTANTE**
- **Descripción:** Archivo de configuración con tus credenciales
- **Ubicación en cPanel:** `/home/inedito/private/config/mercadopago-config.php`
- **Seguridad:** ⚠️ NO subir a `public_html` - mantener en carpeta privada
- **Contenido:**
  - Public Key de prueba: `TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5`
  - Access Token de prueba: `TEST-2656381259343864-040222-...`
  - URLs de retorno (success, failure, pending)

### 2️⃣ `create-preference.php` ⭐ **IMPORTANTE**
- **Descripción:** API que crea preferencias de pago en Mercado Pago
- **Ubicación en cPanel:** `/home/inedito/public_html/cdn/mercadopago/create-preference.php`
- **URL de acceso:** `https://cdn.inedito.digital/mercadopago/create-preference.php`
- **Función:**
  - Recibe datos del pedido desde el frontend
  - Crea una preferencia de pago en Mercado Pago
  - Devuelve la URL de checkout

### 3️⃣ `webhook.php` (Opcional pero recomendado)
- **Descripción:** Recibe notificaciones IPN de Mercado Pago
- **Ubicación en cPanel:** `/home/inedito/public_html/cdn/mercadopago/webhook.php`
- **URL de acceso:** `https://cdn.inedito.digital/mercadopago/webhook.php`
- **Función:**
  - Recibe notificaciones cuando cambia el estado de un pago
  - Registra eventos en logs (`payments.log` y `orders.log`)
  - Permite procesar pagos asincrónicos

### 4️⃣ `test-mercadopago-connection.html` (Solo para pruebas)
- **Descripción:** Página HTML para probar la conexión
- **Ubicación:** Abrir directamente en tu navegador (no subir a cPanel necesariamente)
- **Función:**
  - Prueba la conexión con el backend PHP
  - Verifica que las credenciales funcionan
  - Muestra errores en caso de problemas

---

## 📋 LISTA DE VERIFICACIÓN

### ✅ ANTES DE EMPEZAR

- [ ] Tienes acceso a cPanel de `inedito.digital`
- [ ] Conoces la ruta `/home/inedito/` en tu servidor
- [ ] Descargaste los 4 archivos de este proyecto

---

## 🚀 PASOS RÁPIDOS (Resumen)

### PASO 1: Crear estructura de carpetas en cPanel

```
/home/inedito/
├── private/
│   └── config/                    ← Crear esta carpeta
│       └── mercadopago-config.php ← Subir archivo 1
│
└── public_html/
    └── cdn/
        └── mercadopago/            ← Crear esta carpeta
            ├── create-preference.php ← Subir archivo 2
            └── webhook.php          ← Subir archivo 3
```

---

### PASO 2: Subir archivos

| Archivo | Ruta en cPanel | Permisos |
|---------|----------------|----------|
| `mercadopago-config.php` | `/home/inedito/private/config/` | 644 |
| `create-preference.php` | `/home/inedito/public_html/cdn/mercadopago/` | 644 |
| `webhook.php` | `/home/inedito/public_html/cdn/mercadopago/` | 644 |

---

### PASO 3: Verificar que funciona

1. Abre `test-mercadopago-connection.html` en tu navegador
2. Haz clic en **"Probar Conexión con Backend"**
3. Deberías ver: ✅ **"¡Conexión exitosa!"**

---

### PASO 4: Hacer compra de prueba

1. Ve a: **https://litfit.inedito.digital**
2. Agrega productos al carrito
3. Completa el checkout
4. Selecciona **"Mercado Pago"**
5. Usa la tarjeta de prueba:
   ```
   Número: 5031 7557 3453 0604
   Nombre: APRO
   Fecha: 11/25
   CVV: 123
   DNI: 12345678
   ```
6. Completa el pago
7. Deberías ser redirigido a la página de éxito ✅

---

## 🔍 VERIFICACIÓN DE URLs

Después de subir los archivos, estas URLs deberían funcionar:

### URL 1: API de creación de preferencias
```
https://cdn.inedito.digital/mercadopago/create-preference.php
```
**Resultado esperado:** JSON con error de método (normal, significa que está accesible)

### URL 2: Webhook
```
https://cdn.inedito.digital/mercadopago/webhook.php
```
**Resultado esperado:** JSON con status (normal si está funcionando)

---

## 🎯 FLUJO COMPLETO DEL PROCESO

```
1. Usuario en el frontend
   ↓
2. Llena formulario de checkout
   ↓
3. Click en "Pagar con Mercado Pago"
   ↓
4. Frontend envía datos a:
   https://cdn.inedito.digital/mercadopago/create-preference.php
   ↓
5. Backend PHP:
   - Lee credenciales de mercadopago-config.php
   - Crea preferencia en Mercado Pago
   - Devuelve URL de checkout
   ↓
6. Usuario es redirigido a Mercado Pago
   ↓
7. Usuario paga con tarjeta de prueba
   ↓
8. Mercado Pago redirige a:
   https://litfit.inedito.digital/payment-success-mp
   ↓
9. Frontend:
   - Recupera datos del localStorage
   - Envía email de confirmación
   - Limpia carrito
   - Muestra pantalla de éxito
   ↓
10. (Opcional) Webhook recibe notificación IPN
    - Registra el pago en logs
    - Puede ejecutar acciones adicionales
```

---

## 📞 SOPORTE Y DEBUGGING

### Si algo no funciona:

1. **Verifica los logs en cPanel**
   - Ve a: cPanel → Errors → Error Log
   - Busca mensajes que contengan `mercadopago` o `create-preference`

2. **Prueba manualmente con curl**
   ```bash
   curl -X POST https://cdn.inedito.digital/mercadopago/create-preference.php \
     -H "Content-Type: application/json" \
     -d '{"items":[{"name":"Test","price":100,"quantity":1}],"formData":{"firstName":"Test","lastName":"User","email":"test@test.com","phone":"5555555555","street":"Test 123","city":"Monterrey","state":"NL","zipCode":"64000"},"total":100,"shippingCost":0,"totalPrice":100,"orderId":"TEST-123"}'
   ```

3. **Revisa que las rutas sean correctas**
   - El archivo `create-preference.php` busca la configuración en:
     1. `../../private/config/mercadopago-config.php`
     2. `./mercadopago-config.php` (mismo directorio, fallback)

4. **Verifica permisos de archivos**
   - Todos los archivos PHP deben tener permisos `644`
   - Las carpetas deben tener permisos `755`

---

## 🔐 SEGURIDAD

### ⚠️ Importante sobre las credenciales:

1. **NUNCA** expongas el Access Token en el frontend
2. **SIEMPRE** mantén `mercadopago-config.php` fuera de `public_html`
3. **NO** compartas tus credenciales en repositorios públicos
4. **USA** las credenciales de TEST hasta que todo funcione perfectamente
5. **CAMBIA** a credenciales de producción solo cuando esté listo para aceptar pagos reales

---

## 📊 CREDENCIALES CONFIGURADAS

### Modo TEST (Actual):
```
Public Key:    TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5
Access Token:  TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053
```

### Cuándo cambiar a PRODUCCIÓN:
1. Todo funciona perfectamente en TEST
2. Has probado múltiples escenarios de pago
3. Los emails se envían correctamente
4. El webhook está configurado en Mercado Pago
5. Estás listo para recibir dinero real

Para cambiar a producción, solo edita `mercadopago-config.php` y reemplaza las credenciales de TEST por las de producción (APP_USR-...).

---

## ✅ CHECKLIST FINAL

Antes de considerar que está completo:

- [ ] Archivos subidos en las ubicaciones correctas
- [ ] Permisos configurados (644 para archivos, 755 para carpetas)
- [ ] `test-mercadopago-connection.html` muestra conexión exitosa
- [ ] Compra de prueba funciona correctamente
- [ ] Usuario es redirigido a página de éxito
- [ ] Email de confirmación se envía
- [ ] Carrito se limpia después del pago
- [ ] No hay errores en los logs de cPanel

---

## 📚 DOCUMENTACIÓN ADICIONAL

Consulta estos archivos para más información:

- `INSTRUCCIONES-MERCADOPAGO.md` - Guía paso a paso detallada
- `docs/SOLUCION-FINAL-MP.md` - Explicación del sistema de localStorage
- `docs/mercadopago-config.txt` - Configuración antigua (referencia)

---

## 🎉 ¡LISTO!

Una vez completados todos los pasos, Mercado Pago estará funcionando correctamente en tu sitio.

Los usuarios podrán:
- ✅ Seleccionar Mercado Pago como método de pago
- ✅ Ser redirigidos a Mercado Pago para pagar
- ✅ Regresar automáticamente al sitio después del pago
- ✅ Recibir email de confirmación
- ✅ Ver la pantalla de éxito con su número de orden

---

**Fecha:** Enero 2025  
**Versión:** 1.0  
**Estado:** Modo TEST (Credenciales de prueba configuradas)
