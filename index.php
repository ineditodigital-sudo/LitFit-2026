<?php
// LITFIT - Open Graph Dynamic Injector
$og_title = "LITFIT México";
$og_desc = "La mejor tienda de suplementos y energía.";
$og_image = "https://litfitmexico.com/favicon-litfit.webp";
$og_url = "https://litfitmexico.com/";

if (isset($_GET['p'])) {
    $p = $_GET['p'];
    $og_url = "https://litfitmexico.com/?p=" . urlencode($p);
    
    // Map of static known products
    $static_products = [
        'barras-energeticas' => [
            'name' => 'Barras de Proteína',
            'desc' => '30gr. De proteína por porción + 5gr de bcaas que favorecen a una pronta recuperación.',
            'img' => 'https://imagenes.inedito.digital/LITFIT/4-sabores.webp'
        ],
        'proteina-clasica' => [
            'name' => 'Proteína aislada',
            'desc' => 'Proteína de suero aislada de máxima pureza (90% proteína). Ideal para recuperación muscular post-entrenamiento.',
            'img' => 'https://imagenes.inedito.digital/LITFIT/proteina-standard.webp'
        ],
        'proteina-regular' => [
            'name' => 'Proteína aislada',
            'desc' => 'Proteína de suero aislada de máxima pureza (90% proteína). Ideal para recuperación muscular post-entrenamiento.',
            'img' => 'https://imagenes.inedito.digital/LITFIT/proteina-standard.webp'
        ],
        'proteina-colageno' => [
            'name' => 'Proteína ISO + Collagen',
            'desc' => 'Fórmula revolucionaria que combina proteína de suero premium con colágeno hidrolizado tipo I y III.',
            'img' => 'https://imagenes.inedito.digital/LITFIT/proteina-colageno.webp'
        ],
        'test-product' => [
            'name' => 'Producto de Prueba',
            'desc' => 'Agrega este producto de $0 MXN a tu carrito para probar todo el flujo de checkout.',
            'img' => 'https://imagenes.inedito.digital/LITFIT/BARRASPAGINA-13.jpg'
        ]
    ];

    if (isset($static_products[$p])) {
        $og_title = "LITFIT - " . $static_products[$p]['name'];
        $og_desc = $static_products[$p]['desc'];
        $og_image = $static_products[$p]['img'];
    } else {
        // Dynamic product from DB
        try {
            require_once __DIR__ . '/envios/admin-config.php';
            $pdo = getDbConnection();
            $stmt = $pdo->prepare("SELECT name, description, image FROM products WHERE id = ? LIMIT 1");
            $stmt->execute([$p]);
            $prod = $stmt->fetch();
            if ($prod) {
                $og_title = "LITFIT - " . $prod['name'];
                $og_desc = $prod['description'] ? $prod['description'] : "Descubre nuestro " . $prod['name'];
                $og_image = $prod['image'] ? $prod['image'] : $og_image;
            }
        } catch (Exception $e) {}
    }
}

// Now read the generated index.html
$html_file = __DIR__ . '/index.html';
if (file_exists($html_file)) {
    $html = file_get_contents($html_file);
    
    // Inject OG tags before </head>
    $og_tags = <<<HTML
<meta property="og:title" content="\$og_title" />
<meta property="og:description" content="\$og_desc" />
<meta property="og:image" content="\$og_image" />
<meta property="og:url" content="\$og_url" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="\$og_title" />
<meta name="twitter:description" content="\$og_desc" />
<meta name="twitter:image" content="\$og_image" />
HTML;

    // Use htmlspecialchars for safety when echoing variables into HTML
    $og_tags_safe = str_replace(
        ['$og_title', '$og_desc', '$og_image', '$og_url'],
        [htmlspecialchars($og_title), htmlspecialchars($og_desc), htmlspecialchars($og_image), htmlspecialchars($og_url)],
        $og_tags
    );

    $html = str_replace('</head>', $og_tags_safe . "\n</head>", $html);
    echo $html;
} else {
    echo "Error: index.html not found. Please run npm run build.";
}
?>