# 🔐 GUÍA: CONFIGURAR CREDENCIALES DE PRODUCCIÓN EN CPANEL

## ✅ Credenciales que necesitas

Para **Mercado Pago Checkout Pro**, usa estas DOS credenciales:

```
✅ Public Key (Producción):
APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4

✅ Access Token (Producción):
APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053
```

❌ **NO necesitas**:
- Client ID: 2656381259343864
- Client Secret: P1gxw0KUinRMkt4ZtguWMAjHx5TBScmF

*Esas son para OAuth o integraciones avanzadas, no para Checkout Pro*

---

## 📋 PASO A PASO: Actualizar en cPanel

### 📍 Opción 1: Subir archivo completo (MÁS FÁCIL)

#### 1. Descarga el archivo actualizado
He creado el archivo `mercadopago-config-PRODUCCION.php` con tus credenciales de producción.

#### 2. Conéctate a cPanel
- Ve a tu cPanel: https://tu-servidor.com:2083 (o el que uses)
- Usuario: `inedito` (o tu usuario de cPanel)

#### 3. Ve al Administrador de Archivos
- En cPanel, busca "Administrador de archivos" o "File Manager"
- Click en "Administrador de archivos"

#### 4. Navega a la carpeta correcta

**Opción A: Fuera de public_html (MÁS SEGURO) ✅ RECOMENDADO**
```
/home/inedito/private/config/
```

Si no existe, créala:
1. Ve a `/home/inedito/`
2. Click en "Nueva carpeta" → Nombre: `private`
3. Entra a `private`
4. Click en "Nueva carpeta" → Nombre: `config`

**Opción B: Dentro de public_html (menos seguro)**
```
/home/inedito/public_html/cdn.inedito.digital/mercadopago/
```

#### 5. Sube el archivo
1. Click en "Subir" (botón arriba)
2. Selecciona el archivo `mercadopago-config-PRODUCCION.php`
3. Una vez subido, **RENÓMBRALO** a `mercadopago-config.php`

#### 6. Verifica los permisos
1. Click derecho en `mercadopago-config.php`
2. "Permisos" o "Change Permissions"
3. Establece: `644` (rw-r--r--)
4. Click "Guardar"

---

### 📝 Opción 2: Editar directamente en cPanel

#### 1. Abre el archivo en cPanel
1. Ve a `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
2. Click derecho en `mercadopago-config.php`
3. "Editar" o "Edit"

#### 2. Reemplaza estas líneas:

**CAMBIA ESTO:**
```php
// Access Token (Clave secreta) - NUNCA expongas esto en el frontend
define('MP_ACCESS_TOKEN', 'TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053');

// Public Key - Se puede usar en el frontend si es necesario
define('MP_PUBLIC_KEY', 'TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5');

// Modo de desarrollo (true = test, false = producción)
define('MP_TEST_MODE', true);
```

**POR ESTO:**
```php
// Access Token (Clave secreta) - NUNCA expongas esto en el frontend
define('MP_ACCESS_TOKEN', 'APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053');

// Public Key - Se puede usar en el frontend si es necesario
define('MP_PUBLIC_KEY', 'APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4');

// Modo de desarrollo (true = test, false = producción)
define('MP_TEST_MODE', false); // ⚠️ IMPORTANTE: false para producción
```

#### 3. Guarda el archivo
- Click en "Guardar cambios" o "Save Changes"

---

## 🔧 PASO 3: Actualizar create-preference.php

Necesitas asegurarte de que `create-preference.php` esté apuntando a la ruta correcta del archivo de configuración.

### Si pusiste el config en `/home/inedito/private/config/`:

Edita `create-preference.php` y busca esta línea (cerca de la línea 20):

**CAMBIA ESTO:**
```php
define('MP_CONFIG_LOADED', true);
require_once __DIR__ . '/mercadopago-config.php';
```

**POR ESTO:**
```php
define('MP_CONFIG_LOADED', true);
require_once '/home/inedito/private/config/mercadopago-config.php';
```

### Si lo dejaste en la misma carpeta:

Déjalo como está:
```php
define('MP_CONFIG_LOADED', true);
require_once __DIR__ . '/mercadopago-config.php';
```

---

## ✅ PASO 4: Verificar que funcione

### 1. Prueba el archivo de configuración

Crea un archivo temporal `test-config.php` en la misma carpeta:

```php
<?php
// test-config.php
define('MP_CONFIG_LOADED', true);
require_once __DIR__ . '/mercadopago-config.php';

