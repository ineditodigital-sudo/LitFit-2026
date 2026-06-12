<?php
require_once __DIR__ . '/admin-config.php';
secureCorsHeaders();

$pdo = getDbConnection();

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') { http_response_code(200); exit; }

// GET es público para mostrar catálogo en la tienda
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    verifyAdminToken();
}

switch ($_SERVER['REQUEST_METHOD']) {
    case 'GET':
        $stmt = $pdo->query("SELECT * FROM products ORDER BY created_at DESC");
        $products = $stmt->fetchAll();
        
        // Decodificar los campos JSON para volver a objetos en el frontend
        foreach ($products as &$p) {
            $p['variants'] = json_decode($p['variants'] ?? '[]', true);
            $p['sizes'] = json_decode($p['sizes'] ?? '[]', true);
            // Transformar tipos de dato SQL a los que espera el frontend
            $p['price'] = (float)$p['price'];
            $p['available'] = (bool)$p['available'];
            $p['isNew'] = (bool)$p['is_new'];
            $p['isFeatured'] = (bool)$p['is_featured'];
            $p['isBestSeller'] = (bool)$p['is_best_seller'];
            $p['isSale'] = (bool)$p['is_sale'];
            $p['salePrice'] = $p['sale_price'] ? (float)$p['sale_price'] : null;
            $p['salePercentage'] = $p['sale_percentage'] ? (int)$p['sale_percentage'] : null;
        }
        
        echo json_encode($products);
        break;

    case 'POST':
    case 'PUT':
        $json = file_get_contents('php://input');
        $products = json_decode($json, true);
        
        if (!$products) {
            http_response_code(400);
            die(json_encode(['success' => false, 'message' => 'JSON invalido']));
        }

        try {
            $pdo->beginTransaction();
            // Para simplificar, vaciamos la tabla y reinsertamos (como lo hacía el JSON overwrite)
            $pdo->exec("DELETE FROM products");
            
            $stmt = $pdo->prepare("INSERT INTO products 
                (id, name, price, image, category, description, variants, sizes, available, is_new, is_featured, is_best_seller, is_sale, sale_price, sale_percentage) 
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            
            foreach ($products as $p) {
                $stmt->execute([
                    $p['id'], $p['name'], $p['price'], $p['image'], $p['category'] ?? '', $p['description'] ?? '',
                    json_encode($p['variants'] ?? []), json_encode($p['sizes'] ?? []),
                    $p['available'] ?? 1, $p['isNew'] ?? 0, $p['isFeatured'] ?? 0, $p['isBestSeller'] ?? 0,
                    $p['isSale'] ?? 0, $p['salePrice'] ?? null, $p['salePercentage'] ?? null
                ]);
            }
            $pdo->commit();
            echo json_encode(['success' => true, 'message' => 'Productos actualizados en MySQL']);
        } catch (Exception $e) {
            $pdo->rollBack();
            http_response_code(500);
            echo json_encode(['success' => false, 'message' => $e->getMessage()]);
        }
        break;

    default:
        http_response_code(405);
}
?>
