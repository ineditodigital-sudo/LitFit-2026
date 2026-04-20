# 🔧 SOLUCIÓN: Error al pagar con saldo de Mercado Pago

## ❌ Problema

Al intentar pagar con el **saldo disponible de Mercado Pago**, aparece el error:

```
Algo salió mal...
No pudimos procesar tu pago
¿Qué puedo hacer?
Usa un medio de pago distinto.
```

## 🔍 Causa del problema

El error ocurre porque el archivo `create-preference.php` estaba enviando una configuración de `payment_methods` que **excluía involuntariamente** el método de pago `account_money` (saldo de Mercado Pago).

Cuando se define `payment_methods` con un array vacío o con configuraciones específicas, Mercado Pago puede interpretar que solo se permiten ciertos métodos de pago.

## ✅ Solución

Para permitir **TODOS los métodos de pago**, incluyendo el saldo de Mercado Pago:

### Opción 1: NO incluir payment_methods en la preferencia

La mejor práctica es **simplemente NO incluir** la propiedad `payment_methods` en la preferencia de pago. De esta manera, Mercado Pago permite todos los métodos por defecto.

### Opción 2: Usar el archivo corregido

He creado el archivo `create-preference-FIXED.php` que:
- ✅ NO incluye restricciones de métodos de pago
- ✅ Permite saldo de Mercado Pago (account_money)
- ✅ Permite tarjetas de crédito/débito
- ✅ Permite pagos en efectivo (OXXO, etc.)
- ✅ Permite transferencias bancarias

---

## 📝 PASO A PASO: Actualizar en cPanel

### 1. Descargar el archivo corregido

Descarga `create-preference-FIXED.php` de Figma Make.

### 2. Hacer backup del archivo actual

Antes de reemplazar, haz un backup:

```bash
En cPanel, renombra:
create-preference.php → create-preference-BACKUP.php
```

### 3. Subir el archivo corregido

1. Ve a cPanel → Administrador de archivos
2. Navega a `/home/inedito/public_html/cdn.inedito.digital/mercadopago/`
3. Sube `create-preference-FIXED.php`
4. Renómbralo a `create-preference.php`
5. Establece permisos `644`

### 4. Probar el pago

1. Ve a https://litfit.inedito.digital
2. Agrega el producto de prueba al carrito
3. Completa el checkout
4. Selecciona Mercado Pago
5. Ahora podrás pagar con tu saldo de Mercado Pago

---

## 🔧 Cambios realizados en el código

### ❌ ANTES (Incorrecto):

```php
$preferenceData = [
    'items' => $mpItems,
    // ... otros campos ...
    'payment_methods' => [
        // Configuración que bloqueaba account_money
    ],
    'metadata' => [ /* ... */ ]
];
```

### ✅ DESPUÉS (Correcto):

```php
$preferenceData = [
    'items' => $mpItems,
    // ... otros campos ...
    // ⚠️ NO incluir 'payment_methods' para permitir todos
    'metadata' => [ /* ... */ ]
];
```

---

## 💡 Métodos de pago que ahora funcionarán

Después de aplicar la corrección, estos métodos estarán disponibles:

| Método | ID | Estado |
|--------|-----|--------|
| Saldo de Mercado Pago | `account_money` | ✅ Disponible |
| Tarjeta de Crédito | `credit_card` | ✅ Disponible |
| Tarjeta de Débito | `debit_card` | ✅ Disponible |
| OXXO | `oxxo` | ✅ Disponible |
| SPEI | `bank_transfer` | ✅ Disponible |
| Meses sin intereses | `installments` | ✅ Disponible |

---

## 🧪 Probar con el producto de prueba

El producto de prueba de **$0.01** es perfecto para probar esto:

1. Agrega "PRODUCTO DE PRUEBA" al carrito
2. Completa el checkout (envío GRATIS automático)
3. Selecciona Mercado Pago
4. En la página de Mercado Pago, selecciona "Saldo de Mercado Pago"
5. Si tienes saldo, podrás completar el pago
6. Solo pagarás $0.01 centavo

