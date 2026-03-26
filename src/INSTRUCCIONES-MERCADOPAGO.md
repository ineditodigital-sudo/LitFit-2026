# 🚀 CONFIGURACIÓN DE MERCADO PAGO - LITFIT

## 📋 RESUMEN

Este documento contiene las instrucciones para configurar Mercado Pago con tus credenciales de prueba en el backend PHP.

### 🔐 Credenciales de Prueba

- **Public Key (Pública):** `TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5`
- **Access Token (Secreta):** `TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053`

---

## 📁 ARCHIVOS A SUBIR A CPANEL

Necesitas subir **2 archivos PHP** a tu servidor cPanel:

### 1️⃣ **mercadopago-config.php** (Configuración - PRIVADO)
- **Ubicación recomendada:** `/home/inedito/private/config/mercadopago-config.php`
- **⚠️ IMPORTANTE:** Este archivo NO debe estar en `public_html` para mantener las credenciales seguras

### 2️⃣ **create-preference.php** (API de creación de pagos - PÚBLICO)
- **Ubicación:** `/home/inedito/public_html/cdn/mercadopago/create-preference.php`
- **URL de acceso:** `https://cdn.inedito.digital/mercadopago/create-preference.php`

---

## 🔧 PASO A PASO: INSTALACIÓN EN CPANEL

### PASO 1: Acceder a cPanel

1. Ve a tu cPanel: `https://inedito.digital:2083`
2. Ingresa tus credenciales
3. Busca el icono de **"File Manager"** (Administrador de archivos)
4. Haz clic para abrir

---

### PASO 2: Crear estructura de carpetas

#### A) Crear carpeta para configuración privada

1. En File Manager, asegúrate de estar en `/home/inedito/`
2. Si NO existe la carpeta `private`, créala:
   - Clic en **"+ Folder"** (Nueva carpeta)
   - Nombre: `private`
   - Clic en **"Create New Folder"**

3. Entra a la carpeta `private`
4. Crea una subcarpeta llamada `config`:
   - Clic en **"+ Folder"**
   - Nombre: `config`
   - Clic en **"Create New Folder"**

#### B) Crear carpeta para la API pública

1. En File Manager, navega a `/home/inedito/public_html/cdn/`
2. Si NO existe la carpeta `mercadopago`, créala:
   - Clic en **"+ Folder"**
   - Nombre: `mercadopago`
   - Clic en **"Create New Folder"**

---

### PASO 3: Subir archivo de configuración (PRIVADO)

1. Navega a: `/home/inedito/private/config/`
2. Clic en **"Upload"** (Subir archivos)
3. Arrastra o selecciona el archivo: **`mercadopago-config.php`**
4. Espera a que se complete la subida
5. Cierra la ventana de upload

---

### PASO 4: Subir archivo de API (PÚBLICO)

1. Navega a: `/home/inedito/public_html/cdn/mercadopago/`
2. Clic en **"Upload"**
3. Arrastra o selecciona el archivo: **`create-preference.php`**
4. Espera a que se complete la subida
5. Cierra la ventana de upload

---

### PASO 5: Verificar permisos

#### Para `mercadopago-config.php`:
1. Navega a `/home/inedito/private/config/`
2. Haz clic derecho en `mercadopago-config.php`
3. Selecciona **"Permissions"** (Permisos)
4. Configura: **`644`** (rw-r--r--)
5. Clic en **"Change Permissions"**

#### Para `create-preference.php`:
1. Navega a `/home/inedito/public_html/cdn/mercadopago/`
2. Haz clic derecho en `create-preference.php`
3. Selecciona **"Permissions"**
4. Configura: **`644`** (rw-r--r--)
5. Clic en **"Change Permissions"**

---

## 🧪 PRUEBA DE FUNCIONAMIENTO

### PASO 1: Probar la API

1. Abre tu navegador
2. Ve a: `https://cdn.inedito.digital/mercadopago/create-preference.php`
3. Deberías ver un mensaje de error JSON (esto es normal):
   ```json
   {"success":false,"message":"Método no permitido. Use POST."}
   ```
   ✅ Esto confirma que el archivo está accesible

---

### PASO 2: Hacer una compra de prueba

1. Ve a: **https://litfit.inedito.digital**
2. Agrega productos al carrito
3. Ve al checkout
4. Llena TODOS los campos del formulario:
   - Nombre
   - Apellido
   - Email
   - Teléfono
   - Dirección completa
   - Código postal

5. Espera a que se calculen las opciones de envío
6. Clic en **"Continuar al Pago"**
7. Selecciona **"Mercado Pago"**
8. Clic en **"Pagar con Mercado Pago"**

---

### PASO 3: Usar tarjeta de prueba

Cuando te redirija a Mercado Pago, usa estos datos de prueba:

