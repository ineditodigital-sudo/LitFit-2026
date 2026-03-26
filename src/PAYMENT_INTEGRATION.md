# 💳 Guía de Integración de Pagos - LITFIT

Esta guía te ayudará a integrar **Mercado Pago** y **PayPal** en tu sitio web de LITFIT.

---

## 📋 Tabla de Contenidos

1. [Información del Sistema Actual](#información-del-sistema-actual)
2. [Integración de Mercado Pago](#integración-de-mercado-pago)
3. [Integración de PayPal](#integración-de-paypal)
4. [Implementación en el Código](#implementación-en-el-código)
5. [Testing y Verificación](#testing-y-verificación)
6. [Solución de Problemas](#solución-de-problemas)

---

## 📊 Información del Sistema Actual

### Productos Configurados

| Producto | Precio | Variantes |
|----------|--------|-----------|
| **Barras de Proteína (16 unidades)** | $560 | Combinado de 4 sabores o 1 solo sabor: Choco peanut butter (75g), Almond vanilla (70g), Trufa de chocolate (58g), Café tiramisu (65g) |
| **Barras de Proteína (24 unidades)** | $790 | Combinado de 4 sabores o 1 solo sabor: Choco peanut butter (75g), Almond vanilla (70g), Trufa de chocolate (58g), Café tiramisu (65g) |
| **Proteína ISO** | $780 | Chocolate (1.5kg), Fresa (1.5kg), Vainilla (1.5kg) |
| **Proteína ISO + Colágeno** | $890 | Coco (1.5kg), Fresa (1.5kg), Vainilla (1.5kg) |

### Costos Adicionales
- **Envío:** $150 (fijo)

### Estructura del Carrito

El sistema de carrito está en `/contexts/CartContext.tsx` y maneja:
- Productos con variantes (sabores, tamaños)
- Cantidades
- Persistencia en localStorage
- Cálculo de totales

---

## 🇦🇷 Integración de Mercado Pago

Mercado Pago es ideal para pagos en México y Latinoamérica. Acepta:
- ✅ Tarjetas de crédito/débito
- ✅ Transferencias bancarias
- ✅ Efectivo (OXXO, 7-Eleven, etc.)
- ✅ Meses sin intereses

### Paso 1: Crear Cuenta de Mercado Pago

1. Ve a [https://www.mercadopago.com.mx/developers](https://www.mercadopago.com.mx/developers)
2. Crea una cuenta de desarrollador
3. Ingresa a tu Dashboard de desarrolladores

### Paso 2: Obtener Credenciales

1. En el Dashboard, ve a **"Tus integraciones"** > **"Credenciales"**
2. Encontrarás dos tipos de credenciales:
   - **Modo Prueba (Sandbox):** Para testing
   - **Modo Producción:** Para ventas reales

**Credenciales necesarias:**
- `PUBLIC_KEY` (Clave pública) - Se usa en el frontend
- `ACCESS_TOKEN` (Token de acceso) - Se usa en el backend

⚠️ **IMPORTANTE:** Nunca expongas tu ACCESS_TOKEN en el frontend.

### Paso 3: Instalar SDK de Mercado Pago

```bash
npm install @mercadopago/sdk-react
```

### Paso 4: Configurar Mercado Pago en el Código

#### A) Crear archivo de configuración `/config/mercadopago.ts`

```typescript
// Este archivo contiene la configuración de Mercado Pago
export const MERCADOPAGO_CONFIG = {
  publicKey: process.env.NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY || 'TEST-tu-public-key-aqui',
  // El ACCESS_TOKEN debe estar en el backend/servidor
};
```

#### B) Crear variables de entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Mercado Pago - Modo Prueba
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Mercado Pago - Modo Producción (usar cuando esté listo)
# NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
```

### Paso 5: Modificar el Checkout

#### Actualizar `/pages/checkout.tsx`

Agrega la integración de Mercado Pago Checkout Pro (recomendado):

```typescript
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useEffect, useState } from 'react';

// Inicializar Mercado Pago (fuera del componente)
initMercadoPago('TEST-tu-public-key-aqui');

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const shippingCost = 150;
  const total = totalPrice + shippingCost;

  // Función para crear la preferencia de pago
  const createPreference = async () => {
    try {
      // Preparar items para Mercado Pago
      const mpItems = items.map(item => ({
        id: item.id,
        title: `${item.name}${item.variant ? ` - ${item.variant}` : ''}${item.size ? ` (${item.size})` : ''}`,
        description: item.name,
        picture_url: item.image,
        category_id: 'sports_nutrition',
        quantity: item.quantity,
        unit_price: item.price,
      }));

      // Agregar envío como item
      mpItems.push({
        id: 'shipping',
        title: 'Envío a domicilio',
        description: 'Costo de envío',
        category_id: 'shipping',
        quantity: 1,
        unit_price: shippingCost,
      });

      // Datos del comprador
      const payer = {
        name: formData.firstName,
        surname: formData.lastName,
        email: formData.email,
        phone: {
          area_code: '',
          number: formData.phone,
        },
        address: {
          street_name: formData.street,
          street_number: '',
          zip_code: formData.zipCode,
        },
      };

      // Crear preferencia en tu backend
      const response = await fetch('/api/mercadopago/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: mpItems,
          payer: payer,
          back_urls: {
            success: `${window.location.origin}/payment-success`,
            failure: `${window.location.origin}/payment-failure`,
            pending: `${window.location.origin}/payment-pending`,
          },
          auto_return: 'approved',
          statement_descriptor: 'LITFIT',
          external_reference: `LITFIT-${Date.now()}`,
        }),
      });

      const data = await response.json();
      setPreferenceId(data.id);
    } catch (error) {
      console.error('Error creating preference:', error);
      alert('Error al procesar el pago. Intenta de nuevo.');
    }
  };

  // Renderizar botón de Mercado Pago
  return (
    // ... tu código existente ...
    
    {/* En la sección de pago, reemplaza el botón por: */}
    {preferenceId ? (
      <Wallet 
        initialization={{ preferenceId: preferenceId }}
        customization={{ 
          texts: { 
            valueProp: 'security_safety' 
          } 
        }}
      />
    ) : (
      <button
        onClick={createPreference}
        className="w-full bg-[#00AAC7] hover:bg-[#00d4ff] transition-colors py-4 px-6"
      >
        <span className="text-black font-black">Pagar con Mercado Pago</span>
      </button>
    )}
  );
}
```

### Paso 6: Crear API Route para Mercado Pago

#### Crear archivo `/pages/api/mercadopago/create-preference.ts`

```typescript
import type { NextApiRequest, NextApiResponse } from 'next';
// Necesitarás instalar: npm install mercadopago
import { MercadoPagoConfig, Preference } from 'mercadopago';

// Configurar cliente de Mercado Pago
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN || '',
});

