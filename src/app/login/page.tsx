"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Error de autenticación");
        return;
      }

      router.push("/");
      router.refresh();
    } catch {
      setError("Error de conexión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-eco-bg px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold tracking-tighter text-eco-green font-mono">
            ECONOVA
          </h1>
          <p className="text-[10px] tracking-[6px] text-white/20 uppercase mt-1">
            Trace System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest text-white/30 uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-3 text-sm font-mono text-white placeholder:text-white/15 focus:outline-none focus:border-eco-green/30 transition-colors"
              placeholder="daniel@econova.com.mx"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-white/30 uppercase mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-3 text-sm font-mono text-white placeholder:text-white/15 focus:outline-none focus:border-eco-green/30 transition-colors"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-eco-red text-xs text-center py-2">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-green text-black font-bold py-3 rounded-lg text-sm hover:bg-eco-green/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-[10px] text-white/10 mt-8">
          EcoNova México · Economía circular
        </p>
      </div>
    </div>
  );
}
