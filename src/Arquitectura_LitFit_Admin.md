# 📋 Arquitectura LitFit Admin Panel - Documentación Técnica

**Versión:** 1.1 (Revisada y Corregida)
**Fecha:** 17 de Marzo, 2026  
**Autor:** Tech Lead - LitFit México  
**Stack:** Frontend Estático (Figma Make) + Firebase (BaaS) + Mercado Pago + EnviosInternacionales.com

---

## 📐 1. Arquitectura General

### Diagrama de Flujo

```text
┌─────────────────┐
│  Frontend Web   │ (HTML/JS)
│  LitFit Admin   │
└────────┬────────┘
         │
         │ Firebase SDK
         │
┌────────▼────────────────────────────────────┐
│          Firebase (BaaS)                    │
│  ┌──────────────┐    ┌──────────────┐       │
│  │ Auth (Google)│    │  Firestore   │       │
│  │  Sign-In     │    │  Database    │       │
│  └──────────────┘    └──────────────┘       │
└─────────────────────────────────────────────┘
         │                    ▲
         │                    │
         │                    │ Webhook
         │                    │
┌────────▼────────┐    ┌──────┴──────────┐
│  Mercado Pago   │    │ Cloud Functions │
│  API + Webhook  │───▶│   (Firebase)    │
└─────────────────┘    └─────────────────┘
         │                    │
         │                    │
         └────────────────────┤
                              │
                    ┌─────────▼──────────┐
                    │ EnviosInter.com    │
                    │ API REST           │
                    └────────────────────┘
Flujo de Comunicación
Usuario compra → Frontend envía datos a Mercado Pago y guarda el pedido en Firestore como "Pendiente".

Mercado Pago procesa pago → Envía webhook (notificación IPN) a Firebase Cloud Function.

Cloud Function valida pago → Actualiza Firestore con el estatus de pago ("verde", "rojo", etc.).

Si pago aprobado → Cloud Function llama al endpoint POST /api/v1/rate/shipments/ de EnviosInternacionales.com.

EnviosInternacionales.com responde → Cloud Function extrae la label_url (PDF) y el número de rastreo, y los guarda en Firestore.

Admin abre dashboard → Lee datos en tiempo real desde Firestore y ve el botón de "Imprimir Guía".

🔥 2. Configuración de Firebase
2.1 Creación del Proyecto
Ir a Firebase Console.

Crear nuevo proyecto: litfit-mexico-admin.

Plan: Blaze (Pago por uso, necesario para usar Cloud Functions con peticiones a APIs externas. La capa gratuita cubre sobradamente el tráfico inicial de LitFit).

2.2 Authentication - Google Sign-In
Firebase Console → Authentication → Sign-in method.

Click en "Google" y habilitar el toggle.

Configurar email de soporte del proyecto.

2.3 Firestore Database - Estructura de Datos (Colección: pedidos)
JSON

{
  "pedidos": [
    {
      "id_pedido": "ORD-2024-001",
      "fecha_creacion": "2026-03-17T10:30:00Z",
      "cliente": {
        "nombre": "María González",
        "email": "maria.gonzalez@email.com",
        "telefono": "5512345678",
        "direccion": {
          "calle": "Av. Insurgentes Sur 1234",
          "colonia": "Del Valle",
          "ciudad": "Benito Juárez",
          "estado": "Ciudad de México",
          "codigo_postal": "03100",
          "pais": "MX"
        }
      },
      "productos": [
        {
          "sku": "PROT-ISO-CHOC",
          "nombre": "Proteína ISO - Chocolate",
          "cantidad": 2,
          "precio_unitario": 780,
          "subtotal": 1560
        }
      ],
      "totales": {
        "subtotal": 1560,
        "envio": 150,
        "total": 1710
      },
      "pago": {
        "mp_payment_id": "123456789",
        "mp_status": "approved",
        "fecha_pago": "2026-03-17T10:32:15Z"
      },
      "estatus_pago": "pagado",
      "estatus_semaforo": "verde",
      "alertas": {
        "es_fraude": false,
        "razon_fraude": null
      },
      "envio": {
        "proveedor": "fedex",
        "tracking_number": "1234567890",
        "label_url": "[https://api.enviosinternacionales.com/labels/1234567890.pdf](https://api.enviosinternacionales.com/labels/1234567890.pdf)",
        "estatus_envio": "creado",
        "peso_kg": 1.5,
        "dimensiones": {
          "largo_cm": 30,
          "ancho_cm": 20,
          "alto_cm": 15
        }
      }
    }
  ]
}
2.4 Reglas de Seguridad de Firestore
JavaScript

rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Validar si el usuario es administrador autorizado
    function isAdmin() {
      return request.auth != null &&
             request.auth.token.email in [
               'admin@litfitmexico.com',
               'julian@litfitmexico.com'
             ];
    }

    // Colección de Pedidos - SOLO lectura/escritura para admins y el backend
    match /pedidos/{pedidoId} {
      allow read, write: if isAdmin();
      // Permitir a usuarios en el sitio web crear un pedido "pendiente" al iniciar el checkout
      allow create: if true;
    }

    match /{document=**} {
      allow read, write: if false;
    }
  }
}
💳 3. Integración Backend (Cloud Functions & Webhooks)
3.1 Crear Cloud Function para recibir pagos y generar envíos
Archivo: functions/index.js

JavaScript

const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();
const db = admin.firestore();

// 🔔 Webhook de Mercado Pago
exports.mercadoPagoWebhook = functions.https.onRequest(async (req, res) => {
  try {
    if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

    const { type, data } = req.body;
    if (type !== 'payment') return res.status(200).send('OK - Evento ignorado');

    const paymentId = data.id;
    const MP_ACCESS_TOKEN = functions.config().mercadopago.access_token;

    // 1. Consultar detalles del pago
    const paymentResponse = await axios.get(
      `https://api.mercadopago.com/v1/payments/${paymentId}`,
      { headers: { 'Authorization': `Bearer ${MP_ACCESS_TOKEN}` } }
    );
    const payment = paymentResponse.data;
    const externalReference = payment.external_reference; // ID de tu pedido

    const pedidoRef = db.collection('pedidos').doc(externalReference);
    const pedidoDoc = await pedidoRef.get();

    if (!pedidoDoc.exists) return res.status(404).send('Pedido no encontrado');

    // 2. Determinar semáforos
    let estatusSemaforo = 'amarillo';
    let estatusPago = 'pendiente';

    if (payment.status === 'approved') {
      estatusSemaforo = 'verde';
      estatusPago = 'pagado';
    } else if (payment.status === 'rejected' || payment.status === 'cancelled') {
      estatusSemaforo = 'rojo';
      estatusPago = 'rechazado';
    }

    const esFraude = payment.status === 'rejected' && payment.status_detail === 'cc_rejected_high_risk';

    // 3. Actualizar Firestore
    await pedidoRef.update({
      'pago.mp_payment_id': payment.id,
      'pago.mp_status': payment.status,
      'estatus_pago': estatusPago,
      'estatus_semaforo': estatusSemaforo,
      'alertas.es_fraude': esFraude,
      'alertas.razon_fraude': esFraude ? payment.status_detail : null,
      'actualizado_en': admin.firestore.FieldValue.serverTimestamp()
    });

    // 4. Si el pago es aprobado, generar la guía en automático
    if (payment.status === 'approved') {
      await crearEnvio(externalReference, pedidoDoc.data());
    }

    res.status(200).send('OK');
  } catch (error) {
    console.error('❌ Error en webhook:', error);
    res.status(500).send('Internal Server Error');
  }
});

