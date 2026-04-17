import { useState, useEffect } from "react";
import { motion } from "framer-motion"; // Nota: ajusté el import de motion a framer-motion por convención, cámbialo si usas otro
import {
  Truck,
  Package,
  Clock,
  CheckCircle,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { calculateShipping } from "../config/shipping-rates";

const USE_REAL_API = true; // ✅ API de envíos activada

interface ShippingOption {
  id?: string;
  carrier: string;
  service: string;
  price: number;
  deliveryDays: string;
}

interface ShippingQuoteProps {
  formData: {
    zipCode: string;
    state?: string;
    city?: string;
    colonia?: string;
    country?: string;
  };
  totalWeight?: number;
  onSelectShipping: (option: ShippingOption | null) => void;
  selectedOption: ShippingOption | null;
  subtotal?: number;
}

export function ShippingQuote({
  formData,
  totalWeight = 1.5,
  onSelectShipping,
  selectedOption,
  subtotal = 0,
}: ShippingQuoteProps) {
  const [loading, setLoading] = useState(false);
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [lastQuotedKey, setLastQuotedKey] = useState<string>("");
  const [quotationId, setQuotationId] = useState<string | null>(null);

  const quotationKey = `${formData.zipCode}-${formData.state}-${formData.city}`;

  useEffect(() => {

    const zipCodeValid = formData.zipCode && /^\d{5}$/.test(formData.zipCode);
    const stateValid = formData.state && formData.state.trim().length > 0;
    const cityValid = formData.city && formData.city.trim().length > 0;

    if (zipCodeValid && stateValid && cityValid && quotationKey !== lastQuotedKey) {
      setLastQuotedKey(quotationKey);
      fetchShippingQuote();
    } else if (!zipCodeValid || !stateValid || !cityValid) {
      if (error) {
        setError(null);
      }
    }
  }, [formData.zipCode, formData.state, formData.city, subtotal]);

  const fetchShippingQuote = async () => {
    setLoading(true);
    setError(null);
    setShippingOptions([]);
    onSelectShipping(null);

    try {
      if (!USE_REAL_API) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        const calculatedRates = calculateShipping(totalWeight, formData.state);

        const options: ShippingOption[] = calculatedRates.map((rate) => ({
          carrier: rate.carrier.split(" ")[0],
          service: rate.carrier,
          price: rate.price,
          deliveryDays: rate.deliveryDays,
        }));

        setShippingOptions(options);
        const cheapest = options.reduce((prev, curr) =>
          prev.price < curr.price ? prev : curr
        );
        onSelectShipping(cheapest);
        setLoading(false);
        return;
      }

      function removeAccents(str: string): string {
        return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      }

      const cleanState = removeAccents(formData.state || "");
      const cleanCity = removeAccents(formData.city || "");
      const cleanColonia = removeAccents(formData.colonia || "");

      // ✅ CORRECCIÓN CRÍTICA: Estructura exacta requerida por la API
      const requestBody = {
        quotation: {
          order_id: `LITFIT-${Date.now()}`,
          address_from: {
            country_code: "MX",
            postal_code: "20020", 
            area_level1: "Aguascalientes",
            area_level2: "Aguascalientes",
            area_level3: "Circunvalación Nte"
          },
          address_to: {
            country_code: "MX",
            postal_code: formData.zipCode,
            area_level1: cleanState,
            area_level2: cleanCity,
            area_level3: cleanColonia || "Centro"
          },
          parcels: [
            {
              length: 30,
              width: 20,
              height: 15,
              weight: totalWeight || 1.5,
              package_protected: false,
              declared_value: subtotal > 0 ? subtotal : 1000
            }
          ],
          requested_carriers: ["fedex", "dhl", "estafeta"]
        }
      };


      
      let response;
      try {
        response = await fetch(
          "https://litfitmexico.com/envios/cotizar.php",
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(requestBody),
          }
        );
      } catch (fetchError: any) {
        console.error("❌ Error de red:", fetchError);
        setError("No se puede conectar con el servidor. Por favor verifica que cotizar.php esté subido correctamente.");
        setLoading(false);
        return;
      }

      if (!response.ok) {
        const responseText = await response.text();
        setError(`Error del servidor (${response.status}): ${responseText || "Sin detalles"}`);
        setLoading(false);
        return;
      }

      const responseText = await response.text();
      let data;
      try {
        data = JSON.parse(responseText);
      } catch {
        setError("Respuesta inválida de la API");
        setLoading(false);
        return;
      }

      if (data.api_response) {
        if (data.api_http_code !== 200 && data.api_http_code !== 201 && data.api_http_code !== 202) {
          const errorMsg = data.api_response?.errors 
            ? JSON.stringify(data.api_response.errors)
            : data.api_response?.message || "Error desconocido";
          setError(`Error de cotización: ${errorMsg}`);
          setLoading(false);
          return;
        }
        data = data.api_response;
      }

      const quotationId = data.id;
      if (!quotationId) {
        setError("No se recibió ID de cotización");
        setLoading(false);
        return;
      }

      setQuotationId(quotationId);

      // 🔄 Polling
      let finalData = data;
      let attempts = 0;
      const maxAttempts = 5;

      while (attempts < maxAttempts) {
        const successfulRates = finalData.rates?.filter((opt: any) => opt.success === true) || [];

        if (successfulRates.length > 0) {
          break;
        }

        const hasPending = finalData.rates?.some((r: any) => r.status === "pending");
        if (!hasPending) {
          break;
        }

        attempts++;
        await new Promise((resolve) => setTimeout(resolve, 3000));

        const response2 = await fetch(
          `https://litfitmexico.com/envios/consultar-cotizacion.php?id=${quotationId}`,
          {
            method: "GET",
            headers: { "Content-Type": "application/json" },
          }
        );

        if (!response2.ok) break;

        const responseText2 = await response2.text();
        try {
          finalData = JSON.parse(responseText2);
          if (finalData.api_response) finalData = finalData.api_response;
        } catch {
          break;
        }
      }

      if (finalData.rates && finalData.rates.length > 0) {
        const validOptions: ShippingOption[] = finalData.rates
          .filter((opt: any) => opt.success === true && opt.amount)
          .map((opt: any) => ({
            id: opt.id,
            carrier: opt.provider_display_name,
            service: opt.provider_service_name,
            price: parseFloat(opt.amount),
            deliveryDays: opt.days ? `${opt.days} días` : "N/D",
          }));

        if (validOptions.length > 0) {
          setShippingOptions(validOptions);
          const cheapest = validOptions.reduce((prev, curr) =>
            prev.price < curr.price ? prev : curr
          );
          onSelectShipping(cheapest);
        } else {
          setError("Las tarifas aún están en proceso. Intenta nuevamente en unos segundos.");
        }
      } else {
        setError("No hay opciones de envío disponibles para este código postal.");
      }
    } catch (err: any) {
      console.error("❌ Error fetching shipping:", err);
      setError("No se pudo conectar con el servicio de envíos.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-white p-6 border border-gray-200">
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 text-[#00AAC7] animate-spin mr-3" />
          <span className="text-gray-600">Calculando opciones de envío...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 border border-gray-200">
      <div className="flex items-center gap-3 mb-6">
        <Truck className="w-5 h-5 text-[#00AAC7]" />
        <h2 className="text-xl font-black text-gray-900">Opciones de Envío</h2>
      </div>



      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
            <div>
              <p className="font-black text-red-800 text-sm mb-1">No se pueden calcular los envíos</p>
              <p className="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        </div>
      )}

      {!error && shippingOptions.length === 0 && (
        <div className="p-4 border-2 border-dashed border-gray-300 bg-gray-50 text-center">
          <Package className="w-8 h-8 text-gray-400 mx-auto mb-2" />
          <p className="text-sm text-gray-600">Ingresa un código postal válido para calcular las opciones</p>
        </div>
      )}

      {shippingOptions.length > 0 && (
        <>
          <div className="space-y-3">
            {shippingOptions.map((option, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 border-2 cursor-pointer transition-all ${
                  selectedOption?.carrier === option.carrier &&
                  selectedOption?.service === option.service
                    ? "border-[#00AAC7] bg-[#00AAC7]/5"
                    : "border-gray-200 hover:border-[#00AAC7]/50"
                }`}
                onClick={() => onSelectShipping(option)}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <Package className="w-4 h-4 text-[#00AAC7]" />
                      <h3 className="font-black text-gray-900">{option.carrier}</h3>
                      {selectedOption?.carrier === option.carrier &&
                        selectedOption?.service === option.service && (
                          <CheckCircle className="w-4 h-4 text-[#00AAC7]" />
                        )}
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{option.service}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <Clock className="w-3 h-3" />
                      <span>{option.deliveryDays}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-black text-[#00AAC7]">${option.price.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">MXN</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
          <div className="mt-4 p-3 bg-gray-50 border border-gray-200">
            <p className="text-xs text-gray-600">
              <strong>Nota:</strong> El tiempo de entrega comienza a contar después de que se genera tu guía de envío.
            </p>
          </div>
        </>
      )}
    </div>
  );
}
