# ✅ INSTRUCCIONES PARA ACTUALIZAR EL BACKEND PHP

## 🎯 PROBLEMA ACTUAL
Las URLs de retorno de Mercado Pago no están apuntando a las páginas correctas del frontend.

---

## 📝 SOLUCIÓN: Actualizar el archivo de configuración PHP

### PASO 1: Acceder a cPanel

1. Ve a: **https://inedito.digital/cpanel** (o tu panel de cPanel)
2. Inicia sesión con tus credenciales

---

### PASO 2: Abrir el File Manager

1. En cPanel, busca **"File Manager"** o **"Administrador de archivos"**
2. Click en **File Manager**

---

### PASO 3: Navegar al archivo de configuración

1. En el File Manager, navega a:
   ```
   /home/inedito/private/config/
   ```

2. Busca el archivo: **`mercadopago-config.php`**

3. Click derecho → **Edit** o **Code Edit**

---

### PASO 4: Actualizar las URLs de retorno

Encuentra estas 3 líneas en el archivo:

```php
define('MP_SUCCESS_URL', '...');
define('MP_FAILURE_URL', '...');
define('MP_PENDING_URL', '...');
```

**REEMPLÁZALAS CON:**

```php
define('MP_SUCCESS_URL', 'https://litfit.inedito.digital/payment-success-mp');
define('MP_FAILURE_URL', 'https://litfit.inedito.digital/payment-failure-mp');
define('MP_PENDING_URL', 'https://litfit.inedito.digital/payment-pending-mp');
```

---

### PASO 5: Verificar el archivo completo

El archivo **`mercadopago-config.php`** debería verse así:

```php
<?php
/**
 * Configuración de Mercado Pago
 * Backend en: inedito.digital
 * Frontend en: litfit.inedito.digital (Figma Make)
 */

// Validar que este archivo solo sea incluido desde archivos autorizados
if (!defined('MP_CONFIG_LOADED')) {
    die('Acceso directo no permitido');
}

// Credenciales de TEST
define('MP_ACCESS_TOKEN', 'APP_USR-6788390943904147-121612-2582a096f11f65f5bfe8d4f1fd025255-3071467736');
define('MP_PUBLIC_KEY', 'APP_USR-a4b1fce5-c13e-42ca-ae12-cb1ab17d34b3');

// URLs de retorno
define('MP_SUCCESS_URL', 'https://litfit.inedito.digital/payment-success-mp');
define('MP_FAILURE_URL', 'https://litfit.inedito.digital/payment-failure-mp');
define('MP_PENDING_URL', 'https://litfit.inedito.digital/payment-pending-mp');

// URL del webhook
define('MP_WEBHOOK_URL', 'https://inedito.digital/api/mercadopago/webhook.php');
```

---

### PASO 6: Guardar el archivo

1. Click en **"Save Changes"** o **"Guardar cambios"**
2. Cierra el editor

---

## ✅ VERIFICACIÓN

Después de guardar, verifica que:

- ✅ El archivo no tenga errores de sintaxis
- ✅ Las comillas estén correctas (usa comillas simples `'`)
- ✅ Cada línea termine con punto y coma `;`

---

## 🧪 PROBAR EL SISTEMA

### 1. Hacer una compra de prueba

1. Ve a: **https://litfit.inedito.digital**
2. Agrega productos al carrito
3. Ve al checkout
4. Llena el formulario con datos de prueba
5. Selecciona **"Mercado Pago"**
6. Click en **"Pagar con Mercado Pago"**

### 2. Pagar con tarjeta de prueba

En la página de Mercado Pago, usa estos datos:

```
Número de tarjeta: 4075 5957 1648 3764
Nombre: APRO
Fecha de vencimiento: 12/26
CVV: 123
DNI/RUT/CURP: 12345678
Email: test@test.com
```

### 3. Verificar el resultado

Después de pagar, deberías:

- ✅ Ser redirigido a: `https://litfit.inedito.digital/payment-success-mp`
- ✅ Ver la pantalla de **"¡Pago Exitoso!"**
- ✅ Recibir un email de confirmación en: `reenviadorlitfit@inedito.digital`
- ✅ El carrito debería estar vacío

---

## ❓ SOLUCIÓN DE PROBLEMAS

### Problema: "No se encontraron datos del pedido"

**Solución:**
1. Abre la consola del navegador (F12)
2. Ve a la pestaña **"Application"** o **"Storage"**
3. Busca **"localStorage"**
4. Verifica que exista la clave: `litfit_pending_order`
5. Si no existe, el problema está antes del pago

### Problema: "Hubo un error al procesar tu pedido"

**Solución:**
1. Verifica que EmailJS esté configurado correctamente
2. Verifica las credenciales en `/pages/checkout.tsx`:
   - Service ID: `service_co0q90x`
   - Template ID: `template_yqda5vi`
   - Public Key: `hHdYJvPh0oxZZkFiL`

### Problema: "Sigue apareciendo la misma pantalla del checkout"

**Solución:**
1. Verifica que las URLs en el PHP sean correctas
2. Abre la consola del navegador y busca errores
3. Verifica que Mercado Pago esté redirigiendo a la URL correcta

---

## 📧 CONTACTO

Si tienes problemas, verifica:
1. Las URLs en el archivo PHP
2. La consola del navegador (F12) para ver errores
3. Los logs de EmailJS en: https://dashboard.emailjs.com/admin

---

## 🎉 ¡LISTO!

Después de actualizar el archivo PHP, el sistema debería funcionar perfectamente:

1. **Guardar datos** → ✅
2. **Pagar en Mercado Pago** → ✅
3. **Regresar al sitio** → ✅
4. **Enviar email** → ✅
5. **Limpiar carrito** → ✅

---

**Fecha de actualización:** Diciembre 2024
