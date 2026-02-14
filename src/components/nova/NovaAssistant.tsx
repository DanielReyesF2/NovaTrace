/**
 * NovaAI Assistant — Floating chat widget for NovaTrace
 * Dark theme (#273949 + #b5e951 lime green) matching KPIs Digo design
 *
 * Features:
 * - SSE streaming (tokens appear in real-time)
 * - Tool execution indicators
 * - Keyboard shortcuts (Ctrl+K / Cmd+K)
 * - No external deps (no framer-motion, no react-markdown)
 */

"use client";

import {
  useState,
  useRef,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useNovaChat } from "@/hooks/useNovaChat";

// EcoNova brand colors
const C = {
  dark: "#273949",
  lime: "#b5e951",
  limeDark: "#9ed43e",
  darkLight: "#344a5c",
  darkLighter: "#3d566a",
} as const;

// Tool name -> friendly label
const TOOL_LABELS: Record<string, string> = {
  query_db: "Consultando base de datos...",
  get_schema: "Obteniendo esquema...",
  calc_kpis: "Calculando KPIs...",
  smart_query: "Consultando datos...",
  get_sales_data: "Obteniendo datos...",
  analyze_data: "Analizando datos...",
  generate_pdf_report: "Generando reporte...",
};

function getToolLabel(tool: string): string {
  return TOOL_LABELS[tool] || `Ejecutando ${tool}...`;
}

// Simple markdown-ish renderer (bold, lists, code, headers)
function renderContent(text: string) {
  const lines = text.split("\n");
  const elements: React.ReactNode[] = [];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    // Headers
    if (line.startsWith("### ")) {
      elements.push(
        <h3
          key={i}
          className="text-sm font-semibold mt-3 mb-1"
          style={{ color: C.lime }}
        >
          {processInline(line.slice(4))}
        </h3>
      );
    } else if (line.startsWith("## ")) {
      elements.push(
        <h2
          key={i}
          className="text-base font-bold mt-3 mb-2"
          style={{ color: C.lime }}
        >
          {processInline(line.slice(3))}
        </h2>
      );
    } else if (line.startsWith("# ")) {
      elements.push(
        <h1
          key={i}
          className="text-lg font-bold mt-4 mb-2"
          style={{ color: C.lime }}
        >
          {processInline(line.slice(2))}
        </h1>
      );
    }
    // Bullet list
    else if (line.match(/^[-*]\s/)) {
      elements.push(
        <div key={i} className="flex items-start gap-2 my-0.5">
          <span style={{ color: C.lime }}>&#x2022;</span>
          <span>{processInline(line.slice(2))}</span>
        </div>
      );
    }
    // Numbered list
    else if (line.match(/^\d+\.\s/)) {
      const match = line.match(/^(\d+)\.\s(.*)$/);
      if (match) {
        elements.push(
          <div key={i} className="flex items-start gap-2 my-0.5">
            <span
              className="font-semibold text-xs min-w-[1.2em] text-right"
              style={{ color: C.lime }}
            >
              {match[1]}.
            </span>
            <span>{processInline(match[2])}</span>
          </div>
        );
      }
    }
    // Horizontal rule
    else if (line.match(/^---+$/)) {
      elements.push(
        <hr key={i} className="my-3" style={{ borderColor: C.darkLighter }} />
      );
    }
    // Empty line
    else if (line.trim() === "") {
      elements.push(<div key={i} className="h-2" />);
    }
    // Regular paragraph
    else {
      elements.push(
        <p key={i} className="my-1 leading-relaxed">
          {processInline(line)}
        </p>
      );
    }
  }

  return elements;
}

