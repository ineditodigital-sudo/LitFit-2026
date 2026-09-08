/**
 * Sube SOLO el frontend compilado (index.php + assets) por FTP.
 *
 * A diferencia de ftp-deploy.mjs, este script:
 *   - sube el index.php generado por `npm run deploy` (con las etiquetas Open Graph),
 *     no el index.html crudo de dist-build/
 *   - NO toca /envios ni /mercadopago, para no pisar el backend en producción
 *   - no borra nada en el servidor
 *
 * La contraseña se toma del archivo .env en la raíz del proyecto (ignorado por git),
 * o de la variable de entorno FTP_PASSWORD si está definida.
 *
 * Requiere haber corrido `npm run deploy` antes, para que exista public_html/.
 */
import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const localDir = path.join(root, "public_html");

// Lee .env sin dependencias. Las variables de entorno reales tienen prioridad,
// para no pisar lo que ya venga configurado en la máquina.
function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    // Todo lo que sigue al primer "=" es el valor: así no se rompe con
    // contraseñas que contengan =, %, $ u otros caracteres especiales.
    let value = trimmed.slice(eq + 1).trim();
    if (/^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1); // comillas opcionales
    if (!(key in process.env)) process.env[key] = value;
  }
}

loadDotEnv();

const config = {
  host: "46.202.183.96",
  user: "u282141363.LitFitInedito",
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === "1", // FTPS si se pide explícitamente
};

const REMOTE_ROOT = "/";
const dryRun = process.argv.includes("--dry-run");
// El .htaccess no se sube por defecto: define el enrutamiento de todo el sitio
// y un error ahí lo tumba entero. Se incluye sólo si se pide explícitamente.
const conHtaccess = process.argv.includes("--htaccess");

if (!config.password && !dryRun) {
  console.error("ERROR: falta la contraseña FTP.\n");

  // Confusión frecuente: llenar .env.example (que se versiona) en vez de .env
  const examplePath = path.join(root, ".env.example");
  if (fs.existsSync(examplePath)) {
    const example = fs.readFileSync(examplePath, "utf-8");
    // [ \t] y no \s: \s incluye saltos de línea y haría match con la línea siguiente
    if (/^[ \t]*FTP_PASSWORD[ \t]*=[ \t]*\S+/m.test(example)) {
      console.error("   OJO: pusiste la contraseña en .env.example, y ese archivo NO es el correcto.");
      console.error("   .env.example es una plantilla y SÍ se versiona en git.\n");
      console.error("   Muévela al archivo .env (mismo nombre, sin \".example\") y bórrala de .env.example.\n");
      process.exit(1);
    }
  }

  console.error(`   Crea el archivo .env aquí:\n     ${path.join(root, ".env")}\n`);
  console.error("   Con esta única línea dentro:");
  console.error("     FTP_PASSWORD=tu_contraseña_de_hostinger\n");
  console.error("   (el .env está en .gitignore, no se sube a git ni al servidor)");
  process.exit(1);
}

// 1. Resolver qué archivos hay que subir
const indexPhp = path.join(localDir, "index.php");
const assetsDir = path.join(localDir, "assets");

if (!fs.existsSync(indexPhp)) {
  console.error(`ERROR: no existe ${indexPhp}`);
  console.error("   Corre primero:  npm run deploy");
  process.exit(1);
}

// Todos los .js/.css/.woff2 de la compilación actual, no solo index-*: desde que
// la aplicación divide el código por ruta hay trozos con otros nombres
// (checkout-*.js, admin-dashboard-*.js, ...) y si no se suben, esas páginas
// quedan rotas en producción. El .woff2 es la tipografía auto-alojada. Las
// imágenes y demás archivos del servidor no se tocan: se filtra por extensión.
const bundles = fs
  .readdirSync(assetsDir)
  .filter((f) => /\.(js|css|woff2)$/.test(f));

if (bundles.length === 0) {
  console.error("ERROR: no se encontraron archivos .js / .css en public_html/assets");
  process.exit(1);
}

