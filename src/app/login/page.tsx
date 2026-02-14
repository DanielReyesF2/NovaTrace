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
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Image
            src="/logo-econova-dark.png"
            alt="EcoNova"
            width={200}
            height={60}
            className="mx-auto"
            priority
          />
          <p className="text-[10px] tracking-[6px] text-eco-muted-2 uppercase mt-2">
            Trace System
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] tracking-widest text-eco-muted uppercase mb-2">
              Email
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-3 text-sm font-mono text-eco-ink placeholder:text-eco-muted-2 focus:outline-none focus:border-eco-navy/30 transition-colors"
              placeholder="daniel@econova.com.mx"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] tracking-widest text-eco-muted uppercase mb-2">
              Contraseña
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-eco-surface border border-eco-border rounded-lg px-4 py-3 text-sm font-mono text-eco-ink placeholder:text-eco-muted-2 focus:outline-none focus:border-eco-navy/30 transition-colors"
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
            className="w-full bg-eco-navy text-white font-bold py-3 rounded-lg text-sm hover:bg-eco-navy-light transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Entrando..." : "Entrar"}
          </button>
        </form>

        <p className="text-center text-[10px] text-eco-muted-2 mt-8">
          EcoNova México · Economía circular
        </p>
      </div>
    </div>
  );
}
