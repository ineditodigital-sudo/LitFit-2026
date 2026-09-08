/**
 * Borra del servidor los scripts de debug y migración que nunca deberían estar
 * en producción: quedan accesibles sin autenticación, y migrate-products.php
 * además sobrescribe la información nutricional de los productos con valores
 * fijos cada vez que alguien abre su URL.
 *
 * La lista es fija a propósito: este script no acepta rutas arbitrarias, para
 * que no pueda usarse para borrar otra cosa por error.
 *
 * Uso:  npm run limpiar:debug        (lee FTP_PASSWORD del .env)
 *       npm run limpiar:debug -- --dry-run
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

const REMOTE_ROOT = "/domains/litfitmexico.com/public_html";

// Lista cerrada. Rutas relativas a REMOTE_ROOT.
const A_BORRAR = [
  "envios/migrate-products.php",
  "envios/debug-db.php",
];

const dryRun = process.argv.includes("--dry-run");

console.log("\n>> Limpieza de scripts de debug en producción\n");
console.log(`   Servidor: ${REMOTE_ROOT}`);
A_BORRAR.forEach((f) => console.log(`     ${f}`));
console.log();

if (dryRun) {
  console.log(">> --dry-run: no se conectó al servidor.\n");
  process.exit(0);
}

if (!process.env.FTP_PASSWORD) {
  console.error("ERROR: falta FTP_PASSWORD en el .env de la raíz del proyecto.");
  process.exit(1);
}

const client = new ftp.Client(30000);

try {
  await client.access({
    host: "46.202.183.96",
    user: "u282141363",
    password: process.env.FTP_PASSWORD,
    secure: process.env.FTP_SECURE === "1",
  });
  console.log("   Conexión establecida.\n");

  for (const rel of A_BORRAR) {
    const remote = `${REMOTE_ROOT}/${rel}`;
    try {
      await client.remove(remote);
      console.log(`   BORRADO  ${rel}`);
    } catch (err) {
      // 550 = no existe: ya estaba limpio, no es un fallo
      if (/550/.test(err.message)) console.log(`   ya no estaba  ${rel}`);
      else console.error(`   ERROR al borrar ${rel}: ${err.message}`);
    }
  }

  console.log("\n>> Limpieza terminada.\n");
} catch (err) {
  console.error("\nERROR de conexión:", err.message);
  process.exitCode = 1;
} finally {
  client.close();
}
