<?php
require_once __DIR__ . '/admin-config.php';

// Inicializar cabeceras CORS
secureCorsHeaders();

// Manejar preflight de CORS
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$pdo = getDbConnection();

// Crear tabla si no existe
try {
    $pdo->exec("CREATE TABLE IF NOT EXISTS product_reviews (
        id INT AUTO_INCREMENT PRIMARY KEY,
        product_id VARCHAR(100) NOT NULL,
        author VARCHAR(100) NOT NULL,
        rating INT NOT NULL,
        comment TEXT,
        status ENUM('pending', 'approved', 'rejected') DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )");
} catch (Exception $e) {
    // Ignorar si falla por permisos y ya existe
}

$method = $_SERVER['REQUEST_METHOD'];

try {
    if ($method === 'GET') {
        $admin = isset($_GET['admin']) && $_GET['admin'] === '1';
        
        if ($admin) {
            // Requiere token de admin para ver todas las reseñas (incluyendo pendientes)
            verifyAdminToken();
            $stmt = $pdo->query("SELECT * FROM product_reviews ORDER BY created_at DESC");
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        } else {
            // Pública: Obtener reseñas aprobadas de un producto
            $productId = $_GET['product_id'] ?? '';
            if (empty($productId)) {
                throw new Exception('product_id es requerido');
            }
            $stmt = $pdo->prepare("SELECT id, author, rating, comment, created_at FROM product_reviews WHERE product_id = ? AND status = 'approved' ORDER BY created_at DESC");
            $stmt->execute([$productId]);
            echo json_encode(['success' => true, 'data' => $stmt->fetchAll()]);
        }
    } 
    elseif ($method === 'POST') {
        // Pública: Enviar nueva reseña
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['product_id']) || empty($data['author']) || empty($data['rating'])) {
            throw new Exception('Faltan campos requeridos');
        }
        
        $rating = (int)$data['rating'];
        if ($rating < 1 || $rating > 5) {
            throw new Exception('Rating inválido');
        }

        $stmt = $pdo->prepare("INSERT INTO product_reviews (product_id, author, rating, comment, status) VALUES (?, ?, ?, ?, 'pending')");
        $stmt->execute([
            $data['product_id'],
            substr($data['author'], 0, 100),
            $rating,
            substr($data['comment'] ?? '', 0, 1000)
        ]);

        echo json_encode(['success' => true, 'message' => 'Reseña enviada y pendiente de aprobación']);
    }
    elseif ($method === 'PUT') {
        // Admin: Aprobar o actualizar reseña
        verifyAdminToken();
        $data = json_decode(file_get_contents('php://input'), true);
        
        if (empty($data['id']) || empty($data['status'])) {
            throw new Exception('ID y status son requeridos');
        }
        
        $stmt = $pdo->prepare("UPDATE product_reviews SET status = ? WHERE id = ?");
        $stmt->execute([$data['status'], $data['id']]);
        
        echo json_encode(['success' => true, 'message' => 'Reseña actualizada']);
    }
    elseif ($method === 'DELETE') {
        // Admin: Eliminar reseña
        verifyAdminToken();
        $id = $_GET['id'] ?? '';
        
        if (empty($id)) {
            throw new Exception('ID es requerido');
        }
        
        $stmt = $pdo->prepare("DELETE FROM product_reviews WHERE id = ?");
        $stmt->execute([$id]);
        
        echo json_encode(['success' => true, 'message' => 'Reseña eliminada']);
    }
    else {
        http_response_code(405);
        echo json_encode(['success' => false, 'message' => 'Método no permitido']);
    }
} catch (Exception $e) {
    http_response_code(400);
    echo json_encode(['success' => false, 'message' => $e->getMessage()]);
}
