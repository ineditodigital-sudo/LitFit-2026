import { execSync } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createWriteStream } from "fs";
import archiver from "archiver";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const buildDir = path.join(root, "dist-build");
const outDir   = path.join(root, "public_html");
const backend  = path.join(root, "backend-hostinger");
const zipPath  = path.join(root, "litfit-hostinger.zip");

function log(msg, color = "reset") {
  const colors = { cyan: "\x1b[36m", green: "\x1b[32m", yellow: "\x1b[33m", red: "\x1b[31m", reset: "\x1b[0m" };
  console.log((colors[color] || "") + msg + colors.reset);
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    const s = path.join(src, item), d = path.join(dest, item);
    fs.statSync(s).isDirectory() ? copyDir(s, d) : fs.copyFileSync(s, d);
  }
  return true;
}

function rmDir(dir) {
  if (fs.existsSync(dir)) {
    try {
      // Use Windows rmdir which handles deeply nested folders better
      execSync(`rmdir /s /q "${dir}"`, { stdio: "ignore" });
    } catch {
      // Fallback to Node's rmSync
      try { fs.rmSync(dir, { recursive: true, force: true }); } catch {}
    }
  }
}

log("\n>> LITFIT Deploy - Generando paquete para Hostinger...\n", "cyan");

// 1. Limpiar builds anteriores
rmDir(buildDir);
rmDir(outDir);
if (fs.existsSync(zipPath)) fs.rmSync(zipPath);

// 2. Compilar frontend
log("   [1/5] Compilando frontend React...", "reset");
try {
  execSync("npx vite build", { cwd: root, stdio: "inherit" });
} catch (e) {
  log("   ERROR: El build fallo.", "red");
  process.exit(1);
}
if (!fs.existsSync(buildDir)) {
  log("   ERROR: dist-build/ no encontrado.", "red");
  process.exit(1);
}
log("   OK: Frontend compilado", "green");

// 3. Mover frontend a public_html/
log("   [2/5] Armando public_html/...", "reset");
fs.mkdirSync(outDir, { recursive: true });
copyDir(buildDir, outDir);
log("   OK: Frontend en public_html/", "green");

// 4. Copiar .htaccess
log("   [3/5] Copiando .htaccess...", "reset");
const htaccess = path.join(backend, "frontend-dist", ".htaccess");
if (fs.existsSync(htaccess)) {
  fs.copyFileSync(htaccess, path.join(outDir, ".htaccess"));
  log("   OK: .htaccess copiado", "green");
} else {
  log("   AVISO: .htaccess no encontrado", "yellow");
}

// 4.5 Generar index.php con Open Graph tags
log("   [3.5/5] Inyectando soporte Open Graph en index.php...", "reset");
const indexHtmlPath = path.join(outDir, "index.html");
const indexPhpPath = path.join(outDir, "index.php");
if (fs.existsSync(indexHtmlPath)) {
  let htmlContent = fs.readFileSync(indexHtmlPath, "utf-8");
  
  const phpLogic = `<?php
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
?>
`;

  const ogTagsHtml = `
<meta property="og:title" content="<?php echo htmlspecialchars($og_title); ?>" />
<meta property="og:description" content="<?php echo htmlspecialchars($og_desc); ?>" />
<meta property="og:image" content="<?php echo htmlspecialchars($og_image); ?>" />
<meta property="og:url" content="<?php echo htmlspecialchars($og_url); ?>" />
<meta property="og:type" content="website" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="<?php echo htmlspecialchars($og_title); ?>" />
<meta name="twitter:description" content="<?php echo htmlspecialchars($og_desc); ?>" />
<meta name="twitter:image" content="<?php echo htmlspecialchars($og_image); ?>" />
`;
  
  htmlContent = htmlContent.replace('</head>', ogTagsHtml + '</head>');
  
  fs.writeFileSync(indexPhpPath, phpLogic + htmlContent);
  fs.unlinkSync(indexHtmlPath); // Remove index.html
  log("   OK: index.php generado con etiquetas Open Graph", "green");
}

// 5. Copiar backend PHP
log("   [4/5] Copiando backend PHP...", "reset");
const enviosSrc = path.join(backend, "envios");
const mpSrc     = path.join(backend, "mercadopago");
const enviosDst = path.join(outDir, "envios");
const mpDst     = path.join(outDir, "mercadopago");
if (fs.existsSync(enviosSrc)) { copyDir(enviosSrc, enviosDst); log("   OK: /envios copiado", "green"); }
if (fs.existsSync(mpSrc))     { copyDir(mpSrc, mpDst);         log("   OK: /mercadopago copiado", "green"); }

// 5.1 Copiar PHPMailer (desde el root a envios/)
const mailerSrc = path.join(root, "php-mailer");
const mailerDst = path.join(outDir, "envios", "php-mailer");
if (fs.existsSync(mailerSrc)) {
  copyDir(mailerSrc, mailerDst);
  log("   OK: /php-mailer incluido en el paquete", "green");
} else {
  log("   AVISO: /php-mailer no encontrado en el root", "yellow");
}

// 6. Crear ZIP
log("   [5/5] Creando litfit-hostinger.zip...", "reset");
const output  = createWriteStream(zipPath);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(outDir, false);

output.on("close", () => {
  const sizeMB = (archive.pointer() / 1024 / 1024).toFixed(2);
  rmDir(buildDir); // Limpiar build temporal

  log("\n============================================", "green");
  log(" LISTO para subir a Hostinger!", "green");
  log("============================================", "green");
  log(` Archivo: litfit-hostinger.zip (${sizeMB} MB)`, "reset");
  log(` Ubicacion: ${zipPath}`, "reset");
  log("\n Contenido de public_html/:", "cyan");
  fs.readdirSync(outDir).forEach(f => log(`   /${f}`, "reset"));
  log("\n Instrucciones Hostinger:", "cyan");
  log("   1. Abre el Administrador de Archivos de Hostinger", "reset");
  log("   2. Sube litfit-hostinger.zip a public_html/", "reset");
  log("   3. Haz clic derecho en el zip -> Extraer aqui", "reset");
  log("   4. Elimina el .zip del servidor\n", "reset");
});

archive.on("error", (err) => { throw err; });
archive.finalize();
