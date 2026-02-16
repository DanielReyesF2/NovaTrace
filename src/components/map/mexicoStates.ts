// Simplified SVG paths for 5 active Mexican states + country outline
// Centroids are approximate viewport coordinates (600x500 viewBox)

export interface StateData {
  id: string;
  name: string;
  path: string;
  centroid: [number, number]; // [x, y] in viewBox coords
}

// Simplified outlines (not geographically precise, but recognizable)
export const MEXICO_OUTLINE =
  "M50,200 L80,180 L100,160 L130,140 L160,130 L190,120 L220,115 L250,105 L280,100 L310,95 L340,100 L370,120 L400,140 L420,155 L440,160 L460,165 L480,180 L500,200 L520,220 L540,240 L550,260 L540,280 L520,300 L490,310 L460,305 L430,300 L400,310 L380,320 L360,340 L340,350 L320,345 L300,330 L280,320 L260,330 L240,340 L220,335 L200,320 L180,310 L160,300 L140,290 L120,275 L100,260 L80,245 L60,230 Z";

export const ACTIVE_STATES: StateData[] = [
  {
    id: "michoacan",
    name: "Michoacán",
    path: "M220,270 L240,260 L260,255 L275,260 L280,275 L275,290 L260,300 L240,305 L225,295 L220,280 Z",
    centroid: [250, 278],
  },
  {
    id: "jalisco",
    name: "Jalisco",
    path: "M190,230 L210,220 L230,215 L250,220 L255,235 L250,250 L240,260 L220,265 L205,260 L195,250 L190,240 Z",
    centroid: [222, 240],
  },
  {
    id: "guanajuato",
    name: "Guanajuato",
    path: "M260,230 L280,225 L295,230 L300,245 L295,255 L280,260 L265,255 L258,245 Z",
    centroid: [278, 243],
  },
  {
    id: "edomex",
    name: "Edo. México",
    path: "M295,265 L310,260 L320,265 L325,278 L320,288 L310,292 L298,288 L293,278 Z",
    centroid: [309, 276],
  },
  {
    id: "puebla",
    name: "Puebla",
    path: "M325,268 L342,262 L355,268 L358,282 L352,295 L340,300 L328,295 L322,282 Z",
    centroid: [340, 280],
  },
];

// Plant location (Michoacán)
export const PLANT_LOCATION: [number, number] = [248, 280];

// State → Feedstock origin mapping
export const STATE_ORIGINS: Record<string, string> = {
  "Michoacán, MX": "michoacan",
  "Jalisco, MX": "jalisco",
  "Guanajuato, MX": "guanajuato",
  "Edo. México, MX": "edomex",
  "Puebla, MX": "puebla",
};
