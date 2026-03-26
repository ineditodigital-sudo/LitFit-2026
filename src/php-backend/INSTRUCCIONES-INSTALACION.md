# 📋 INSTRUCCIONES DE INSTALACIÓN - API DE ENVÍOS

## 🎯 Objetivo
Subir los archivos PHP a tu servidor cPanel para que la integración con enviosinternacionales.com funcione correctamente.

---

## 📁 Archivos a Subir

Tienes **2 archivos PHP** en esta carpeta:
1. ✅ `cotizar.php` - Crea cotizaciones de envío
2. ✅ `consultar-cotizacion.php` - Consulta estado de cotizaciones

---

## 🚀 PASOS PARA INSTALAR

### **1️⃣ Accede a tu cPanel**
   - URL: https://inedito.digital:2083 (o tu URL de cPanel)
   - Usuario: Tu usuario de cPanel
   - Contraseña: Tu contraseña de cPanel

### **2️⃣ Abre el Administrador de Archivos**
   - Busca "Administrador de archivos" o "File Manager"
   - Clic en "Administrador de archivos"

### **3️⃣ Navega a la carpeta correcta**
   Navega a:
   ```
   /home/inedito/public_html/cdn.inedito.digital/envios/
   ```

   Si la carpeta `envios/` NO existe:
   - Clic derecho → "Crear carpeta" → Nombrarla "envios"

### **4️⃣ Sube los archivos**
   - Estando en la carpeta `envios/`
   - Clic en "Cargar" (botón superior)
   - Selecciona los 2 archivos PHP:
     - `cotizar.php`
     - `consultar-cotizacion.php`
   - Espera a que terminen de subirse

### **5️⃣ Verifica los permisos**
   Para cada archivo:
   - Clic derecho → "Cambiar permisos"
   - Asegúrate que tengan permisos **644** (rw-r--r--)
   - ✅ Lectura para propietario, grupo y otros
   - ✅ Escritura solo para propietario

### **6️⃣ Verifica las URLs**
   Los archivos deberían estar accesibles en:
   - ✅ https://cdn.inedito.digital/envios/cotizar.php
   - ✅ https://cdn.inedito.digital/envios/consultar-cotizacion.php

---

## 🧪 PROBAR LA INSTALACIÓN

### **Opción 1: Desde el navegador**
Abre esta URL en tu navegador:
```
https://cdn.inedito.digital/envios/consultar-cotizacion.php
```

**Respuesta esperada:**
```json
{"error":"ID de cotización requerido"}
```

✅ Si ves este mensaje = **¡Instalación correcta!**

### **Opción 2: Desde la consola del navegador**
1. Abre tu sitio: https://litfitmexico.com
2. Presiona F12 (abrir consola)
3. Ve a la pestaña "Console"
4. Pega este código:

```javascript
fetch('https://cdn.inedito.digital/envios/consultar-cotizacion.php', {
  method: 'GET'
})
.then(res => res.json())
.then(data => console.log('✅ API funciona:', data))
.catch(err => console.error('❌ Error:', err));
```

**Respuesta esperada:**
```
✅ API funciona: {error: "ID de cotización requerido"}
```

---

## ⚠️ PROBLEMA CON PERMISOS DE API

**IMPORTANTE:** Los archivos PHP están correctos, pero necesitas resolver el problema de permisos con enviosinternacionales.com:

### 🔍 **Diagnóstico actual:**
- ✅ Token OAuth2 se obtiene correctamente (HTTP 200)
- ❌ Crear órdenes falla con HTTP 401
- ⚠️ Esto significa que tu cuenta NO tiene permisos para crear envíos

### 📧 **SOLUCIÓN: Contactar a soporte**

Envía este email a: **soporte@enviosinternacionales.com**

```
Asunto: Activar permisos para crear cotizaciones vía API

Hola,

Tengo una integración OAuth2 con su API y puedo autenticarme correctamente,
pero cuando intento crear cotizaciones (POST /api/v1/quotations) obtengo 
error 401.

Client ID: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0

¿Podrían activar los permisos necesarios para:
- Crear cotizaciones (POST /api/v1/quotations)
- Consultar cotizaciones (GET /api/v1/quotations/:id)
- Crear órdenes de envío (POST /api/v1/orders)

Es para mi sitio de e-commerce: https://litfitmexico.com

Gracias
```

---

## 📊 MIENTRAS TANTO: SISTEMA DE FALLBACK

Tu sitio YA está funcionando con:

### ✅ **Sistema actual (activado):**
1. Intenta obtener tarifas reales de envíos
2. Si falla, usa tarifas estáticas aproximadas
3. Los pagos funcionan 100% (PayPal + Mercado Pago)
4. Los emails se envían correctamente
5. Las órdenes se procesan

### 🔄 **Cuando se active tu cuenta:**
1. Las tarifas serán 100% reales y precisas
2. Se crearán guías automáticamente
3. Los clientes recibirán número de tracking

---

## 🆘 SOPORTE

### Si los archivos NO funcionan:

**Revisa:**
1. ✅ Los archivos están en `/public_html/cdn.inedito.digital/envios/`
2. ✅ Los permisos son 644
3. ✅ La carpeta `envios/` tiene permisos 755
4. ✅ No hay `.htaccess` bloqueando PHP

**Logs de error:**
Para ver errores, accede a:
```
/home/inedito/public_html/cdn.inedito.digital/error_log
```

O en cPanel:
- Métricas → Errores

---

## ✅ CHECKLIST FINAL

- [ ] Archivos subidos a `/public_html/cdn.inedito.digital/envios/`
- [ ] Permisos 644 en ambos archivos
- [ ] Probado desde el navegador (respuesta JSON)
- [ ] Email enviado a soporte de enviosinternacionales.com
- [ ] Tu sitio funciona correctamente con el sistema de fallback

---

**¿Listo?** Sube los archivos y avísame cuando esté hecho para probar juntos. 🚀