---

## 🔐 Restricciones específicas (opcional)

Si en el futuro necesitas **restringir** ciertos métodos de pago, usa esta configuración:

### Ejemplo: Excluir solo OXXO

```php
'payment_methods' => [
    'excluded_payment_types' => [
        ['id' => 'ticket'] // Excluye OXXO y similares
    ]
]
```

### Ejemplo: Excluir tarjetas American Express

```php
'payment_methods' => [
    'excluded_payment_methods' => [
        ['id' => 'amex']
    ]
]
```

### Ejemplo: Permitir solo tarjetas de crédito

```php
'payment_methods' => [
    'excluded_payment_types' => [
        ['id' => 'ticket'],        // Excluye OXXO
        ['id' => 'bank_transfer'], // Excluye SPEI
        ['id' => 'atm']           // Excluye cajeros
    ]
    // account_money NO se excluye, así que seguirá disponible
]
```

⚠️ **IMPORTANTE**: Si usas estas restricciones, **NO excluyas** `account_money` a menos que específicamente no quieras permitir saldo de Mercado Pago.

---

## 📊 Comparación de configuraciones

| Configuración | Saldo MP | Tarjetas | OXXO | SPEI |
|---------------|----------|----------|------|------|
| Sin `payment_methods` | ✅ | ✅ | ✅ | ✅ |
| `payment_methods: []` | ⚠️ Depende | ⚠️ Depende | ⚠️ Depende | ⚠️ Depende |
| Excluir `account_money` | ❌ | ✅ | ✅ | ✅ |
| Excluir `ticket` | ✅ | ✅ | ❌ | ✅ |

---

## 🐛 Debugging

Si después de aplicar la solución aún hay problemas:

### 1. Verificar logs de cPanel

```bash
cPanel → Archivos de registro → error_log
```

Busca líneas con:
- `"Permitiendo TODOS los métodos de pago"`
- `"Preferencia creada exitosamente"`

### 2. Verificar la respuesta de Mercado Pago

En los logs PHP, busca:
```
📥 Respuesta completa: {...}
```

Verifica que la respuesta incluya `payment_methods` con todos los métodos disponibles.

### 3. Probar con modo TEST primero

Antes de probar en producción, prueba con credenciales TEST:

1. Cambia `MP_TEST_MODE` a `true` en `mercadopago-config.php`
2. Usa credenciales TEST
3. Usa tarjetas de prueba de Mercado Pago
4. Una vez confirmado que funciona, cambia a producción

---

## 📚 Referencias

- [Documentación oficial de Mercado Pago - Preferences](https://www.mercadopago.com.mx/developers/es/reference/preferences/_checkout_preferences/post)
- [Métodos de pago en México](https://www.mercadopago.com.mx/developers/es/guides/resources/localization/payment-methods)
- [Configurar medios de pago](https://www.mercadopago.com.mx/developers/es/docs/checkout-pro/checkout-customization/payment-methods)

---

## ✅ Checklist de verificación

Después de aplicar la solución, verifica:

- [ ] Archivo `create-preference.php` actualizado en cPanel
- [ ] Permisos del archivo establecidos en `644`
- [ ] Modo de prueba: Credenciales TEST funcionan
- [ ] Modo producción: Credenciales de producción activas
- [ ] Pago con saldo de Mercado Pago funciona
- [ ] Pago con tarjeta funciona
- [ ] Pago con OXXO funciona (si aplica)
- [ ] URLs de retorno funcionan correctamente

---

## 💬 ¿Sigues teniendo problemas?

Si después de aplicar esta solución aún tienes problemas:

1. **Revisa los logs** de cPanel (error_log)
2. **Verifica las credenciales** (que sean de producción y correctas)
3. **Prueba con producto de $0.01** primero
4. **Desactiva bloqueadores de anuncios** temporalmente
5. **Revisa el saldo** de tu cuenta de Mercado Pago

---

**Última actualización:** 21 de enero de 2026  
**Versión:** 1.0 - Solución para account_money
