"use client";

interface CarbonCreditCalculatorProps {
  totalCO2Avoided: number; // kg
  totalBatches: number;
  monthsActive: number;
}

export function CarbonCreditCalculator({
  totalCO2Avoided,
  totalBatches,
  monthsActive,
}: CarbonCreditCalculatorProps) {
  const tonnes = totalCO2Avoided / 1000;
  const batchesPerMonth = totalBatches / Math.max(monthsActive, 1);
  const annualProjection = (totalCO2Avoided / Math.max(monthsActive, 1)) * 12;
  const annualTonnes = annualProjection / 1000;

  const priceMin = 15; // USD per tonne
  const priceMax = 50;
  const priceMid = 30;

  return (
    <div className="bg-eco-surface border border-eco-green/10 rounded-xl p-5">
      <h3 className="text-[10px] tracking-[2px] text-eco-muted uppercase mb-4">
        Potencial de Créditos de Carbono
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
        {/* Current */}
        <div className="text-center p-4 rounded-xl border border-eco-border">
          <div className="text-[10px] text-eco-muted uppercase tracking-wider mb-2">
            Acumulado actual
          </div>
          <div className="font-mono text-2xl font-bold" style={{ color: "#3d7a0a" }}>
            {tonnes.toFixed(2)}
          </div>
          <div className="text-xs text-eco-muted">toneladas CO₂eq</div>
          <div className="mt-2 font-mono text-sm text-eco-ink font-semibold">
            ${(tonnes * priceMid).toFixed(0)} USD
          </div>
          <div className="text-[9px] text-eco-muted-2">@${priceMid}/t</div>
        </div>

        {/* Annual projection */}
        <div className="text-center p-4 rounded-xl border border-eco-green/15 bg-eco-green/3">
          <div className="text-[10px] text-eco-muted uppercase tracking-wider mb-2">
            Proyección anual
          </div>
          <div className="font-mono text-2xl font-bold" style={{ color: "#3d7a0a" }}>
            {annualTonnes.toFixed(1)}
          </div>
          <div className="text-xs text-eco-muted">toneladas CO₂eq/año</div>
          <div className="mt-2 font-mono text-sm text-eco-ink font-semibold">
            ${(annualTonnes * priceMid).toFixed(0)} USD
          </div>
          <div className="text-[9px] text-eco-muted-2">@${priceMid}/t</div>
        </div>

        {/* Range */}
        <div className="text-center p-4 rounded-xl border border-eco-border">
          <div className="text-[10px] text-eco-muted uppercase tracking-wider mb-2">
            Rango de valor anual
          </div>
          <div className="space-y-1.5 mt-1">
            <div className="flex justify-between text-xs">
              <span className="text-eco-muted">Mínimo (${priceMin}/t)</span>
              <span className="font-mono font-semibold">${(annualTonnes * priceMin).toFixed(0)}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-eco-muted">Medio (${priceMid}/t)</span>
              <span className="font-mono font-semibold" style={{ color: "#3d7a0a" }}>
                ${(annualTonnes * priceMid).toFixed(0)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-eco-muted">Premium (${priceMax}/t)</span>
              <span className="font-mono font-semibold">${(annualTonnes * priceMax).toFixed(0)}</span>
            </div>
          </div>
          <div className="mt-2 h-2 bg-eco-surface-2 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full"
              style={{
                width: "60%",
                background: "linear-gradient(90deg, #b5e951, #3d7a0a)",
              }}
            />
          </div>
        </div>
      </div>

      <div className="text-[10px] text-eco-muted-2 italic border-t border-eco-border pt-3">
        Basado en {batchesPerMonth.toFixed(1)} lotes/mes promedio.
        Precios de referencia: mercado voluntario de carbono (Gold Standard / Verra VCS).
        Se requiere verificación independiente para emisión de créditos.
      </div>
    </div>
  );
}