echo "✅ Archivo de configuración cargado correctamente<br>";
echo "Public Key: " . substr(MP_PUBLIC_KEY, 0, 20) . "...<br>";
echo "Access Token: " . substr(MP_ACCESS_TOKEN, 0, 20) . "...<br>";
echo "Modo: " . (MP_TEST_MODE ? 'TEST' : 'PRODUCCIÓN') . "<br>";
?>
```

Abre en tu navegador:
```
https://cdn.inedito.digital/mercadopago/test-config.php
```

**Deberías ver:**
```
✅ Archivo de configuración cargado correctamente
Public Key: APP_USR-e3e73806-f...
Access Token: APP_USR-2656381259...
Modo: PRODUCCIÓN
```

❌ **Borra este archivo después de probar** (es sensible)

### 2. Prueba el sistema completo

1. Ve a tu sitio: https://litfit.inedito.digital
2. Agrega productos al carrito
3. Ve a checkout
4. Selecciona Mercado Pago
5. Haz click en "Pagar con Mercado Pago"

**Ahora debería redirigirte a Mercado Pago REAL** (no sandbox)

---

## 🎯 Diferencias entre Test y Producción

| Aspecto | TEST | PRODUCCIÓN |
|---------|------|------------|
| Public Key | `TEST-cec7b3b0...` | `APP_USR-e3e73806...` |
| Access Token | `TEST-2656381259...` | `APP_USR-2656381259...` |
| MP_TEST_MODE | `true` | `false` |
| Pagos | Ficticios (tarjetas de prueba) | REALES (cobra dinero) |
| URL Checkout | sandbox.mercadopago.com.mx | www.mercadopago.com.mx |

---

## ⚠️ IMPORTANTE: Seguridad

### ✅ HACER:
1. Mantener `mercadopago-config.php` fuera de `public_html` si es posible
2. Establecer permisos `644` al archivo
3. Nunca exponer el Access Token en el frontend
4. Nunca commitear credenciales en Git
5. Usar HTTPS (que ya tienes)

### ❌ NO HACER:
1. Subir credenciales a Git/GitHub
2. Dejar permisos `777` en archivos sensibles
3. Exponer el Access Token en JavaScript
4. Compartir credenciales por email o chat

---

## 📝 Resumen de archivos

Después de configurar, deberías tener:

```
📁 /home/inedito/public_html/cdn.inedito.digital/mercadopago/
├── create-preference.php          ✅ Crea preferencias de pago
├── webhook.php                    ✅ Recibe notificaciones
└── mercadopago-config.php         ⚠️ SI está aquí, OK pero menos seguro

📁 /home/inedito/private/config/
└── mercadopago-config.php         ✅ MEJOR UBICACIÓN (más seguro)
```

---

## 🐛 Troubleshooting

### Error: "Config file not found"
**Solución:** Verifica la ruta en `create-preference.php`:
```php
require_once '/home/inedito/private/config/mercadopago-config.php';
```

### Error: "Permission denied"
**Solución:** Cambia permisos del archivo:
```bash
chmod 644 mercadopago-config.php
```

### Error: "Invalid access token"
**Solución:** Verifica que copiaste bien el Access Token (sin espacios extra)

### Sigue redirigiendo a TEST
**Solución:** Verifica que `MP_TEST_MODE` esté en `false`:
```php
define('MP_TEST_MODE', false);
```

---

## 🎉 ¡Listo!

Una vez configurado:
1. ✅ Los pagos serán REALES
2. ✅ Los clientes pagarán de verdad
3. ✅ El dinero llegará a tu cuenta de Mercado Pago
4. ✅ Recibirás notificaciones reales

**⚠️ ADVERTENCIA:** Una vez en producción, los pagos son REALES. Haz pruebas exhaustivas antes de publicar!

---

## 📞 ¿Necesitas ayuda?

Si tienes problemas:
1. Revisa los logs de error en cPanel
2. Verifica que el archivo test-config.php funcione
3. Prueba desactivando el bloqueador de anuncios
4. Contacta si persiste el error

---

## 📎 Archivos importantes

He creado para ti:
- ✅ `mercadopago-config-PRODUCCION.php` - Versión lista para producción
- ✅ `SOLUCION-ERROR-BLOQUEADOR.md` - Guía para errores comunes
- ✅ Este archivo - Instrucciones completas
