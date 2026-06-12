const fs = require('fs');
const code = fs.readFileSync('E:/LITFIT/Sitio Web LITFIT/Sitio Web LITFIT/LITFIT_BUILD_de_emergencia-fresa/assets/index-X2jJ6DWi-v3.js', 'utf8');
const start = code.indexOf('Fresa');
console.log(code.substring(Math.max(0, start - 200), start + 200));
