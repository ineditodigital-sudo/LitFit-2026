<?php
require_once 'admin-config.php';
try {
  $pdo = getDbConnection();
  $stmt = $pdo->query("SELECT * FROM coupons");
  $coupons = $stmt->fetchAll(PDO::FETCH_ASSOC);
  echo "COUPONS DB: " . json_encode($coupons);
} catch (Exception $e) {
  echo "ERROR: " . $e->getMessage();
}
?>
