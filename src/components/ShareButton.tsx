import { Share2 } from "lucide-react";

interface ShareButtonProps {
  title: string;
  text: string;
  url?: string;
}

export function ShareButton({ title, text, url }: ShareButtonProps) {
  const handleShare = async () => {
    const shareData = {
      title,
      text,
      url: url || window.location.href,
    };

    try {
      if (navigator.share) {
        await navigator.share(shareData);
      } else {
        // Fallback for browsers that don't support Web Share API
        await navigator.clipboard.writeText(shareData.url);
        alert("¡Enlace copiado al portapapeles!");
      }
    } catch (err) {
      // AbortError is common if user cancels the share dialog, no need to alert
      if ((err as Error).name !== 'AbortError') {
        console.error("Error compartiendo:", err);
      }
    }
  };

  return (
    <button
      onClick={handleShare}
      className="p-2 text-gray-400 hover:text-[#00AAC7] transition-colors rounded-full hover:bg-gray-100"
      title="Compartir producto"
    >
      <Share2 className="w-5 h-5" />
    </button>
  );
}
