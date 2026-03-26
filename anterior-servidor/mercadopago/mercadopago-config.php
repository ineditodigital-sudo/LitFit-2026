<?php
/**
 * ============================================
 * CONFIGURACIÓN DE MERCADO PAGO - LITFIT
 * ============================================
 * 
 * Este archivo contiene las credenciales de Mercado Pago
 * y debe ser subido a cPanel en una ubicación segura.
 * 
 * 📍 UBICACIÓN RECOMENDADA EN CPANEL:
 * /home/inedito/private/config/mercadopago-config.php
 * 
 * ⚠️ IMPORTANTE: Este archivo NO debe estar en public_html
 * para mantener las credenciales seguras.
 */

// Validar que este archivo solo sea incluido desde archivos autorizados
if (!defined('MP_CONFIG_LOADED')) {
    http_response_code(403);
    die('Acceso directo no permitido');
}

// ============================================
// 🔐 CREDENCIALES DE MERCADO PAGO (PRODUCCIÓN)
// ============================================

// Access Token (Clave secreta) - NUNCA expongas esto en el frontend
define('MP_ACCESS_TOKEN', 'APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053');

// Public Key - Se puede usar en el frontend si es necesario
define('MP_PUBLIC_KEY', 'APP_USR-e3e73806-fac5-4e30-a4a7-dca0bc3dfbd4');

// ============================================
// 🌐 URLs DE RETORNO (Frontend en Figma Make)
// ============================================

// URL cuando el pago es exitoso
define('MP_SUCCESS_URL', 'https://litfitmexico.com/payment-success-mp');

// URL cuando el pago falla
define('MP_FAILURE_URL', 'https://litfitmexico.com/payment-failure-mp');

// URL cuando el pago está pendiente
define('MP_PENDING_URL', 'https://litfitmexico.com/payment-pending-mp');

// ============================================
// 🔔 WEBHOOK (Notificaciones IPN)
// ============================================

// URL del webhook para recibir notificaciones de Mercado Pago
define('MP_WEBHOOK_URL', 'https://cdn.inedito.digital/mercadopago/webhook.php');

// ============================================
// ⚙️ CONFIGURACIÓN ADICIONAL
// ============================================

// Modo de desarrollo (true = test, false = producción)
define('MP_TEST_MODE', false); // ⚠️ CAMBIADO A false PARA PRODUCCIÓN

// Timeout para las peticiones HTTP (segundos)
define('MP_TIMEOUT', 30);

// URL base de la API de Mercado Pago
define('MP_API_URL', 'https://api.mercadopago.com');

?>
