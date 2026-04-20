# 🔍 DIAGNÓSTICO PASO A PASO - Error "Failed to fetch"

Ya tienes los archivos subidos a cPanel pero aún ves el error "Failed to fetch". Sigamos estos pasos para encontrar el problema exacto.

---

## 🚀 PASO 1: Usar la herramienta de diagnóstico

He creado una herramienta que prueba automáticamente tu configuración:

1. **Abre el archivo:** `diagnostico-mercadopago.html`
2. **Ábrelo en tu navegador** (doble clic)
3. **Espera a que se ejecuten los tests automáticos**

La herramienta te dirá EXACTAMENTE qué está fallando.

---

## 📋 PASO 2: Verificar manualmente en cPanel

### Verifica la ubicación de los archivos:

1. Abre **cPanel File Manager**
2. Verifica que existan estos archivos en estas rutas EXACTAS:

```
✅ /home/inedito/private/config/mercadopago-config.php
✅ /home/inedito/public_html/cdn/mercadopago/create-preference.php
```

### Pregunta importante:
- ¿Están los archivos EN ESAS RUTAS EXACTAS?
- ¿La carpeta se llama exactamente "mercadopago" (minúsculas)?
- ¿Los archivos tienen exactamente esos nombres?

---

## 🌐 PASO 3: Probar la URL directamente

Abre tu navegador y ve a:

```
https://cdn.inedito.digital/mercadopago/create-preference.php
```

### ¿Qué ves?

#### ✅ OPCIÓN A: Mensaje JSON
```json
{"success":false,"message":"Método no permitido. Use POST."}
```
**Esto es PERFECTO** - El archivo está funcionando, pasa al PASO 4.

---

#### ❌ OPCIÓN B: Error 404
```
Not Found
The requested URL was not found on this server.
```

**PROBLEMA:** El archivo NO está en la ubicación correcta.

**SOLUCIÓN:**
1. Ve a cPanel File Manager
2. Navega a: `/home/inedito/public_html/cdn/`
3. ¿Existe la carpeta "mercadopago"?
   - **NO:** Créala (+ Folder → nombre: "mercadopago")
   - **SÍ:** Entra a ella
4. ¿Está el archivo "create-preference.php" dentro?
   - **NO:** Súbelo de nuevo
   - **SÍ:** Verifica que el nombre sea EXACTO (sin espacios, minúsculas)

---

#### ❌ OPCIÓN C: Error 403
```
Forbidden
You don't have permission to access this resource.
```

**PROBLEMA:** Permisos incorrectos.

**SOLUCIÓN:**
1. Ve a cPanel File Manager
2. Navega al archivo: `create-preference.php`
3. Clic derecho → **Permissions**
4. Configura: **644** (rw-r--r--)
5. Clic en "Change Permissions"

---

#### ❌ OPCIÓN D: Error 500
```
Internal Server Error
```

**PROBLEMA:** Error en el código PHP.

**SOLUCIÓN:**
1. Ve a cPanel → **Error Log** (o "Errors")
2. Busca el error más reciente
3. Copia el mensaje de error completo
4. Es posible que:
   - El archivo de configuración no se encuentre
   - Haya un error de sintaxis en PHP
   - Falte alguna extensión de PHP

---

## 🔍 PASO 4: Verificar el archivo de configuración

Si la URL responde (mensaje JSON), el problema puede estar en el archivo de configuración.

### Verifica en cPanel:

1. Ve a: `/home/inedito/private/config/`
2. ¿Existe el archivo `mercadopago-config.php`?
   - **NO:** Súbelo ahora
   - **SÍ:** Ábrelo y verifica

### Contenido del archivo debe tener:

```php
<?php
if (!defined('MP_CONFIG_LOADED')) {
    http_response_code(403);
    die('Acceso directo no permitido');
}

define('MP_ACCESS_TOKEN', 'TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053');
define('MP_PUBLIC_KEY', 'TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5');
```

**VERIFICA:**
- ¿Las credenciales son EXACTAMENTE esas?
- ¿No hay espacios extras?
- ¿No hay caracteres raros al copiar/pegar?

---

## 🧪 PASO 5: Hacer prueba desde el sitio

1. Ve a: **https://litfit.inedito.digital**
2. Agrega un producto al carrito
3. Ve al checkout
4. Llena el formulario completo
5. **ANTES de hacer clic en Mercado Pago:**
   - Abre la consola del navegador (F12)
   - Ve a la pestaña "Console"
6. Ahora SÍ haz clic en **"Pagar con Mercado Pago"**

### ¿Qué ves en la consola?