// 📦 Función para generar guía en EnviosInternacionales.com
async function crearEnvio(pedidoId, pedidoData) {
  try {
    const ENVIOS_API_TOKEN = functions.config().envios.api_token;
    // Endpoint para crear envío directamente (sin cotización previa)
    const ENVIOS_API_URL = '[https://app.enviosinternacionales.com/api/v1/rate/shipments/](https://app.enviosinternacionales.com/api/v1/rate/shipments/)';

    const envioPayload = {
      "carrier": {
        "name": "fedex", // O el carrier predeterminado que use LitFit
        "service_name": "standard_overnight"
      },
      "address_from": {
        "country_code": "MX",
        "postal_code": "06600",
        "area_level1": "Ciudad de México",
        "area_level2": "Cuauhtémoc",
        "area_level3": "Juárez",
        "street1": "Av. Reforma 500",
        "company": "LitFit México",
        "name": "LitFit",
        "phone": "5512345678",
        "email": "contacto@litfitmexico.com",
        "reference": "Oficina principal"
      },
      "address_to": {
        "country_code": "MX",
        "postal_code": pedidoData.cliente.direccion.codigo_postal,
        "area_level1": pedidoData.cliente.direccion.estado,
        "area_level2": pedidoData.cliente.direccion.ciudad,
        "area_level3": pedidoData.cliente.direccion.colonia,
        "street1": pedidoData.cliente.direccion.calle,
        "company": "Particular",
        "name": pedidoData.cliente.nombre,
        "phone": pedidoData.cliente.telefono,
        "email": pedidoData.cliente.email,
        "reference": "Entregar en puerta"
      },
      "parcels": [
        {
          "weight": pedidoData.envio.peso_kg || 1,
          "length": pedidoData.envio.dimensiones.largo_cm || 20,
          "width": pedidoData.envio.dimensiones.ancho_cm || 20,
          "height": pedidoData.envio.dimensiones.alto_cm || 15
        }
      ]
    };

    const response = await axios.post(ENVIOS_API_URL, envioPayload, {
      headers: {
        'Authorization': `Bearer ${ENVIOS_API_TOKEN}`,
        'Content-Type': 'application/json'
      }
    });

    const envioResponse = response.data;

    // 5. Guardar la URL de la etiqueta en la base de datos
    await db.collection('pedidos').doc(pedidoId).update({
      'envio.tracking_number': envioResponse.master_tracking_number || envioResponse.id,
      'envio.label_url': envioResponse.label_url,
      'envio.proveedor': envioResponse.rate?.provider_display_name || 'Generado',
      'envio.fecha_creacion_guia': admin.firestore.FieldValue.serverTimestamp(),
      'envio.estatus_envio': 'creado',
      'actualizado_en': admin.firestore.FieldValue.serverTimestamp()
    });

    console.log(`✅ Guía generada con éxito para pedido ${pedidoId}`);
  } catch (error) {
    console.error('❌ Error al crear envío:', error.response?.data || error.message);
  }
}
3.2 Desplegar Cloud Functions
Bash

