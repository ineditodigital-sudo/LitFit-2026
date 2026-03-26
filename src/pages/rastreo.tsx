import { useState } from 'react';
import { motion } from 'motion/react';
import { Search, Package, MapPin, Clock, CheckCircle, Truck, ArrowLeft, Loader2 } from 'lucide-react';

const RASTREO_BACKEND_URL = "https://inedito.digital/api/envios/rastrear.php";

interface TrackingEvent {
  date: string;
  time: string;
  status: string;
  location: string;
  description: string;
}

interface TrackingInfo {
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  origin: string;
  destination: string;
  events: TrackingEvent[];
}

export default function Rastreo() {
  const [trackingNumber, setTrackingNumber] = useState('');
  const [loading, setLoading] = useState(false);
  const [trackingInfo, setTrackingInfo] = useState<TrackingInfo | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!trackingNumber.trim()) {
      setError('Por favor ingresa un número de guía');
      return;
    }

    setLoading(true);
    setError(null);
    setTrackingInfo(null);

    try {
      const response = await fetch(`${RASTREO_BACKEND_URL}?tracking=${encodeURIComponent(trackingNumber)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Error al consultar el rastreo');
      }

      const data = await response.json();

      if (data.success && data.tracking) {
        setTrackingInfo(data.tracking);
      } else {
        setError(data.message || 'No se encontró información para este número de guía');
      }
    } catch (err) {
      console.error('Error tracking shipment:', err);
      setError('No se pudo obtener la información de rastreo. Por favor intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregado')) return <CheckCircle className="w-5 h-5 text-green-500" />;
    if (statusLower.includes('tránsito') || statusLower.includes('camino')) return <Truck className="w-5 h-5 text-[#00AAC7]" />;
    if (statusLower.includes('preparación') || statusLower.includes('recolección')) return <Package className="w-5 h-5 text-yellow-500" />;
    return <Clock className="w-5 h-5 text-gray-400" />;
  };

  const getStatusColor = (status: string) => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('entregado')) return 'bg-green-500';
    if (statusLower.includes('tránsito') || statusLower.includes('camino')) return 'bg-[#00AAC7]';
    if (statusLower.includes('preparación') || statusLower.includes('recolección')) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <div className="bg-black text-white py-6 border-b border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <a href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-black tracking-tight">LITFIT</span>
            </a>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-block bg-[#00AAC7]/10 p-4 rounded-full mb-6"
          >
            <Package className="w-12 h-12 text-[#00AAC7]" />
          </motion.div>
          <h1 className="text-4xl md:text-5xl font-black text-gray-900 mb-4">
            Rastrea tu Pedido
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Ingresa tu número de guía para conocer el estado de tu envío en tiempo real
          </p>
        </div>

        {/* Search Form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white p-6 border border-gray-200 mb-8"
        >
          <form onSubmit={handleSearch} className="flex gap-4">
            <div className="flex-1">
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ej: 1234567890"
                className="w-full px-4 py-3 border border-gray-300 focus:border-[#00AAC7] focus:ring-2 focus:ring-[#00AAC7]/20 outline-none transition-all"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-[#00AAC7] hover:bg-[#00d4ff] text-black font-black transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Buscando...
                </>
              ) : (
                <>
                  <Search className="w-5 h-5" />
                  Rastrear
                </>
              )}
            </button>
          </form>

          {error && (
            <div className="mt-4 p-4 bg-red-50 border border-red-200 text-red-800">
              <p className="text-sm font-medium">{error}</p>
            </div>
          )}
        </motion.div>

        {/* Tracking Results */}
        {trackingInfo && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            {/* Status Card */}
            <div className="bg-white p-6 border border-gray-200">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Número de Guía</p>
                  <p className="text-2xl font-black text-gray-900">{trackingInfo.trackingNumber}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-gray-600 mb-1">Paquetería</p>
                  <p className="font-black text-gray-900">{trackingInfo.carrier}</p>
                </div>
              </div>

              <div className={`p-4 ${getStatusColor(trackingInfo.status)} bg-opacity-10 border-l-4 ${getStatusColor(trackingInfo.status).replace('bg-', 'border-')}`}>
                <div className="flex items-center gap-3">
                  {getStatusIcon(trackingInfo.status)}
                  <div>
                    <p className="font-black text-gray-900">{trackingInfo.status}</p>
                    <p className="text-sm text-gray-600">Entrega estimada: {trackingInfo.estimatedDelivery}</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4 mt-6">
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Origen
                  </p>
                  <p className="font-black text-gray-900">{trackingInfo.origin}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600 mb-1 flex items-center gap-2">
                    <MapPin className="w-4 h-4" />
                    Destino
                  </p>
                  <p className="font-black text-gray-900">{trackingInfo.destination}</p>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white p-6 border border-gray-200">
              <h2 className="text-xl font-black text-gray-900 mb-6">Historial de Movimientos</h2>
              
              <div className="space-y-4">
                {trackingInfo.events.map((event, index) => (
                  <div key={index} className="flex gap-4">
                    {/* Timeline Line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-3 h-3 rounded-full ${index === 0 ? 'bg-[#00AAC7]' : 'bg-gray-300'}`} />
                      {index < trackingInfo.events.length - 1 && (
                        <div className="w-0.5 h-full bg-gray-200 my-1" />
                      )}
                    </div>

                    {/* Event Content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <p className="font-black text-gray-900">{event.status}</p>
                          <p className="text-sm text-gray-600">{event.location}</p>
                        </div>
                        <div className="text-right text-sm text-gray-500">
                          <p>{event.date}</p>
                          <p>{event.time}</p>
                        </div>
                      </div>
                      {event.description && (
                        <p className="text-sm text-gray-600">{event.description}</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {/* Help Section */}
        {!trackingInfo && !loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="bg-gray-50 p-6 border border-gray-200"
          >
            <h3 className="font-black text-gray-900 mb-4">¿Dónde encuentro mi número de guía?</h3>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00AAC7] mt-0.5 flex-shrink-0" />
                <span>En el correo electrónico de confirmación que recibiste después de tu compra</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00AAC7] mt-0.5 flex-shrink-0" />
                <span>El número de guía se genera automáticamente después de procesar tu pago</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-[#00AAC7] mt-0.5 flex-shrink-0" />
                <span>Si no lo encuentras, contáctanos a: reenviadorlitfit@inedito.digital</span>
              </li>
            </ul>
          </motion.div>
        )}
      </div>
    </div>
  );
}
