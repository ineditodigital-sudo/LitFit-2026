const https = require('https');

const API_BASE = 'https://app.enviosinternacionales.com/api/v1';
const CLIENT_ID = '9ba18129-3733-4f9e-bbb2-763486377e6e';
const CLIENT_SECRET = '634P%z*e]m>Lh_Ea';

async function spy() {
    console.log("Infiltrándose en la paquetería...");
    
    // 1. Obtener Token
    const authRes = await fetch(`${API_BASE}/oauth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `grant_type=client_credentials&client_id=${CLIENT_ID}&client_secret=${CLIENT_SECRET}`
    });
    const authData = await authRes.json();
    const token = authData.access_token;
    
    // 2. Obtener lista de envíos exitosos
    const shipRes = await fetch(`${API_BASE}/shipments/?include=packages`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const shipData = await shipRes.json();
    
    if (shipData.data && shipData.data.length > 0) {
        console.log("¡Guía exitosa encontrada!");
        const firstShipment = shipData.data[0];
        
        console.log("\n--- DETALLES DEL ENVÍO ---");
        console.log(JSON.stringify(firstShipment.attributes, null, 2));
        
        console.log("\n--- PAQUETES ---");
        console.log(JSON.stringify(shipData.included, null, 2));
    } else {
        console.log("No se encontraron envíos.");
    }
}

spy();
