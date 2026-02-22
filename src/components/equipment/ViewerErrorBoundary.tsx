"use client";

import React from "react";

interface State {
  hasError: boolean;
  error: Error | null;
}

export class ViewerErrorBoundary extends React.Component<
  { children: React.ReactNode },
  State
> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error("[Digital Twin] Render error:", error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex h-full w-full items-center justify-center bg-eco-navy">
          <div className="text-center max-w-sm px-6">
            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-eco-red/10">
              <svg
                className="h-8 w-8 text-eco-red"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
                />
              </svg>
            </div>
            <h3 className="text-sm font-semibold text-white/80 mb-1">
              Error en viewer 3D
            </h3>
            <p className="text-[10px] text-white/40 mb-4">
              {this.state.error?.message || "No se pudo renderizar la escena 3D"}
            </p>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="text-[11px] font-medium text-eco-green hover:text-eco-green/80 bg-eco-green/10 px-4 py-2 rounded-lg transition-colors"
            >
              Reintentar
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
