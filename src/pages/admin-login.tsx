import React, { useState } from "react";
import { motion } from "motion/react";
import { Lock, User, Shield } from "lucide-react";

const ADMIN_AUTH_URL = "https://litfitmexico.com/envios/admin-auth.php";

interface AdminLoginProps {
  onLoginSuccess: (token: string) => void;
}

export function AdminLogin({ onLoginSuccess }: AdminLoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const response = await fetch(ADMIN_AUTH_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: username.trim(), password }),
      });

      const data = await response.json();

      if (response.ok && data.success && data.token) {
        // Guardar token con timestamp de expiración
        const expiresAt = Date.now() + (data.expiresIn * 1000);
        sessionStorage.setItem("litfit_admin_token", data.token);
        sessionStorage.setItem("litfit_admin_expires", String(expiresAt));
        onLoginSuccess(data.token);
      } else {
        setError(data.message || "Credenciales incorrectas.");
      }
    } catch (err) {
      setError("Error de conexión. Verifica tu internet e inténtalo de nuevo.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-950 via-gray-900 to-black flex items-center justify-center p-4">

      {/* Background grid */}
      <div className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: "linear-gradient(rgba(0,170,199,0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(0,170,199,0.3) 1px, transparent 1px)",
          backgroundSize: "40px 40px"
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="relative w-full max-w-md"
      >
        {/* Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-[32px] overflow-hidden shadow-2xl">

          {/* Header */}
          <div className="px-10 pt-10 pb-8 text-center">
            <div className="w-16 h-16 bg-[#00AAC7]/10 border border-[#00AAC7]/30 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-8 h-8 text-[#00AAC7]" />
            </div>
            <img
              src="https://imagenes.inedito.digital/LITFIT/LOGO%20LITFIT%20BLANCO%20Y%20AZUL.webp"
              alt="LITFIT México"
              className="h-10 mx-auto mb-4 object-contain"
            />
            <h1 className="text-white font-black text-xl tracking-tight">Panel de Control</h1>
            <p className="text-white/40 text-xs font-medium mt-1">Acceso exclusivo administradores</p>
          </div>

          {/* Form */}
          <div className="px-10 pb-10 space-y-5">
            <div>
              <label className="block text-[10px] font-black text-white/50 mb-2 tracking-widest uppercase">
                Usuario
              </label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm font-medium focus:border-[#00AAC7]/60 focus:bg-white/10 outline-none transition-all"
                  placeholder="Usuario"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black text-white/50 mb-2 tracking-widest uppercase">
                Contraseña
              </label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-white/20 text-sm font-medium focus:border-[#00AAC7]/60 focus:bg-white/10 outline-none transition-all"
                  placeholder="Contraseña"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            {error && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-red-500/10 border border-red-500/30 text-red-300 px-4 py-3 rounded-xl text-xs font-medium"
              >
                {error}
              </motion.div>
            )}

            <button
              type="submit"
              onClick={handleLogin}
              disabled={isLoading || !username || !password}
              className="w-full bg-[#00AAC7] hover:bg-[#0091AB] disabled:bg-white/10 disabled:text-white/30 text-white py-4 rounded-2xl font-black text-xs tracking-widest transition-all duration-300 shadow-lg hover:shadow-[#00AAC7]/25 disabled:cursor-not-allowed mt-2"
            >
              {isLoading ? "VERIFICANDO..." : "INICIAR SESIÓN"}
            </button>
          </div>
        </div>

        <p className="mt-4 text-center text-[10px] text-white/20 font-medium">
          🔒 Autenticación segura — LITFIT México
        </p>
      </motion.div>
    </div>
  );
}
