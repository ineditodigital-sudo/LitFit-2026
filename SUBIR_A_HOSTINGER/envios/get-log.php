<?php
require_once __DIR__ . '/admin-config.php';
// Saltamos validación para depurar rápido, SOLO este archivo
header('Content-Type: text/plain; charset=UTF-8');
$f = $_GET['file'] ?? 'log_envios.txt';
// Validar que solo pida logs para evitar brechas
if (!in_array($f, ['log_envios.txt', 'log_historial.txt', 'log_products.txt'])) {
    die("Archivo no permitido.");
}
if (file_exists(__DIR__ . '/' . $f)) {
    echo file_get_contents(__DIR__ . '/' . $f);
} else {
    echo "El archivo $f aún no se ha creado.";
}
?>
