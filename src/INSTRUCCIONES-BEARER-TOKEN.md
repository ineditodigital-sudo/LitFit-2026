# 🔑 CONFIGURAR BEARER TOKEN - ENVÍOS INTERNACIONALES

## ✅ CÓDIGO YA ACTUALIZADO

El archivo `crear-orden-envios.php` ya está configurado para usar **Bearer Token** en lugar de Basic Auth.

---

## 📋 PASOS PARA ACTIVAR LA INTEGRACIÓN:

### **PASO 1: Obtén tu Bearer Token**

1. Ve a: **https://app.enviosinternacionales.com**
2. Inicia sesión con tu cuenta
3. Busca una de estas secciones:
   - **"Configuración"** → **"API"**
   - **"Integraciones"**
   - **"API Keys"**
   - **"Tokens"**
   - **"Desarrolladores"**

4. Busca un botón como:
   - **"Generar Token"**
   - **"Crear API Key"**
   - **"Obtener Access Token"**

5. **Copia el token completo**  
   Se verá algo como:
   ```
   eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c
   ```

---

### **PASO 2: Actualiza el archivo PHP**

1. Descarga `crear-orden-envios.php` de Figma Make
2. Abre el archivo en un editor de texto (Notepad, VS Code, etc.)
3. Busca la línea **22** que dice:
   ```php
   define('ENVIOS_BEARER_TOKEN', 'TU_BEARER_TOKEN_AQUI');
   ```

4. **Reemplaza** `TU_BEARER_TOKEN_AQUI` con tu token real:
   ```php
   define('ENVIOS_BEARER_TOKEN', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...');
   ```

5. **NO BORRES LAS COMILLAS** (`'...'`)

---

### **PASO 3: Completa tus datos de origen (Almacén)**

En el mismo archivo, actualiza las líneas **33-39** con la dirección de tu almacén/oficina:

```php
define('ORIGIN_NAME', 'LITFIT - Almacén Principal');
define('ORIGIN_STREET', 'Av. Constitución 123, Col. Centro'); // ⚠️ TU DIRECCIÓN
define('ORIGIN_CITY', 'Monterrey'); // ⚠️ TU CIUDAD
define('ORIGIN_STATE', 'Nuevo León'); // ⚠️ TU ESTADO
define('ORIGIN_ZIP', '64000'); // ⚠️ TU CP
define('ORIGIN_COUNTRY', 'MX');
define('ORIGIN_PHONE', '8112345678'); // ⚠️ TU TELÉFONO
```

---

### **PASO 4: Sube el archivo a cPanel**

1. Entra a **cPanel** de tu hosting
2. Ve a **"Administrador de archivos"** (File Manager)
3. Navega a: `/public_html/cdn.inedito.digital/envios/`
4. **Sube** el archivo actualizado
5. **Renómbralo** a: `crear-orden.php`
6. Asegúrate que tenga permisos **644**

---

### **PASO 5: Prueba la integración**

1. Ve al simulador de pagos:
   ```
   https://litfit.inedito.digital/test-payment
   ```

2. Haz una prueba de compra

3. **Revisa los logs**. Deberías ver:
   ```
   ✅ Orden creada en Envíos Internacionales
   📡 Método: API (no EMAIL_FALLBACK)
   📥 HTTP Code: 200 o 201
   ```

4. **Verifica en enviosinternacionales.com**:
   - Ve a tu panel de órdenes
   - Debería aparecer la nueva orden automáticamente

---

## 🎯 RESULTADOS ESPERADOS:

### ✅ **ÉXITO (HTTP 200/201):**
```
📥 HTTP Code: 200
✅ Envío creado exitosamente
📮 Tracking Number: MX123456789
📡 Método: API
```

**→ La orden aparecerá automáticamente en tu panel de enviosinternacionales.com**

---

### ❌ **SI SIGUE DANDO ERROR 401:**

Posibles causas:

1. **Token incorrecto o expirado**
   - Verifica que copiaste el token completo
   - Genera un nuevo token

2. **Token sin permisos**
   - Verifica que el token tenga permisos para "crear órdenes"

3. **Cuenta sin acceso a API**
   - Contacta a soporte de enviosinternacionales.com
   - Pregunta si tu plan incluye acceso API

---

### ❌ **SI DA ERROR 404:**

El endpoint `/api/v1/orders` no existe.

**Pregunta a soporte:**
- ¿Cuál es el endpoint correcto para crear órdenes?
- ¿Tienen documentación de la API?

Posibles endpoints alternativos:
- `/api/v1/ordenes`
- `/api/v1/shipments`
- `/api/v1/create-order`

---

### ❌ **SI DA ERROR 400:**

La estructura de datos que envío no es la correcta.

**Solución:**
- Necesitas la documentación de la API
- Pregunta a soporte qué campos requieren

---

## 🆘 SI NO ENCUENTRAS CÓMO GENERAR EL TOKEN:

### **Opción A: Contacta a soporte**

Envía este mensaje:

```
Hola,

Tengo una tienda online (LITFIT) y necesito integrar su API para 
crear envíos automáticamente cuando mis clientes compren.

¿Podrían indicarme:
1. ¿Dónde puedo generar un Bearer Token o API Key?
2. ¿Cuál es el endpoint para crear órdenes de envío?
3. ¿Tienen documentación de la API?

Gracias.
```

---

### **Opción B: Busca en el panel**

Revisa todas estas secciones:
- Configuración
- API
- Integraciones
- Webhooks
- Desarrolladores
- Mi cuenta
- Perfil

---

## 📊 VERIFICACIÓN FINAL:

Una vez que funcione, cada compra en tu tienda:

1. ✅ Se procesa el pago (Mercado Pago o PayPal)
2. ✅ Se envía email de confirmación al cliente
3. ✅ **Se crea AUTOMÁTICAMENTE la orden en enviosinternacionales.com**
4. ✅ Aparece en tu panel con todos los datos listos
5. ✅ Solo tienes que imprimir la guía y enviar

---

## 🚀 ¡LISTO!

Una vez configurado el token, todo funcionará automáticamente sin que tengas que hacer nada manual.

**Cada venta → Orden automática en enviosinternacionales.com** 📦
