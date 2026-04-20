<?php
header('Content-Type: application/json');
echo json_encode(['success' => true, 'message' => 'CORS funciona correctamente', 'timestamp' => time()]);
?>