const preference = new Preference(client);

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { items, payer, back_urls, auto_return, statement_descriptor, external_reference } = req.body;

    const preferenceData = {
      items: items,
      payer: payer,
      back_urls: back_urls,
      auto_return: auto_return,
      statement_descriptor: statement_descriptor,
      external_reference: external_reference,
      notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/mercadopago/webhook`, // Para recibir notificaciones
    };

    const response = await preference.create({ body: preferenceData });

    res.status(200).json({ id: response.id });
  } catch (error) {
    console.error('Error creating preference:', error);
    res.status(500).json({ error: 'Error creating payment preference' });
  }
}
```

### Paso 7: Agregar ACCESS_TOKEN al `.env.local`

```env
# Backend - NO exponer en frontend
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

### Paso 8: Crear Páginas de Respuesta

#### `/pages/payment-success.tsx`

```typescript
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { CheckCircle } from 'lucide-react';
import { useCart } from '../contexts/CartContext';

export default function PaymentSuccess() {
  const router = useRouter();
  const { clearCart } = useCart();
  const { payment_id, status, external_reference } = router.query;

  useEffect(() => {
    // Limpiar carrito cuando el pago es exitoso
    if (status === 'approved') {
      clearCart();
    }
  }, [status, clearCart]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="bg-gradient-to-br from-[#00AAC7] to-[#00d4ff] p-12 rounded-full inline-block mb-6">
          <CheckCircle className="w-24 h-24 text-black" />
        </div>
        <h1 className="text-4xl font-black text-gray-900 mb-4">
          ¡Pago Exitoso!
        </h1>
        <p className="text-gray-600 mb-2">
          Tu pedido ha sido confirmado y procesado correctamente.
        </p>
        <p className="text-sm text-gray-500 mb-8">
          ID de Pago: {payment_id}
        </p>
        <a
          href="/"
          className="inline-block px-8 py-4 bg-black text-white font-black tracking-wide hover:bg-gray-900 transition-colors"
        >
          VOLVER AL INICIO
        </a>
      </div>
    </div>
  );
}
```

#### `/pages/payment-failure.tsx` y `/pages/payment-pending.tsx`

Crea páginas similares para manejar pagos fallidos y pendientes.

---

## 💙 Integración de PayPal

PayPal es ideal para pagos internacionales y acepta tarjetas de todo el mundo.

### Paso 1: Crear Cuenta de PayPal Business

1. Ve a [https://www.paypal.com/businesswallet](https://www.paypal.com/businesswallet)
2. Crea una cuenta Business
3. Ve al Developer Dashboard: [https://developer.paypal.com/dashboard](https://developer.paypal.com/dashboard)

### Paso 2: Obtener Credenciales

1. En el Developer Dashboard, ve a **"Apps & Credentials"**
2. Crea una nueva app o usa "Default Application"
3. Encontrarás:
   - **Client ID** - Para el frontend
   - **Secret** - Para el backend (nunca expongas esto)

Modo Sandbox (pruebas):
- Usa las credenciales de "Sandbox"
- Crea cuentas de prueba en "Sandbox Accounts"

Modo Live (producción):
- Cambia a "Live" cuando estés listo

### Paso 3: Instalar SDK de PayPal

```bash
npm install @paypal/react-paypal-js
```

### Paso 4: Configurar PayPal en el Código

#### A) Agregar credenciales al `.env.local`

```env
# PayPal - Modo Sandbox
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sandbox-client-id-aqui

# PayPal - Modo Producción (usar cuando esté listo)
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=production-client-id-aqui

# Backend
PAYPAL_CLIENT_SECRET=tu-secret-aqui
```

#### B) Envolver App con PayPalScriptProvider

Actualiza `/App.tsx`:

```typescript
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

function App() {
  const paypalOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
    currency: "MXN", // Peso mexicano
    intent: "capture",
  };

  return (
    <PayPalScriptProvider options={paypalOptions}>
      <CartProvider>
        {/* Tu contenido existente */}
      </CartProvider>
    </PayPalScriptProvider>
  );
}
```

### Paso 5: Modificar Checkout para PayPal

#### Actualizar `/pages/checkout.tsx`

```typescript
import { PayPalButtons, usePayPalScriptReducer } from "@paypal/react-paypal-js";

