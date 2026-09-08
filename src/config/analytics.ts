// Helpers de analítica (Meta Pixel + Microsoft Clarity).
// Los scripts base se cargan desde index.html; aquí sólo disparamos eventos.
// Como el sitio es una SPA, el PageView automático sólo cuenta la primera carga:
// por eso reportamos manualmente cada cambio de "página".

declare global {
  interface Window {
    fbq?: (...args: any[]) => void;
    clarity?: (...args: any[]) => void;
  }
}

/** PageView de Meta Pixel al navegar dentro de la SPA. */
export function trackPageView() {
  window.fbq?.("track", "PageView");
}

/** Evento estándar de Meta Pixel (ViewContent, AddToCart, Purchase, etc.). */
export function trackEvent(name: string, params?: Record<string, unknown>) {
  window.fbq?.("track", name, params);
}

/** Etiqueta la sesión en Clarity para poder filtrar grabaciones. */
export function tagSession(key: string, value: string) {
  window.clarity?.("set", key, value);
}