// Process inline markdown (bold, code, italic)
function processInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let remaining = text;
  let key = 0;

  while (remaining.length > 0) {
    // Bold **text**
    const boldMatch = remaining.match(/\*\*(.+?)\*\*/);
    // Code `text`
    const codeMatch = remaining.match(/`(.+?)`/);

    // Find earliest match
    let earliest: { type: string; index: number; match: RegExpMatchArray } | null =
      null;

    if (boldMatch && boldMatch.index !== undefined) {
      earliest = { type: "bold", index: boldMatch.index, match: boldMatch };
    }
    if (
      codeMatch &&
      codeMatch.index !== undefined &&
      (!earliest || codeMatch.index < earliest.index)
    ) {
      earliest = { type: "code", index: codeMatch.index, match: codeMatch };
    }

    if (!earliest) {
      parts.push(remaining);
      break;
    }

    // Add text before match
    if (earliest.index > 0) {
      parts.push(remaining.slice(0, earliest.index));
    }

    // Add formatted element
    if (earliest.type === "bold") {
      parts.push(
        <strong key={key++} className="font-semibold" style={{ color: C.lime }}>
          {earliest.match[1]}
        </strong>
      );
      remaining = remaining.slice(
        earliest.index + earliest.match[0].length
      );
    } else if (earliest.type === "code") {
      parts.push(
        <code
          key={key++}
          className="px-1.5 py-0.5 rounded text-xs font-mono"
          style={{ backgroundColor: C.darkLight, color: C.lime }}
        >
          {earliest.match[1]}
        </code>
      );
      remaining = remaining.slice(
        earliest.index + earliest.match[0].length
      );
    }
  }

  return parts.length === 1 ? parts[0] : <>{parts}</>;
}

// ============================================================================
// Icons (inline SVG to avoid lucide-react dependency)
// ============================================================================

