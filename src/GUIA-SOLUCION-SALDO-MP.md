# 🔧 GUÍA COMPLETA: Solucionar error de saldo de Mercado Pago

## 🎯 Problema

Al intentar pagar con **saldo de Mercado Pago**, aparece:
```
Algo salió mal...
No pudimos procesar tu pago
Usa un medio de pago distinto.
```

---

## 🔍 PASO 1: Diagnosticar el problema

### Subir el script de diagnóstico

1. Descarga `verificar-metodos-pago.php` de Figma Make
2. Súbelo a cPanel en: `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
3. Accede a: **https://cdn.inedito.digital/mercadopago/verificar-metodos-pago.php**
4. Haz click en **"Consultar Métodos Disponibles"**

### ¿Qué buscar?

Si **account_money** aparece en la lista:
- ✅ El problema NO es de tu código PHP
- ✅ El problema ES de configuración de Mercado Pago

Si **account_money** NO aparece:
- ❌ Tu cuenta NO tiene habilitado el saldo para pagos
- 🔧 Necesitas contactar a Mercado Pago

---

## 🛠️ PASO 2: Soluciones ordenadas por probabilidad

### Solución 1: Verificar configuración en panel de Mercado Pago (MÁS PROBABLE)

1. Ve a: **https://www.mercadopago.com.mx/developers/panel**
2. Click en tu aplicación de LITFIT
3. Ve a **"Configuración de pagos"** o **"Payment methods"**
4. Busca si hay métodos **excluidos** o **bloqueados**
5. **Asegúrate de que NO haya ningún método excluido**

**Específicamente busca:**
- ❌ `excluded_payment_methods` → debe estar VACÍO
- ❌ `excluded_payment_types` → debe estar VACÍO
- ✅ `account_money` → NO debe estar en la lista de excluidos

**Captura de pantalla de lo que debes revisar:**
```
Configuración → Medios de pago
└── Medios excluidos: [DEBE ESTAR VACÍO]
└── Tipos excluidos: [DEBE ESTAR VACÍO]
```

---

### Solución 2: Aumentar el monto mínimo

Mercado Pago puede tener un **monto mínimo** para ciertos métodos de pago.

**Prueba con $10 MXN en lugar de $0.01:**

1. Cambia el precio del producto de prueba temporalmente
2. O agrega más productos al carrito
3. Intenta pagar con saldo nuevamente

En `ProductoPrueba.tsx`, puedes cambiar temporalmente:
```typescript
price: 10.00  // En lugar de 0.01
```

---

### Solución 3: Verificar que la cuenta vendedor acepte saldo

**Tu cuenta de Mercado Pago debe tener configurado:**

1. Ve a tu cuenta de Mercado Pago (como vendedor)
2. **Configuración** → **Cuenta** → **Preferencias de pagos**
3. Verifica que **"Recibir pagos con saldo de Mercado Pago"** esté **HABILITADO**

Si no está habilitado:
- Contáctalo a soporte de Mercado Pago
- Solicita habilitar `account_money` para tu cuenta vendedor

---

### Solución 4: Probar con credenciales TEST primero

Antes de seguir, prueba en modo TEST para confirmar que el código funciona:

1. Abre `mercadopago-config.php` en cPanel
2. Cambia:
   ```php
   define('MP_TEST_MODE', true);  // Cambiar a true
   ```
3. Cambia las credenciales a las de TEST:
   ```php
   define('MP_ACCESS_TOKEN', 'TEST-XXXXXXX');
   define('MP_PUBLIC_KEY', 'TEST-XXXXXXX');
   ```

4. Usa tarjetas de prueba de Mercado Pago:
   - Tarjeta aprobada: `5031 7557 3453 0604`
   - CVV: `123`
   - Fecha: Cualquier fecha futura
   - Nombre: APRO

Si funciona en TEST pero NO en producción → El problema es de configuración de la cuenta de producción.

---

### Solución 5: Usar la versión minimalista del PHP

He creado `create-preference-ALL-METHODS.php` que usa SOLO los campos mínimos requeridos.

**Instrucciones:**

1. Descarga `create-preference-ALL-METHODS.php`
2. Súbelo a cPanel
3. Renombra tu `create-preference.php` actual a `create-preference-BACKUP.php`
4. Renombra `create-preference-ALL-METHODS.php` a `create-preference.php`
5. Prueba nuevamente

Esta versión:
- ✅ No incluye campos innecesarios
- ✅ Usa solo campos obligatorios
- ✅ Minimiza conflictos de configuración

---

## 📊 PASO 3: Revisar logs de cPanel

1. Ve a cPanel → **Archivos de registro**
2. Busca `error_log` en `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
3. Busca líneas recientes con tu prueba
4. Busca específicamente:
   ```
   💳 Métodos disponibles: {...}
   ```

Copia el contenido y revísalo para ver si `account_money` está incluido.

---

## 🎯 PASO 4: Verificar saldo real en tu cuenta

**Importante:** Verifica que tu cuenta de Mercado Pago (la que está pagando) tenga:

1. Saldo disponible mayor a $0.01
2. Saldo NO bloqueado o retenido
3. Cuenta verificada (email y teléfono confirmados)