export default function Checkout() {
  const { items, totalPrice, clearCart } = useCart();
  const [{ isPending }] = usePayPalScriptReducer();
  const shippingCost = 150;
  const total = totalPrice + shippingCost;

  // Crear orden en PayPal
  const createOrder = (data: any, actions: any) => {
    // Preparar items para PayPal
    const paypalItems = items.map(item => ({
      name: `${item.name}${item.variant ? ` - ${item.variant}` : ''}${item.size ? ` (${item.size})` : ''}`,
      description: item.name,
      unit_amount: {
        currency_code: "MXN",
        value: item.price.toFixed(2),
      },
      quantity: item.quantity.toString(),
    }));

    return actions.order.create({
      purchase_units: [
        {
          description: "Productos LITFIT",
          amount: {
            currency_code: "MXN",
            value: total.toFixed(2),
            breakdown: {
              item_total: {
                currency_code: "MXN",
                value: totalPrice.toFixed(2),
              },
              shipping: {
                currency_code: "MXN",
                value: shippingCost.toFixed(2),
              },
            },
          },
          items: paypalItems,
          shipping: {
            name: {
              full_name: `${formData.firstName} ${formData.lastName}`,
            },
            address: {
              address_line_1: formData.street,
              admin_area_2: formData.city,
              admin_area_1: formData.state,
              postal_code: formData.zipCode,
              country_code: "MX",
            },
          },
        },
      ],
      application_context: {
        shipping_preference: "SET_PROVIDED_ADDRESS",
      },
    });
  };

  // Aprobar pago
  const onApprove = async (data: any, actions: any) => {
    try {
      const details = await actions.order.capture();
      
      // Enviar email de confirmación usando EmailJS
      await emailjs.send(
        'service_co0q90x',
        'template_yqda5vi',
        {
          customer_name: `${formData.firstName} ${formData.lastName}`,
          customer_email: formData.email,
          customer_phone: formData.phone,
          shipping_address: `${formData.street}, ${formData.city}, ${formData.state}, ${formData.zipCode}, ${formData.country}`,
          order_items: items.map(item => 
            `- ${item.name}${item.variant ? ` (${item.variant})` : ''}${item.size ? ` - ${item.size}` : ''} - $${item.price}`
          ).join('\n'),
          subtotal: `$${totalPrice.toLocaleString()}`,
          shipping: `$${shippingCost}`,
          total: `$${total.toLocaleString()}`,
          notes: formData.notes || 'Sin notas',
          payment_method: 'PayPal',
          payment_id: details.id,
          to_email: 'reenviadorlitfit@inedito.digital'
        }
      );

      // Mostrar éxito
      setStep('success');
      clearCart();
      
      return details;
    } catch (error) {
      console.error('Error processing payment:', error);
      alert('Error al procesar el pago. Por favor contacta soporte.');
    }
  };

  // Manejar error
  const onError = (err: any) => {
    console.error('PayPal Error:', err);
    alert('Hubo un error con PayPal. Por favor intenta de nuevo.');
  };

  return (
    // ... en la sección de métodos de pago ...
    
    <div className="space-y-4">
      {/* Botón de PayPal */}
      <div className="p-6 border-2 border-gray-300 hover:border-[#00AAC7]/50">
        <h3 className="font-black mb-4">PayPal</h3>
        {isPending ? (
          <div className="text-center py-4">Cargando PayPal...</div>
        ) : (
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            style={{
              layout: "vertical",
              color: "blue",
              shape: "rect",
              label: "pay",
            }}
          />
        )}
      </div>
    </div>
  );
}
```

---

## 🔧 Implementación Completa en el Código

### Estructura de Archivos Necesaria

```
/
├── .env.local                              # Variables de entorno
├── pages/
│   ├── api/
│   │   └── mercadopago/
│   │       ├── create-preference.ts       # API para crear preferencia MP
│   │       └── webhook.ts                  # Recibir notificaciones MP
│   ├── checkout.tsx                        # Página de checkout (actualizada)
│   ├── payment-success.tsx                 # Pago exitoso
│   ├── payment-failure.tsx                 # Pago fallido
│   └── payment-pending.tsx                 # Pago pendiente
├── config/
│   └── mercadopago.ts                      # Configuración MP
└── contexts/
    └── CartContext.tsx                     # Ya existe