// 2. Comprobar que el index.php referencia justo esos bundles
const indexContent = fs.readFileSync(indexPhp, "utf-8");
const referenced = [...indexContent.matchAll(/assets\/(index-[A-Za-z0-9_-]+\.(?:js|css))/g)].map((m) => m[1]);
const missing = referenced.filter((r) => !bundles.includes(r));
if (missing.length > 0) {
  console.error(`ERROR: index.php referencia bundles que no están en assets/: ${missing.join(", ")}`);
  console.error("   Vuelve a correr:  npm run deploy");
  process.exit(1);
}

console.log("\n>> Subida de frontend a litfitmexico.com\n");
console.log(`   Destino: ${REMOTE_ROOT}`);
console.log(`   Modo:    ${config.secure ? "FTPS (cifrado)" : "FTP plano"}`);
console.log("   Archivos:");
console.log("     index.php");
console.log(`     assets/  (${bundles.length} archivos .js/.css/.woff2)`);
console.log("     robots.txt, llms.txt, sitemap.xml");
if (conHtaccess) console.log("     .htaccess   <-- incluido por --htaccess");
console.log(
  `\n   NO se tocan: /envios, /mercadopago, imágenes${conHtaccess ? "" : ", .htaccess"}\n`
);

if (dryRun) {
  console.log(">> --dry-run: validación OK, no se conectó al servidor.\n");
  process.exit(0);
}

const client = new ftp.Client(30000); // timeout explícito: no se queda colgado

// Fase 1: conexión. Se separa del resto para distinguir "credenciales malas"
// de "falló al subir", que se arreglan de formas muy distintas.
try {
  console.log("   Conectando...");
  await client.access(config);
  console.log("   Conexión establecida.\n");
} catch (err) {
  const msg = err.message || "";
  console.error("\n>> NO SE SUBIÓ NADA. Falló la conexión.\n");

  if (/530|login|password|incorrect/i.test(msg)) {
    console.error("   El servidor rechazó las credenciales.");
    console.error("   Causa más común: se usó el texto de ejemplo en lugar de la contraseña real.");
    console.error('   Revisa que $env:FTP_PASSWORD NO diga literalmente "tu_password".');
  } else if (/timeout|ETIMEDOUT|ENOTFOUND|ECONNREFUSED/i.test(msg)) {
    console.error("   No se pudo alcanzar el servidor (timeout o host inaccesible).");
    console.error("   Revisa tu conexión, o si el firewall bloquea el puerto 21.");
  } else {
    console.error(`   Detalle: ${msg}`);
  }

  client.close();
  process.exit(1);
}

// Fase 2: subida
try {
  await client.cd(REMOTE_ROOT);

  // index.php al raíz
  await client.uploadFrom(indexPhp, "index.php");
  console.log("   OK  index.php");

  // Archivos sueltos de la raíz que consumen buscadores y agentes. Se generan en
  // cada build (llms.txt, sitemap.xml) o viven en public/ (robots.txt), y sin
  // esto nunca llegaban al servidor: el .htaccess devolvía el HTML de la tienda
  // en su lugar.
  for (const nombre of ["robots.txt", "llms.txt", "sitemap.xml"]) {
    const ruta = path.join(localDir, nombre);
    if (!fs.existsSync(ruta)) continue;
    await client.uploadFrom(ruta, nombre);
    console.log(`   OK  ${nombre}`);
  }

  if (conHtaccess) {
    const htaccess = path.join(localDir, ".htaccess");
    if (!fs.existsSync(htaccess)) throw new Error("no existe public_html/.htaccess");
    await client.uploadFrom(htaccess, ".htaccess");
    console.log("   OK  .htaccess");
  }

  // bundles dentro de assets/
  await client.ensureDir(`${REMOTE_ROOT}/assets`);
  for (const b of bundles) {
    await client.uploadFrom(path.join(assetsDir, b), b);
    console.log(`   OK  assets/${b}`);
  }

  console.log("\n>> SUBIDA COMPLETADA.\n");
  console.log("   Verifica en incógnito: https://litfitmexico.com/");
} catch (err) {
  console.error("\n>> SUBIDA INCOMPLETA:", err.message);
  console.error("   Puede que algunos archivos sí hayan subido. Revisa las líneas OK de arriba.");
  process.exitCode = 1;
} finally {
  client.close();
}
