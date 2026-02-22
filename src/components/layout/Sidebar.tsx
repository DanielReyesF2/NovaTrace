"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname, useRouter } from "next/navigation";

interface SidebarProps {
  user: {
    email: string;
    role: string;
  };
}

const ROLE_STYLES: Record<string, { color: string; bg: string }> = {
  ADMIN: { color: "#b5e951", bg: "rgba(181,233,81,0.15)" },
  OPERATOR: { color: "#E8700A", bg: "rgba(232,112,10,0.15)" },
  VIEWER: { color: "#2D8CF0", bg: "rgba(45,140,240,0.15)" },
};

const NAV_ITEMS = [
  {
    href: "/",
    label: "Dashboard",
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="7" height="7" rx="1" />
        <rect x="14" y="3" width="7" height="7" rx="1" />
        <rect x="3" y="14" width="7" height="7" rx="1" />
        <rect x="14" y="14" width="7" height="7" rx="1" />
      </svg>
    ),
  },
  {
    href: "/batch",
    label: "Lotes",
    matchPrefix: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2" />
        <rect x="9" y="3" width="6" height="4" rx="1" />
        <path d="M9 14l2 2 4-4" />
      </svg>
    ),
  },
  {
    href: "/analytics",
    label: "Análisis",
    matchPrefix: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22,12 18,12 15,21 9,3 6,12 2,12" />
      </svg>
    ),
  },
  {
    href: "/equipment",
    label: "Equipos",
    matchPrefix: true,
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z" />
      </svg>
    ),
  },
];

export function Sidebar({ user }: SidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const isActive = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.href === "/") return pathname === "/";
    if (item.matchPrefix) return pathname.startsWith(item.href);
    return pathname === item.href;
  };

  const roleStyle = ROLE_STYLES[user.role] || ROLE_STYLES.VIEWER;

  const handleLogout = async () => {
    setLoggingOut(true);
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setCollapsed(!collapsed)}
        className="fixed top-4 left-4 z-50 md:hidden bg-eco-navy border border-white/10 rounded-lg p-2 text-white/60 hover:text-white"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M3 12h18M3 6h18M3 18h18" />
        </svg>
      </button>

      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/30 z-30 md:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      <aside
        className={`
          fixed md:sticky top-0 left-0 h-screen z-40
          flex flex-col
          bg-eco-navy
          transition-all duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)]
          ${collapsed ? "-translate-x-full md:translate-x-0 md:w-16" : "w-60"}
          md:translate-x-0
        `}
      >
        {/* Logo */}
        <div className="px-5 py-6 border-b border-white/[0.06]">
          <Link href="/" className="flex items-center gap-2.5">
            <Image
              src="/logo-econova.png"
              alt="EcoNova"
              width={collapsed ? 32 : 130}
              height={collapsed ? 32 : 46}
              className={`transition-all duration-300 object-contain ${collapsed ? "md:w-8" : "w-[130px]"}`}
              priority
            />
          </Link>
          {!collapsed && (
            <span className="text-[8px] tracking-[4px] text-white/25 uppercase mt-1.5 block pl-0.5 font-medium">
              Trace
            </span>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3 px-3 py-2.5 rounded-xl text-[13px] font-medium
                  transition-all duration-200 group relative
                  ${active
                    ? "bg-white/[0.08] text-eco-green"
                    : "text-white/40 hover:text-white/65 hover:bg-white/[0.04]"
                  }
                `}
              >
                {active && (
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-eco-green rounded-full" />
                )}
                <span className="flex-shrink-0">{item.icon}</span>
                <span className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
                  {item.label}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Collapse toggle (desktop) */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="hidden md:flex mx-3 mb-2 items-center justify-center py-2 rounded-lg text-white/25 hover:text-white/50 hover:bg-white/5 transition-colors"
        >
          <svg
            width="16" height="16" viewBox="0 0 24 24" fill="none"
            stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"
            className={`transition-transform duration-200 ${collapsed ? "rotate-180" : ""}`}
          >
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        {/* User section */}
        <div className="border-t border-white/[0.06] px-3 py-4">
          <div className="flex items-center gap-3">
            <div
              className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-[10px] font-bold"
              style={{ color: roleStyle.color, backgroundColor: roleStyle.bg }}
            >
              {user.email.charAt(0).toUpperCase()}
            </div>
            <div className={`overflow-hidden transition-all duration-200 min-w-0 ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
              <p className="text-xs text-white/60 truncate">{user.email}</p>
              <span
                className="text-[9px] font-semibold uppercase tracking-wider"
                style={{ color: roleStyle.color }}
              >
                {user.role}
              </span>
            </div>
          </div>

          {/* Logout */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className={`
              mt-3 w-full flex items-center gap-3 px-3 py-2 rounded-lg text-xs
              text-white/30 hover:text-eco-red hover:bg-eco-red/10
              transition-colors disabled:opacity-50
            `}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="flex-shrink-0">
              <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
              <polyline points="16,17 21,12 16,7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className={`overflow-hidden transition-all duration-200 whitespace-nowrap ${collapsed ? "md:w-0 md:opacity-0" : "w-auto opacity-100"}`}>
              {loggingOut ? "Saliendo..." : "Cerrar sesion"}
            </span>
          </button>
        </div>
      </aside>
    </>
  );
}
