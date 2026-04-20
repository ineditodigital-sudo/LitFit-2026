# ❌ Error: "Failed to fetch" - SOLUCIÓN

## 🔍 ¿Por qué aparece este error?

El error **"TypeError: Failed to fetch"** en Mercado Pago significa que el frontend **NO puede conectarse** con el backend PHP. 

Esto es **NORMAL** si aún **NO has subido los archivos PHP** a cPanel.

---

## ✅ SOLUCIÓN: Sube los archivos PHP a cPanel

### Estado actual:
- ❌ Backend de Mercado Pago: **NO disponible** (archivos PHP no subidos)
- ✅ PayPal: **Funcionando** correctamente
- ✅ EmailJS: **Funcionando** correctamente
- ✅ Sistema de envíos: **Funcionando** correctamente

---

## 🚀 PASOS PARA SOLUCIONAR (10 minutos)

### PASO 1: Descarga los archivos PHP

Tienes 2 archivos que necesitas subir a cPanel:

1. **mercadopago-config.php** (Configuración con credenciales)
2. **create-preference.php** (API que crea los pagos)

**Ubicación:** Ya están creados en este proyecto, búscalos en la carpeta raíz.

---

### PASO 2: Accede a cPanel

1. Ve a: `https://inedito.digital:2083`
2. Inicia sesión con tus credenciales
3. Busca **"File Manager"** (Administrador de archivos)
4. Haz clic para abrir

---

### PASO 3: Crea las carpetas necesarias

#### Carpeta 1: Configuración (PRIVADA)

```
Ruta: /home/inedito/private/config/

Pasos:
1. En File Manager, navega a: /home/inedito/
2. Si NO existe "private", créala (clic en "+ Folder")
3. Entra a "private"
4. Si NO existe "config", créala
```

#### Carpeta 2: API (PÚBLICA)

```
Ruta: /home/inedito/public_html/cdn/mercadopago/

Pasos:
1. Navega a: /home/inedito/public_html/cdn/
2. Si NO existe "mercadopago", créala
```

---

### PASO 4: Sube los archivos

#### Archivo 1: mercadopago-config.php

```
Ubicación: /home/inedito/private/config/

1. Navega a esa carpeta en File Manager
2. Clic en "Upload" (Subir)
3. Selecciona: mercadopago-config.php
4. Espera a que termine
5. ✅ Listo
```

#### Archivo 2: create-preference.php

```
Ubicación: /home/inedito/public_html/cdn/mercadopago/

1. Navega a esa carpeta en File Manager
2. Clic en "Upload"
3. Selecciona: create-preference.php
4. Espera a que termine
5. ✅ Listo
```

---

### PASO 5: Verifica los permisos

Para cada archivo PHP:

1. Haz clic derecho en el archivo
2. Selecciona **"Permissions"** (Permisos)
3. Configura: **644** (rw-r--r--)
4. Clic en **"Change Permissions"**

---

### PASO 6: Prueba que funciona

#### Opción A: Verificar URL directamente

1. Abre tu navegador
2. Ve a: `https://cdn.inedito.digital/mercadopago/create-preference.php`
3. Deberías ver un mensaje JSON (aunque sea de error, significa que está accesible)

**Resultado esperado:**
```json
{"success":false,"message":"Método no permitido. Use POST."}
```

✅ Esto es **NORMAL** - El archivo está funcionando, solo rechaza peticiones GET directas.

---

#### Opción B: Usar la herramienta de prueba

1. Abre: **verificar-urls-mercadopago.html** en tu navegador
2. Espera unos segundos
3. Deberías ver: ✅ **"Funcionando correctamente"**

---

### PASO 7: Haz una compra de prueba

Ahora que el backend está configurado:

1. Ve a: **https://litfit.inedito.digital**
2. Agrega productos al carrito
3. Ve al checkout
4. Llena el formulario completo
5. Selecciona **"Mercado Pago"**
6. Clic en **"Pagar con Mercado Pago"**

Deberías ser redirigido a Mercado Pago ✅

---

## 🧪 TARJETA DE PRUEBA

Usa esta tarjeta de prueba en Mercado Pago:

```
Número: 5031 7557 3453 0604
Nombre: APRO
Fecha:  11/25
CVV:    123
DNI:    12345678
```

