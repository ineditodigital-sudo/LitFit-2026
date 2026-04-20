// Configuración de tarifas de envío
// Ajusta estos valores según tus acuerdos con las paqueterías

export interface ShippingRate {
  carrier: string;
  basePrice: number; // Precio base para el primer kg
  pricePerKg: number; // Precio por kg adicional
  deliveryDays: string;
  zones: {
    local: number; // Multiplicador para zona local (mismo estado)
    regional: number; // Multiplicador para zona regional (estados cercanos)
    national: number; // Multiplicador para zona nacional
  };
}

export const SHIPPING_RATES: ShippingRate[] = [
  {
    carrier: "FedEx Express Saver",
    basePrice: 120,
    pricePerKg: 35,
    deliveryDays: "2-3 días",
    zones: {
      local: 1.0,
      regional: 1.3,
      national: 1.8,
    },
  },
  {
    carrier: "DHL Express",
    basePrice: 140,
    pricePerKg: 40,
    deliveryDays: "1-2 días",
    zones: {
      local: 1.0,
      regional: 1.4,
      national: 2.0,
    },
  },
  {
    carrier: "Estafeta Terrestre",
    basePrice: 90,
    pricePerKg: 25,
    deliveryDays: "3-5 días",
    zones: {
      local: 1.0,
      regional: 1.2,
      national: 1.5,
    },
  },
];

// Estados por zona (desde Aguascalientes)
export const SHIPPING_ZONES = {
  local: ["Aguascalientes"],
  regional: [
    "Jalisco",
    "Guanajuato",
    "Zacatecas",
    "San Luis Potosí",
    "Querétaro",
    "Nayarit",
    "Colima",
    "Michoacán",
  ],
  national: [
    "Ciudad de México",
    "Estado de México",
    "Nuevo León",
    "Puebla",
    "Veracruz",
    "Chihuahua",
    "Baja California",
    "Sonora",
    "Sinaloa",
    "Oaxaca",
    "Chiapas",
    "Yucatán",
    "Quintana Roo",
    "Hidalgo",
    "Morelos",
    "Guerrero",
    "Tlaxcala",
    "Tamaulipas",
    "Coahuila",
    "Durango",
    "Campeche",
    "Tabasco",
    "Baja California Sur",
  ],
};

export function calculateShipping(
  weight: number,
  state: string,
): { carrier: string; price: number; deliveryDays: string }[] {
  // Determinar zona
  let zone: "local" | "regional" | "national" = "national";

  if (SHIPPING_ZONES.local.includes(state)) {
    zone = "local";
  } else if (SHIPPING_ZONES.regional.includes(state)) {
    zone = "regional";
  }

  // Calcular precios
  return SHIPPING_RATES.map((rate) => {
    const basePrice = rate.basePrice;
    const additionalWeight = Math.max(0, weight - 1); // Primer kg incluido
    const additionalCost = additionalWeight * rate.pricePerKg;
    const zoneMultiplier = rate.zones[zone];
    const totalPrice = (basePrice + additionalCost) * zoneMultiplier;

    return {
      carrier: rate.carrier,
      price: Math.round(totalPrice * 100) / 100, // Redondear a 2 decimales
      deliveryDays: rate.deliveryDays,
    };
  });
}
