<?php
/**
 * ============================================
 * CONFIGURACIÓN DE MERCADO PAGO - LITFIT
 * ============================================
 *
 * UBICACIÓN EN HOSTINGER:
 * /public_html/mercadopago/mercadopago-config.php
 *
 * IMPORTANTE: Este archivo contiene credenciales sensibles.
 * NO lo expongas públicamente ni lo subas a GitHub.
 */

if (!defined('MP_CONFIG_LOADED')) {
    die('Acceso denegado.');
}

// ============================================
// CREDENCIALES DE MERCADO PAGO - PRODUCCIÓN
// ============================================

// Access Token (Clave secreta) - NUNCA expongas esto en el frontend
define('MP_ACCESS_TOKEN', 'APP_USR-2656381259343864-040222-6a17922f45c181c9e9d640a2df04ff76-198666053');

// ============================================
// URLs DE RETORNO (nuevo dominio del cliente)
// ============================================
define('MP_SUCCESS_URL', 'https://litfitmexico.com/payment-success-mp');
define('MP_FAILURE_URL',  'https://litfitmexico.com/payment-failure-mp');
define('MP_PENDING_URL',  'https://litfitmexico.com/payment-pending-mp');

// URL del Webhook para notificaciones de Mercado Pago
define('MP_WEBHOOK_URL', 'https://litfitmexico.com/mercadopago/webhook.php');

// ============================================
// CONFIGURACIÓN ADICIONAL
// ============================================

// URL base de la API de Mercado Pago
define('MP_API_URL', 'https://api.mercadopago.com');

// Timeout para las peticiones HTTP (segundos)
define('MP_TIMEOUT', 30);

// Modo test: false = PRODUCCIÓN REAL
define('MP_TEST_MODE', false);
?>
