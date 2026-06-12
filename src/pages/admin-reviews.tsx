import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { Check, Trash2, X, MessageSquare, Star } from "lucide-react";

interface Review {
  id: number;
  product_id: string;
  author: string;
  rating: number;
  comment: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
}

interface AdminReviewsProps {
  adminToken: string;
}

export function AdminReviews({ adminToken }: AdminReviewsProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setLoading(true);
      const res = await fetch("https://litfitmexico.com/envios/api-reviews.php?admin=1", {
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
      } else {
        toast.error(data.message || "Error al cargar reseñas");
      }
    } catch (err) {
      toast.error("Error de conexión al cargar reseñas");
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id: number, status: 'approved' | 'rejected') => {
    try {
      const res = await fetch("https://litfitmexico.com/envios/api-reviews.php", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${adminToken}`
        },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(`Reseña ${status === 'approved' ? 'aprobada' : 'rechazada'}`);
        setReviews(reviews.map(r => r.id === id ? { ...r, status } : r));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error al actualizar estado");
    }
  };

  const deleteReview = async (id: number) => {
    if (!confirm("¿Estás seguro de que deseas eliminar esta reseña permanentemente?")) return;
    
    try {
      const res = await fetch(`https://litfitmexico.com/envios/api-reviews.php?id=${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${adminToken}` }
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Reseña eliminada");
        setReviews(reviews.filter(r => r.id !== id));
      } else {
        toast.error(data.message);
      }
    } catch (err) {
      toast.error("Error al eliminar reseña");
    }
  };

  if (loading) {
    return <div className="p-8 text-center animate-pulse text-gray-500 font-bold">Cargando reseñas...</div>;
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <header className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-[#0F172A] tracking-tight flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-[#00AAC7]" />
            Reseñas de Clientes
          </h1>
          <p className="text-slate-500 font-medium mt-1">Aprueba y gestiona los comentarios sobre tus productos.</p>
        </div>
      </header>

      {reviews.length === 0 ? (
        <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-3xl p-12 text-center">
          <MessageSquare className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <h3 className="text-lg font-bold text-slate-600 mb-2">No hay reseñas todavía</h3>
          <p className="text-slate-500 text-sm">Las reseñas de los clientes aparecerán aquí para tu aprobación.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {reviews.map((review) => (
            <div key={review.id} className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row justify-between gap-4">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-3">
                    <span className="font-black text-slate-800">{review.author}</span>
                    <span className="text-xs font-bold px-2 py-1 bg-slate-100 text-slate-500 rounded-lg">
                      Prod: {review.product_id}
                    </span>
                    <span className="text-xs font-bold text-slate-400">
                      {new Date(review.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(star => (
                      <Star key={star} className={`w-4 h-4 ${star <= review.rating ? "fill-current" : "text-slate-200"}`} />
                    ))}
                  </div>
                  <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    "{review.comment}"
                  </p>
                </div>
                
                <div className="flex md:flex-col justify-end gap-2 shrink-0 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-4">
                  {review.status === 'pending' && (
                    <>
                      <button 
                        onClick={() => updateStatus(review.id, 'approved')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-600 hover:bg-emerald-100 hover:text-emerald-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        <Check className="w-4 h-4" /> Aprobar
                      </button>
                      <button 
                        onClick={() => updateStatus(review.id, 'rejected')}
                        className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-50 text-orange-600 hover:bg-orange-100 hover:text-orange-700 font-bold text-xs rounded-xl transition-colors"
                      >
                        <X className="w-4 h-4" /> Rechazar
                      </button>
                    </>
                  )}
                  {review.status === 'approved' && (
                    <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-emerald-500 text-white font-bold text-xs rounded-xl cursor-default">
                      <Check className="w-4 h-4" /> Aprobada
                    </div>
                  )}
                  {review.status === 'rejected' && (
                    <div className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-orange-100 text-orange-700 font-bold text-xs rounded-xl cursor-default">
                      <X className="w-4 h-4" /> Rechazada
                    </div>
                  )}
                  <button 
                    onClick={() => deleteReview(review.id)}
                    className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 font-bold text-xs rounded-xl transition-colors mt-auto"
                  >
                    <Trash2 className="w-4 h-4" /> Eliminar
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
