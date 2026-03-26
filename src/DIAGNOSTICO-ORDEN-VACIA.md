# 🔍 DIAGNÓSTICO: Orden se crea pero aparece vacía

## ✅ LO QUE YA FUNCIONA:
- Bearer Token ✅
- Endpoint `/api/v1/orders` ✅
- HTTP 200 ✅
- Se crea la orden ✅

## ❌ PROBLEMA:
- La orden aparece vacía en enviosinternacionales.com
- Todos los campos en `null`

---

## 🛠️ SOLUCIÓN APLICADA:

### **Cambié la estructura del JSON**

**ANTES (anidado):**
```json
{
  "origin": {
    "name": "...",
    "street": "...",
    ...
  },
  "destination": {
    "name": "...",
    ...
  }
}
```

**AHORA (plano):**
```json
{
  "ecommerce_id": "LITFIT-123456",
  "platform": "custom",
  "price": 940.00,
  "origin_name": "LITFIT - Almacén Principal",
  "origin_street": "Av. Constitución 123",
  "origin_city": "Monterrey",
  "destination_name": "Ricardo Corona",
  "destination_street": "...",
  "destination_city": "...",
  "parcel_weight": 1.2,
  "parcel_length": 30,
  ...
}
```

### **Agregué logging detallado**

Ahora el archivo registra EXACTAMENTE qué JSON se envía a la API.

---

## 🧪 CÓMO PROBAR:

### **PASO 1: Sube el archivo actualizado**

1. Descarga `crear-orden-envios.php` de Figma Make
2. Sube a cPanel: `/envios/`
3. Renómbralo a: `crear-orden.php`
4. Permisos: 644

---

### **PASO 2: Prueba con el simulador**

```
https://litfit.inedito.digital/test-payment
```

Haz una compra de prueba.

---

### **PASO 3: Verifica los logs en cPanel**

1. En cPanel, ve a **"Error Log"** o **"Registro de errores PHP"**
2. Busca la línea que dice: **"📋 JSON completo que se enviará:"**
3. **Cópiala completa** y pégala aquí

Debe verse algo como:
```json
{
  "ecommerce_id": "LITFIT-1769032567079",
  "platform": "custom",
  "price": 940,
  "origin_name": "LITFIT - Almacén Principal",
  "origin_street": "Av. Constitución 123, Col. Centro",
  "origin_city": "Monterrey",
  "origin_state": "Nuevo León",
  "origin_zip_code": "64000",
  "destination_name": "Ricardo Corona",
  "destination_street": "Calle Falsa 123",
  "destination_city": "Ciudad de México",
  "destination_state": "CDMX",
  "destination_zip_code": "01000",
  "parcel_weight": 1.2,
  "parcel_length": 30,
  "parcel_width": 20,
  "parcel_height": 15,
  "parcel_value": 850
}
```

---

### **PASO 4: Verifica en enviosinternacionales.com**

1. Ve a tu panel de órdenes
2. Busca la orden recién creada
3. **¿Ahora SÍ tiene datos?** ✅
4. **¿Sigue vacía?** ❌

---

## 📊 POSIBLES RESULTADOS:

### **✅ RESULTADO A: FUNCIONÓ**

La orden ahora SÍ tiene todos los datos:
- Nombre del destinatario ✅
- Dirección completa ✅
- Productos ✅
- Peso ✅

**→ ¡PERFECTO! Ya está todo automatizado** 🎉

---

### **❌ RESULTADO B: SIGUE VACÍA**

La orden aún aparece sin datos.

**Siguiente paso:**

1. **Copia el JSON completo** de los logs de cPanel
2. **Ve a enviosinternacionales.com**
3. Busca: **Configuración → API → Documentación**
4. Compara el JSON que enviamos vs el ejemplo de su documentación
5. **O contáctame con:**
   - El JSON que se envió (de los logs)
   - Captura de la documentación de la API (si la encuentras)

---

## 🎯 NOMBRES DE CAMPOS ALTERNATIVOS:

Si esta versión no funciona, es posible que los campos tengan nombres diferentes.

### **Prueba estos nombres alternativos:**

**Para dirección de origen:**
```
origin_name / from_name / sender_name
origin_address / from_address / sender_address
origin_zip / from_zip / sender_zip
```

**Para dirección de destino:**
```
destination_name / to_name / receiver_name
destination_address / to_address / receiver_address  
destination_zip / to_zip / receiver_zip
```

**Para paquete:**
```
parcel_weight / weight / package_weight
parcel_value / value / declared_value
```

---

## 📞 ¿NO ENCUENTRAS LA DOCUMENTACIÓN?

### **Opción A: Inspecciona una orden existente**

Si enviosinternacionales.com tiene una opción de "Exportar" o "Ver JSON":

1. Crea una orden manualmente
2. Busca "Exportar" o "Ver detalles técnicos"
3. Si te muestra un JSON, cópialo completo

Eso nos dirá EXACTAMENTE qué estructura usan.

---

### **Opción B: Prueba con campos mínimos**

Voy a crear otra versión que envíe SOLO los campos esenciales:

```json
{
  "origin_zip": "64000",
  "destination_zip": "01000",
  "weight": 1.2,
  "price": 940
}
```

Si esta versión SÍ funciona, sabré que los campos adicionales causan problemas.

---

## 🚨 IMPORTANTE:

**DESPUÉS DE PROBAR, NECESITO QUE ME COMPARTAS:**

1. ✅ **Los logs completos** del simulador (consola del navegador)
2. ✅ **Los logs de cPanel** (especialmente el JSON que se envió)
3. ✅ **Captura de la orden** en enviosinternacionales.com (¿tiene datos o sigue vacía?)

Con eso podré ajustar perfectamente la estructura. 🚀
