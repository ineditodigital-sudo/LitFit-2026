/**
 * Genera un SQL de restauración para la información nutricional que
 * migrate-products.php sobrescribió.
 *
 * Valores tomados de la API antes del daño, corroborados con el campo
 * `description` de proteina-colageno (que el script de migración no tocó).
 *
 * El JSON se escribe con escapes \uXXXX (ASCII puro) para que el archivo sea
 * inmune a problemas de codificación al importarlo en phpMyAdmin. MySQL
 * interpreta esos escapes al parsear el JSON y guarda el carácter real.
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const RESTAURAR = [
  {
    id: "proteina-colageno",
    nutrition: {
      "Proteína": "25g",
      "Colágeno": "4.5g",
      "Carbohidratos": "0g",
      "Calorías": "118 Cals por scoop",
    },
    features: [
      "25g Proteína + 4.5g Colágeno",
      "Proteína enriquecida con colágeno",
      "Envío seguro a todo México",
    ],
  },
  {
    id: "proteina-clasica",
    nutrition: {
      "Proteína": "28.5g",
      "Calorías": "120 kcal",
    },
    // features quedaron intactas: no se tocan
    features: null,
  },
];

// JSON -> literal seguro para MySQL: solo ASCII, y las barras invertidas de
// los escapes \uXXXX se duplican porque MySQL las consume en los literales.
function sqlJson(value) {
  const json = JSON.stringify(value).replace(/[-￿]/g, (c) =>
    "\\u" + c.charCodeAt(0).toString(16).padStart(4, "0")
  );
  return "'" + json.replace(/\\/g, "\\\\").replace(/'/g, "\\'") + "'";
}

const lineas = [
  "-- Restauración de información nutricional sobrescrita por migrate-products.php",
  "-- Solo toca las columnas nutrition/features de dos productos.",
  "-- No borra ni inserta filas: el resto del catálogo queda intacto.",
  "",
  "START TRANSACTION;",
  "",
];

for (const p of RESTAURAR) {
  const sets = [`nutrition = ${sqlJson(p.nutrition)}`];
  if (p.features) sets.push(`features = ${sqlJson(p.features)}`);
  lineas.push(`-- ${p.id}`);
  lineas.push(`UPDATE products SET ${sets.join(", ")} WHERE id = '${p.id}';`);
  lineas.push("");
}

lineas.push("COMMIT;");
lineas.push("");
lineas.push("-- Verificación (opcional): debe mostrar los valores restaurados");
lineas.push(
  "-- SELECT id, nutrition, features FROM products WHERE id IN ('proteina-colageno','proteina-clasica');"
);
lineas.push("");

const outPath = path.join(root, "restaurar-nutricion.sql");
fs.writeFileSync(outPath, lineas.join("\n"), "utf-8");
console.log("Generado:", outPath);