# Inicializar proyecto localmente en la carpeta de tu código
firebase init functions

# Configurar variables secretas para el entorno de Node.js
firebase functions:config:set \
  mercadopago.access_token="APP_USR-tu-token-de-mp" \
  envios.api_token="tu-token-jwt-de-envios-internacionales"

# Subir funciones a la nube
firebase deploy --only functions
📦 4. Integración Frontend (Panel de Admin en Figma Make)
4.1 Login con Firebase
Usa el SDK de Firebase en tu código exportado de Figma para habilitar el botón de Google:

JavaScript

import { getAuth, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import { app } from "./firebase-config"; // Tu inicialización de Firebase

const auth = getAuth(app);
const provider = new GoogleAuthProvider();

document.getElementById('btn-login-google').addEventListener('click', () => {
  signInWithPopup(auth, provider)
    .then((result) => {
      // Redirigir al dashboard si es exitoso
      window.location.href = '/admin/dashboard.html';
    }).catch((error) => {
      console.error("Error de login", error);
    });
});
4.2 Botón "Imprimir Guía" en la Tabla
Como la Cloud Function ya hizo el trabajo de obtener la URL del PDF y guardarla en Firestore, el frontend solo necesita leerla y mostrarla en la tabla de pedidos:

JavaScript

// Suponiendo que 'pedido' es el documento extraído de Firestore en tu ciclo de renderizado
const botonImprimir = document.createElement('button');
botonImprimir.innerText = '📄 Imprimir Guía';

if (pedido.envio && pedido.envio.label_url) {
  botonImprimir.onclick = () => window.open(pedido.envio.label_url, '_blank');
  botonImprimir.className = 'btn-activo'; // Clases de Figma Make
} else {
  botonImprimir.innerText = 'Guía no disponible';
  botonImprimir.disabled = true;
  botonImprimir.className = 'btn-inactivo'; // Clases de Figma Make
}
🔐 5. Variables de Entorno y Credenciales Necesarias
Archivo .env (Para tu Frontend local)
Bash

# Firebase (Obtenido de Project Settings en Firebase Console)
VITE_FIREBASE_API_KEY="AIzaSy..."
VITE_FIREBASE_AUTH_DOMAIN="litfit-mexico-admin.firebaseapp.com"
VITE_FIREBASE_PROJECT_ID="litfit-mexico-admin"
VITE_FIREBASE_STORAGE_BUCKET="litfit-mexico-admin.appspot.com"
VITE_FIREBASE_MESSAGING_SENDER_ID="..."
VITE_FIREBASE_APP_ID="..."
Credenciales para el Backend (Cloud Functions)
Asegúrate de tener a la mano las siguientes llaves para ejecutarlas en la terminal con firebase functions:config:set:

Mercado Pago access_token: Desde mercadopago.com.mx/developers/panel -> Producción. Empieza con APP_USR-...

EnviosInternacionales bearer_token: Desde tu panel de EnviosInternacionales.com en la sección de Integraciones > API. Generas el token y copias el string completo.
```
