# ❓ ¿Qué necesito saber para ayudarte?

Ya que tienes los archivos subidos a cPanel pero sigue el error, necesito información específica para diagnosticar el problema exacto.

---

## 🎯 RESPONDE ESTAS 3 PREGUNTAS SIMPLES:

### 1️⃣ ¿Qué ves cuando abres esta URL en tu navegador?

```
https://cdn.inedito.digital/mercadopago/create-preference.php
```

**Opciones:**

- [ ] A) Mensaje JSON como: `{"success":false,"message":"Método no permitido..."}`
- [ ] B) Error 404 - "Not Found"
- [ ] C) Error 403 - "Forbidden"
- [ ] D) Error 500 - "Internal Server Error"
- [ ] E) Página en blanco
- [ ] F) Otro: _________________

---

### 2️⃣ ¿Qué dice la consola del navegador cuando intentas pagar?

**Pasos:**
1. Ve a https://litfit.inedito.digital
2. Agrega producto al carrito
3. Ve al checkout y llena el formulario
4. **ANTES de hacer clic**, abre la consola (F12)
5. Haz clic en "Pagar con Mercado Pago"
6. **Copia TODO el texto que aparece en rojo** en la consola

**Pega aquí el error completo:**
```
[Pega aquí el error de la consola]
```

---

### 3️⃣ ¿Están los archivos en estas rutas EXACTAS en cPanel?

Verifica en cPanel File Manager:

**Archivo 1:**
```
Ruta: /home/inedito/private/config/mercadopago-config.php
```
- [ ] SÍ, está en esa ruta exacta
- [ ] NO, está en otra ruta: _________________
- [ ] NO existe

**Archivo 2:**
```
Ruta: /home/inedito/public_html/cdn/mercadopago/create-preference.php
```
- [ ] SÍ, está en esa ruta exacta
- [ ] NO, está en otra ruta: _________________
- [ ] NO existe

---

## 🧪 HERRAMIENTA DE DIAGNÓSTICO AUTOMÁTICO

**Mejor aún, usa la herramienta automática:**

1. Abre el archivo: **`diagnostico-mercadopago.html`**
2. Ábrelo en tu navegador (doble clic)
3. Espera a que se ejecuten los tests (1-2 minutos)
4. **Toma captura de pantalla** de los resultados

**Y comparte:**
- ¿Qué tests pasan (✅)?
- ¿Qué tests fallan (❌)?
- ¿Qué mensajes aparecen en cada test?

---

## 📸 CAPTURAS DE PANTALLA ÚTILES

Si puedes, toma capturas de:

### 1. Estructura de carpetas en cPanel
Muestra la carpeta `/home/inedito/public_html/cdn/` para ver si existe "mercadopago"

### 2. Consola del navegador (F12)
Cuando haces clic en "Pagar con Mercado Pago", muestra los errores en rojo

### 3. Resultado de diagnostico-mercadopago.html
Toda la página con los resultados de los tests

---

## 🎯 CON ESTA INFORMACIÓN PODRÉ:

✅ Identificar el problema exacto  
✅ Darte la solución específica  
✅ Hacer que Mercado Pago funcione en minutos  

---

## 📝 RESPUESTAS RÁPIDAS (copia y pega)

**Pregunta 1 (URL en navegador):**
```
Al abrir https://cdn.inedito.digital/mercadopago/create-preference.php veo:
[Pega aquí lo que ves]
```

**Pregunta 2 (Error en consola):**
```
Error en consola del navegador:
[Pega aquí el error completo]
```

**Pregunta 3 (Rutas en cPanel):**
```
mercadopago-config.php está en: [ruta]
create-preference.php está en: [ruta]
```

---

## 🚀 SOLUCIONES COMUNES (Prueba mientras tanto)

### Si ves error 404:
```
Los archivos NO están en la ubicación correcta.
Verifica las rutas en cPanel.
```

### Si ves "Failed to fetch":
```
1. Vacía la caché del navegador
2. Prueba en modo incógnito
3. Desactiva bloqueadores de anuncios
4. Prueba en otro navegador
```

### Si ves error 500:
```
Ve a cPanel → Error Log
Busca el error más reciente
Copia el mensaje completo
```

---

**Responde las 3 preguntas de arriba y podré ayudarte específicamente! 🎯**