```

### Instalación de Dependencias

```bash
# Instalar todas las dependencias necesarias
npm install @mercadopago/sdk-react mercadopago @paypal/react-paypal-js
```

### Archivo `.env.local` Completo

```env
# EmailJS (ya configurado)
NEXT_PUBLIC_EMAILJS_PUBLIC_KEY=hHdYJvPh0oxZZkFiL

# Mercado Pago - Sandbox (Pruebas)
NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
MERCADOPAGO_ACCESS_TOKEN=TEST-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# Mercado Pago - Producción (cuando estés listo)
# NEXT_PUBLIC_MERCADOPAGO_PUBLIC_KEY=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx
# MERCADOPAGO_ACCESS_TOKEN=APP_USR-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx

# PayPal - Sandbox (Pruebas)
NEXT_PUBLIC_PAYPAL_CLIENT_ID=sandbox-client-id-xxxxxxx
PAYPAL_CLIENT_SECRET=sandbox-secret-xxxxxxx

# PayPal - Producción (cuando estés listo)
# NEXT_PUBLIC_PAYPAL_CLIENT_ID=production-client-id-xxxxxxx
# PAYPAL_CLIENT_SECRET=production-secret-xxxxxxx

# Configuración del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

---

## 🧪 Testing y Verificación

### Testing de Mercado Pago

1. **Usar Tarjetas de Prueba:**

   ```
   VISA Aprobada:
   - Número: 4509 9535 6623 3704
   - CVV: 123
   - Vencimiento: Cualquier fecha futura
   - Nombre: APRO (para aprobado)

   Mastercard Rechazada:
   - Número: 5031 7557 3453 0604
   - CVV: 123
   - Vencimiento: Cualquier fecha futura
   - Nombre: OCHO (para rechazado)
   ```

2. **Usuarios de Prueba:**
   - Crea usuarios de prueba en tu Dashboard de Mercado Pago
   - Úsalos para simular compras completas

