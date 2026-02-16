// State → Feedstock origin mapping
export const STATE_ORIGINS: Record<string, string> = {
  "Michoacán, MX": "Michoacán",
  "Jalisco, MX": "Jalisco",
  "Guanajuato, MX": "Guanajuato",
  "Edo. México, MX": "México",
  "Puebla, MX": "Puebla",
};

// Real geographic coordinates [longitude, latitude]
export const STATE_COORDS: Record<string, [number, number]> = {
  "Michoacán": [-101.7, 19.2],
  "Jalisco": [-103.3, 20.7],
  "Guanajuato": [-101.0, 21.0],
  "México": [-99.6, 19.3],
  "Puebla": [-98.2, 19.0],
};

// EcoNova plant location (Michoacán)
export const PLANT_COORDS: [number, number] = [-101.2, 19.4];

// Active state names (for highlighting)
export const ACTIVE_STATE_NAMES = new Set([
  "Michoacán",
  "Jalisco",
  "Guanajuato",
  "México",
  "Puebla",
]);
