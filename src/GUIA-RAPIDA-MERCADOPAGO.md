# ⚡ GUÍA RÁPIDA: Mercado Pago en 5 minutos

## 🎯 Lo que vas a hacer

Subir 2 archivos PHP a cPanel para que Mercado Pago funcione con tus credenciales de prueba.

---

## 📦 ARCHIVOS QUE NECESITAS

| # | Archivo | ¿Para qué sirve? |
|---|---------|------------------|
| 1 | `mercadopago-config.php` | Guarda tus credenciales de forma segura |
| 2 | `create-preference.php` | Crea los pagos en Mercado Pago |
| 3 | `webhook.php` | *(Opcional)* Recibe notificaciones de pagos |

---

## 🚀 INSTALACIÓN EN 3 PASOS

### PASO 1: Accede a cPanel

1. Ve a: `https://inedito.digital:2083`
2. Inicia sesión
3. Busca **"File Manager"** (Administrador de archivos)
4. Haz clic para abrir

---

### PASO 2: Crea las carpetas necesarias

#### 📁 Carpeta 1: Para la configuración (privada)

```
Ubicación: /home/inedito/private/config/

Pasos:
1. Navega a: /home/inedito/
2. Si NO existe "private", créala
3. Entra a "private"
4. Si NO existe "config", créala
5. Listo ✅
```

#### 📁 Carpeta 2: Para la API (pública)

```
Ubicación: /home/inedito/public_html/cdn/mercadopago/

Pasos:
1. Navega a: /home/inedito/public_html/cdn/
2. Si NO existe "mercadopago", créala
3. Listo ✅
```

---

### PASO 3: Sube los archivos

#### ⬆️ Subir archivo 1: mercadopago-config.php

1. Navega a: `/home/inedito/private/config/`
2. Clic en **"Upload"** (Subir)
3. Selecciona: `mercadopago-config.php`
4. Espera a que termine
5. ✅ Listo

#### ⬆️ Subir archivo 2: create-preference.php

1. Navega a: `/home/inedito/public_html/cdn/mercadopago/`
2. Clic en **"Upload"**
3. Selecciona: `create-preference.php`
4. Espera a que termine
5. ✅ Listo

#### ⬆️ (Opcional) Subir archivo 3: webhook.php

1. En la misma carpeta: `/home/inedito/public_html/cdn/mercadopago/`
2. Clic en **"Upload"**
3. Selecciona: `webhook.php`
4. Espera a que termine
5. ✅ Listo

---

## ✅ VERIFICACIÓN RÁPIDA

### Opción 1: Prueba automática

1. Abre el archivo: `test-mercadopago-connection.html` en tu navegador
2. Clic en **"Probar Conexión con Backend"**
3. Deberías ver: ✅ **"¡Conexión exitosa!"**

### Opción 2: Prueba manual

1. Abre tu navegador
2. Ve a: `https://cdn.inedito.digital/mercadopago/create-preference.php`
3. Deberías ver un mensaje JSON (aunque sea de error, significa que está accesible)

---

## 🧪 HACER COMPRA DE PRUEBA

### 1. Ve a tu tienda
```
https://litfit.inedito.digital
```

### 2. Agrega productos al carrito
- Cualquier producto de LITFIT

### 3. Ve al checkout
- Llena TODOS los campos del formulario

### 4. Selecciona Mercado Pago
- Clic en el botón azul de Mercado Pago

### 5. Paga con tarjeta de prueba

```
╔════════════════════════════════════╗
║  TARJETA DE PRUEBA                 ║
╠════════════════════════════════════╣
║  Número: 5031 7557 3453 0604       ║
║  Nombre: APRO                      ║
║  Fecha:  11/25                     ║
║  CVV:    123                       ║
║  DNI:    12345678                  ║
╚════════════════════════════════════╝
```

### 6. Verifica el resultado

Después de pagar, deberías:
- ✅ Ser redirigido a tu sitio
- ✅ Ver la pantalla de "¡Pago Exitoso!"
- ✅ Recibir un email de confirmación
- ✅ Ver el carrito vacío

---

## 🎨 RESULTADOS ESPERADOS

### ✅ SI TODO FUNCIONA:

