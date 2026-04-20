<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();
verifyAdminToken();

header('Content-Type: text/plain');
$file = __DIR__ . '/log_envios.txt';
if (file_exists($file)) {
    echo file_get_contents($file);
} else {
    echo "No log found.";
}
?>
