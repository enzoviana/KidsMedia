/** Filtres annuels des affectations RSAI : année, statut calculé et recherche texte. */
export const STATUTS: [string, string][] = [["toutes", "Tous statuts"], ["active", "Actives"], ["en_attente", "En attente"], ["a_venir", "À venir"], ["terminee", "Terminées"], ["revoquee", "Révoquées"]];

export function statutAffectation(a: any, now = new Date()): string {
  if (a?.statut === "revoquee" || a?.statut === "en_attente") return a.statut;
  const today = now.toISOString().slice(0, 10);
  const deb = String(a?.dateDebut ?? "").slice(0, 10), fin = a?.dateFin ? String(a.dateFin).slice(0, 10) : null;
  if (deb && deb > today) return "a_venir";
  if (fin && fin < today) return "terminee";
  return "active";
}

/** Garde les affectations qui chevauchent l'année demandée. */
export function filterAffectations(rows: any[], annee: number, statut: string, q: string, now = new Date()): any[] {
  const n = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const start = `${annee}-01-01`, end = `${annee}-12-31`;
  return rows.filter((a) => {
    const deb = String(a?.dateDebut ?? "").slice(0, 10), fin = a?.dateFin ? String(a.dateFin).slice(0, 10) : null;
    if (deb && deb > end) return false;
    if (fin && fin < start) return false;
    if (statut !== "toutes" && statutAffectation(a, now) !== statut) return false;
    if (q && !n(`${a?.rsai?.nom ?? ""} ${a?.rsai?.prenom ?? ""} ${a?.etablissement?.nom ?? a?.creche?.nom ?? ""}`).includes(n(q))) return false;
    return true;
  });
}