function IconX({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function IconArrowUp({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <line x1="12" y1="19" x2="12" y2="5" />
      <polyline points="5 12 12 5 19 12" />
    </svg>
  );
}

function IconRefresh({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10" />
    </svg>
  );
}

function IconWrench({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
    </svg>
  );
}

function IconLoader({ className }: { className?: string }) {
  return (
    <svg
      className={`animate-spin ${className || ""}`}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
    >
      <path d="M21 12a9 9 0 1 1-6.219-8.56" />
    </svg>
  );
}

// ============================================================================
// Component
// ============================================================================

export function NovaAssistant() {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const lastMessageRef = useRef<HTMLDivElement>(null);
  const prevMessagesLengthRef = useRef(0);

  const { messages, sendMessage, isLoading, isStreaming, activeTools, clearMessages } =
    useNovaChat();

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === "Escape" && isOpen) {
        setIsOpen(false);
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen]);

  // Smart scroll
  useEffect(() => {
    const currentLength = messages.length;
    const prevLength = prevMessagesLengthRef.current;

    if (currentLength > prevLength && currentLength > 0) {
      const lastMessage = messages[currentLength - 1];
      if (lastMessage.role === "assistant" && lastMessageRef.current) {
        requestAnimationFrame(() => {
          setTimeout(() => {
            lastMessageRef.current?.scrollIntoView({
              behavior: "smooth",
              block: "start",
            });
          }, 50);
        });
      } else if (lastMessage.role === "user" && scrollRef.current) {
        scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
      }
    }
    prevMessagesLengthRef.current = currentLength;
  }, [messages]);

  // Auto-scroll during streaming
  useEffect(() => {
    if (isStreaming && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [isStreaming, messages]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    e.target.style.height = "auto";
    e.target.style.height = Math.min(e.target.scrollHeight, 150) + "px";
  };

  const handleSubmit = useCallback(
    async (e?: FormEvent) => {
      e?.preventDefault();
      if (!input.trim() || isLoading) return;
      const message = input.trim();
      setInput("");
      if (inputRef.current) inputRef.current.style.height = "auto";
      await sendMessage(message);
    },
    [input, isLoading, sendMessage]
  );

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClear = useCallback(() => {
    clearMessages();
    prevMessagesLengthRef.current = 0;
  }, [clearMessages]);

  return (
    <>
      {/* ======== Floating Button ======== */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-5 right-5 max-sm:bottom-4 max-sm:right-4 z-50 flex items-center gap-2.5 px-5 py-3 max-sm:px-4 max-sm:py-3.5 rounded-full text-sm font-medium transition-all hover:scale-[1.03] active:scale-[0.97]"
          style={{
            backgroundColor: C.dark,
            color: "#ffffff",
            boxShadow: `0 4px 20px ${C.dark}50`,
            animation: "nova-fadein 0.2s ease-out",
          }}
        >
          <div
            className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold"
            style={{ backgroundColor: C.lime, color: C.dark }}
          >
            N
          </div>
          <span>NovaAI</span>
          <kbd
            className="ml-1 px-1.5 py-0.5 text-[10px] font-mono rounded hidden sm:inline"
            style={{ backgroundColor: C.darkLight, color: "rgba(255,255,255,0.7)" }}
          >
            {"\u2318"}K
          </kbd>
        </button>
      )}

      {/* ======== Modal ======== */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 flex items-start max-sm:items-stretch justify-center pt-[8vh] max-sm:pt-0 px-4 max-sm:px-0"
          style={{
            backgroundColor: "rgba(0, 0, 0, 0.5)",
            backdropFilter: "blur(8px)",
            animation: "nova-fadein 0.15s ease-out",
          }}
          onClick={() => setIsOpen(false)}
        >
          <div
            className="w-full max-w-[580px] flex flex-col overflow-hidden relative max-sm:max-w-none max-sm:h-[100dvh] max-sm:max-h-[100dvh] max-sm:rounded-none max-sm:fixed max-sm:inset-0 max-sm:z-50"
            style={{
              backgroundColor: C.dark,
              borderRadius: "20px",
              boxShadow: "0 25px 60px -12px rgba(0, 0, 0, 0.5)",
              maxHeight: "75vh",
              animation: "nova-slidedown 0.2s ease-out",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-5 py-4 max-sm:px-4"
              style={{ borderBottom: `1px solid ${C.darkLight}` }}
            >
              <div className="flex items-center gap-3">
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center text-sm font-bold"
                  style={{ backgroundColor: C.lime, color: C.dark }}
                >
                  N
                </div>
                <div>
                  <span className="font-semibold text-white text-sm">
                    NovaAI
                  </span>
                  <div className="flex items-center gap-1.5 mt-0.5">
                    <div
                      className="w-1.5 h-1.5 rounded-full animate-pulse"
                      style={{ backgroundColor: C.lime }}
                    />
                    <span
                      className="text-[11px]"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      Online
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                {messages.length > 0 && (
                  <button
                    onClick={handleClear}
                    className="p-2 max-sm:p-3 rounded-lg transition-colors"
                    style={{ color: "rgba(255,255,255,0.5)" }}
                    title="Nueva conversacion"
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = C.darkLight;
                      e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = "transparent";
                      e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                    }}
                  >
                    <IconRefresh className="h-4 w-4" />
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 max-sm:p-3 rounded-lg transition-colors"
                  style={{ color: "rgba(255,255,255,0.5)" }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = C.darkLight;
                    e.currentTarget.style.color = "rgba(255,255,255,0.8)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = "transparent";
                    e.currentTarget.style.color = "rgba(255,255,255,0.5)";
                  }}
                >
                  <IconX className="h-4 w-4" />
                </button>
              </div>
            </div>

            {/* Content */}
            <div
              ref={scrollRef}
              className="flex-1 overflow-y-auto overscroll-contain max-sm:min-h-0"
              style={{ minHeight: "250px", maxHeight: "calc(75vh - 160px)" }}
            >
              {messages.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center px-8 py-16">
                  <h2 className="text-2xl font-bold text-white mb-3">
                    Hola, EcoNova!
                  </h2>
                  <p
                    className="text-sm leading-relaxed max-w-xs"
                    style={{ color: "rgba(255,255,255,0.6)" }}
                  >
                    Soy{" "}
                    <span className="font-semibold" style={{ color: C.lime }}>
                      NovaAI
                    </span>
                    , tu asistente inteligente. Puedo ayudarte con analisis de
                    lotes, rendimiento de pirolisis, regulaciones ambientales y
                    mas.
                  </p>
                  <p
                    className="text-xs mt-3"
                    style={{ color: "rgba(255,255,255,0.35)" }}
                  >
                    Preguntame lo que necesites
                  </p>
                </div>
              ) : (
                <div className="p-5 space-y-5">
                  {messages.map((message, index) => {
                    const isLastAssistant =
                      message.role === "assistant" &&
                      index === messages.length - 1;
                    const isUser = message.role === "user";

                    return (
                      <div
                        key={message.id}
                        ref={isLastAssistant ? lastMessageRef : undefined}
                        className={isUser ? "flex justify-end" : ""}
                        style={{ animation: "nova-fadein 0.15s ease-out" }}
                      >
                        {isUser ? (
                          <div className="max-w-[85%]">
                            <div
                              className="px-4 py-3 rounded-2xl rounded-br-md text-sm"
                              style={{
                                backgroundColor: C.lime,
                                color: C.dark,
                              }}
                            >
                              {message.content}
                            </div>
                          </div>
                        ) : (
                          <div
                            className="text-sm leading-relaxed"
                            style={{ color: "rgba(255,255,255,0.9)" }}
                          >
                            {renderContent(message.content)}
                            {/* Streaming cursor */}
                            {isLastAssistant && isStreaming && (
                              <span
                                className="inline-block w-2 h-4 ml-0.5 animate-pulse rounded-sm"
                                style={{ backgroundColor: C.lime }}
                              />
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}

                  {/* Tool execution indicators */}
                  {activeTools.length > 0 && (
                    <div
                      className="flex items-center gap-2 px-3 py-2 rounded-lg"
                      style={{ backgroundColor: C.darkLight }}
                    >
                      <IconWrench className="h-3.5 w-3.5 animate-spin" />
                      <span
                        className="text-xs"
                        style={{ color: "rgba(255,255,255,0.7)" }}
                      >
                        {getToolLabel(activeTools[activeTools.length - 1])}
                      </span>
                    </div>
                  )}

                  {/* Loading */}
                  {isLoading && !isStreaming && activeTools.length === 0 && (
                    <div
                      className="flex items-center gap-2"
                      style={{ color: "rgba(255,255,255,0.5)" }}
                    >
                      <IconLoader className="h-4 w-4" />
                      <span className="text-sm">Pensando...</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Input */}
            <div
              className="p-4 max-sm:pb-[max(1rem,env(safe-area-inset-bottom))]"
              style={{ borderTop: `1px solid ${C.darkLight}` }}
            >
              <form onSubmit={handleSubmit} className="relative">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={handleTextareaChange}
                  onKeyDown={handleKeyDown}
                  placeholder="Escribe tu pregunta..."
                  rows={1}
                  disabled={isLoading}
                  className="w-full resize-none rounded-xl px-4 py-3 pr-14 text-sm max-sm:text-base focus:outline-none transition-all"
                  style={{
                    backgroundColor: C.darkLight,
                    border: `1px solid ${C.darkLighter}`,
                    color: "#ffffff",
                  }}
                  onFocus={(e) =>
                    (e.currentTarget.style.borderColor = C.lime)
                  }
                  onBlur={(e) =>
                    (e.currentTarget.style.borderColor = C.darkLighter)
                  }
                />
                {/* Send button */}
                <button
                  type="submit"
                  disabled={!input.trim() || isLoading}
                  className="absolute right-2 bottom-2 p-2.5 max-sm:p-3 rounded-lg transition-all disabled:opacity-30 disabled:cursor-not-allowed"
                  style={{
                    backgroundColor: C.lime,
                    color: C.dark,
                  }}
                >
                  <IconArrowUp className="h-4 w-4" />
                </button>
              </form>
              {/* Keyboard shortcuts - hidden on mobile */}
              <div
                className="hidden sm:flex items-center justify-center gap-4 mt-3 text-[11px]"
                style={{ color: "rgba(255,255,255,0.4)" }}
              >
                <span className="flex items-center gap-1.5">
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{ backgroundColor: C.darkLight }}
                  >
                    {"\u21b5"}
                  </kbd>
                  enviar
                </span>
                <span style={{ color: "rgba(255,255,255,0.2)" }}>
                  &middot;
                </span>
                <span className="flex items-center gap-1.5">
                  <kbd
                    className="px-1.5 py-0.5 rounded text-[10px] font-mono"
                    style={{ backgroundColor: C.darkLight }}
                  >
                    esc
                  </kbd>
                  cerrar
                </span>
              </div>
            </div>
          </div>
        </div>
      )}

    </>
  );
}
