/** Affichage et règles de la fiche RSAI. */

/** Code du département, sans adresse exacte (code postal ou champ dédié). */
export function departementLabel(r: { departement?: string; codePostal?: string } | null | undefined): string {
  if (!r) return "—";
  const explicite = String(r.departement ?? "").trim();
  if (explicite) return explicite;
  const cp = String(r.codePostal ?? "").replace(/\s/g, "");
  if (!cp) return "—";
  if (/^97[1-6]/.test(cp)) return cp.slice(0, 3);
  return cp.slice(0, 2);
}

/** Localisation publique d'une RSAI : uniquement le département (jamais l'adresse exacte). */
export function rsaiLocalisation(r: { departement?: string; codePostal?: string } | null | undefined): string {
  const dep = departementLabel(r);
  return dep !== "—" ? `Département ${dep}` : "Département non renseigné";
}

/** Vrai si au moins une affectation active couvre la date du jour. */
export function missionEnCours(affectations: unknown): boolean {
  if (!Array.isArray(affectations)) return false;
  const now = Date.now();
  return affectations.some((a: any) => {
    const statut = String(a?.statut ?? "").toLowerCase();
    if (!["active", "en_cours", "en cours"].includes(statut) || a?.terminee) return false;
    const debut = a?.dateDebut ? new Date(a.dateDebut).getTime() : NaN;
    const fin = a?.dateFin ? new Date(a.dateFin).getTime() : NaN;
    if (Number.isFinite(debut) && debut > now) return false;
    if (Number.isFinite(fin) && fin < now) return false;
    return true;
  });
}

/**
 * Disponibilité calculée : `true` si aucune mission n'est en cours, `false` si
 * une mission est active, `null` si l'information n'est pas encore disponible.
 */
export function estDisponible(r: { missionEnCours?: boolean; affectations?: unknown } | null | undefined): boolean | null {
  if (!r) return null;
  if (typeof r.missionEnCours === "boolean") return !r.missionEnCours;
  if (Array.isArray(r.affectations)) return !missionEnCours(r.affectations);
  return null;
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
