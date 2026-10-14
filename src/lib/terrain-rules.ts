export const ABSENCE_MOTIFS = ["Maladie / fièvre", "Rendez-vous médical", "Convenance personnelle", "Autre"] as const;
/** Plage acceptée par le serveur. */
export const validTemperature = (t: number) => Number.isFinite(t) && t >= 34 && t <= 43;
/** Seuil d'alerte fièvre envoyée aux parents et à la crèche. */
export const feverAlert = (t: number) => t >= 38.5;
