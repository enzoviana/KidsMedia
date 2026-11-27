/** Affichage et règles de la fiche RSAI. */

export function distanceLabel(km: unknown): string {
  if (km == null || km === "") return "—";
  const n = Number(km);
  if (!Number.isFinite(n) || n < 0) return "—";
  if (n < 1) return `${Math.round(n * 1000)} m`;
  return `${n.toFixed(1)} km`;
}

export function rsaiLocalisation(r: { region?: string; ville?: string; secteur?: string } | null | undefined): string {
  if (!r) return "Région non renseignée";
  return [r.region, r.ville, r.secteur].filter(Boolean).join(" · ") || "Région non renseignée";
}

/**
 * La note n'est ouverte qu'après une mission effectuée et terminée. Le serveur
 * reste l'autorité finale ; ceci ne fait que masquer le bouton inutile.
 */
export function peutNoterRsai(r: { peutNoter?: boolean; missionsTerminees?: number; missionsTermineesAvecCreche?: number } | null | undefined): boolean {
  if (!r) return false;
  if (typeof r.peutNoter === "boolean") return r.peutNoter;
  if (typeof r.missionsTermineesAvecCreche === "number") return r.missionsTermineesAvecCreche > 0;
  return Number(r.missionsTerminees ?? 0) > 0;
}
