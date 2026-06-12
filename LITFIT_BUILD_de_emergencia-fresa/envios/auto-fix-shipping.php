<?php
/**
 * AUTO-FIX SHIPPING - LITFIT
 * Este script busca pedidos pagados sin guía e intenta generarlas.
 */
require_once __DIR__ . '/admin-config.php';
require_once __DIR__ . '/order-helper.php';

function run_auto_fix() {
    $pdo = getDbConnection();
    
    // 1. Buscar pedidos pagados que NO tengan número de rastreo
    $stmt = $pdo->prepare("SELECT order_id, order_data FROM orders WHERE status = 'PAID' AND tracking_number IS NULL");
    $stmt->execute();
    $ordersToFix = $stmt->fetchAll();

    $results = [];

    foreach ($ordersToFix as $row) {
        $orderId = $row['order_id'];
        
        // 🚀 Intentar crear la guía
        $success = shipping_create_externally($orderId);
        
        if ($success) {
            $results[] = "✅ Pedido $orderId: Guía generada con éxito.";
        } else {
            // Leer el último error del log para reportarlo
            $errorLog = __DIR__ . '/debug-envios.log';
            $lastError = "Error desconocido";
            if (file_exists($errorLog)) {
                $lines = file($errorLog);
                $lastLine = end($lines);
                if (strpos($lastLine, $orderId) !== false) {
                    $lastError = $lastLine;
                }
            }
            $results[] = "❌ Pedido $orderId: Falló la generación. Error: $lastError";
        }
    }
    
    return $results;
}

// Si se llama directamente, ejecutar y mostrar
if (basename($_SERVER['PHP_SELF']) == 'auto-fix-shipping.php') {
    header('Content-Type: application/json');
    echo json_encode(run_auto_fix());
}
?>
