/**
 * Sube archivos PHP concretos de backend-hostinger/envios/ por FTP.
 *
 * Existe porque ftp-frontend.mjs deja /envios intacto a propósito, y
 * ftp-deploy.mjs vuelca el backend completo y reinstala los scripts de debug
 * que deben seguir borrados del servidor. Aquí la lista es cerrada: no acepta
 * rutas arbitrarias, para que no pueda pisarse otra cosa por error.
 *
 * Uso:  npm run deploy:backend
 *       npm run deploy:backend -- --dry-run
 */
import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

function loadDotEnv() {
  const envPath = path.join(root, ".env");
  if (!fs.existsSync(envPath)) return;
  for (const line of fs.readFileSync(envPath, "utf-8").split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eq = trimmed.indexOf("=");
    if (eq === -1) continue;
    const key = trimmed.slice(0, eq).trim();
    let value = trimmed.slice(eq + 1).trim();
    if (/^(".*"|'.*')$/s.test(value)) value = value.slice(1, -1);
    if (!(key in process.env)) process.env[key] = value;
  }
}
loadDotEnv();

const config = {
  host: "46.202.183.96",
  user: "u282141363.LitFitInedito",
  password: process.env.FTP_PASSWORD,
  secure: process.env.FTP_SECURE === "1",
};

// Lista cerrada, relativa a backend-hostinger/. Se sube al mismo sub-path remoto.
// Orden importante: db-setup.php crea la columna images, y api-products.php ya
// la usa en su INSERT. Al reves, guardar un producto fallaria hasta migrar.
const ARCHIVOS = [
  "envios/db-setup.php",
  "envios/api-products.php",
];

const dryRun = process.argv.includes("--dry-run");

if (!config.password && !dryRun) {
  console.error("ERROR: falta FTP_PASSWORD (variable de entorno o .env en la raíz).");
  process.exit(1);
}

// Validar que todo exista y compile antes de tocar el servidor
const faltantes = ARCHIVOS.filter((f) => !fs.existsSync(path.join(root, "backend-hostinger", f)));
if (faltantes.length > 0) {
  console.error(`ERROR: no existen localmente: ${faltantes.join(", ")}`);
  process.exit(1);
}

console.log("\n>> Subida de backend a litfitmexico.com\n");
console.log(`   Modo:  ${config.secure ? "FTPS (cifrado)" : "FTP plano"}`);
console.log("   Archivos:");
ARCHIVOS.forEach((f) => console.log(`     ${f}`));
console.log("\n   NO se tocan: index.php, assets, /mercadopago, .htaccess, ni el resto de /envios\n");

if (dryRun) {
  console.log(">> --dry-run: validación OK, no se conectó al servidor.\n");
  process.exit(0);
}

const client = new ftp.Client(30000);

try {
  console.log("   Conectando...");
  await client.access(config);
  console.log("   Conexión establecida.\n");
} catch (err) {
  console.error("\n>> NO SE SUBIÓ NADA. Falló la conexión.");
  console.error(`   Detalle: ${err.message}`);
  client.close();
  process.exit(1);
}

try {
  // Confirmar que estamos donde creemos antes de sobrescribir nada
  const raiz = await client.list("/");
  if (!raiz.some((e) => e.name === "envios")) {
    throw new Error('no se encontró /envios en la raíz FTP; se aborta sin subir nada');
  }

  for (const archivo of ARCHIVOS) {
    const local = path.join(root, "backend-hostinger", archivo);
    await client.uploadFrom(local, `/${archivo}`);
    console.log(`   OK  ${archivo}`);
  }
  console.log("\n>> SUBIDA COMPLETADA.\n");
} catch (err) {
  console.error("\n>> SUBIDA INCOMPLETA:", err.message);
  console.error("   Revisa las líneas OK de arriba para saber qué sí subió.");
  process.exitCode = 1;
} finally {
  client.close();
}
