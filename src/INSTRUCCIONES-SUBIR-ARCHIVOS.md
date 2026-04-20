# 📁 Cómo Subir los Archivos PHP al Servidor

## 🎯 Problema Detectado

El error **"Failed to fetch"** significa que el archivo `cotizar.php` **NO ESTÁ** en el servidor todavía.

---

## ✅ Solución: Sube 2 Archivos

### **PASO 1: Crea las Carpetas en cPanel**

1. Ve a **cPanel → File Manager**
2. Navega a: `/public_html/`
3. Crea esta estructura de carpetas:
   ```
   public_html/
   └── api/
       └── envios/
   ```

**Cómo crear carpetas:**
- Click en "**+ Folder**" (arriba)
- Nombre: `api`
- Entra a `api`
- Click en "**+ Folder**" otra vez
- Nombre: `envios`

---

### **PASO 2: Sube el Archivo de Test Primero**

1. Ve a: `/public_html/api/envios/`
2. Click en "**Upload**"
3. Sube el archivo: **`test-conexion.php`** (descárgalo de aquí)
4. Permisos: **644**

---

### **PASO 3: Prueba el Archivo de Test**

Abre en tu navegador:
```
https://inedito.digital/api/envios/test-conexion.php
```

**Deberías ver:**
```json
{
  "success": true,
  "message": "✅ El archivo PHP está funcionando correctamente!",
  "server_time": "2026-01-06 14:00:00",
  "php_version": "8.x",
  "method": "GET"
}
```

✅ **Si ves eso → La ruta es correcta, continúa al Paso 4**

❌ **Si NO ves eso:**
- Verifica que la carpeta sea `/public_html/api/envios/`
- Verifica que el archivo se llame exactamente `test-conexion.php`
- Verifica permisos: 644

---

### **PASO 4: Sube el Archivo Principal**

1. Ve a: `/public_html/api/envios/`
2. Click en "**Upload**"
3. Sube el archivo: **`cotizar.php`** (descárgalo de aquí)
4. Permisos: **644**

---

### **PASO 5: Prueba el Sistema Completo**

Abre el archivo `test-api-simple.html` en tu navegador y haz click en "Probar Backend PHP".

---

## 📋 Estructura Final

Tu servidor debe verse así:

```
/home/inedito/public_html/
├── api/
│   └── envios/
│       ├── test-conexion.php  ← Archivo de prueba
│       └── cotizar.php         ← Archivo principal
├── index.html
└── [otros archivos de WordPress]
```

---

## 🔍 Cómo Verificar que Está Correcto

### Test 1: Archivo de conexión
```
URL: https://inedito.digital/api/envios/test-conexion.php
Esperado: JSON con "success": true
```

### Test 2: Archivo principal (desde el HTML)
```
Abrir: test-api-simple.html
Click: "Probar Backend PHP"
Esperado: Ver opciones de envío O error de la API (no "Failed to fetch")
```

---

## ⚠️ Errores Comunes

### "Failed to fetch"
❌ El archivo NO está en el servidor
✅ Sube el archivo a la ruta correcta

### "404 Not Found"
❌ La ruta es incorrecta
✅ Verifica: `/public_html/api/envios/cotizar.php`

### "403 Forbidden"
❌ Permisos incorrectos
✅ Cambia a: 644

### "500 Internal Server Error"
❌ Error de sintaxis PHP
✅ Revisa los logs en cPanel → Errors

---

## 📞 Si Sigues Con Problemas

Dime:
1. ¿Puedes acceder a `https://inedito.digital/api/envios/test-conexion.php`?
2. ¿Qué mensaje ves?
3. ¿Qué dice cPanel File Manager? (captura de pantalla)

---

## 🎯 Resumen Rápido

1. ✅ Crea carpeta: `/public_html/api/envios/`
2. ✅ Sube: `test-conexion.php`
3. ✅ Prueba: `https://inedito.digital/api/envios/test-conexion.php`
4. ✅ Si funciona → Sube: `cotizar.php`
5. ✅ Prueba desde: `test-api-simple.html`

**¡Listo!** 🚀
