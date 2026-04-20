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
