<?php
require_once 'admin-config.php';
try {
  $pdo = getDbConnection();
  $stmt = $pdo->prepare("DELETE FROM coupons WHERE code='TEST2'");
  $stmt->execute();
  echo "SUCCESS";
} catch (Exception $e) {
  echo "ERROR: " . $e->getMessage();
}
?>
