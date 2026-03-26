# Configuración de EmailJS para LITFIT

Este documento te guía paso a paso para configurar EmailJS y recibir correos de los formularios del sitio.

## 📧 Correo de Destino
Todos los correos se enviarán a: **reenviadorlitfit@inedito.digital**

---

## 🚀 Pasos de Configuración

### 1. Crear cuenta en EmailJS
1. Ve a [https://www.emailjs.com/](https://www.emailjs.com/)
2. Crea una cuenta gratuita (permite 200 emails/mes)
3. Verifica tu correo electrónico

### 2. Configurar Email Service
1. En el dashboard, ve a **Email Services**
2. Click en **Add New Service**
3. Selecciona tu proveedor de email (Gmail, Outlook, etc.)
4. Sigue las instrucciones para conectar tu cuenta
5. Anota el **Service ID** (lo necesitarás después)

### 3. Crear Templates

Necesitas crear **2 templates** diferentes:

#### Template 1: Formulario de Contacto
1. Ve a **Email Templates** > **Create New Template**
2. Nombre del template: `litfit_contact_form`
3. Configura el template con estas variables:

```
Asunto: Nuevo mensaje de contacto - {{subject}}

De: {{from_name}} <{{from_email}}>
Mensaje:

{{message}}

---
Este mensaje fue enviado desde el formulario de contacto de LITFIT.
```

**Variables a usar:**
- `{{from_name}}` - Nombre del usuario
- `{{from_email}}` - Email del usuario
- `{{subject}}` - Asunto del mensaje
- `{{message}}` - Mensaje del usuario

**To Email:** `reenviadorlitfit@inedito.digital`

#### Template 2: Confirmación de Pedido (Checkout)
1. Ve a **Email Templates** > **Create New Template**
2. Nombre del template: `litfit_order_confirmation`
3. Configura el template con estas variables:

```
Asunto: Nuevo Pedido - LITFIT

INFORMACIÓN DEL CLIENTE:
Nombre: {{customer_name}}
Email: {{customer_email}}
Teléfono: {{customer_phone}}

DIRECCIÓN DE ENVÍO:
{{shipping_address}}

PRODUCTOS:
{{order_items}}

RESUMEN:
Subtotal: {{subtotal}}
Envío: {{shipping}}
Total: {{total}}

NOTAS DE ENTREGA:
{{notes}}

---
Este pedido fue generado desde el checkout de LITFIT.
```

**Variables a usar:**
- `{{customer_name}}` - Nombre completo del cliente
- `{{customer_email}}` - Email del cliente
- `{{customer_phone}}` - Teléfono del cliente
- `{{shipping_address}}` - Dirección completa de envío
- `{{order_items}}` - Lista de productos
- `{{subtotal}}` - Subtotal del pedido
- `{{shipping}}` - Costo de envío
- `{{total}}` - Total del pedido
- `{{notes}}` - Notas adicionales

**To Email:** `reenviadorlitfit@inedito.digital`

### 4. Obtener Public Key
1. Ve a **Account** en el menú principal
2. Busca la sección **API Keys**
3. Copia tu **Public Key**

### 5. Configurar las Claves en el Código

Necesitas actualizar **3 archivos** con tus credenciales de EmailJS:

#### Archivo 1: `/components/Contact.tsx` (líneas 21, 32, 33)
```typescript
// Línea 21
emailjs.init('TU_PUBLIC_KEY_AQUI');

// Línea 32-33
await emailjs.send(
  'TU_SERVICE_ID_AQUI',        // Service ID
  'litfit_contact_form',        // Template ID del formulario de contacto
  templateParams
);
```

#### Archivo 2: `/pages/checkout.tsx` (líneas 46, 66, 67)
```typescript
// Línea 46
emailjs.init('TU_PUBLIC_KEY_AQUI');

// Línea 66-67
await emailjs.send(
  'TU_SERVICE_ID_AQUI',              // Service ID
  'litfit_order_confirmation',        // Template ID de confirmación de pedido
  templateParams
);
```

---

## 🔑 Resumen de Credenciales Necesarias

Reemplaza estos valores en el código:

| Placeholder | Dónde encontrarlo | Dónde usarlo |
|------------|-------------------|--------------|
| `YOUR_PUBLIC_KEY` | Account > API Keys | `Contact.tsx` y `checkout.tsx` |
| `YOUR_SERVICE_ID` | Email Services | `Contact.tsx` y `checkout.tsx` |
| `litfit_contact_form` | Email Templates | `Contact.tsx` (línea 33) |
| `litfit_order_confirmation` | Email Templates | `checkout.tsx` (línea 67) |

---

## ✅ Verificación

Una vez configurado:

1. **Formulario de Contacto**: Ve a la sección "Contacto" en la landing page y envía un mensaje de prueba
2. **Checkout**: Agrega un producto al carrito y completa el proceso de checkout
3. Verifica que los correos lleguen a `reenviadorlitfit@inedito.digital`

---

## 🆘 Solución de Problemas

### "Error sending email"
- Verifica que las credenciales sean correctas
- Asegúrate de que el servicio de email esté conectado y activo en EmailJS
- Revisa la consola del navegador para más detalles

### Los correos no llegan
- Verifica que el email destino sea `reenviadorlitfit@inedito.digital` en los templates
- Revisa la carpeta de spam
- Verifica que tu cuenta de EmailJS esté verificada

### Límite de emails alcanzado
- El plan gratuito permite 200 emails/mes
- Considera actualizar a un plan de pago si necesitas más

---

## 📚 Recursos
- [Documentación oficial de EmailJS](https://www.emailjs.com/docs/)
- [Ejemplos de templates](https://www.emailjs.com/docs/examples/email-templates/)