```
1. Usuario paga con tarjeta de prueba
   ↓
2. Mercado Pago procesa el pago
   ↓
3. Redirige a: /payment-success-mp
   ↓
4. Muestra: "¡Pago Exitoso!" 🎉
   ↓
5. Envía email de confirmación 📧
   ↓
6. Limpia el carrito 🛒
```

### ❌ SI HAY ERROR:

1. **Error de conexión:**
   - Verifica que los archivos estén en las rutas correctas

2. **Error de credenciales:**
   - Abre `mercadopago-config.php` y verifica las claves

3. **Error de permisos:**
   - Configura permisos 644 en ambos archivos PHP

---

## 📍 RESUMEN DE UBICACIONES

| Archivo | Ruta completa en cPanel |
|---------|-------------------------|
| Configuración | `/home/inedito/private/config/mercadopago-config.php` |
| API | `/home/inedito/public_html/cdn/mercadopago/create-preference.php` |
| Webhook | `/home/inedito/public_html/cdn/mercadopago/webhook.php` |

| Frontend | URL |
|----------|-----|
| Tu tienda | `https://litfit.inedito.digital` |
| API backend | `https://cdn.inedito.digital/mercadopago/create-preference.php` |

---

## 🔐 CREDENCIALES CONFIGURADAS

```
Tipo:         TEST (Modo de prueba)
Public Key:   TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5
Access Token: TEST-2656381259343864-040222-...
```

⚠️ Estas son credenciales de **PRUEBA**. No se procesará dinero real.

---

## 🆘 AYUDA RÁPIDA

### Problema 1: "No se puede conectar con el backend"
**Solución:** Verifica que `create-preference.php` esté en `/public_html/cdn/mercadopago/`

### Problema 2: "Error de configuración"
**Solución:** Verifica que `mercadopago-config.php` esté en `/private/config/`

### Problema 3: "Credenciales inválidas"
**Solución:** Abre `mercadopago-config.php` y verifica que las claves sean exactamente:
- `TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5`
- `TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053`

### Problema 4: "No redirige después del pago"
**Solución:** Espera unos segundos. Mercado Pago puede tardar en redirigir.

---

## 📞 CHECKLIST FINAL

Marca ✅ cuando completes cada paso:

- [ ] Creé la carpeta `/home/inedito/private/config/`
- [ ] Creé la carpeta `/home/inedito/public_html/cdn/mercadopago/`
- [ ] Subí `mercadopago-config.php` a `/private/config/`
- [ ] Subí `create-preference.php` a `/cdn/mercadopago/`
- [ ] (Opcional) Subí `webhook.php` a `/cdn/mercadopago/`
- [ ] Probé la conexión con `test-mercadopago-connection.html`
- [ ] Hice una compra de prueba
- [ ] Recibí email de confirmación
- [ ] El carrito se limpió después del pago

---

## 🎉 ¡YA ESTÁ!

Si completaste todos los pasos del checklist, **Mercado Pago está funcionando correctamente**.

Ahora puedes:
- ✅ Aceptar pagos de prueba
- ✅ Probar diferentes escenarios (aprobado, rechazado, pendiente)
- ✅ Cuando estés listo, cambiar a credenciales de producción

---

## 🚀 PRÓXIMOS PASOS

1. **Probar más escenarios:**
   - Pago aprobado (tarjeta APRO)
   - Pago rechazado (tarjeta OCHO)
   - Pago pendiente (tarjeta CONT)

2. **Configurar webhook en Mercado Pago:**
   - URL: `https://cdn.inedito.digital/mercadopago/webhook.php`

3. **Cuando todo funcione, pasar a producción:**
   - Obtener credenciales reales de Mercado Pago
   - Reemplazar en `mercadopago-config.php`
   - ¡Empezar a vender! 💰

---

**⏱️ Tiempo estimado:** 5-10 minutos  
**🎯 Dificultad:** Fácil  
**✅ Estado:** Listo para usar

---

## 📚 MÁS INFORMACIÓN

Si necesitas más detalles, consulta:
- `INSTRUCCIONES-MERCADOPAGO.md` - Guía completa paso a paso
- `RESUMEN-ARCHIVOS-MERCADOPAGO.md` - Descripción detallada de archivos
- `docs/SOLUCION-FINAL-MP.md` - Explicación técnica del sistema

---

**¡Éxito con tus ventas! 🚀**
