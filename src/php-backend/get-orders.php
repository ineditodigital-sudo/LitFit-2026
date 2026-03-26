<?php
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type, Authorization');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$dir = __DIR__ . '/pedidos-json/';
if (!is_dir($dir)) {
    mkdir($dir, 0777, true);
    echo json_encode([]);
    exit;
}

$files = glob($dir . '/*.json');
$orders = [];

foreach ($files as $file) {
    $content = file_get_contents($file);
    if ($content) {
        $orders[] = json_decode($content, true);
    }
}

// Sort by timestamp desc if it exists
usort($orders, function($a, $b) {
  $tsA = isset($a['timestamp']) ? strtotime($a['timestamp']) : 0;
  $tsB = isset($b['timestamp']) ? strtotime($b['timestamp']) : 0;
  return $tsB - $tsA;
});

echo json_encode($orders);
exit;