#### ✅ SI FUNCIONA:
```
💾 Datos guardados con ID: LITFIT-...
🚀 Conectando con backend de Mercado Pago...
📍 URL: https://cdn.inedito.digital/mercadopago/create-preference.php
📥 Respuesta del servidor: 200
📦 Datos recibidos: {success: true, checkoutUrl: "..."}
🔄 Redirigiendo a Mercado Pago...
```
Y serás redirigido a Mercado Pago ✅

---

#### ❌ SI FALLA:
```
❌ Error al iniciar pago con Mercado Pago: TypeError: Failed to fetch
```

**Copia TODO el mensaje de la consola y revisa:**

1. **¿Dice "Failed to fetch"?**
   - El navegador no puede conectarse al servidor
   - Verifica firewall o bloqueadores de ads
   - Prueba en modo incógnito

2. **¿Dice "CORS"?**
   - El servidor no tiene CORS configurado
   - Verifica que el archivo PHP tenga los headers correctos

3. **¿Dice "500 Internal Server Error"?**
   - Hay un error en el PHP
   - Revisa los logs de error en cPanel

---

## 📊 PASO 6: Revisar logs de cPanel

Si sigue sin funcionar:

1. Ve a cPanel
2. Busca **"Error Log"** o **"Errors"**
3. Busca errores recientes que mencionen:
   - `mercadopago`
   - `create-preference`
   - `PHP Fatal error`
   - `PHP Warning`

### Copia los errores y revisa:

**Error común 1:**
```
PHP Fatal error: require_once(): Failed opening required
```
**Solución:** El archivo `mercadopago-config.php` no está en la ruta correcta.

**Error común 2:**
```
PHP Parse error: syntax error
```
**Solución:** Hay un error de sintaxis. Vuelve a subir el archivo.

**Error común 3:**
```
cURL error
```
**Solución:** El servidor no puede conectarse a Mercado Pago. Contacta a tu hosting.

---

## 🔧 SOLUCIONES RÁPIDAS

### Problema: "Failed to fetch"

**Prueba esto:**
1. Vacía la caché del navegador (Ctrl + Shift + Delete)
2. Prueba en modo incógnito
3. Prueba en otro navegador
4. Desactiva extensiones (ad blockers, etc.)

---

### Problema: "CORS policy"

**Verifica en el archivo PHP:**
```php
header('Access-Control-Allow-Origin: https://litfit.inedito.digital');
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
```

Estas líneas DEBEN estar al inicio del archivo `create-preference.php`.

---

### Problema: "Config file not found"

**La ruta del config es incorrecta:**

En `create-preference.php`, busca esta línea:
```php
$configPath = __DIR__ . '/../../private/config/mercadopago-config.php';
```

**Verifica que la ruta sea correcta según tu estructura de cPanel.**

Si tu estructura es diferente, ajusta la ruta. Por ejemplo:
```php
// Si está en el mismo directorio
$configPath = __DIR__ . '/mercadopago-config.php';

// Si private está en otro lugar
$configPath = '/home/inedito/private/config/mercadopago-config.php';
```

---

## ✅ CHECKLIST DE VERIFICACIÓN

Marca cada elemento:

- [ ] Los archivos están en las rutas correctas
- [ ] Los nombres de archivos son exactos (sin espacios)
- [ ] Los permisos son 644
- [ ] La URL responde (aunque sea con error 405)
- [ ] El archivo de configuración existe
- [ ] Las credenciales son correctas
- [ ] No hay errores en los logs de cPanel
- [ ] El navegador puede acceder a la URL
- [ ] CORS está configurado
- [ ] No hay bloqueadores de ads activos

---

## 🆘 SI NADA FUNCIONA

**Por favor, proporciona esta información:**

1. **¿Qué ves cuando abres:**
   ```
   https://cdn.inedito.digital/mercadopago/create-preference.php
   ```

2. **Resultado de `diagnostico-mercadopago.html`:**
   - ¿Qué tests pasan?
   - ¿Qué tests fallan?
   - ¿Qué mensajes ves?

3. **Consola del navegador (F12):**
   - Copia TODO el mensaje de error completo

4. **Logs de cPanel:**
   - Copia los últimos errores relacionados con `mercadopago`

5. **Estructura de carpetas:**
   - Haz screenshot de cPanel mostrando:
     - `/home/inedito/private/config/`
     - `/home/inedito/public_html/cdn/mercadopago/`

Con esta información podré ayudarte a resolver el problema exacto.

---

**Fecha:** Enero 2025  
**Herramienta de diagnóstico:** diagnostico-mercadopago.html
