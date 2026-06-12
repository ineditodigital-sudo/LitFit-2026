<?php
require_once 'admin-config.php';

header('Content-Type: application/json');

try {
    $pdo = getDbConnection();
    
    // Crear tabla coupons
    $sql = "CREATE TABLE IF NOT EXISTS coupons (
        id INT AUTO_INCREMENT PRIMARY KEY,
        code VARCHAR(50) NOT NULL UNIQUE,
        type ENUM('percent', 'fixed') NOT NULL DEFAULT 'percent',
        value DECIMAL(10,2) NOT NULL,
        min_purchase DECIMAL(10,2) DEFAULT 0.00,
        valid_from DATETIME DEFAULT NULL,
        valid_until DATETIME DEFAULT NULL,
        allow_shaker TINYINT(1) DEFAULT 1,
        is_active TINYINT(1) DEFAULT 1,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;";
    
    $pdo->exec($sql);

    echo json_encode(['success' => true, 'message' => 'Tabla coupons creada correctamente']);
} catch (PDOException $e) {
    http_response_code(200);
    echo json_encode(['success' => false, 'message' => 'Error al crear tabla: ' . $e->getMessage()]);
}
?>