3. **Verificar Notificaciones:**
   - Usa herramientas como [ngrok](https://ngrok.com/) para exponer tu localhost
   - Configura el webhook URL en Mercado Pago

### Testing de PayPal

1. **Crear Cuentas de Prueba:**
   - En el Sandbox de PayPal, crea:
     - 1 cuenta "Business" (vendedor)
     - 1 cuenta "Personal" (comprador)

2. **Realizar Compra de Prueba:**
   - Usa las credenciales del comprador de prueba
   - El dinero es ficticio

3. **Verificar en Dashboard:**
   - Ve al Sandbox Dashboard para ver las transacciones

### Checklist de Verificación

- [ ] Mercado Pago funciona en modo sandbox
- [ ] PayPal funciona en modo sandbox
- [ ] Los emails de confirmación llegan correctamente
- [ ] El carrito se limpia después del pago exitoso
- [ ] Los datos del cliente se envían correctamente
- [ ] El total incluye productos + envío
- [ ] Las páginas de éxito/error/pendiente funcionan
- [ ] Las variantes (sabores, tamaños) se muestran correctamente

---

## 🚀 Paso a Producción

### Antes de Ir a Producción:

1. **Verificar Cuenta de Negocios:**
   - Mercado Pago: Cuenta verificada y certificada
   - PayPal: Cuenta Business activa y verificada

2. **Cambiar a Credenciales de Producción:**
   - Actualiza `.env.local` con credenciales LIVE
   - Remueve las credenciales de TEST

3. **Configurar Webhooks:**
   - Configura URLs de webhook en ambas plataformas
   - Verifica que tu servidor sea accesible públicamente

4. **SSL/HTTPS:**
   - OBLIGATORIO: Tu sitio debe tener certificado SSL
   - Ambas plataformas requieren HTTPS en producción

5. **Testing Final:**
   - Haz compras de prueba con cantidades mínimas
   - Verifica que todo funcione correctamente

---

## ❓ Solución de Problemas

### Mercado Pago

**Error: "Invalid public key"**
- Verifica que hayas copiado correctamente el PUBLIC_KEY
- Asegúrate de usar TEST- para sandbox, APP_USR- para producción

**Error: "Unauthorized"**
- El ACCESS_TOKEN es incorrecto o expiró
- Verifica que estés usando el token correcto (sandbox vs producción)

**El botón no aparece**
- Verifica que hayas inicializado Mercado Pago: `initMercadoPago()`
- Revisa la consola del navegador para errores

### PayPal

**Error: "Client ID is required"**
- Verifica el archivo `.env.local`
- Asegúrate de que `NEXT_PUBLIC_PAYPAL_CLIENT_ID` esté definido

**Botones no aparecen**
- Verifica que `PayPalScriptProvider` esté envolviendo tu app
- Revisa la consola para errores de SDK

**Error de moneda**
- PayPal puede no soportar MXN en algunos países
- Considera usar USD como alternativa

### General

**Los emails no llegan**
- Verifica configuración de EmailJS
- Revisa spam/correo no deseado
- Confirma que los templates tengan las variables correctas

**El carrito no se limpia**
- Verifica que `clearCart()` se ejecute después del pago
- Revisa que no haya errores en la consola

---

## 📚 Recursos Adicionales

### Documentación Oficial

- **Mercado Pago:**
  - [Documentación general](https://www.mercadopago.com.mx/developers/es/docs)
  - [Checkout Pro](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/landing)
  - [SDK React](https://github.com/mercadopago/sdk-react)

- **PayPal:**
  - [Documentación general](https://developer.paypal.com/docs/)
  - [JavaScript SDK](https://developer.paypal.com/sdk/js/)
  - [React SDK](https://www.npmjs.com/package/@paypal/react-paypal-js)

### Soporte

- Mercado Pago: [Soporte para desarrolladores](https://www.mercadopago.com.mx/developers/es/support)
- PayPal: [Developer Support](https://developer.paypal.com/support/)

---

## ✅ Próximos Pasos

1. ✅ Crear cuentas de desarrollador en ambas plataformas
2. ✅ Obtener credenciales de sandbox
3. ✅ Instalar dependencias necesarias
4. ✅ Configurar `.env.local`
5. ✅ Implementar API routes para Mercado Pago
6. ✅ Actualizar componente de checkout
7. ✅ Crear páginas de respuesta (success/failure/pending)
8. ✅ Testing exhaustivo en modo sandbox
9. ✅ Configurar webhooks
10. ✅ Pasar a producción

---

**¿Necesitas ayuda con algún paso específico?** Consulta la sección de solución de problemas o contacta al soporte de cada plataforma.

---

*Última actualización: Diciembre 2024*
