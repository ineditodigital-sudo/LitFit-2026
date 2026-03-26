# 🐛 DEBUGGING: Mercado Pago no envía email ni limpia carrito

## ✅ CAMBIOS REALIZADOS

### 1. **Mejoras en logging y manejo de errores**
- Agregué `console.log()` detallados en `/pages/payment-success-mp.tsx`
- Ahora muestra el mensaje de error específico en pantalla
- Logs con emojis para facilitar el seguimiento

### 2. **Página de prueba creada**
- Ruta: `https://litfit.inedito.digital/test-mp-data`
- Permite ver los datos guardados en localStorage
- Útil para verificar si los datos se están guardando correctamente

---

## 🧪 PASOS PARA DEBUGGING

### PASO 1: Verificar que se guardan los datos

1. **Ve al checkout:**
   ```
   https://litfit.inedito.digital/checkout
   ```

2. **Agrega productos y llena el formulario**

3. **Antes de hacer click en "Pagar con Mercado Pago":**
   - Abre la consola del navegador (F12)
   - Ve a la pestaña "Console"

4. **Click en "Pagar con Mercado Pago"**

5. **EN ESE MOMENTO (antes de que te redirija):**
   - Verifica en la consola si dice "Redirigiendo a Mercado Pago..."
   - Abre una **nueva pestaña** y ve a:
     ```
     https://litfit.inedito.digital/test-mp-data
     ```
   - Deberías ver los datos del pedido guardados

6. **Si NO ves datos:**
   - El problema está en el guardado (línea 190 de checkout.tsx)
   - Verifica la consola por errores de localStorage

---

### PASO 2: Completar el pago y verificar el procesamiento

1. **Completa el pago en Mercado Pago** con la tarjeta de prueba:
   ```
   Número: 4075 5957 1648 3764
   Nombre: APRO
   Fecha: 12/26
   CVV: 123
   DNI: 12345678
   ```

2. **Después de pagar, serás redirigido a:**
   ```
   https://litfit.inedito.digital/payment-success-mp
   ```

3. **INMEDIATAMENTE abre la consola del navegador (F12)**

4. **Busca los logs con emojis:**
   ```
   🔍 Iniciando proceso de confirmación...
   ✅ Datos del pedido encontrados: {...}
   📦 Número de orden generado: LITFIT-ABC123
   📧 Inicializando EmailJS...
   📧 Enviando email de confirmación...
   ✅ Email enviado exitosamente: {...}
   🛒 Limpiando carrito...
   🗑️ Limpiando localStorage...
   🎉 Proceso completado exitosamente
   ```

5. **Si ves un error:**
   - Busca el mensaje que empieza con `❌`
   - Anota el mensaje de error completo
   - También aparecerá en pantalla

---

## 🔍 POSIBLES ERRORES Y SOLUCIONES

### Error 1: "No se encontraron datos del pedido"

**Causa:** localStorage no tiene los datos guardados

**Solución:**
1. Verifica que el botón de Mercado Pago esté guardando los datos
2. Usa la página `/test-mp-data` ANTES de pagar para verificar
3. Revisa la consola por errores al hacer click en el botón

---

### Error 2: "Los datos del pedido están incompletos"

**Causa:** Algunos campos del formulario están vacíos

**Solución:**
1. Asegúrate de llenar TODOS los campos del formulario
2. Verifica que el carrito tenga productos
3. Usa `/test-mp-data` para ver qué datos faltan

---

### Error 3: Error de EmailJS

**Ejemplos:**
- `"The public key is required"`
- `"Service not found"`
- `"Template not found"`

**Solución:**

1. **Verifica las credenciales en `/pages/payment-success-mp.tsx`:**
   - Public Key: `hHdYJvPh0oxZZkFiL`
   - Service ID: `service_co0q90x`
   - Template ID: `template_yqda5vi`

2. **Ve a EmailJS Dashboard:**
   ```
   https://dashboard.emailjs.com/admin
   ```

3. **Verifica que el Template ID sea correcto:**
   - Email Services → service_co0q90x
   - Email Templates → Busca el template de pedidos
   - Copia el Template ID exacto

4. **Verifica que las variables del template coincidan:**
   - `customer_name`
   - `customer_email`
   - `customer_phone`
   - `shipping_address`
   - `order_items`
   - `subtotal`
   - `shipping`
   - `total`
   - `notes`
   - `payment_method`
   - `payment_id`
   - `to_email`

---

### Error 4: CORS o red

**Ejemplos:**
- `"Network error"`
- `"CORS blocked"`
- `"Failed to fetch"`

**Solución:**
1. Verifica tu conexión a internet
2. Intenta en modo incógnito
3. Limpia el caché del navegador

---

## 📋 CHECKLIST DE VERIFICACIÓN

Antes de reportar el problema, verifica:

- [ ] El backend PHP tiene las URLs correctas
- [ ] localStorage guarda los datos (usa `/test-mp-data`)
- [ ] El formulario está completamente lleno
- [ ] Las credenciales de EmailJS son correctas
- [ ] El Template ID existe en EmailJS
- [ ] La consola del navegador muestra los logs
- [ ] No hay errores en la consola antes del pago

---

## 🆘 REPORTAR ERROR

Si después de todo esto sigue sin funcionar, reporta:

1. **Captura de pantalla** de la consola del navegador (F12 → Console)
2. **Mensaje de error** que aparece en pantalla
3. **Datos de `/test-mp-data`** (screenshot o copiar/pegar)
4. **¿En qué paso falla?**
   - ¿Al guardar datos? (antes de pagar)
   - ¿Al enviar email? (después de pagar)
   - ¿Al limpiar carrito? (después del email)

---

## 🎯 FLUJO COMPLETO ESPERADO

```
1. Usuario llena formulario ✅
2. Click en "Pagar con Mercado Pago" ✅
3. Se guardan datos en localStorage ✅
   → Verificar con /test-mp-data
4. Redirige a Mercado Pago ✅
5. Usuario paga ✅
6. Mercado Pago redirige a /payment-success-mp ✅
7. Se leen datos de localStorage ✅
   → Log: "Datos del pedido encontrados"
8. Se inicializa EmailJS ✅
   → Log: "Inicializando EmailJS"
9. Se envía email ✅
   → Log: "Email enviado exitosamente"
10. Se limpia carrito ✅
    → Log: "Limpiando carrito"
11. Se limpia localStorage ✅
    → Log: "Limpiando localStorage"
12. Se muestra pantalla de éxito ✅
    → Pantalla: "¡Pago Exitoso!"
```

---

**Actualización:** Diciembre 2024
