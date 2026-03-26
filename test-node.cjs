async function testApi() {
  const API_KEY = 'brvLtZIWJaJTOZxEWxUlOA6dZksfLOMDfS9ZvEHBLG0';
  const SECRET_KEY = 'Lh5MdoKxgcgn-PfQi7141KTq-Sdkifg8t_pa87QmBog';

  const payload = {
    origin: {
      name: 'LITFIT', company: 'LITFIT', email: 'envios@litfit.com', phone: '8112345678',
      street: 'Calle Principal', number: '123', district: 'Centro', city: 'San Pedro Garza Garcia',
      state: 'Nuevo Leon', country: 'MX', zip_code: '66477'
    },
    destination: {
      name: 'Juan Perez', email: 'juan@test.com', phone: '1234567890',
      street: 'Calle Falsa', number: '123', district: 'Centro', city: 'Aguascalientes',
      state: 'Aguascalientes', country: 'MX', zip_code: '20196'
    },
    parcel: { weight: 1.5, length: 10, width: 10, height: 10 },
    carrier: 'fedex'
  };

  const res = await fetch('https://api.enviosinternacionales.com/v1/shipments', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Api-Key': API_KEY,
      'X-Secret-Key': SECRET_KEY
    },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  console.log("Response:", await res.text());
}
testApi();
