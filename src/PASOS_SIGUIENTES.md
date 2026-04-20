# 🚀 SIGUIENTES PASOS - LITFIT MERCADO PAGO

## ⚡ IMPORTANTE: SOLO BACKEND EN cPANEL

**Tu sitio funciona así:**
- ✅ **Frontend:** Figma Make lo despliega automáticamente a `https://litfit.inedito.digital`
- ✅ **Backend PHP:** TÚ subes SOLO 2 archivos PHP a cPanel

**NO necesitas:**
- ❌ Exportar el frontend desde Figma Make
- ❌ Subir todo el sitio a cPanel
- ❌ Configurar hosting completo

---

## ✅ LO QUE YA ESTÁ HECHO

He modificado el código del frontend en Figma Make:

1. ✅ **`/pages/checkout.tsx`** modificado - Llama al backend PHP
2. ✅ **URL configurada** - `https://litfit.inedito.digital/api/mercadopago/create-preference.php`
3. ✅ **SDK eliminado** - Ya no se necesita `@mercadopago/sdk-react`
4. ✅ **Documentación creada** - Guías completas
5. ✅ **PayPal intacto** - Sigue funcionando
6. ✅ **EmailJS intacto** - Sigue funcionando

**Figma Make desplegará esto automáticamente.**

---

## 📋 LO QUE TIENES QUE HACER

### ✅ PASO 1: Crear 2 archivos PHP en cPanel (15-20 min)

📄 **Sigue las instrucciones en:** `/CPANEL_BACKEND_SETUP.md`

**Resumen rápido:**

1. Accede a cPanel de `litfit.inedito.digital`
2. Crea **Archivo 1:** `/private/config/mercadopago-config.php` (credenciales)
3. Crea **Archivo 2:** `/public_html/api/mercadopago/create-preference.php` (API)
4. Configura permisos
5. Prueba con cURL

**Eso es todo. Solo 2 archivos.**

---

### ✅ PASO 2: Probar que funcione (5 min)

1. **Prueba con cURL** (ver documentación)
2. **Prueba desde el sitio:**
   - Abre `https://litfit.inedito.digital`
   - Agrega productos
   - Ve a checkout
   - Llena el formulario
   - Click en "Pagar con Mercado Pago"
   - Deberías ser redirigido a Mercado Pago

3. **Usa tarjeta de prueba:**
   ```
   Número: 4509 9535 6623 3704
   CVV: 123
   Fecha: 11/25
   Nombre: APRO
   ```

---

## 📁 ARCHIVOS DE DOCUMENTACIÓN

| Archivo | Contenido |
|---------|-----------|
| `/CPANEL_BACKEND_SETUP.md` | 📖 **GUÍA PRINCIPAL** - Paso a paso para cPanel |
| `/LEEME_PRIMERO.md` | 👋 Resumen ejecutivo |
| `/PASOS_SIGUIENTES.md` | 📋 Este archivo (checklist) |

---

## 🗂️ ESTRUCTURA EN cPANEL (QUE CREARÁS)

```
/home/tu_usuario/litfit.inedito.digital/
│
├── public_html/
│   ├── (Figma Make despliega aquí automáticamente)
│   │   ├── index.html
│   │   ├── css/
│   │   └── js/
│   │
│   └── api/                             ← TÚ CREAS ESTO
│       └── mercadopago/                 ← TÚ CREAS ESTO
│           └── create-preference.php    ← TÚ CREAS ESTO (Archivo 1)
│
└── private/                             ← TÚ CREAS ESTO
    ├── config/                          ← TÚ CREAS ESTO
    │   └── mercadopago-config.php       ← TÚ CREAS ESTO (Archivo 2)
    └── logs/
        └── mercadopago.log              ← Se crea automáticamente
```

---

## ✅ CHECKLIST

Marca cuando completes:

**CONFIGURACIÓN:**
- [ ] Leí `/CPANEL_BACKEND_SETUP.md`
- [ ] Accedí a cPanel de `litfit.inedito.digital`
- [ ] Creé carpeta `/private/config/`
- [ ] Creé archivo `mercadopago-config.php` con credenciales
- [ ] Configuré permisos `600` en `mercadopago-config.php`
- [ ] Creé carpeta `/public_html/api/mercadopago/`
- [ ] Creé archivo `create-preference.php`
- [ ] Configuré permisos `644` en `create-preference.php`
- [ ] Verifiqué CORS en línea 10 del PHP

**PRUEBAS:**
- [ ] Probé con cURL - ✅ Respuesta exitosa
- [ ] Abrí `https://litfit.inedito.digital`
- [ ] Agregué productos al carrito
- [ ] Fui a checkout y llené el formulario
- [ ] Probé "Pagar con Mercado Pago" - ✅ Redirige
- [ ] Probé con tarjeta de prueba - ✅ Pago exitoso
- [ ] Verifiqué que PayPal sigue funcionando
- [ ] Verifiqué que EmailJS envía emails

---

## 🎯 RESULTADO FINAL

Una vez completado:

✅ **Frontend (Figma Make):**
- Se despliega automáticamente
- Sin credenciales sensibles
- Código limpio

✅ **Backend (cPanel):**
- Solo 2 archivos PHP
- Credenciales seguras en `/private/`
- Logs automáticos

✅ **Flujo de pago:**
```
Usuario → Figma Make Frontend → cPanel Backend PHP → Mercado Pago → Redirección
```

---

## 🆘 ¿PROBLEMAS?

| Problema | Solución |
|----------|----------|
| Error CORS | Verifica línea 10 de `create-preference.php` |
| "No se pudo iniciar el pago" | Revisa error_log en cPanel |
| "checkoutUrl vacío" | Verifica credenciales en config |
| Error 500 | Verifica ruta del `require_once` |

**Ver más en:** `/CPANEL_BACKEND_SETUP.md` → Sección "Solución de Problemas"

---

## 📊 FLUJO COMPLETO

```
1. Usuario compra en sitio (Figma Make)
   └─> https://litfit.inedito.digital

2. Frontend llama al backend PHP
   └─> POST a /api/mercadopago/create-preference.php

3. Backend PHP procesa
   ├─> Lee credenciales desde /private/config/
   ├─> Llama a API de Mercado Pago
   └─> Retorna URL de checkout

4. Frontend redirige a Mercado Pago
   └─> Usuario completa el pago

5. Mercado Pago redirige de vuelta
   └─> https://litfit.inedito.digital/payment-success-mp
```

---

## 🚀 **COMIENZA AHORA**

**Abre:** `/CPANEL_BACKEND_SETUP.md`

Sigue los pasos para crear los 2 archivos PHP.

**Tiempo total:** 20-25 minutos

---

## 💡 RECORDATORIO

- ✅ **Figma Make** despliega el frontend automáticamente
- ✅ **TÚ** solo creas 2 archivos PHP en cPanel
- ✅ **No exportes** el sitio desde Figma Make
- ✅ **No subas** archivos HTML/CSS/JS a cPanel

El frontend y el backend coexisten en el mismo dominio:
- Frontend: Figma Make lo despliega
- Backend PHP: Tú lo creas en cPanel

**¡Ambos usan `https://litfit.inedito.digital`!**

---

**👉 SIGUIENTE PASO:** Abre `/CPANEL_BACKEND_SETUP.md` y empieza.

¡Éxito! 🎉
