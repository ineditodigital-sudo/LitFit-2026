# 🚀 Sistema de Envíos - Instrucciones Simples

## ✅ Lo que Hice

Creé un archivo **`cotizar.php`** limpio y simple que:
- ✅ Solo usa la API real de enviosinternacionales.com
- ✅ No tiene fallbacks ni mockups
- ✅ Si funciona → retorna opciones de envío
- ✅ Si falla → retorna el error exacto

---

## 📋 Instrucciones (1 paso)

### Sube el archivo al servidor:

```
Archivo: cotizar.php
Ubicación: /public_html/api/envios/cotizar.php
Permisos: 644
```

---

## 🔍 Qué Pasará

### Si las credenciales son correctas:
- ✅ Verás opciones de envío reales
- ✅ Precios exactos de FedEx, DHL, Estafeta, etc.
- ✅ El checkout funcionará perfectamente

### Si las credenciales son incorrectas (Error 401):
- ❌ Verás un error en el checkout
- ❌ No podrás completar la compra
- ❌ Necesitarás contactar a enviosinternacionales.com

---

## 📞 Si No Funciona (Error 401)

### Contacta a: soporte@enviosinternacionales.com

**Envía este mensaje:**

```
Asunto: Verificación de credenciales API

Hola,

Necesito verificar mis credenciales de API porque recibo error 401.

API Key: brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0
Secret Key: Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog

Request que envío:
POST https://app.enviosinternacionales.com/api/v1/quotations
Authorization: Basic [credenciales en base64]

Preguntas:
1. ¿Son correctas estas credenciales?
2. ¿Es correcto el endpoint /api/v1/quotations?
3. ¿Uso Basic Auth correctamente?
4. ¿Mi cuenta tiene permisos activos?

Gracias
```

---

## 🧪 Cómo Probar

1. Ve a: `https://litfit.inedito.digital`
2. Agrega productos al carrito
3. Ve a Checkout
4. Llena datos y pon CP: **06600**
5. Abre la consola del navegador (F12)
6. Busca los logs:
   - ✅ `✅ Respuesta de la API` = Funcionó
   - ❌ `❌ Error response` = Fallo (lee el error)

---

## 📊 Logs a Revisar

### En la consola del navegador:
- `🚚 Solicitando cotización...`
- `📤 Enviando: {...}`
- `📥 Response status: 200` o `401`
- `✅ Respuesta de la API` o `❌ Error response`

### En cPanel → Metrics → Errors:
- `📍 CP: 06600, Peso: 1.5kg`
- `📤 Llamando a API: https://...`
- `📥 HTTP Code: 200` o `401`
- `✅ X opciones formateadas` o `❌ Error HTTP 401`

---

## ⚙️ Estructura del Archivo cotizar.php

```
1. Recibe petición POST con código postal y peso
2. Llama a API de enviosinternacionales.com con Basic Auth
3. Si HTTP 200 → Formatea y retorna opciones
4. Si HTTP 401 → Retorna error de credenciales
5. Si HTTP 404 → Retorna error de endpoint
```

**No hay fallbacks, no hay mockups, solo API real.**

---

## ✅ Checklist

- [ ] Subir `cotizar.php` al servidor
- [ ] Verificar permisos 644
- [ ] Probar con CP 06600
- [ ] Revisar consola del navegador (F12)
- [ ] Si falla con 401 → Contactar enviosinternacionales.com
- [ ] Cuando funcione → Listo para producción

---

**Todo listo. Sube el archivo y prueba.** 🚀
