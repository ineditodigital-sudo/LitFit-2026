async function test() {
  const payload = {
    quotation: {
      address_from: { country_code: "MX", postal_code: "66477", area_level1: "Nuevo Leon", area_level2: "Monterrey", area_level3: "Centro" },
      address_to: { country_code: "MX", postal_code: "20196", area_level1: "Ags", area_level2: "Ags", area_level3: "Villerias" },
      parcels: [{ length: 30, width: 20, height: 15, weight: 1.5, declared_value: 1000 }],
      requested_carriers: ["fedex"]
    }
  };

  const res = await fetch("https://tienda.litfitmexico.com/envios/cotizar.php", {
    method: "POST", headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload)
  });
  const data = await res.json();
  const qId = data.id;
  console.log("Quotation ID:", qId);

  await new Promise(r => setTimeout(r, 6000));
  const res2 = await fetch("https://tienda.litfitmexico.com/envios/consultar-cotizacion.php?id=" + qId);
  const data2 = await res2.json();
  const rates = data2.api_response?.rates || data2.rates || [];
  console.log("Rates sample:", JSON.stringify(rates[0], null, 2));
}
test();
