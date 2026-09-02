<?php
require_once 'admin-config.php';
secureCorsHeaders();

// Este script crea las tablas e importa los JSON existentes si los hay.
$pdo = getDbConnection();

try {
    // 1. Crear TABLA PRODUCTOS
    $pdo->exec("CREATE TABLE IF NOT EXISTS products (
        id VARCHAR(50) PRIMARY KEY,
        name VARCHAR(255) NOT NULL,
        price DECIMAL(10,2) NOT NULL,
        image TEXT,
        images JSON,
        category VARCHAR(100),
        description TEXT,
        variants JSON,
        sizes JSON,
        nutrition JSON,
        features JSON,
        available BOOLEAN DEFAULT 1,
        is_new BOOLEAN DEFAULT 0,
        is_featured BOOLEAN DEFAULT 0,
        is_best_seller BOOLEAN DEFAULT 0,
        is_sale BOOLEAN DEFAULT 0,
        sale_price DECIMAL(10,2),
        sale_percentage INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // 1.1 Crear TABLA SETTINGS
    $pdo->exec("CREATE TABLE IF NOT EXISTS settings (
        setting_key VARCHAR(50) PRIMARY KEY,
        setting_value TEXT,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    // Insertar valor inicial de mantenimiento si no existe
    $pdo->exec("INSERT IGNORE INTO settings (setting_key, setting_value) VALUES ('maintenance_mode', '0');");

    // 2. Crear TABLA PEDIDOS
    $pdo->exec("CREATE TABLE IF NOT EXISTS orders (
        id INT AUTO_INCREMENT PRIMARY KEY,
        order_id VARCHAR(100) UNIQUE NOT NULL,
        customer_name VARCHAR(100),
        customer_email VARCHAR(100),
        total DECIMAL(10,2),
        status VARCHAR(20),
        tracking_number VARCHAR(100),
        tracking_url TEXT,
        label_url TEXT,
        order_data LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;");

    echo "✅ Tablas creadas correctamente.<br>";

    // 2.5 MIGRACION DE ESQUEMA
    // CREATE TABLE IF NOT EXISTS no toca una tabla que ya existe, asi que las
    // columnas agregadas despues del despliegue inicial nunca aparecian solas y
    // habia que anadirlas a mano por SQL. Esto las reconcilia y es idempotente.
    $columnasProducts = [
        'images'    => "ALTER TABLE products ADD COLUMN images JSON AFTER image",
        'nutrition' => "ALTER TABLE products ADD COLUMN nutrition JSON AFTER sizes",
        'features'  => "ALTER TABLE products ADD COLUMN features JSON AFTER nutrition",
    ];
    $existentes = $pdo->query("SHOW COLUMNS FROM products")->fetchAll(PDO::FETCH_COLUMN);
    foreach ($columnasProducts as $columna => $sql) {
        if (!in_array($columna, $existentes, true)) {
            $pdo->exec($sql);
            echo "Columna products.$columna anadida.<br>";
        }
    }

    // 3. MIGRACIÓN: Importar productos desde products.json si la tabla está vacía
    $checkProducts = $pdo->query("SELECT COUNT(*) FROM products")->fetchColumn();
    if ($checkProducts == 0 && file_exists('products.json')) {
        $json = file_get_contents('products.json');
        $products = json_decode($json, true);
        if ($products) {
            $stmt = $pdo->prepare("INSERT INTO products (id, name, price, image, category, description, variants, sizes, available, is_new, is_featured, is_best_seller, is_sale, sale_price, sale_percentage) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            foreach ($products as $p) {
                $name = $p['name'] ?? $p['title'] ?? 'Producto sin nombre';
                $stmt->execute([
                    $p['id'], $name, $p['price'], $p['image'] ?? '', $p['category'] ?? '', $p['description'] ?? '',
                    json_encode($p['variants'] ?? $p['flavors'] ?? []), json_encode($p['sizes'] ?? []),
                    $p['available'] ?? 1, $p['isNew'] ?? 0, $p['isFeatured'] ?? 0, $p['isBestSeller'] ?? 0,
                    $p['isSale'] ?? 0, $p['salePrice'] ?? null, $p['salePercentage'] ?? null
                ]);
            }
            echo "📦 " . count($products) . " productos migrados de JSON a MySQL.<br>";
        }
    }

    // 4. MIGRACIÓN: Importar pedidos desde pedidos-json/
    $checkOrders = $pdo->query("SELECT COUNT(*) FROM orders")->fetchColumn();
    if ($checkOrders == 0 && is_dir('pedidos-json')) {
        $files = glob('pedidos-json/*.json');
        if ($files) {
            $stmt = $pdo->prepare("INSERT INTO orders (order_id, customer_name, customer_email, total, status, order_data) 
                                   VALUES (?, ?, ?, ?, ?, ?)");
            foreach ($files as $file) {
                $content = file_get_contents($file);
                $d = json_decode($content, true);
                if ($d) {
                    $stmt->execute([
                        $d['orderId'], 
                        ($d['formData']['firstName'] ?? '') . ' ' . ($d['formData']['lastName'] ?? ''),
                        $d['formData']['email'] ?? '',
                        $d['total'] ?? 0,
                        $d['status'] ?? 'PENDING',
                        $content
                    ]);
                }
            }
            echo "🛒 " . count($files) . " pedidos migrados de JSON a MySQL.<br>";
        }
    }

    echo "🚀 Migración completada con éxito. Ya puedes usar MySQL.";

} catch (PDOException $e) {
    die("❌ Error en la creación/migración: " . $e->getMessage());
}
?>
