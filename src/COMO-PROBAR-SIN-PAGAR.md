# 🧪 CÓMO PROBAR EL SISTEMA SIN PAGAR

## ✅ SIMULADOR DE PAGOS CREADO

He creado una página especial que **simula un pago exitoso** y ejecuta **TODO el flujo real** sin necesidad de gastar dinero.

---

## 🚀 CÓMO USARLO (3 PASOS)

### **PASO 1: Agregar productos al carrito**

1. Ve a: https://litfit.inedito.digital
2. Agrega cualquier producto al carrito
3. Puedes agregar el "PRODUCTO DE PRUEBA" ($10 MXN) o cualquier otro

---

### **PASO 2: Ir a la página de prueba**

**Opción A - URL directa:**
```
https://litfit.inedito.digital/test-payment
```

**Opción B - Desde el navegador:**
1. Ve a: https://litfit.inedito.digital
2. En la barra de direcciones, agrega: `/test-payment`
3. Enter

---

### **PASO 3: Simular el pago**

1. **Completa el formulario** con datos de prueba
   - Ya viene pre-rellenado con datos de ejemplo
   - Puedes cambiarlos si quieres

2. **Click en el botón amarillo:** "SIMULAR PAGO EXITOSO"

3. **Espera unos segundos** mientras se ejecuta el flujo

4. **Verás los logs en tiempo real:**
   ```
   [17:30:45] 📦 Orden generada: LITFIT-1737489045123
   [17:30:45] 💰 Total: $1049.00 MXN
   [17:30:46] 📧 PASO 1: Enviando email de confirmación...
   [17:30:47] ✅ Email de confirmación enviado correctamente
   [17:30:47] 📦 PASO 2: Creando orden en enviosinternacionales.com...
   [17:30:48] ✅ Orden creada en Envíos Internacionales
   [17:30:48] 📮 Tracking Number: MX123456789
   [17:30:49] 🧹 PASO 3: Limpiando carrito...
   [17:30:50] ✅ Carrito limpiado
   [17:30:50] 🎉 SIMULACIÓN COMPLETADA EXITOSAMENTE
   ```

---

## ✅ LO QUE SE EJECUTA (TODO REAL)

### 1. ✅ **Email de confirmación** (REAL)
- Se envía a tu email: `reenviadorlitfit@inedito.digital`
- Usa EmailJS con tus credenciales reales
- Incluye todos los datos del pedido

### 2. ✅ **Creación en Envíos Internacionales** (REAL)
- Llama a la API REAL: `https://cdn.inedito.digital/envios/crear-orden.php`
- Usa tus credenciales de enviosinternacionales.com
- Crea el envío en su sistema (o envía email si falla)

### 3. ✅ **Limpia el carrito** (REAL)
- Borra los productos del carrito
- Igual que después de un pago real

### 4. ❌ **NO cobra dinero** (SIMULADO)
- No se conecta a Mercado Pago
- No se conecta a PayPal
- Es solo una simulación del pago

---

## 🔍 VERIFICAR QUE FUNCIONÓ

### **A) Revisar emails**

Deberías recibir un email en: `reenviadorlitfit@inedito.digital`

Con el asunto:
```
Nueva Orden - LITFIT - #LITFIT-1234567890
```

---

### **B) Revisar logs en cPanel**

1. **Accede a cPanel:**
   - URL: https://inedito.digital:2083

2. **Abre el Administrador de Archivos**

3. **Navega a:**
   ```
   /home/inedito/public_html/cdn.inedito.digital/envios/
   ```

4. **Abre el archivo:**
   ```
   ordenes-log.txt
   ```

5. **Deberías ver algo como:**
   ```
   [2026-01-21 17:30:50] Orden: LITFIT-1234567890 | Cliente: Juan Pérez | Total: $1049.00 | Método Pago: 🧪 SIMULACIÓN DE PAGO | Método Envío: API | Tracking: MX123456789
   ```

---

### **C) Revisar en enviosinternacionales.com** (si la API funcionó)

1. Inicia sesión en: https://app.enviosinternacionales.com
2. Ve a "Envíos" o "Shipments"
3. Busca tu orden: `LITFIT-1234567890`
4. Debería aparecer con todos los datos

**Si NO aparece:**
- Es normal si la API aún no está configurada correctamente
- El sistema enviará un email de fallback automáticamente
- Revisa tu bandeja de entrada

---

### **D) Revisar logs en el navegador**

