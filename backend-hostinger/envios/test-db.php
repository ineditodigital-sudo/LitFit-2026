<?php
require_once 'admin-config.php';
try {
  $pdo = getDbConnection();
  $stmt = $pdo->prepare('INSERT INTO coupons (code, type, value, min_purchase, valid_from, valid_until, allow_shaker, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)');
  $success = $stmt->execute(['TEST2', 'percent', 10, 0, null, null, 1, 1]);
  echo 'SUCCESS: ' . ($success ? 'YES' : 'NO');
} catch (Exception $e) {
  echo 'ERROR: ' . $e->getMessage();
}
?>