Para verificar:
1. Ve a tu cuenta de Mercado Pago
2. **Dinero en cuenta** → **Saldo disponible**
3. Debe mostrar saldo mayor a $0.01

---

## 🔐 PASO 5: Verificar credenciales de producción

Asegúrate de que las credenciales sean de **producción** (no TEST):

```php
// ✅ CORRECTO - Producción
define('MP_ACCESS_TOKEN', 'APP_USR-XXXXXXX');
define('MP_PUBLIC_KEY', 'APP_USR-XXXXXXX');
define('MP_TEST_MODE', false);

// ❌ INCORRECTO - Test
define('MP_ACCESS_TOKEN', 'TEST-XXXXXXX');
define('MP_PUBLIC_KEY', 'TEST-XXXXXXX');
define('MP_TEST_MODE', true);
```

---

## 📞 PASO 6: Contactar a Mercado Pago (si nada funciona)

Si después de todo esto sigue sin funcionar:

1. Ve a: **https://www.mercadopago.com.mx/ayuda**
2. Inicia sesión con tu cuenta vendedor
3. **Contactar soporte** → **Problemas con cobros**
4. Explica:

```
Hola, tengo un problema con mi aplicación de Mercado Pago.

Credenciales: APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4 (Public Key)

Problema: Al crear una preferencia de pago a través de la API 
y abrir el checkout, el método "account_money" (saldo de Mercado Pago) 
aparece pero no permite completar el pago. Da error:
"No pudimos procesar tu pago - Usa un medio de pago distinto"

He verificado:
- La preferencia NO excluye ningún método de pago
- La API devuelve los métodos disponibles correctamente
- Otros métodos (tarjeta) funcionan correctamente
- La cuenta compradora tiene saldo disponible

¿Pueden verificar si hay alguna restricción en mi cuenta vendedor 
que impida recibir pagos con saldo de Mercado Pago?
```

---

## 🧪 PASO 7: Pruebas adicionales

### Prueba A: Crear preferencia desde Postman

1. Descarga Postman
2. Crea una petición POST a: `https://api.mercadopago.com/checkout/preferences`
3. Headers:
   ```
   Content-Type: application/json
   Authorization: Bearer TU_ACCESS_TOKEN
   ```
4. Body:
   ```json
   {
     "items": [{
       "title": "Producto de prueba",
       "quantity": 1,
       "unit_price": 10.00,
       "currency_id": "MXN"
     }]
   }
   ```
5. Envía la petición
6. Abre el `init_point` que te devuelve
7. Intenta pagar con saldo

Si funciona desde Postman pero NO desde tu app → El problema está en tu código PHP.
Si NO funciona ni desde Postman → El problema está en tu cuenta de Mercado Pago.

### Prueba B: Usar credenciales de otra cuenta

Si tienes acceso a otra cuenta de Mercado Pago:

1. Crea una nueva aplicación en esa cuenta
2. Usa esas credenciales temporalmente
3. Prueba si el saldo funciona

Si funciona con otra cuenta → El problema es específico de tu cuenta vendedor de LITFIT.

---

## ✅ Checklist de verificación

Marca lo que ya verificaste:

- [ ] Ejecuté `verificar-metodos-pago.php` y vi que `account_money` aparece
- [ ] Revisé el panel de Mercado Pago y NO hay métodos excluidos
- [ ] Probé con un monto mayor ($10 en lugar de $0.01)
- [ ] Verifiqué que mi cuenta vendedor puede recibir pagos con saldo
- [ ] Confirmé que la cuenta compradora tiene saldo disponible
- [ ] Las credenciales son de producción (APP_USR-xxx)
- [ ] `MP_TEST_MODE` está en `false`
- [ ] Probé con la versión minimalista del PHP
- [ ] Revisé los logs de error_log en cPanel
- [ ] Probé crear preferencia desde Postman directamente
- [ ] Contacté a soporte de Mercado Pago

---

## 💡 Dato importante sobre montos mínimos

**Mercado Pago México tiene montos mínimos por método:**

| Método | Monto mínimo |
|--------|--------------|
| Tarjeta de crédito | $10 MXN |
| Tarjeta de débito | $10 MXN |
| OXXO | $10 MXN |
| SPEI | $1 MXN |
| **Saldo MP** | **Puede variar** |

Para evitar problemas, **prueba con $10 MXN como mínimo**.

---

## 🎯 Resumen ejecutivo

### Causa más probable:

**Tu aplicación de Mercado Pago tiene configurado métodos excluidos** en el panel de desarrolladores, o **tu cuenta vendedor no tiene habilitado recibir pagos con saldo**.

### Solución más rápida:

1. Ve a https://www.mercadopago.com.mx/developers/panel
2. Selecciona tu aplicación
3. Ve a configuración de pagos
4. Quita TODOS los métodos excluidos
5. Guarda cambios
6. Prueba nuevamente

### Si nada funciona:

Contacta a soporte de Mercado Pago y pídeles que habiliten `account_money` para tu cuenta vendedor.

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 2.0 - Diagnóstico completo