```
Número de tarjeta: 5031 7557 3453 0604
Nombre: APRO
Fecha de vencimiento: 11/25
CVV: 123
Documento (DNI): 12345678
```

**Otros casos de prueba:**

| Nombre | Resultado |
|--------|-----------|
| `APRO` | Pago aprobado ✅ |
| `OCHO` | Pago rechazado ❌ |
| `CONT` | Pago pendiente ⏳ |

---

### PASO 4: Verificar el resultado

Después de pagar, Mercado Pago te redirigirá automáticamente a:

**Si el pago fue exitoso:**
- URL: `https://litfit.inedito.digital/payment-success-mp`
- Deberías ver: 🎉 **"¡Pago Exitoso!"**
- Email enviado ✅
- Carrito limpiado ✅
- Número de orden mostrado

**Si el pago falló:**
- URL: `https://litfit.inedito.digital/payment-failure-mp`
- Mensaje de error

**Si el pago está pendiente:**
- URL: `https://litfit.inedito.digital/payment-pending-mp`
- Mensaje de espera

---

## 🔍 DEBUGGING: Si algo no funciona

### ✅ CHECKLIST DE VERIFICACIÓN

- [ ] Los 2 archivos PHP están subidos en las ubicaciones correctas
- [ ] Los permisos son `644` en ambos archivos
- [ ] La carpeta `cdn/mercadopago/` existe en `public_html`
- [ ] Las credenciales en `mercadopago-config.php` son correctas
- [ ] El frontend apunta a la URL correcta

---

### 📋 LOGS DE ERROR

Para ver errores detallados en cPanel:

1. Ve a cPanel → **"Errors"** o **"Error Log"**
2. Busca mensajes recientes que contengan:
   - `create-preference.php`
   - `mercadopago`
   - `CURL Error`
   - `HTTP`

---

### 🧪 PROBAR MANUALMENTE LA API

Puedes hacer una prueba con `curl` desde tu terminal:

```bash
curl -X POST https://cdn.inedito.digital/mercadopago/create-preference.php \
  -H "Content-Type: application/json" \
  -d '{
    "items": [
      {
        "name": "Proteína ISO",
        "price": 500,
        "quantity": 1
      }
    ],
    "formData": {
      "firstName": "Test",
      "lastName": "User",
      "email": "test@test.com",
      "phone": "5555555555",
      "street": "Calle Test 123",
      "city": "Monterrey",
      "state": "Nuevo León",
      "zipCode": "64000"
    },
    "total": 500,
    "shippingCost": 0,
    "totalPrice": 500,
    "orderId": "TEST-123"
  }'
```

**Respuesta esperada:**
```json
{
  "success": true,
  "checkoutUrl": "https://www.mercadopago.com.mx/checkout/v1/redirect?pref_id=...",
  "preferenceId": "123456789-abcd-1234-efgh-123456789abc",
  "orderId": "TEST-123"
}
```

---

## 🔄 ACTUALIZAR CREDENCIALES (Cuando pases a producción)

Para cambiar de **TEST** a **producción**:

1. Ve a cPanel → File Manager
2. Navega a: `/home/inedito/private/config/`
3. Edita el archivo `mercadopago-config.php`
4. Reemplaza las líneas:

**ANTES (Test):**
```php
define('MP_ACCESS_TOKEN', 'TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053');
define('MP_PUBLIC_KEY', 'TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5');
define('MP_TEST_MODE', true);
```

**DESPUÉS (Producción):**
```php
define('MP_ACCESS_TOKEN', 'APP_USR-TU_ACCESS_TOKEN_DE_PRODUCCION');
define('MP_PUBLIC_KEY', 'APP_USR-TU_PUBLIC_KEY_DE_PRODUCCION');
define('MP_TEST_MODE', false);
```

5. Guarda el archivo
6. Listo ✅

---

## 📞 SOPORTE

Si tienes problemas:

1. **Revisa los logs** en cPanel → Error Log
2. **Verifica las URLs** en tu navegador
3. **Prueba con curl** para aislar el problema
4. **Revisa los permisos** de los archivos

---

## ✅ CHECKLIST FINAL

Antes de considerar la instalación completa:

- [ ] `mercadopago-config.php` subido a `/home/inedito/private/config/`
- [ ] `create-preference.php` subido a `/home/inedito/public_html/cdn/mercadopago/`
- [ ] Permisos configurados a `644` en ambos archivos
- [ ] La API responde (aunque sea con error de método)
- [ ] Compra de prueba realizada con tarjeta de test
- [ ] Pago exitoso redirige correctamente
- [ ] Email de confirmación se envía
- [ ] Carrito se limpia después del pago

---

**🎉 ¡Todo listo! Mercado Pago debería estar funcionando correctamente con tus credenciales de prueba.**

---

**Fecha de creación:** Enero 2025  
**Versión:** 1.0  
**Autor:** Sistema automatizado de documentación
