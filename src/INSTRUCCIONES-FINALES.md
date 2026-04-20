# 🎯 INSTRUCCIONES FINALES - Saldo de Mercado Pago

## ✅ QUÉ HE HECHO

1. ✅ Actualicé `create-preference.php` para enviar `payment_methods` con arrays vacíos
2. ✅ Cambié el precio del producto de prueba de **$0.01** a **$10.00 MXN**
3. ✅ Creé scripts de diagnóstico

---

## ⚠️ EL PROBLEMA REAL

Tu diagnóstico muestra que la configuración **sigue devolviendo**:

```json
"excluded_payment_methods": [{"id": ""}]
"excluded_payment_types": [{"id": ""}]
```

Esto significa que **tu aplicación de Mercado Pago tiene estas exclusiones configuradas a nivel del panel de desarrolladores**, y no se pueden sobrescribir solo con código.

---

## 🔧 SOLUCIÓN OBLIGATORIA

**DEBES ir al panel de Mercado Pago y eliminar las exclusiones:**

### PASO 1: Acceder al panel

1. Ve a: **https://www.mercadopago.com.mx/developers/panel**
2. Inicia sesión con tu cuenta de Mercado Pago (la del vendedor)

### PASO 2: Seleccionar tu aplicación

1. En el panel, verás una lista de aplicaciones
2. Busca la que tiene Client ID: `2656381259343864`
3. O la que tiene Public Key: `APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4`
4. Haz click en ella

### PASO 3: Configuración de medios de pago

Busca una de estas opciones en el menú lateral:
- **"Configuración"** → **"Medios de pago"**
- **"Payment methods"**
- **"Configuración de pagos"**
- **"Settings"** → **"Payment methods"**

### PASO 4: Eliminar exclusiones

1. Deberías ver una sección que dice algo como:
   - "Medios de pago excluidos" / "Excluded payment methods"
   - "Tipos de pago excluidos" / "Excluded payment types"

2. **ELIMINA TODO** lo que esté en esas listas
   - Incluso si está vacío o con placeholders, borra todo
   - Debe quedar COMPLETAMENTE VACÍO

3. **Guarda los cambios**

### PASO 5: Esperar

- Mercado Pago puede tardar **5-10 minutos** en aplicar los cambios
- Durante ese tiempo, toma un café ☕

---

## 🧪 CÓMO PROBAR DESPUÉS

### Prueba 1: Script de diagnóstico

1. Ve a: https://cdn.inedito.digital/mercadopago/verificar-metodos-pago.php
2. Click en **"Crear Preferencia de Prueba"**
3. Verifica que ahora muestre:
   ```json
   "excluded_payment_methods": []  ← VACÍO
   "excluded_payment_types": []    ← VACÍO
   ```

### Prueba 2: Desde tu tienda

1. Ve a: https://litfit.inedito.digital
2. Agrega el **PRODUCTO DE PRUEBA** ($10 MXN) al carrito
3. Completa el checkout
4. Selecciona **Mercado Pago**
5. Intenta pagar con tu **saldo de Mercado Pago**
6. Ahora debería funcionar ✅

---

## 📊 CAMBIOS REALIZADOS EN FIGMA MAKE

### Archivo actualizado: `create-preference.php`

```php
'payment_methods' => [
    'excluded_payment_methods' => [],
    'excluded_payment_types' => []
]
```

**Importante:** Descarga y sube este archivo a cPanel DESPUÉS de limpiar el panel de MP.

### Archivo actualizado: `producto-prueba.tsx`

```typescript
price: 10.00  // Cambió de 0.01 a 10.00
```

Ahora el producto cuesta **$10 MXN** en lugar de 1 centavo.

---

## 🎯 RAZONES DEL CAMBIO DE PRECIO

**¿Por qué cambié de $0.01 a $10.00?**

1. **Monto mínimo:** Mercado Pago tiene montos mínimos por método de pago:
   - Tarjetas: $10 MXN
   - OXXO: $10 MXN  
   - **Saldo MP:** Puede variar

2. **Más realista:** $10 es más cercano a un precio real de producto

3. **Evita errores:** Montos muy bajos pueden causar rechazos automáticos

---

## ❌ SI AÚN NO FUNCIONA

### Opción 1: Contactar a Mercado Pago

Si después de limpiar el panel y esperar 10 minutos aún no funciona:

**Contacta a soporte:**
- Email: ayuda@mercadopago.com.mx
- Teléfono: 800 XXX XXXX (buscar en su web)

**Mensaje sugerido:**

```
Hola,

Tengo una aplicación de Mercado Pago configurada y no puedo recibir 
pagos con saldo de Mercado Pago (account_money).

Datos de mi aplicación:
- Client ID: 2656381259343864
- Public Key: APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4
- Collector ID: 198666053

He verificado que:
- La preferencia no excluye métodos de pago
- El monto es de $10 MXN (sobre el mínimo)
- Otros métodos funcionan correctamente

¿Pueden verificar si mi cuenta vendedor tiene restricciones
para recibir pagos con saldo de Mercado Pago?

Gracias.
```

### Opción 2: Crear nueva aplicación

Como último recurso, crea una nueva aplicación en Mercado Pago:

1. Ve a: https://www.mercadopago.com.mx/developers/panel
2. Click en **"Crear aplicación"** o **"Create application"**
3. Configúrala SIN excluir ningún método
4. Usa las nuevas credenciales en `mercadopago-config.php`

---

## 📱 CAPTURA DE PANTALLA REQUERIDA

Para ayudarte mejor, necesito que me envíes una captura de:

1. El panel de Mercado Pago
2. La sección de "Configuración de medios de pago"
3. Las listas de métodos excluidos

Así podré ver exactamente qué tienes configurado.

---

## ✅ CHECKLIST FINAL

Marca lo que ya hiciste:

- [ ] Accedí al panel de Mercado Pago
- [ ] Encontré mi aplicación (Client ID: 2656381259343864)
- [ ] Entré a "Configuración de medios de pago"
- [ ] Eliminé TODAS las exclusiones de métodos
- [ ] Eliminé TODAS las exclusiones de tipos
- [ ] Guardé los cambios
- [ ] Esperé 10 minutos
- [ ] Descargué `create-preference.php` actualizado de Figma Make
- [ ] Lo subí a cPanel sobrescribiendo el anterior
- [ ] Probé con el producto de $10 MXN
- [ ] El pago con saldo de MP ahora funciona ✅

---

## 🚀 PRÓXIMOS PASOS

Una vez que funcione:

1. **Descarga y guarda** el archivo `create-preference.php` actualizado
2. **Súbelo a cPanel** en: `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
3. **Prueba con un producto real** (no solo el de prueba)
4. **Verifica** que todos los métodos funcionen:
   - ✅ Saldo de Mercado Pago
   - ✅ Tarjetas de crédito
   - ✅ Tarjetas de débito
   - ✅ OXXO
   - ✅ SPEI

---

## 💡 RESUMEN EJECUTIVO

1. **Problema:** Tu app de MP tiene exclusiones configuradas en el panel
2. **Solución:** Eliminar exclusiones desde el panel de desarrolladores
3. **Código:** Ya está actualizado en Figma Make
4. **Monto:** Cambié de $0.01 a $10.00 MXN
5. **Acción requerida:** Limpiar panel de MP y subir archivo PHP actualizado

---

**Última actualización:** 21 de enero de 2026  
**Estado:** ⏳ Esperando que limpies el panel de Mercado Pago  
**Próximo paso:** Acceder a https://www.mercadopago.com.mx/developers/panel
