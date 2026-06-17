import { useState, useEffect } from "react";
import { Star, MessageSquare, X } from "lucide-react";
import { toast } from "sonner";
import { motion } from "motion/react";

interface Review {
  id: string;
  author: string;
  rating: number;
  comment: string;
  created_at: string;
}

interface ProductReviewsProps {
  productId: string;
}

export function useProductReviews(productId: string) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch(`https://litfitmexico.com/envios/api-reviews.php?product_id=${productId}`);
        const data = await res.json();
        if (data.success) {
          setReviews(data.data);
        }
      } catch (err) {
        console.error("Error fetching reviews:", err);
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchReviews();
    }
  }, [productId]);

  const avgRating = reviews.length > 0 
    ? (reviews.reduce((acc, r) => acc + Number(r.rating), 0) / reviews.length).toFixed(1) 
    : 0;

  return { reviews, avgRating, loading };
}

export function ReviewStars({ avgRating, reviewCount, onWriteReview }: { avgRating: number | string, reviewCount: number, onWriteReview: () => void }) {
  return (
    <div className="flex items-center gap-3 mt-4 px-2">
      <div className="flex gap-1">
        {[...Array(5)].map((_, i) => (
          <Star key={i} className={`w-4 h-4 ${i < Math.round(Number(avgRating)) ? 'fill-[#00AAC7] text-[#00AAC7]' : 'text-gray-300'}`} />
        ))}
      </div>
      <span className="text-sm text-gray-600 font-medium">
        {reviewCount > 0 ? `${avgRating} (${reviewCount} reseñas)` : 'Nuevo producto'}
      </span>
      <button 
        onClick={onWriteReview}
        className="text-xs font-bold text-[#00AAC7] hover:underline ml-2"
      >
        Escribir reseña
      </button>
    </div>
  );
}

export function ReviewSection({ productId, reviews }: { productId: string, reviews: Review[] }) {
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewForm, setReviewForm] = useState({ author: '', rating: 5, comment: '' });
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReview(true);
    try {
      const res = await fetch("https://litfitmexico.com/envios/api-reviews.php", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          product_id: productId,
          ...reviewForm
        })
      });
      const data = await res.json();
      if (data.success) {
        toast.success(data.message);
        setShowReviewModal(false);
        setReviewForm({ author: '', rating: 5, comment: '' });
      } else {
        toast.error(data.message || "Error al enviar reseña");
      }
    } catch (err) {
      toast.error("Error de conexión");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  return (
    <>
      <div className="mt-16 pt-12 border-t border-gray-100 w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-2xl font-black text-black tracking-tighter uppercase italic">Reseñas del Producto</h2>
            <p className="text-gray-500 font-medium">Lo que dicen nuestros clientes</p>
          </div>
          <button 
            onClick={() => setShowReviewModal(true)}
            className="bg-[#0F172A] text-white px-6 py-3 font-bold text-xs tracking-widest uppercase hover:bg-black transition-colors"
          >
            Escribir una reseña
          </button>
        </div>

        {reviews.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center border-2 border-dashed border-gray-200">
            <MessageSquare className="w-8 h-8 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500 font-medium">Aún no hay reseñas. ¡Sé el primero en opinar!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 gap-6">
            {reviews.map(review => (
              <div key={review.id} className="bg-gray-50 p-6 border border-gray-100">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h4 className="font-black text-black uppercase">{review.author}</h4>
                    <p className="text-xs text-gray-500 font-medium">{new Date(review.created_at).toLocaleDateString()}</p>
                  </div>
                  <div className="flex text-[#00AAC7]">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className={`w-3.5 h-3.5 ${i < review.rating ? 'fill-current text-[#00AAC7]' : 'text-gray-300'}`} />
                    ))}
                  </div>
                </div>
                <p className="text-sm text-gray-700 leading-relaxed italic">"{review.comment}"</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white p-6 md:p-8 max-w-md w-full relative"
          >
            <button 
              onClick={() => setShowReviewModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-black"
            >
              <X className="w-6 h-6" />
            </button>
            <h3 className="text-2xl font-black uppercase italic mb-6">Escribir Reseña</h3>
            
            <form onSubmit={handleSubmitReview} className="space-y-4">
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tu Calificación</label>
                <div className="flex gap-2">
                  {[1,2,3,4,5].map(star => (
                    <button 
                      key={star}
                      type="button"
                      onClick={() => setReviewForm(p => ({ ...p, rating: star }))}
                      className={`transition-colors ${star <= reviewForm.rating ? 'text-[#00AAC7]' : 'text-gray-300'}`}
                    >
                      <Star className="w-8 h-8 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Tu Nombre</label>
                <input 
                  type="text" 
                  required
                  value={reviewForm.author}
                  onChange={e => setReviewForm(p => ({ ...p, author: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#00AAC7]"
                  placeholder="Ej. Juan Pérez"
                />
              </div>
              <div>
                <label className="block text-xs font-black uppercase text-gray-500 mb-2">Comentario</label>
                <textarea 
                  required
                  value={reviewForm.comment}
                  onChange={e => setReviewForm(p => ({ ...p, comment: e.target.value }))}
                  className="w-full bg-gray-50 border border-gray-200 px-4 py-3 text-sm focus:outline-none focus:border-[#00AAC7] h-32 resize-none"
                  placeholder="¿Qué te pareció el producto?"
                />
              </div>
              <button 
                type="submit"
                disabled={isSubmittingReview}
                className="w-full bg-[#00AAC7] hover:bg-[#0091AB] text-white font-black tracking-wider text-sm py-4 uppercase transition-colors disabled:opacity-50"
              >
                {isSubmittingReview ? 'Enviando...' : 'Enviar Reseña'}
              </button>
            </form>
          </motion.div>
        </div>
      )}
    </>
  );
}
