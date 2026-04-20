const API_BASE = 'https://app.enviosinternacionales.com/api/v1';
const CLIENT_ID = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
const CLIENT_SECRET = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';

async function testApi() {
    console.log("Obteniendo Token...");
    const urlencoded = new URLSearchParams();
    urlencoded.append("client_id", CLIENT_ID);
    urlencoded.append("client_secret", CLIENT_SECRET);
    urlencoded.append("grant_type", "client_credentials");

    const authRes = await fetch(`${API_BASE}/oauth/token`, {
        method: 'POST',
        body: urlencoded
    });
    
    if (!authRes.ok) {
        console.log("Auth error:", await authRes.text());
        return;
    }
    const authData = await authRes.json();
    const token = authData.access_token;
    console.log("Token obtenido:", token.substring(0,10) + '...');

    // 1. Cotizar
    const quotePayload = {
        quotation: {
            address_from: { country_code: 'MX', postal_code: '20020', area_level1: 'Ag', area_level2: 'Ag', area_level3: 'Centro', address_line_1: 'Cedro 305' },
            address_to: { country_code: 'MX', postal_code: '20000', area_level1: 'Ag', area_level2: 'Ag', area_level3: 'Centro', address_line_1: 'Conocido 1' },
            parcels: [{ weight: 1, length: 15, width: 15, height: 15 }]
        }
    };

    const quoteRes = await fetch(`${API_BASE}/quotations`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(quotePayload)
    });
    const quoteData = await quoteRes.json();
    const rate = (quoteData.rates || []).find(r => r.success === true);
    if (!rate) {
        console.log("No rate:", quoteData);
        return;
    }
    const rateId = rate.id;
    console.log("Rate ID:", rateId);

    // Testing - SAT Codes
    const pkgTypes = ['box', 'caja', 'XBX', '4G'];
    const notes = ['51191900', 'Suplementos_alimenticios', 'Suplementos alimenticios', '01010101'];

    for (let pkg of pkgTypes) {
        for (let note of notes) {
            console.log(`\n=> Probando: [${pkg}] / [${note}]`);
            const shipPayload = {
                shipment: {
                    rate_id: rateId,
                    address_from: { name: 'LITFIT MEXICO', email: 'a@b.com', phone: '4491000000', street1: 'Cedro 305', postal_code: '20020', reference: 'F' },
                    address_to: { name: 'C', email: 'c@d.com', phone: '4491000000', street1: 'Dir', postal_code: '20000', reference: 'E' },
                    packages: [{ package_number: 1, package_type: pkg, content: 'Suplementos', consignment_note: note, weight: 1, length: 15, width: 15, height: 15 }]
                }
            };

            const shipRes = await fetch(`${API_BASE}/shipments/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify(shipPayload)
            });
            const text = await shipRes.text();
            
            if (shipRes.status === 429) {
                console.log("RATE LIMIT ALCANZADO. Guarde y espere.");
                return;
            }

            console.log("Resp:", text);
            if (!text.includes('consignment_note')) {
                console.log(">>> NOTA ACEPTADA!");
            }
            if (!text.includes('package_type')) {
                console.log(">>> PACKAGE TYPE ACEPTADO!");
            }
            if (shipRes.status === 201 || shipRes.status === 200) {
                console.log("🔥 ÉXITO TOTAL 🔥");
                return;
            }
            
            // Wait 2 secs to prevent rate limits
            await new Promise(r => setTimeout(r, 2000));
        }
    }
}

testApi();
