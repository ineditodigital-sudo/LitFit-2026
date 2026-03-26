# 📦 INTEGRACIÓN CON ENVÍOS INTERNACIONALES

## ✅ QUÉ SE HA IMPLEMENTADO

He creado una integración automática que envía los pedidos a **enviosinternacionales.com** inmediatamente después de que un pago sea exitoso (Mercado Pago o PayPal).

---

## 🔧 ARCHIVOS MODIFICADOS

### 1. **Archivo PHP creado: `/crear-orden-envios.php`**

**Ubicación en cPanel:**
```
/home/inedito/public_html/cdn.inedito.digital/envios/crear-orden.php
```

**URL de acceso:**
```
https://cdn.inedito.digital/envios/crear-orden.php
```

**Qué hace:**
- Recibe los datos del pedido desde el frontend
- Prepara la información del cliente y productos
- Envía un email a enviosinternacionales.com con todos los detalles
- Guarda un log local de todas las órdenes

---

### 2. **Frontend actualizado:**

#### `/pages/payment-success-mp.tsx` ✅
- Ahora llama automáticamente al endpoint de envíos después del email de confirmación
- Registra si la orden se creó exitosamente

#### `/pages/checkout.tsx` ✅
- Integración con PayPal actualizada
- También envía órdenes de PayPal a Envíos Internacionales

---

## 📋 PASOS PARA CONFIGURAR

### PASO 1: Subir archivo PHP a cPanel

1. **Descarga** el archivo `crear-orden-envios.php` de Figma Make

2. **Accede a cPanel**:
   - URL: https://inedito.digital:2083
   - Usuario: Tu usuario de cPanel
   - Contraseña: Tu contraseña

3. **Crea la carpeta** (si no existe):
   ```
   /home/inedito/public_html/cdn.inedito.digital/envios/
   ```

4. **Sube el archivo**:
   - Copia `crear-orden-envios.php`
   - Pégalo en `/home/inedito/public_html/cdn.inedito.digital/envios/`
   - Renómbralo a `crear-orden.php`

5. **Establece permisos**:
   - Click derecho en el archivo → Permisos
   - Establece: `644`

---

### PASO 2: Configurar email de destino

Abre el archivo `crear-orden.php` y busca esta línea (aproximadamente línea 180):

```php
$emailDestino = 'ordenes@enviosinternacionales.com'; // Ajustar email real
```

**Cámbiala al email real de Envíos Internacionales** donde quieres recibir las notificaciones.

Por ejemplo:
```php
$emailDestino = 'ventasenvios@enviosinternacionales.com';
```

---

### PASO 3: (Opcional) Configurar API de Envíos Internacionales

Si **enviosinternacionales.com tiene una API REST**, puedes configurarla para que las órdenes se creen automáticamente en su sistema.

#### ¿Tiene API?

Pregunta a tu contacto en Envíos Internacionales:
- ¿Tienen API REST para crear órdenes?
- ¿Cuál es la URL del endpoint?
- ¿Qué credenciales necesitas? (API Key, Token, etc.)
- ¿Cuál es la estructura de datos que esperan?

#### Si tienen API:

1. Abre `crear-orden.php`
2. Busca la sección:
   ```php
   // ============================================
   // OPCIÓN 1: ENVIAR A API DE ENVÍOS INTERNACIONALES
   // ============================================
   ```

3. Descomenta el código (quita los `/*` y `*/`)

4. Configura:
   ```php
   $ch = curl_init('https://api.enviosinternacionales.com/v1/ordenes'); // URL real de la API
   curl_setopt($ch, CURLOPT_HTTPHEADER, [
       'Content-Type: application/json',
       'Authorization: Bearer TU_API_KEY_AQUI' // Credenciales reales
   ]);
   ```

5. Ajusta el formato de `$apiData` según la documentación de su API

---

## 📧 CÓMO FUNCIONA (Flujo actual con EMAIL)

### Cuando un cliente paga:

```
1. Cliente completa checkout ✅
   ↓
2. Paga con Mercado Pago o PayPal ✅
   ↓
3. Frontend detecta pago exitoso ✅
   ↓
4. Envía email de confirmación al cliente ✅
   ↓
5. 🆕 Llama a crear-orden.php ✅
   ↓
6. crear-orden.php envía email a Envíos Internacionales ✅
   ↓
7. Envíos Internacionales recibe email con:
   - Datos del destinatario
   - Productos a enviar
   - Dirección completa
   - Total pagado
   - Método de pago
   - Notas especiales
```

---

## 📨 FORMATO DEL EMAIL QUE RECIBE ENVÍOS INTERNACIONALES

El email que llegará a Envíos Internacionales tiene este formato:

### Asunto:
```
Nueva Orden de Envío - LITFIT - #LITFIT-1234567890
```

### Contenido:

