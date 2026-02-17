"use client";

import { useState } from "react";
import Image from "next/image";

interface Photo {
  id: string;
  url: string;
  type: string;
  caption: string | null;
  takenAt: string;
}

const TYPE_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  FEEDSTOCK: { label: "Materia prima", color: "#E8700A", icon: "📦" },
  PROCESS: { label: "Proceso", color: "#2D8CF0", icon: "⚙️" },
  PRODUCT: { label: "Producto", color: "#3d7a0a", icon: "🛢️" },
  LABEL: { label: "Etiqueta", color: "#7C5CFC", icon: "🏷️" },
};

export function PhotoGallery({ photos }: { photos: Photo[] }) {
  const [selected, setSelected] = useState<Photo | null>(null);

  return (
    <>
      <div className="bg-white rounded-2xl shadow-soft border border-black/[0.03] p-5">
        <h3 className="text-[11px] tracking-[2px] text-eco-muted uppercase font-medium mb-4">
          Registro Fotográfico — {photos.length} fotos
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {photos.map((photo) => {
            const typeInfo = TYPE_LABELS[photo.type] || TYPE_LABELS.PROCESS;
            return (
              <button
                key={photo.id}
                onClick={() => setSelected(photo)}
                className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-eco-surface-2 border border-black/[0.04] hover:border-black/[0.1] transition-all hover:shadow-md"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photo.url}
                  alt={photo.caption || `Foto ${photo.type}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
                {/* Type badge */}
                <span
                  className="absolute top-2 left-2 text-[8px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full text-white"
                  style={{ backgroundColor: typeInfo.color }}
                >
                  {typeInfo.icon} {typeInfo.label}
                </span>
                {/* Caption */}
                {photo.caption && (
                  <span className="absolute bottom-2 left-2 right-2 text-[10px] text-white leading-tight line-clamp-2 font-medium">
                    {photo.caption}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Lightbox */}
      {selected && (
        <div
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-6"
          onClick={() => setSelected(null)}
        >
          <div
            className="relative max-w-3xl w-full max-h-[85vh] rounded-2xl overflow-hidden bg-white shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={selected.url}
              alt={selected.caption || `Foto ${selected.type}`}
              className="w-full max-h-[70vh] object-contain bg-black"
            />
            <div className="p-4 flex items-center justify-between">
              <div>
                {selected.caption && (
                  <p className="text-sm text-eco-ink font-medium">{selected.caption}</p>
                )}
                <p className="text-[10px] text-eco-muted font-mono mt-0.5">
                  {TYPE_LABELS[selected.type]?.icon} {TYPE_LABELS[selected.type]?.label || selected.type}
                  {" · "}
                  {new Date(selected.takenAt).toLocaleString("es-MX", {
                    day: "numeric",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
                className="text-eco-muted hover:text-eco-ink text-xl px-3 py-1 rounded-lg hover:bg-eco-surface-2 transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Navigate prev/next */}
            {photos.length > 1 && (() => {
              const idx = photos.findIndex((p) => p.id === selected.id);
              const prev = idx > 0 ? photos[idx - 1] : null;
              const next = idx < photos.length - 1 ? photos[idx + 1] : null;
              return (
                <>
                  {prev && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(prev); }}
                      className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors text-lg"
                    >
                      ‹
                    </button>
                  )}
                  {next && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setSelected(next); }}
                      className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/40 hover:bg-black/60 text-white flex items-center justify-center transition-colors text-lg"
                    >
                      ›
                    </button>
                  )}
                </>
              );
            })()}
          </div>
        </div>
      )}
    </>
  );
}
