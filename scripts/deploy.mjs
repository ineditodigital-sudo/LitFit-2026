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

// Scripts que NUNCA deben llegar al servidor: migraciones de un solo uso y
// utilidades de debug. Quedan accesibles públicamente y sin autenticación;
// migrate-products.php además sobrescribe la información nutricional de los
// productos con valores fijos cada vez que alguien abre su URL.
const NUNCA_SUBIR = new Set([
  "migrate-products.php",
  "debug-db.php",
  "debug-log.php",
  "check-db.php",
  "test-db.php",
  "test-db-del.php",
  "get-log.php",
]);

const excluidos = [];

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  fs.mkdirSync(dest, { recursive: true });
  for (const item of fs.readdirSync(src)) {
    if (NUNCA_SUBIR.has(item)) {
      excluidos.push(item);
      continue;
    }
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

// 3.9 Generar llms.txt y sitemap.xml con el catalogo real
//
// Ambos archivos son necesarios y no existian: el .htaccess reescribe cualquier
// ruta inexistente a index.php, asi que /llms.txt y /sitemap.xml devolvian el
// HTML de la tienda. robots.txt ya anunciaba el sitemap, y Lighthouse marcaba
// llms.txt como invalido por recibir HTML en vez de Markdown.
//
// Se arman con los productos publicados para que no queden desactualizados.
async function generarArchivosParaAgentes(destino) {
  const BASE = "https://litfitmexico.com";
  let productos = [];
  try {
    const res = await fetch(`${BASE}/envios/api-products.php`, { signal: AbortSignal.timeout(15000) });
    const datos = await res.json();
    if (Array.isArray(datos)) {
      productos = datos
        .filter((p) => p && p.id && p.name && p.category !== "TEST")
        .map((p) => ({
          id: String(p.id),
          nombre: String(p.name).trim(),
          descripcion: String(p.description || "").replace(/\s+/g, " ").trim().slice(0, 160),
          precio: p.price,
        }));
    }
  } catch (e) {
    log(`   AVISO: no se pudo leer el catalogo (${e.message}); se generan sin productos.`, "yellow");
  }

  const paginas = [
    { url: `${BASE}/`, titulo: "Inicio", desc: "Catalogo completo de LITFIT." },
    { url: `${BASE}/?p=proteina-clasica`, titulo: "Proteina aislada", desc: "Proteina de suero aislada." },
    { url: `${BASE}/?p=proteina-colageno`, titulo: "Proteina + colageno", desc: "Proteina con colageno hidrolizado." },
    { url: `${BASE}/?p=barras-energeticas`, titulo: "Barras de proteina", desc: "Barras en paquetes de 16 y 24 piezas." },
    { url: `${BASE}/?p=aviso-privacidad`, titulo: "Aviso de privacidad", desc: "Tratamiento de datos personales." },
  ];

  const enlacesProductos = productos
    .map((p) => `- [${p.nombre}](${BASE}/?p=${encodeURIComponent(p.id)})${p.descripcion ? ": " + p.descripcion : ""}`)
    .join("\n");

  const llms = `# LITFIT Mexico

> Tienda en linea de nutricion deportiva: proteina de suero aislada, proteina con colageno, creatina, barras y galletas de proteina. Envios a toda la Republica Mexicana, pago con Mercado Pago.

Las fichas de producto se abren con el parametro \`?p=<id-del-producto>\`. La compra se completa en \`/?p=checkout\`, que pide datos de envio, cotiza paqueteria por codigo postal y redirige a Mercado Pago.

## Productos
${enlacesProductos || "- [Catalogo completo](" + BASE + "/)"}

## Paginas
${paginas.map((p) => `- [${p.titulo}](${p.url}): ${p.desc}`).join("\n")}

## Notas
- Precios en pesos mexicanos (MXN).
- El catalogo y las existencias se sirven en ${BASE}/envios/api-products.php (JSON, solo lectura).
`;

  fs.writeFileSync(path.join(destino, "llms.txt"), llms, "utf-8");

  const urlsSitemap = [...paginas.map((p) => p.url), ...productos.map((p) => `${BASE}/?p=${encodeURIComponent(p.id)}`)];
  const unicas = [...new Set(urlsSitemap)];
  const hoy = new Date().toISOString().slice(0, 10);
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${unicas.map((u) => `  <url>
    <loc>${u.replace(/&/g, "&amp;")}</loc>
    <lastmod>${hoy}</lastmod>
  </url>`).join("\n")}
</urlset>
`;
  fs.writeFileSync(path.join(destino, "sitemap.xml"), sitemap, "utf-8");

  log(`   OK: llms.txt y sitemap.xml (${productos.length} productos)`, "green");
}

await generarArchivosParaAgentes(outDir);

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
// LITFIT - Open Graph Dynamic Injector + IDs de seguimiento
//
// Los IDs de Meta Pixel y Microsoft Clarity se leen de la tabla \`settings\`,
// editable desde Admin -> Configuracion. Se inyectan aqui (server-side) y no
// en el index.html para que un cambio en el panel surta efecto de inmediato,
// sin recompilar ni volver a publicar.
$meta_pixel_id = '';
$clarity_id    = '';
// Cache en disco de los ajustes. Cada visita abria una conexion a MySQL solo
// para leer tres claves, y en el hosting compartido eso disparaba el tiempo de
// respuesta hasta 1.5 s en las horas malas. Con 5 minutos de vigencia la portada
// deja de tocar la base; un cambio en el panel (pixel, banners del hero) tarda
// como mucho ese rato en verse.
$cache_cfg_archivo = sys_get_temp_dir() . '/litfit_cfg_portada.json';
$cache_cfg_vigencia = 300;
$cfg = null;
if (is_readable($cache_cfg_archivo) && (time() - filemtime($cache_cfg_archivo)) < $cache_cfg_vigencia) {
    $cache_cfg_datos = json_decode((string)file_get_contents($cache_cfg_archivo), true);
    if (is_array($cache_cfg_datos)) $cfg = $cache_cfg_datos;
}

try {
    require_once __DIR__ . '/envios/admin-config.php';
    if ($cfg === null) {
        // Conexion propia en vez de getDbConnection(): esa funcion hace die() si la
        // base no responde, y se llevaria por delante toda la portada. Aqui la BD
        // solo aporta extras (pixel, Open Graph, precarga del banner), asi que un
        // fallo debe degradar en silencio, nunca devolver un 500.
        $dsn_cfg = 'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4';
        $pdo_cfg = new PDO($dsn_cfg, DB_USER, DB_PASS, [
            PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
            PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        ]);
        $stmt_cfg = $pdo_cfg->query("SELECT setting_key, setting_value FROM settings WHERE setting_key IN ('meta_pixel_id','clarity_id','hero_slides')");
        $cfg = $stmt_cfg->fetchAll(PDO::FETCH_KEY_PAIR);
        @file_put_contents($cache_cfg_archivo, json_encode($cfg), LOCK_EX);
    }
    // Si la clave no existe todavia en la BD, se usan los IDs actuales como
    // respaldo para no perder el seguimiento. Una clave vacia SI desactiva.
    $meta_pixel_id = array_key_exists('meta_pixel_id', $cfg) ? $cfg['meta_pixel_id'] : '37935625759362059';
    $clarity_id    = array_key_exists('clarity_id', $cfg)    ? $cfg['clarity_id']    : 'xwpsdnfmsh';
} catch (Throwable $e) {
    $meta_pixel_id = '37935625759362059';
    $clarity_id    = 'xwpsdnfmsh';
}
// Blindaje: sólo se permiten los caracteres válidos de cada plataforma, para
// que nada pueda escaparse de la etiqueta <script>.
$meta_pixel_id = preg_replace('/[^0-9]/', '', (string)$meta_pixel_id);
$clarity_id    = preg_replace('/[^A-Za-z0-9]/', '', (string)$clarity_id);

// Precarga del primer banner del carrusel (elemento LCP de la portada).
// Sin esto el navegador no descubre esa imagen hasta despues de bajar y
// ejecutar el bundle y de que el carrusel consulte api-settings: el LCP se iba
// a 11 s en movil. Aqui ya conocemos los slides, asi que se anuncia de una vez.
// Solo aplica a la portada: en las fichas de producto el hero ni se monta.
$hero_preload  = '';
$hero_inline   = '';
$hero_skeleton = '';
if (!isset($_GET['p'])) {
    $slides_raw = isset($cfg['hero_slides']) ? $cfg['hero_slides'] : '';
    $slides = $slides_raw ? json_decode($slides_raw, true) : null;
    if (is_array($slides) && count($slides) > 0) {
        $primero = $slides[0];
        $img_desk = isset($primero['image']) ? $primero['image'] : '';
        $img_mob  = isset($primero['imageMobile']) ? $primero['imageMobile'] : $img_desk;
        // Solo URLs http(s) o rutas del propio sitio, para no inyectar basura en el head.
        $valida = function ($u) {
            return is_string($u) && $u !== '' && (preg_match('#^https?://#i', $u) || $u[0] === '/');
        };
        if ($valida($img_mob)) {
            $hero_preload .= '<link rel="preload" as="image" fetchpriority="high" media="(max-width: 767px)" href="' . htmlspecialchars($img_mob, ENT_QUOTES) . '">' . "
";
        }
        if ($valida($img_desk)) {
            $hero_preload .= '<link rel="preload" as="image" fetchpriority="high" media="(min-width: 768px)" href="' . htmlspecialchars($img_desk, ENT_QUOTES) . '">' . "
";
        }
        // Los slides tambien viajan en el HTML. Sin esto el carrusel tenia que
        // esperar a que bajara el bundle Y a que respondiera api-settings antes
        // de poder pintar el banner: ese round-trip era casi 3 s del LCP.
        $json_slides = json_encode($slides, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT);
        if ($json_slides !== false) {
            $hero_inline = '<script>window.__LITFIT_HERO__=' . $json_slides . ';</script>' . "
";
        }
        // Primer pintado sin esperar a React. Va como capa encima de #root, no
        // dentro: createRoot vacia su contenedor al montar y la pantalla se
        // quedaba en negro ~900 ms hasta que React terminaba de pintar. Asi el
        // banner se ve desde el principio y la capa se retira (desde App.tsx)
        // cuando React ya pinto debajo, sin parpadeo.
        if ($valida($img_mob) || $valida($img_desk)) {
            $src_mob  = htmlspecialchars($valida($img_mob) ? $img_mob : $img_desk, ENT_QUOTES);
            $src_desk = htmlspecialchars($valida($img_desk) ? $img_desk : $img_mob, ENT_QUOTES);
            $hero_skeleton =
                '<div id="lcp-overlay">'
              . '<div style="position:absolute;top:0;left:0;right:0;height:64px;background:#000"></div>'
              . '<div style="padding-top:64px">'
              . '<div id="lcp-hero">'
              . '<picture>'
              . '<source media="(min-width: 768px)" srcset="' . $src_desk . '">'
              . '<img src="' . $src_mob . '" alt="LITFIT" width="1080" height="1920" fetchpriority="high" decoding="async">'
              . '</picture>'
              . '</div></div></div>';
        }
    }
}

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
            // Con el cache de ajustes la portada ya no abre conexion, asi que aqui
            // se abre solo si hace falta: pasa unicamente en fichas de producto
            // dinamicas, que son las que necesitan sus etiquetas Open Graph.
            if (!isset($pdo_cfg)) {
                $pdo_cfg = new PDO(
                    'mysql:host=' . DB_HOST . ';dbname=' . DB_NAME . ';charset=utf8mb4',
                    DB_USER, DB_PASS,
                    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC]
                );
            }
            $stmt = $pdo_cfg->prepare("SELECT name, description, image FROM products WHERE id = ? LIMIT 1");
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
<!-- La descripcion ya se calcula para Open Graph (cambia por producto), asi que
     se reutiliza para la meta description, que faltaba por completo. -->
<meta name="description" content="<?php echo htmlspecialchars($og_desc); ?>" />
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
  
  // Scripts de seguimiento: sólo se emiten si hay ID configurado en el admin.
  //
  // Los stubs (fbq / clarity) se definen de forma síncrona, igual que antes, así
  // que cualquier llamada del sitio se encola y no se pierde ni un evento. Lo
  // único que se aplaza es la DESCARGA de los scripts externos, que juntos pesan
  // ~200 KB y bloqueaban el hilo principal ~350 ms durante el arranque.
  //
  // Se descargan en cuanto el visitante interactúa por primera vez: un scroll,
  // un toque, un clic o una tecla. En esta tienda el hero ocupa toda la pantalla
  // del móvil, así que cualquiera que llegue a ver un producto ya disparó la
  // carga. Quien se va sin tocar nada queda cubierto por el píxel de imagen que
  // se envía al ocultarse la pestaña.
  //
  // Antes se cargaban durante el arranque y costaban ~290 ms de bloqueo del hilo
  // principal, 9 puntos de rendimiento en móvil, compitiendo con la propia carga
  // de la tienda.
  const trackingHead = `
<?php if ($meta_pixel_id || $clarity_id): ?>
<script>
(function(){
  var urls = [];
<?php if ($meta_pixel_id): ?>
  !function(f,b,e,v,n){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[]}(window,document,'script');
  fbq('init', '<?php echo $meta_pixel_id; ?>');
  fbq('track', 'PageView');
  urls.push('https://connect.facebook.net/en_US/fbevents.js');
<?php endif; ?>
<?php if ($clarity_id): ?>
  window.clarity = window.clarity || function(){(window.clarity.q = window.clarity.q || []).push(arguments)};
  urls.push('https://www.clarity.ms/tag/<?php echo $clarity_id; ?>');
<?php endif; ?>

  var yaCargo = false;
  var seEnvioPixelSalida = false;
  function cargar(){
    if (yaCargo) return;
    yaCargo = true;
    quitarEscuchas();
    for (var i = 0; i < urls.length; i++) {
      var s = document.createElement('script');
      s.async = true;
      s.src = urls[i];
      document.head.appendChild(s);
    }
  }

  var eventos = ['pointerdown','keydown','touchstart','scroll'];
  function quitarEscuchas(){
    for (var i = 0; i < eventos.length; i++) {
      window.removeEventListener(eventos[i], cargar, true);
    }
  }
  for (var i = 0; i < eventos.length; i++) {
    window.addEventListener(eventos[i], cargar, { capture: true, once: true, passive: true });
  }

  // Red de seguridad para quien se marcha sin tocar nada: al ocultarse la
  // pestana se dispara el pixel ligero de imagen (la misma URL del <noscript>),
  // que no necesita JavaScript de Facebook y sale aunque la pagina se este
  // cerrando. Como solo ocurre si fbevents NO llego a cargarse, el PageView no
  // se cuenta dos veces.
  function pixelDeSalida(){
    if (yaCargo || seEnvioPixelSalida) return;
    seEnvioPixelSalida = true;
<?php if ($meta_pixel_id): ?>
    new Image().src = 'https://www.facebook.com/tr?id=<?php echo $meta_pixel_id; ?>&ev=PageView&noscript=1&rl=1';
<?php endif; ?>
  }
  document.addEventListener('visibilitychange', function(){
    if (document.visibilityState === 'hidden') pixelDeSalida();
  });
  window.addEventListener('pagehide', pixelDeSalida)
})();
</script>
<?php endif; ?>
`;

  // El <noscript> del pixel va en el <body>: dentro del <head> es HTML inválido.
  const trackingBody = `<?php if ($meta_pixel_id): ?>
<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=<?php echo $meta_pixel_id; ?>&ev=PageView&noscript=1" alt="" /></noscript>
<?php endif; ?>
`;

  // La tipografia se referencia desde el CSS, asi que el navegador no la
  // descubre hasta parsearlo. Anunciarla en el head la adelanta y evita que el
  // texto se repinte a mitad de carga.
  const assetsDir = fs.readdirSync(path.join(outDir, "assets"));
  const fuente = assetsDir.find((f) => /\.woff2$/.test(f));
  const preloadFuente = fuente
    ? `<link rel="preload" as="font" type="font/woff2" crossorigin href="/assets/${fuente}">
`
    : "";

  // El motor de animacion (LazyMotion) llega por import dinamico, asi que el
  // navegador no lo descubre hasta haber ejecutado el bundle. Anunciandolo aqui
  // baja en paralelo y ya esta listo cuando React monta: se ahorra una segunda
  // pasada de render y maquetacion de la portada entera.
  const chunkMotion = assetsDir.find((f) => /^layout-.*\.js$/.test(f));
  const preloadMotion = chunkMotion
    ? `<link rel="modulepreload" crossorigin href="/assets/${chunkMotion}">
`
    : "";

  const heroPreload = preloadFuente + preloadMotion + `<?php if ($hero_skeleton): ?><style>#lcp-overlay{position:absolute;top:0;left:0;right:0;z-index:1;background:#000}#lcp-hero{width:100%;background:#000;aspect-ratio:9/16}#lcp-hero picture,#lcp-hero img{display:block;width:100%;height:100%;object-fit:contain}@media(min-width:768px){#lcp-hero{aspect-ratio:5/2}}</style><?php endif; ?>
<?php echo $hero_preload; ?><?php echo $hero_inline; ?>`;
  htmlContent = htmlContent.replace('</head>', heroPreload + ogTagsHtml + trackingHead + '</head>');
  htmlContent = htmlContent.replace('<div id="root">', trackingBody + '<div id="root">');
  htmlContent = htmlContent.replace('<div id="root"></div>', '<?php echo $hero_skeleton; ?><div id="root"></div>');

  // El bundle se descarga con la misma prioridad de antes (modulepreload), pero
  // se ejecuta despues del primer pintado. Asi el banner del hero aparece en
  // cuanto llega, en vez de esperar a que React monte la portada y el navegador
  // haga la maquetacion completa: eran casi dos segundos de pantalla en negro.
  // La hoja principal bloqueaba el pintado, y con el la imagen del hero: el
  // navegador no pinta NADA hasta tenerla, aunque el esqueleto del banner use
  // solo estilos en linea y no la necesite. Se pide con la misma prioridad
  // (preload) pero sin bloquear. Cuando React monta ya esta aplicada: son 22 KB
  // que viajan antes que el bundle, que pesa cuatro veces mas.
  htmlContent = htmlContent.replace(
    /<link rel="stylesheet" crossorigin href="([^"]+)">/,
    (_, href) =>
      `<link rel="preload" as="style" crossorigin href="${href}">
` +
      `<link rel="stylesheet" crossorigin href="${href}" media="print" onload="this.media='all';this.onload=null">
` +
      `<noscript><link rel="stylesheet" crossorigin href="${href}"></noscript>`
  );

  htmlContent = htmlContent.replace(
    /<script type="module" crossorigin src="([^"]+)"><\/script>/,
    (_, src) =>
      `<link rel="modulepreload" crossorigin href="${src}">
` +
      `<script>(function(){var arrancado=false;function arranca(){if(arrancado)return;arrancado=true;` +
      `var s=document.createElement('script');s.type='module';s.crossOrigin='anonymous';s.src='${src}';document.head.appendChild(s);}` +
      // El doble rAF espera al primer pintado, pero en una pestana de fondo el
      // navegador no dispara rAF: sin el temporizador la pagina se quedaba sin
      // montar hasta que el visitante le diera foco.
      `setTimeout(arranca,300);` +
      `if('requestAnimationFrame'in window){requestAnimationFrame(function(){requestAnimationFrame(arranca);});}else{arranca();}})();</script>`
  );

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

  if (excluidos.length > 0) {
    log("\n AVISO: scripts excluidos del paquete por seguridad:", "yellow");
    [...new Set(excluidos)].forEach(f => log(`   - ${f}`, "yellow"));
    log("   Si alguno sigue en el servidor, borralo desde el Administrador de Archivos.", "yellow");
  }

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