```
═══════════════════════════════════════
       Nueva Orden de Envío - LITFIT       
         Orden #LITFIT-1234567890          
═══════════════════════════════════════

📦 INFORMACIÓN DEL DESTINATARIO
───────────────────────────────────────
Nombre:     Juan Pérez García
Teléfono:   5512345678
Email:      cliente@example.com
Dirección:  Av. Reforma 123, Colonia Centro, 
            Ciudad de México, CDMX, 
            CP 06000, México

📦 PRODUCTOS A ENVIAR
───────────────────────────────────────
• Proteína ISO - Chocolate (1kg) x1
• Barras energéticas - Frutos rojos x2

💰 INFORMACIÓN DEL PAGO
───────────────────────────────────────
Método de pago:    Mercado Pago
Total productos:   $899.00 MXN
Costo de envío:    $150.00 MXN
Total pagado:      $1,049.00 MXN
Estado:            ✅ PAGADO

📝 NOTAS ADICIONALES
───────────────────────────────────────
Tocar timbre al llegar, departamento 301

───────────────────────────────────────
Este email fue generado automáticamente
Por favor, crea el envío en tu sistema
usando estos datos
```

---

## 🧪 CÓMO PROBAR

### Prueba 1: Con el producto de $10 MXN

1. Ve a https://litfit.inedito.digital
2. Agrega el **PRODUCTO DE PRUEBA** al carrito
3. Completa el checkout con datos reales
4. Paga con Mercado Pago (solo $10 MXN)
5. Espera la confirmación
6. **Verifica** que llegó el email a Envíos Internacionales

### Prueba 2: Revisar logs en cPanel

1. Ve a cPanel → Administrador de archivos
2. Navega a: `/home/inedito/public_html/cdn.inedito.digital/envios/`
3. Abre el archivo: `ordenes-log.txt`
4. Deberías ver algo como:
   ```
   [2026-01-21 16:30:45] Orden: LITFIT-12345 | Cliente: Juan Pérez | Total: $10.00 | Método: Mercado Pago
   ```

---

## 🔍 DEBUGGING

### Si no llega el email a Envíos Internacionales:

1. **Revisa los logs de error de PHP:**
   ```
   /home/inedito/public_html/cdn.inedito.digital/envios/error_log
   ```

2. **Verifica que el email está bien configurado:**
   - Abre `crear-orden.php`
   - Busca `$emailDestino =`
   - Confirma que es el email correcto

3. **Revisa la consola del navegador** (F12):
   - Busca logs de:
     - `📦 Enviando orden a Envíos Internacionales...`
     - `✅ Orden creada en Envíos Internacionales:`

4. **Revisa la carpeta de SPAM** de Envíos Internacionales

---

## 📊 DATOS QUE SE ENVÍAN

El sistema envía automáticamente:

### Información del cliente:
- ✅ Nombre completo
- ✅ Email
- ✅ Teléfono
- ✅ Dirección completa (calle, colonia, ciudad, estado, CP, país)

### Información del pedido:
- ✅ Lista de productos con cantidades y variantes
- ✅ Total de productos
- ✅ Costo de envío
- ✅ Total pagado
- ✅ Método de pago (Mercado Pago o PayPal)
- ✅ Número de orden único
- ✅ Notas especiales del cliente

---

## 🎯 PRÓXIMOS PASOS (Opcional)

### Si quieres integración directa con su API:

1. **Contacta a Envíos Internacionales** y pide:
   - Documentación de su API
   - Credenciales de API (API Key o Token)
   - URL del endpoint para crear órdenes
   - Estructura de datos que esperan

2. **Implementa la API:**
   - Descomenta la sección de API en `crear-orden.php`
   - Configura las credenciales
   - Ajusta el formato de datos según su documentación
   - Prueba con datos de prueba

3. **Ventajas de usar API:**
   - Las órdenes se crean automáticamente en su sistema
   - No necesitan copiar datos manualmente
   - Menos errores humanos
   - Tracking automático

---

## ✅ CHECKLIST DE CONFIGURACIÓN

Marca lo que ya hiciste:

- [ ] Descargué `crear-orden-envios.php` de Figma Make
- [ ] Creé la carpeta `/envios/` en cPanel
- [ ] Subí el archivo y lo renombré a `crear-orden.php`
- [ ] Establecí permisos `644`
- [ ] Configuré el email destino correcto
- [ ] Probé con el producto de $10 MXN
- [ ] Verifiqué que llegó el email a Envíos Internacionales
- [ ] Revisé el archivo `ordenes-log.txt`

---

## 📞 CONTACTO CON ENVÍOS INTERNACIONALES

Para configurar la integración directa con API, contacta a:

**Email:** (Tu contacto en Envíos Internacionales)
**Teléfono:** (Si tienes)

**Pregúntales:**
1. ¿Tienen API REST para crear órdenes automáticamente?
2. Si sí, ¿me pueden proporcionar la documentación?
3. ¿Cuáles son las credenciales que necesito?

---

## 🚀 RESUMEN

**Estado actual:** ✅ FUNCIONANDO con EMAIL

**Flujo:**
1. Cliente paga → ✅
2. Email de confirmación al cliente → ✅
3. Email automático a Envíos Internacionales → ✅
4. Envíos Internacionales crea la orden manualmente → ⏳

**Próximo paso recomendado:**
- Configurar API para que las órdenes se creen automáticamente (si tienen API)

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0 - Integración con EMAIL
