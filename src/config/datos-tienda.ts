// Peticiones compartidas del escaparate.
//
// Cada componente de la portada pedia por su cuenta los mismos dos endpoints:
// el catalogo se descargaba y se parseaba cuatro veces (ProductsSection,
// BarsPromotion, Footer y el carrito) y los ajustes otras cuatro. Eran ocho
// viajes al servidor y ocho parseos de JSON compitiendo con el arranque.
//
// Aqui se comparte una sola peticion por endpoint. La vigencia corta permite
// que, si alguien vuelve a la tienda despues de editar algo en el panel, la
// siguiente carga traiga datos frescos en vez de quedarse pegada a la primera.

const VIGENCIA_MS = 30_000;

type Entrada<T> = { promesa: Promise<T>; momento: number };

const cache = new Map<string, Entrada<any>>();

function pedir<T>(clave: string, url: () => string, normalizar: (d: any) => T): Promise<T> {
  const previa = cache.get(clave);
  if (previa && Date.now() - previa.momento < VIGENCIA_MS) return previa.promesa;

  const promesa = fetch(url())
    .then((r) => r.json())
    .then(normalizar)
    .catch((e) => {
      // Un fallo no debe quedarse cacheado: el siguiente intento vuelve a pedir.
      cache.delete(clave);
      throw e;
    });

  cache.set(clave, { promesa, momento: Date.now() });
  return promesa;
}

export function obtenerProductos(): Promise<any[]> {
  return pedir("productos", () => `https://litfitmexico.com/envios/api-products.php?t=${Date.now()}`,
    (d) => (Array.isArray(d) ? d : []));
}

export function obtenerAjustes(): Promise<Record<string, any>> {
  return pedir("ajustes", () => `https://litfitmexico.com/envios/api-settings.php?t=${Date.now()}`,
    (d) => (d && typeof d === "object" ? d : {}));
}
