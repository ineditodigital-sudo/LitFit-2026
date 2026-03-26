# 💙 Guía Rápida: Configuración de PayPal para LITFIT

¡PayPal ya está integrado en tu sitio! Solo necesitas configurar tus credenciales.

---

## ✅ Lo que ya está hecho

- ✅ SDK de PayPal instalado (`@paypal/react-paypal-js`)
- ✅ PayPalScriptProvider configurado en App.tsx
- ✅ Botones de PayPal integrados en el checkout
- ✅ Integración con EmailJS para confirmaciones
- ✅ Manejo completo del flujo de pago

---

## 🚀 Pasos para activar PayPal

### Paso 1: Crear cuenta de desarrollador PayPal

1. Ve a [https://developer.paypal.com/](https://developer.paypal.com/)
2. Haz clic en **"Log in to Dashboard"**
3. Si no tienes cuenta, crea una cuenta de PayPal Business (gratis)

### Paso 2: Obtener Client ID

1. Una vez en el Dashboard, ve a **"Apps & Credentials"**
2. En la parte superior, verás dos pestañas:
   - **Sandbox** (para pruebas)
   - **Live** (para producción)
3. Empieza con **Sandbox** para hacer pruebas
4. En la sección "REST API apps", busca **"Default Application"** o crea una nueva app
5. Haz clic en la app y copia el **"Client ID"**

### Paso 3: Configurar en tu sitio

1. Crea un archivo `.env` en la raíz de tu proyecto (si no existe)
2. Pega tu Client ID:

```env
VITE_PAYPAL_CLIENT_ID=tu-sandbox-client-id-aqui
```

3. Guarda el archivo y reinicia tu servidor de desarrollo

---

## 🧪 Probar PayPal en Modo Sandbox

### Crear cuentas de prueba

1. En el Dashboard de PayPal, ve a **"Testing Tools" > "Sandbox Accounts"**
2. Verás cuentas de prueba pre-creadas:
   - **Business** (vendedor) - Para recibir pagos
   - **Personal** (comprador) - Para hacer pagos de prueba

3. Haz clic en "..." junto a una cuenta Personal y selecciona **"View/Edit Account"**
4. Copia el email y la contraseña

### Hacer una compra de prueba

1. En tu sitio, agrega productos al carrito
2. Ve al checkout y completa la información
3. En la sección de pago, verás los botones de PayPal
4. Haz clic en "PayPal" o "Debit or Credit Card"
5. Usa las credenciales de la cuenta de prueba Personal
6. Completa el pago

**Nota:** El dinero es ficticio, no se procesará ningún cargo real.

---

## 💰 Pasar a Producción (Pagos Reales)

### Cuando estés listo para recibir pagos reales:

1. **Verifica tu cuenta de PayPal Business:**
   - Ve a [https://www.paypal.com/businesswallet](https://www.paypal.com/businesswallet)
   - Completa la verificación de tu cuenta
   - Vincula una cuenta bancaria para recibir fondos

2. **Obtener credenciales de producción:**
   - Ve al Dashboard de desarrolladores
   - Cambia de "Sandbox" a **"Live"**
   - Copia el **Client ID de Live**

3. **Actualizar tu sitio:**
   - En tu archivo `.env`, reemplaza el Client ID de Sandbox por el de Live:
   ```env
   VITE_PAYPAL_CLIENT_ID=tu-live-client-id-aqui
   ```

4. **SSL/HTTPS:**
   - ⚠️ **IMPORTANTE:** Tu sitio DEBE tener certificado SSL (HTTPS) en producción
   - PayPal no funcionará con HTTP en modo Live

---

## 💡 Características Implementadas

### ✅ Lo que hace tu integración de PayPal:

1. **Múltiples métodos de pago:**
   - PayPal balance
   - Tarjetas de crédito/débito
   - Pay in 4 (Paga en 4 pagos sin intereses)

2. **Información de envío:**
   - Se envía automáticamente la dirección del cliente
   - Se incluyen todos los productos del carrito

3. **Confirmación por email:**
   - Después del pago exitoso, se envía un email de confirmación vía EmailJS
   - Incluye todos los detalles del pedido

4. **Limpieza del carrito:**
   - El carrito se limpia automáticamente después del pago exitoso

5. **Página de éxito:**
   - Muestra una confirmación visual con número de orden
   - Redirige al inicio después de completar

---

## 🔍 Verificar Transacciones

### Modo Sandbox:
- Ve al Dashboard > "Sandbox Accounts"
- Haz clic en la cuenta Business
- Ve a "Sandbox Site" para ver las transacciones simuladas

### Modo Live:
- Inicia sesión en tu cuenta de PayPal Business
- Ve a "Activity" para ver todas las transacciones reales
- Configura notificaciones por email para cada pago

---

## 🛠️ Configuración de Moneda

Actualmente configurado para: **MXN (Peso Mexicano)**

Para cambiar la moneda:
1. Abre `/App.tsx`
2. Encuentra `paypalOptions`
3. Cambia `currency: "MXN"` a otra moneda (ej: "USD", "EUR", etc.)

```typescript
const paypalOptions = {
  clientId: import.meta.env.VITE_PAYPAL_CLIENT_ID || "...",
  currency: "USD", // Cambia aquí
  intent: "capture" as const,
};
```

**Nota:** Asegúrate de que tu cuenta de PayPal soporte la moneda elegida.

---

## 📊 Comisiones de PayPal

### Comisiones estándar en México:
- **Ventas nacionales:** 3.6% + $3.00 MXN por transacción
- **Ventas internacionales:** 4.4% + comisión por cambio de moneda

### Ejemplo:
- Venta de $1,000 MXN
- Comisión: (1000 × 0.036) + 3 = $39 MXN
- Recibes: $961 MXN

Consulta las tarifas actualizadas en [https://www.paypal.com/mx/webapps/mpp/merchant-fees](https://www.paypal.com/mx/webapps/mpp/merchant-fees)

---

## ❓ Solución de Problemas

### ❌ Error: "Client ID is required"
**Solución:** Verifica que el archivo `.env` esté en la raíz y tenga el Client ID correcto.

### ❌ Los botones de PayPal no aparecen
**Solución:** 
1. Verifica la consola del navegador para errores
2. Asegúrate de que el Client ID sea válido
3. Reinicia el servidor de desarrollo

### ❌ Error: "Currency not supported"
**Solución:** Verifica que tu cuenta de PayPal soporte la moneda configurada (MXN).

### ❌ El pago no se completa
**Solución:**
1. En modo Sandbox, usa solo cuentas de prueba de PayPal
2. Verifica que tengas conexión a internet
3. Revisa la consola del navegador para errores

### ❌ No llega el email de confirmación
**Solución:**
1. Verifica las credenciales de EmailJS
2. Revisa la carpeta de spam
3. Asegúrate de que el template de EmailJS esté configurado correctamente

---

## 📞 Soporte

### Documentación oficial:
- [PayPal Developer](https://developer.paypal.com/docs/)
- [PayPal JavaScript SDK](https://developer.paypal.com/sdk/js/)
- [PayPal React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js)

### Soporte de PayPal:
- [Centro de ayuda para desarrolladores](https://developer.paypal.com/support/)
- [Foros de la comunidad](https://www.paypal-community.com/t5/Developer-Tools/bd-p/developer-tools)

---

## ✅ Checklist antes de lanzar

- [ ] Cuenta de PayPal Business verificada
- [ ] Client ID de producción obtenido
- [ ] Variable de entorno actualizada con Client ID de Live
- [ ] Pruebas de transacciones exitosas en Sandbox
- [ ] Sitio web con certificado SSL (HTTPS)
- [ ] Emails de confirmación funcionando
- [ ] Políticas de privacidad y términos de servicio actualizados
- [ ] Configuración de reembolsos y devoluciones clara

---

¡Listo! PayPal está completamente integrado y funcionando en tu sitio. 🎉

Si tienes alguna pregunta, consulta la documentación o contacta al soporte de PayPal.
