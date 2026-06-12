import * as ftp from "basic-ftp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, "..");

const config = {
  host: "46.202.183.96",
  user: "u282141363",
  password: process.env.FTP_PASSWORD, // Will be passed via CLI
  secure: false
};

async function deploy() {
  if (!config.password) {
    console.error("❌ Error: Necesitas proveer la contraseña de FTP. Usa: FTP_PASSWORD=tu_pass npm run deploy:ftp");
    process.exit(1);
  }

  const client = new ftp.Client();
  client.ftp.verbose = true;

  try {
    console.log("🚀 Conectando al servidor FTP...");
    await client.access(config);

    console.log("📂 Cambiando al directorio del dominio...");
    await client.cd("/");
    await client.ensureDir("/domains/litfitmexico.com/public_html");
    await client.cd("/domains/litfitmexico.com/public_html");

    // Subir la carpeta dist-build/ al public_html
    const localDistPath = path.join(rootDir, "dist-build");
    if (!fs.existsSync(localDistPath)) {
      console.error("❌ Error: No se encontró la carpeta 'dist-build'. Ejecuta 'npm run build' primero.");
      process.exit(1);
    }

    console.log("📤 Subiendo archivos estáticos (dist)...");
    await client.uploadFromDir(localDistPath);

    // Subir backend-hostinger/
    const localBackendPath = path.join(rootDir, "backend-hostinger");
    if (fs.existsSync(localBackendPath)) {
      console.log("📤 Subiendo archivos de backend (backend-hostinger)...");
      await client.uploadFromDir(localBackendPath);
    }

    console.log("✅ ¡Despliegue completado con éxito!");
  } catch (err) {
    console.error("❌ Error durante el despliegue FTP:", err);
  } finally {
    client.close();
  }
}

deploy();
