<?php
header('Content-Type: application/json');
header('Access-Control-Allow-Origin: https://litfitmexico.com');

echo json_encode([
    'status' => 'OK',
    'message' => 'El backend PHP funciona!',
    'path' => __DIR__,
    'url' => 'https://litfitmexico.com/api/mercadopago/test.php'
]);