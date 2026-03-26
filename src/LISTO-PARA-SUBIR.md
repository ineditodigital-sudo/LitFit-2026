# 🚀 ARCHIVO LISTO PARA SUBIR A CPANEL

## ✅ CONFIGURACIÓN COMPLETADA

El archivo `crear-orden-envios.php` está **100% configurado** con:

### 🔑 **Bearer Token:**
```
ZpvirypJCMHAy6f8uT4P25hP3yg4n0e1iaTM2JP8RJXKxMcuTQUxXZB1AxQMO7y9PdxzAme9cvTL7qsJ4CNv+NLDzVPmB00Qt71eYiu21oYwaDYI6eq6jMsrPNbZIJIYo36AYDS+/XsKP3yLoMDwNJ8/VX2nnzZcrgxENXv5Nd1smXi8eMtuWe84WcjW4HdU3RSwgQ5olPZDVw+b/cer6Ecrm1k+NEfI3RNPkfCE0em1ZVTdr8oZjyuuP9ynNdZJz8zlyFdvjdZc5ZOMJStm8lujXd9AdsxhyEizg9TRz4mPH9zZrba61DM8kGkav+NTMIWR97LUNwq8jQ5mW1JrIhq8hOvp76UEbYaUm25UTW9C0zOZl0VKUpGdjuhKS+rDMQM=--uOnLHR5cf8ouoIpM--Hym02qCUmXNJhgixmMaT3A==
```

### 📍 **Datos de origen (temporales):**
- Nombre: LITFIT - Almacén Principal
- Dirección: Av. Constitución 123, Col. Centro
- Ciudad: Monterrey
- Estado: Nuevo León
- CP: 64000
- Teléfono: 8112345678

### 📧 **Email de notificaciones:**
- ricoro845@gmail.com ✅

### 🌐 **Endpoint API:**
- `https://app.enviosinternacionales.com/api/v1/orders`

---

## 📤 PASOS PARA SUBIR:

### **1. Descarga el archivo**
- En Figma Make, descarga `crear-orden-envios.php`

### **2. Sube a cPanel**
1. Entra a cPanel de tu hosting
2. Ve a **"Administrador de archivos"** (File Manager)
3. Navega a: `/public_html/cdn.inedito.digital/envios/`
4. **Sube** el archivo
5. **Renómbralo** a: `crear-orden.php` (borra el `-envios`)
6. **Permisos:** 644 (click derecho → Change Permissions → 644)

### **3. Verifica que el archivo esté accesible**
- URL: `https://cdn.inedito.digital/envios/crear-orden.php`

---

## 🧪 PROBAR LA INTEGRACIÓN:

### **Opción A: Simulador de Pagos** (Recomendado)
```
https://litfit.inedito.digital/test-payment
```

1. Haz una compra simulada
2. Revisa los **logs de consola**
3. Busca esta información:

**✅ SI FUNCIONA (API):**
```
📥 HTTP Code: 200 o 201
✅ Envío creado exitosamente
📡 Método: API
🎉 Tracking Number: MX123456789
```

**❌ SI NO FUNCIONA (Fallback Email):**
```
📥 HTTP Code: 401, 404, o 400
⚠️ Método: EMAIL_FALLBACK
📧 Email enviado a ricoro845@gmail.com
```

---

## 📊 RESULTADOS ESPERADOS:

### **🎯 CASO 1: ÉXITO TOTAL (API Funciona)**

**Logs en el simulador:**
```
✅ Orden creada en Envíos Internacionales
📡 Método: API
📮 Tracking Number: MX123456789
```

**Lo que pasa:**
1. ✅ Pago procesado
2. ✅ Email de confirmación enviado al cliente
3. ✅ **Orden creada AUTOMÁTICAMENTE en enviosinternacionales.com**
4. ✅ Aparece en tu panel con todos los datos listos
5. ✅ Carrito limpiado

**→ Solo tienes que entrar a enviosinternacionales.com y verás la orden lista** 🎉

---

### **⚠️ CASO 2: FALLBACK (API no funciona)**

**Logs en el simulador:**
```
⚠️ Orden creada en Envíos Internacionales
📡 Método: EMAIL_FALLBACK
📧 Email enviado a ricoro845@gmail.com
```

**Lo que pasa:**
1. ✅ Pago procesado
2. ✅ Email de confirmación enviado al cliente
3. ⚠️ La API rechazó la petición
4. ✅ **Email enviado a ricoro845@gmail.com** con todos los datos
5. ✅ Carrito limpiado

**→ Recibirás un email con:**
- Nombre y dirección del destinatario
- Productos a enviar
- Código postal
- Total pagado
- Método de pago

**→ Tendrás que crear la orden manualmente en enviosinternacionales.com**

---

## 🔍 POSIBLES ERRORES Y SOLUCIONES:

### **Error 401 (No autorizado)**
**Causa:** Token incorrecto, expirado o sin permisos

**Solución:**
1. Verifica que copiaste el token completo (es muy largo)
2. Genera un nuevo token en enviosinternacionales.com
3. Verifica que el token tenga permisos para "crear órdenes"

---

### **Error 404 (No encontrado)**
**Causa:** El endpoint `/api/v1/orders` no existe

**Posibles endpoints correctos:**
- `/api/v1/ordenes`
- `/api/v1/order`
- `/api/v1/shipments`
- `/api/v1/create-order`

**Solución:**
Necesitas verificar en la documentación de enviosinternacionales.com cuál es el endpoint correcto.

---

### **Error 400 (Datos incorrectos)**
**Causa:** La estructura de datos que envío no coincide con lo que esperan

**Solución:**
Necesitas la documentación de la API para ver qué campos requieren exactamente.

---

### **No llega el email de fallback**
**Causa:** La función `mail()` de PHP está deshabilitada en el servidor

**Solución:**
1. Verifica la carpeta de spam en ricoro845@gmail.com
2. Si no llega nada, avísame y configuro EmailJS para el fallback

---

## 📞 SIGUIENTE PASO:

1. **Sube el archivo** como te indiqué arriba
2. **Prueba con el simulador:** `https://litfit.inedito.digital/test-payment`
3. **Copia TODOS los logs** que aparezcan en consola
4. **Pégalos aquí** para que vea exactamente qué pasó

---

## 🎯 LO QUE BUSCAMOS VER:

**Si sale esto:**
```
📥 HTTP Code: 200
✅ Envío creado exitosamente
📡 Método: API
```

**→ ¡FUNCIONÓ! 🎉** La orden se creó automáticamente en enviosinternacionales.com

---

**Si sale esto:**
```
📥 HTTP Code: 401
⚠️ Método: EMAIL_FALLBACK
```

**→ Hay que ajustar algo** (token, endpoint o estructura de datos)

---

¡Prueba y me cuentas qué sale! 🚀
