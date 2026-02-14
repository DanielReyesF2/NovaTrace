export const EVENT_TYPE_CONFIG: Record<
  string,
  { label: string; color: string; bg: string; icon: string }
> = {
  PHASE_CHANGE: {
    label: "Cambio de Fase",
    color: "#3d7a0a",
    bg: "rgba(181,233,81,0.15)",
    icon: "\u25B6",
  },
  INCIDENT: {
    label: "Incidente",
    color: "#DC2626",
    bg: "rgba(220,38,38,0.08)",
    icon: "\u26A0",
  },
  VALVE_CHANGE: {
    label: "Valvula",
    color: "#E8700A",
    bg: "rgba(232,112,10,0.1)",
    icon: "\u25C8",
  },
  EQUIPMENT_TOGGLE: {
    label: "Equipo",
    color: "#2D8CF0",
    bg: "rgba(45,140,240,0.1)",
    icon: "\u2699",
  },
  FUEL_ADD: {
    label: "Combustible",
    color: "#7C5CFC",
    bg: "rgba(124,92,252,0.1)",
    icon: "+",
  },
  OBSERVATION: {
    label: "Observacion",
    color: "rgba(39,57,73,0.5)",
    bg: "rgba(39,57,73,0.06)",
    icon: "\u25CB",
  },
};
