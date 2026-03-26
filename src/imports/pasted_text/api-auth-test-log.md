🔐 PASO 1: Obtener Token de Autenticación
📥 HTTP Status Code: 200

📥 Response:

{"access_token":"tzno2jj7JCvTy+TL9ukOf6nLeWRv52Qtj+M5MPTmVG6bkVmRB6NpAA5dsme5N4lywrHvJfnzU6xrTXIX6TNgdJm5UTb5t8AV4Ut+Vjg8hiQhlu6cfTMdisTbYrua3irJECT60CZxqmiaeoLOACEZO53EkvyoNsSrYdvriN50hDrFu1DSY1r/5W44Z2+ooUdd+er/sQuN7ndyEovl2UD4zmGWRLXHasyENT+whXNO3iCjz4YTVGX3rdzMgkUFol7Yf7qrDeeeCajuGTmhv7CiFvyHSqhqAN3sRGlcuXbShw4MwqCP7jKsJf0tYzpgAP+83V13C0NQ+UnHFdq3Uu8jbP5doVYu2EdA7pbhNyqBOD6zNMDw--S0E90wkIHjXbalFB--2+iakxJYrc9TD7/FFLbm1A==","token_type":"Bearer","expires_in":7200,"scope":"default","created_at":1773786108}
✅ Token obtenido exitosamente!

🎟️ Token (primeros 50 caracteres): tzno2jj7JCvTy+TL9ukOf6nLeWRv52Qtj+M5MPTmVG6bkVmRB6...

⏰ Expira en: 7200 segundos

📦 PASO 2: Crear Envío de Prueba con el Token
📤 Datos del envío:

{
    "order": {
        "reference": "TEST-DIAGNOSTICO-1773786108",
        "reference_number": "TEST-1773786108",
        "payment_status": "paid",
        "total_price": "1049.00",
        "platform": "custom",
        "package_type": "box",
        "parcels": [
            {
                "weight": 1.1999999999999999555910790149937383830547332763671875,
                "length": 30,
                "width": 20,
                "height": 15,
                "quantity": 1,
                "dimension_unit": "cm",
                "mass_unit": "kg",
                "package_type": "box",
                "consignment_note": "Prueba de diagnóstico - Suplementos alimenticios"
            }
        ],
        "products": [
            {
                "name": "Proteína ISO - Prueba",
                "sku": "TEST-SKU-123",
                "price": "899.00",
                "quantity": 1,
                "weight": 1,
                "length": 10,
                "width": 10,
                "height": 15,
                "hs_code": "2106909900"
            }
        ],
        "shipper_address": {
            "address": "Av. Constitución 123, Col. Centro",
            "internal_number": "",
            "reference": "Almacén LITFIT",
            "sector": "Centro",
            "city": "Monterrey",
            "state": "Nuevo León",
            "postal_code": "64000",
            "country": "MX",
            "person_name": "LITFIT - Almacén Principal",
            "company": "LITFIT",
            "phone": "8112345678",
            "email": "ricoro845@gmail.com"
        },
        "recipient_address": {
            "address": "Vallarta 216 #8",
            "internal_number": "",
            "reference": "Prueba de diagnóstico",
            "sector": "Vistas de Oriente",
            "city": "Aguascalientes",
            "state": "Aguascalientes",
            "postal_code": "20196",
            "country": "MX",
            "person_name": "Ricardo Ledesma",
            "company": "",
            "phone": "4492610335",
            "email": "ricoro845@gmail.com"
        }
    }
}
🧪 INTENTO 1: Authorization: Bearer {token}
📤 Headers:

Content-Type: application/json
Accept: application/json
Authorization: Bearer tzno2jj7JCvTy+TL9ukOf6nLeWRv52...
📥 HTTP Status Code: 401

📥 Response:

❌ Este método NO funcionó (HTTP 401)

🧪 INTENTO 2: Token en URL (?access_token=...)
📤 URL:

https://app.enviosinternacionales.com/api/v1/orders?access_token=...
📥 HTTP Status Code: 401

📥 Response:

❌ Este método NO funcionó (HTTP 401)

🧪 INTENTO 3: X-API-TOKEN header
📤 Headers:

Content-Type: application/json
Accept: application/json
X-API-TOKEN: tzno2jj7JCvTy+TL9ukOf6nLeWRv52...
📥 HTTP Status Code: 401

📥 Response:

❌ Este método NO funcionó (HTTP 401)