Esta tarjeta **aprobará** el pago automáticamente.

---

## 🔍 VERIFICACIÓN: ¿Funciona o no?

### ✅ SI FUNCIONA:

Cuando hagas clic en "Pagar con Mercado Pago":

1. Verás en la consola (F12):
   ```
   💾 Datos guardados con ID: LITFIT-1234567890-ABC123
   🚀 Conectando con backend de Mercado Pago...
   📍 URL: https://cdn.inedito.digital/mercadopago/create-preference.php
   📥 Respuesta del servidor: 200
   📦 Datos recibidos: {success: true, checkoutUrl: "..."}
   🔄 Redirigiendo a Mercado Pago...
   ```

2. Serás redirigido a Mercado Pago
3. Podrás completar el pago

---

### ❌ SI SIGUE SIN FUNCIONAR:

Si aún ves el error "Failed to fetch", verifica:

#### 1. ¿Los archivos están en las rutas correctas?

```
Verificar en cPanel:
✅ /home/inedito/private/config/mercadopago-config.php
✅ /home/inedito/public_html/cdn/mercadopago/create-preference.php
```

#### 2. ¿Los permisos son correctos?

```
Ambos archivos PHP deben tener permisos: 644
```

#### 3. ¿La URL es accesible?

```bash
Abre en navegador:
https://cdn.inedito.digital/mercadopago/create-preference.php

Si dice "404 Not Found" → El archivo NO está subido
Si muestra JSON → El archivo SÍ está subido ✅
```

#### 4. ¿Hay errores en el servidor?

```
En cPanel:
1. Ve a "Errors" o "Error Log"
2. Busca mensajes recientes
3. Busca palabras: "mercadopago", "create-preference", "PHP"
```

---

## 📞 AYUDA ADICIONAL

### Error específico: "Failed to fetch"

**Causa:** El servidor no responde  
**Solución:** Verifica que los archivos PHP estén subidos

### Error: "Error del servidor: 500"

**Causa:** Error en el código PHP  
**Solución:** Revisa los logs de error en cPanel

### Error: "No se recibió la URL de pago"

**Causa:** Las credenciales de Mercado Pago son incorrectas  
**Solución:** Verifica que las credenciales en `mercadopago-config.php` sean:
- Public Key: `TEST-cec7b3b0-43d7-4e14-bf86-0031029e83d5`
- Access Token: `TEST-2656381259343864-040222-1cd4c8ea4d69b0c72788a643b1b74915-198666053`

---

## 🎯 RESUMEN

| Problema | Solución |
|----------|----------|
| "Failed to fetch" | Sube los archivos PHP a cPanel |
| "404 Not Found" | Verifica las rutas de los archivos |
| "Error 500" | Revisa los logs de PHP en cPanel |
| "No se recibió URL" | Verifica las credenciales de MP |

---

## 📚 DOCUMENTACIÓN RELACIONADA

- **GUIA-RAPIDA-MERCADOPAGO.md** - Pasos de instalación
- **INSTRUCCIONES-MERCADOPAGO.md** - Guía completa
- **LISTO-PARA-SUBIR.md** - Resumen ejecutivo

---

## ✅ CHECKLIST

Marca cuando completes cada paso:

- [ ] Descargué los archivos PHP
- [ ] Accedí a cPanel
- [ ] Creé la carpeta `/private/config/`
- [ ] Creé la carpeta `/cdn/mercadopago/`
- [ ] Subí `mercadopago-config.php`
- [ ] Subí `create-preference.php`
- [ ] Configuré permisos a 644
- [ ] Verifiqué que la URL responde
- [ ] Hice una compra de prueba
- [ ] ✅ Mercado Pago funciona!

---

## 🎉 RESULTADO ESPERADO

Una vez que completes todos los pasos:

1. El botón "Pagar con Mercado Pago" **funcionará**
2. Serás **redirigido a Mercado Pago**
3. Podrás **completar el pago** con tarjeta de prueba
4. Regresarás a tu sitio con **confirmación de éxito**
5. Recibirás **email de confirmación**

---

**⏱️ Tiempo estimado:** 10-15 minutos  
**🎯 Dificultad:** Fácil  
**✅ Estado:** Listo para seguir los pasos

---

**¡Sigue los pasos de arriba y el error se solucionará! 🚀**
