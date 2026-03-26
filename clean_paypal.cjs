const fs = require('fs');
const file = 'e:/LITFIT/Sitio Web LITFIT/Sitio Web LITFIT/src/pages/checkout.tsx';
let txt = fs.readFileSync(file, 'utf8');

// 1. Remove imports
txt = txt.replace(/import\s*\{\s*PayPalButtons[^\n]+;\r?\n/, '');

// 2. Remove PAYPAL_ENABLED flag
txt = txt.replace(/\/\/\s*🔧 CONFIGURACIÓN:.*?DESHABILITADO.*?verificación\r?\n/is, '');

// // 3. Remove PayPalButtonWrapper
txt = txt.replace(/\/\/\s*PayPal Button Wrapper Component[\s\S]*?(?=\/\/\s*Mercado Pago Button Component)/i, '');

// 4. Update the state for selectedPaymentMethod
txt = txt.replace(/const\s+\[selectedPaymentMethod,\s*setSelectedPaymentMethod\]\s*=\s*useState<'mercadopago'\s*\|\s*'paypal'\s*\|\s*null>\(null\);/, 
  "const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'mercadopago' | null>('mercadopago');");

// 5. Remove UI block: it starts at `{/* PayPal - solo mostrar ...` and ends before `</div>\n</div>\n</motion.div>`
const parts = txt.split(/\{\/\*\s*PayPal\s*-\s*solo mostrar si está habilitado\s*\*\/\}/);
if(parts.length > 1) {
  const mainBefore = parts[0];
  const secondPart = parts[1];
  // Split the second part to find where the container div closes
  const subparts = secondPart.split(/\{\/\*\s*PayPal\s*-\s*Próximamente[\s\S]*?<\//); // skip ahead
  
  // Since string manip is messy, let me just find index
  const idx2 = txt.indexOf("{/* PayPal - solo mostrar");
  const endIdx = txt.indexOf("</div>\n                </div>\n              </motion.div>", idx2);
  if (idx2 > 0 && endIdx > idx2) {
     txt = txt.substring(0, idx2) + txt.substring(endIdx);
  } else {
     // Alternative
     const end2 = txt.indexOf("</motion.div>", idx2);
     if (idx2 > 0 && end2 > idx2) {
       txt = txt.substring(0, idx2) + "</div>\n                </div>\n              </motion.div>" + txt.substring(end2 + 13);
     }
  }
}

fs.writeFileSync(file, txt);
console.log("Done");
