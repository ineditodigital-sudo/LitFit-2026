import type { AppProps } from 'next/app';
import { CartProvider } from '../contexts/CartContext';
import { NavigationProvider } from '../contexts/NavigationContext';
import { Toaster } from 'sonner';
import '../styles/globals.css';

export default function App({ Component, pageProps }: AppProps) {
  return (
    <CartProvider>
      <NavigationProvider>
        <Component {...pageProps} />
        <Toaster position="top-center" richColors />
      </NavigationProvider>
    </CartProvider>
  );
}
