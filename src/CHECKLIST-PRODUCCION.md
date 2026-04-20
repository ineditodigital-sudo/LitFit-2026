# ✅ CHECKLIST: Configurar Mercado Pago en Producción

## 🎯 Resumen Rápido

### Credenciales que necesitas:

```
✅ Public Key:
APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4

✅ Access Token:
APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053
```

❌ **NO usar:** Client ID ni Client Secret (esos no son para Checkout Pro)

---

## 📋 Pasos a seguir (marca cuando completes)

### [ ] PASO 1: Preparar el archivo de configuración

- [ ] Descarga el archivo `mercadopago-config-PRODUCCION.php` de Figma Make
- [ ] Renómbralo a `mercadopago-config.php` en tu computadora

**O edita manualmente:**
- [ ] Cambia `MP_ACCESS_TOKEN` a: `APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053`
- [ ] Cambia `MP_PUBLIC_KEY` a: `APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4`
- [ ] Cambia `MP_TEST_MODE` a: `false`

---

### [ ] PASO 2: Subir a cPanel

- [ ] Conéctate a cPanel (https://tu-servidor.com:2083)
- [ ] Abre el "Administrador de archivos"

**Opción A: Ubicación segura (RECOMENDADO)**
- [ ] Navega a `/home/inedito/`
- [ ] Crea carpeta `private` (si no existe)
- [ ] Dentro de `private`, crea carpeta `config`
- [ ] Sube `mercadopago-config.php` a `/home/inedito/private/config/`
- [ ] Establece permisos `644` al archivo

**Opción B: Ubicación simple**
- [ ] Navega a `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
- [ ] Sube `mercadopago-config.php` ahí
- [ ] Establece permisos `644` al archivo

---

### [ ] PASO 3: Actualizar create-preference.php

**Si elegiste Opción A (private/config):**
- [ ] Edita `create-preference.php`
- [ ] Busca la línea: `require_once __DIR__ . '/mercadopago-config.php';`
- [ ] Cámbiala a: `require_once '/home/inedito/private/config/mercadopago-config.php';`
- [ ] Guarda el archivo

**Si elegiste Opción B (misma carpeta):**
- [ ] No necesitas cambiar nada en `create-preference.php`

---

### [ ] PASO 4: Verificar configuración

- [ ] Sube `test-config-produccion.php` a `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
- [ ] Abre en tu navegador: `https://cdn.inedito.digital/mercadopago/test-config-produccion.php`

**Deberías ver:**
- ✅ Archivo de configuración cargado correctamente
- ✅ Public Key empieza con `APP_USR-e3e73806...`
- ✅ Access Token empieza con `APP_USR-2656381259...`
- ✅ Modo: **PRODUCCIÓN** (NO test)
- ✅ Configuración CORRECTA para producción

**Si ves errores:**
- ❌ "Config file not found" → Verifica la ruta en create-preference.php
- ❌ "Modo: TEST" → Cambia `MP_TEST_MODE` a `false`
- ❌ "credenciales de TEST" → Verifica que copiaste bien las credenciales

- [ ] **IMPORTANTE:** Borra `test-config-produccion.php` después de verificar

---

### [ ] PASO 5: Probar pago real

⚠️ **ATENCIÓN:** A partir de aquí los pagos serán REALES

- [ ] Ve a https://litfit.inedito.digital
- [ ] Agrega un producto al carrito (usa uno barato para prueba)
- [ ] Ve al checkout
- [ ] Llena el formulario con datos reales
- [ ] Selecciona "Mercado Pago"
- [ ] Haz click en "Pagar con Mercado Pago"

**Deberías ver:**
- [ ] Redirección a `www.mercadopago.com.mx` (NO sandbox)
- [ ] Pantalla de pago de Mercado Pago
- [ ] Opciones de pago reales (tarjeta, OXXO, etc.)

**Para probar SIN cobrar de verdad:**
- [ ] Inicia el pago pero NO lo completes
- [ ] O complétalo y luego devuélvelo desde el panel de Mercado Pago

---

### [ ] PASO 6: Configurar Webhook (opcional pero recomendado)

- [ ] Ve a https://www.mercadopago.com.mx/developers/panel/app
- [ ] Selecciona tu aplicación
- [ ] Ve a "Webhooks" o "Notificaciones IPN"
- [ ] Agrega URL: `https://cdn.inedito.digital/mercadopago/webhook.php`
- [ ] Selecciona eventos: `payment` (mínimo)
- [ ] Guarda

---

## 🔍 Verificación Final

Marca todas las que apliquen:

- [ ] Las credenciales empiezan con `APP_USR-` (NO con `TEST-`)
- [ ] `MP_TEST_MODE` está en `false`
- [ ] El archivo `test-config-produccion.php` muestra "PRODUCCIÓN"
- [ ] El archivo `test-config-produccion.php` fue BORRADO después de verificar
- [ ] El pago redirige a `www.mercadopago.com.mx` (NO a sandbox)
- [ ] Las opciones de pago son reales (OXXO, tarjetas reales, etc.)
- [ ] El archivo `mercadopago-config.php` tiene permisos `644`
- [ ] Las credenciales NO están expuestas en el frontend
- [ ] El webhook está configurado (opcional)

---

## 🚨 IMPORTANTE: Diferencias Test vs Producción

| Aspecto | TEST ❌ | PRODUCCIÓN ✅ |
|---------|---------|---------------|
| Public Key | `TEST-cec7b3b0...` | `APP_USR-e3e73806...` |
| Access Token | `TEST-2656381259...` | `APP_USR-2656381259...` |
| MP_TEST_MODE | `true` | `false` |
| URL Checkout | sandbox.mercadopago.com.mx | www.mercadopago.com.mx |
| Tarjetas | Tarjetas de prueba ficticias | Tarjetas reales |
| Dinero | NO se cobra | SÍ se cobra REAL |
| Notificaciones | Pueden no llegar | Llegan normalmente |

---

## ⚠️ Advertencias de Seguridad

### ✅ HACER:
- [x] Mantener `mercadopago-config.php` fuera de `public_html`
- [x] Establecer permisos `644` en archivos de configuración
- [x] Usar HTTPS (ya lo tienes)
- [x] Borrar archivos de prueba después de usarlos
- [x] No compartir credenciales por email/chat

### ❌ NO HACER:
- [ ] ~~Dejar archivos de test en producción~~
- [ ] ~~Subir credenciales a Git/GitHub~~
- [ ] ~~Establecer permisos `777`~~
- [ ] ~~Exponer Access Token en JavaScript~~
- [ ] ~~Usar credenciales de producción en desarrollo~~

---

## 📊 Estructura de Archivos Final

```
📁 /home/inedito/
├── private/                           ← Carpeta privada (fuera de la web)
│   └── config/
│       └── mercadopago-config.php     ✅ Credenciales de producción
│
└── public_html/
    └── cdn.inedito.digital/
        └── mercadopago/
            ├── create-preference.php   ✅ Crea preferencias de pago
            └── webhook.php             ✅ Recibe notificaciones
```

**O si usaste la ubicación simple:**

```
📁 /home/inedito/public_html/cdn.inedito.digital/mercadopago/
├── create-preference.php              ✅ Crea preferencias de pago
├── mercadopago-config.php            ⚠️ Credenciales (menos seguro aquí)
└── webhook.php                        ✅ Recibe notificaciones
```

---

## 🎉 ¡Listo para Producción!

Cuando hayas marcado TODO el checklist:

✅ Tu sitio está configurado para aceptar pagos REALES
✅ Los clientes pueden comprar con Mercado Pago
✅ El dinero llegará a tu cuenta de Mercado Pago
✅ Las credenciales están seguras

---

## 📞 ¿Problemas?

### Error al pagar:
1. Revisa la consola del navegador (F12)
2. Desactiva bloqueadores de anuncios
3. Verifica que `test-config-produccion.php` muestre "PRODUCCIÓN"
4. Revisa los logs de error en cPanel

### No redirige a Mercado Pago:
1. Verifica que `create-preference.php` cargue el config correcto
2. Revisa que las credenciales sean de producción
3. Verifica los headers CORS en `create-preference.php`

### Aparece "Config file not found":
1. Verifica la ruta en `create-preference.php`
2. Verifica que el archivo exista en cPanel
3. Verifica los permisos (644)

---

## 📚 Documentos Relacionados

- `INSTRUCCIONES-CREDENCIALES-PRODUCCION.md` - Guía detallada paso a paso
- `SOLUCION-ERROR-BLOQUEADOR.md` - Solución a errores de bloqueadores
- `mercadopago-config-PRODUCCION.php` - Archivo listo para subir
- `test-config-produccion.php` - Archivo para verificar configuración

---

**Última actualización:** 21 de enero de 2026
**Versión:** 1.0 - Producción
