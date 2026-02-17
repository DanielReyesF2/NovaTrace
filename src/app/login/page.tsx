"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

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
      <div className="w-full max-w-[360px]">
        {/* Logo */}
        <div className="text-center mb-12">
          <Image
            src="/logo-econova-dark.png"
            alt="EcoNova"
            width={180}
            height={54}
            className="mx-auto"
            priority
          />
          <p className="text-[9px] tracking-[6px] text-eco-muted-2 uppercase mt-3 font-medium">
            Trace System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-[11px] tracking-[2px] text-eco-muted uppercase mb-2.5 font-medium">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-eco-ink placeholder:text-eco-muted-2 focus:outline-none focus:border-eco-navy/20 focus:ring-4 focus:ring-eco-navy/[0.04] transition-all"
              placeholder="daniel@econova.com.mx"
              required
            />
          </div>
          <div>
            <label className="block text-[11px] tracking-[2px] text-eco-muted uppercase mb-2.5 font-medium">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-white border border-black/[0.08] rounded-xl px-4 py-3.5 text-[14px] text-eco-ink placeholder:text-eco-muted-2 focus:outline-none focus:border-eco-navy/20 focus:ring-4 focus:ring-eco-navy/[0.04] transition-all"
              placeholder="••••••••"
              required
            />
          </div>

          {error && (
            <div className="text-eco-red text-[13px] text-center py-2 font-medium">{error}</div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-eco-navy text-white font-semibold py-3.5 rounded-xl text-[14px] hover:bg-eco-navy-light transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-soft active:scale-[0.98]"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-[10px] text-eco-muted-2 mt-10 font-light tracking-wide">
          EcoNova México · Economía circular
        </p>
      </div>
    </div>
  );
}