1. Abre la consola del navegador: **F12**
2. Ve a la pestaña **Console**
3. Deberías ver los mismos logs que aparecen en pantalla

---

## 🎯 VENTAJAS DE ESTE MÉTODO

✅ **No gastas dinero** - Es completamente gratis  
✅ **Flujo 100% real** - Ejecuta todo excepto el cobro  
✅ **Logs en tiempo real** - Ves exactamente qué pasa  
✅ **Fácil de usar** - Solo llena el formulario y click  
✅ **Repetible** - Puedes probar las veces que quieras  

---

## 🔧 CONFIGURAR ANTES DE PROBAR

Asegúrate de tener configurado:

1. ✅ Archivo `crear-orden.php` subido a cPanel
2. ✅ Datos de origen editados (dirección de almacén)
3. ✅ Email de fallback configurado
4. ✅ Permisos correctos (644)

Si no lo has hecho, sigue: `/INTEGRACION-ENVIOS-COMPLETA.md`

---

## 🆘 PROBLEMAS COMUNES

### "No se puede acceder a /test-payment"

**Solución:** Verifica que la URL sea:
```
https://litfit.inedito.digital/test-payment
```

Sin espacios, sin mayúsculas.

---

### "Carrito vacío"

**Solución:** Primero agrega productos al carrito desde la tienda.

---

### "Error al enviar email"

**Causa:** Credenciales de EmailJS incorrectas.

**Solución:** Verifica en `test-payment.tsx` línea 60:
```typescript
emailjs.init('hHdYJvPh0oxZZkFiL');
```

---

### "Error al crear orden en Envíos Internacionales"

**Causas posibles:**
1. El archivo `crear-orden.php` no está subido a cPanel
2. La URL está mal configurada
3. Datos de origen no configurados
4. Credenciales de API incorrectas

**Solución:** Revisa los logs en pantalla para ver el error específico.

---

## 📊 EJEMPLO DE SALIDA EXITOSA

Cuando todo funcione correctamente, verás esta pantalla:

```
🎉 ¡Simulación Exitosa!

✅ Email de confirmación enviado
   Al cliente y a tu equipo

✅ Orden creada en Envíos Internacionales
   Vía API o email de fallback

✅ Carrito limpiado
   El flujo está completo
```

Y los logs mostrarán:

```
[17:30:45] 📦 Orden generada: LITFIT-1234567890
[17:30:45] 💰 Total: $1049.00 MXN
[17:30:45] 📦 Productos: 1 items
[17:30:46] 📧 PASO 1: Enviando email de confirmación al cliente...
[17:30:47] ✅ Email de confirmación enviado correctamente
[17:30:47] 📦 PASO 2: Creando orden en enviosinternacionales.com...
[17:30:47] 📤 Enviando datos a: https://cdn.inedito.digital/envios/crear-orden.php
[17:30:48] ✅ Orden creada en Envíos Internacionales
[17:30:48] 📮 Tracking Number: MX123456789
[17:30:48] 📡 Método: API
[17:30:49] 🧹 PASO 3: Limpiando carrito...
[17:30:50] ✅ Carrito limpiado

🎉 SIMULACIÓN COMPLETADA EXITOSAMENTE
✅ Email enviado
✅ Orden creada en Envíos Internacionales
✅ Carrito limpiado
```

---

## 🔄 PROBAR DE NUEVO

Si quieres hacer otra prueba:

1. **Agrega productos** al carrito de nuevo
2. **Ve a:** `/test-payment`
3. **Cambia los datos** si quieres
4. **Click en:** "SIMULAR PAGO EXITOSO"

---

## ⚠️ IMPORTANTE

**Esta página es SOLO para pruebas.**

- ✅ Úsala para verificar que todo funciona
- ✅ Úsala para hacer debugging
- ❌ NO la compartas con clientes
- ❌ NO la uses en producción

Para ventas reales, los clientes deben usar el checkout normal con Mercado Pago o PayPal.

---

## 📞 SIGUIENTE PASO

Una vez que compruebes que todo funciona con el simulador:

1. **Configura los datos de origen** en `crear-orden.php` (tu dirección real)
2. **Verifica que recibas los emails**
3. **Verifica que se creen las órdenes en enviosinternacionales.com**
4. **Haz una compra REAL de $10 MXN** con Mercado Pago para confirmar

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0 - Simulador de Pagos sin costo  
**Estado:** ✅ LISTO PARA USAR
