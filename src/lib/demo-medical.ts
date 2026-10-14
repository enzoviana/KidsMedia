// Données et règles de démonstration pour les modules du cahier des charges.

export const vaccinsObligatoires = [
  { nom: "Diphtérie-Tétanos-Polio (DTP)", doses: ["2 mois", "4 mois", "11 mois"] },
  { nom: "Coqueluche", doses: ["2 mois", "4 mois", "11 mois"] },
  { nom: "Haemophilus influenzae b (Hib)", doses: ["2 mois", "4 mois", "11 mois"] },
  { nom: "Hépatite B", doses: ["2 mois", "4 mois", "11 mois"] },
  { nom: "Pneumocoque", doses: ["2 mois", "4 mois", "11 mois"] },
  { nom: "Méningocoque C", doses: ["5 mois", "12 mois"] },
  { nom: "Rougeole-Oreillons-Rubéole (ROR)", doses: ["12 mois", "16-18 mois"] },
];

export const demoVaccins = [
  { nom: "Diphtérie-Tétanos-Polio (DTP)", dose: 1, date: "2024-05-12", medecin: { prenom: "Dr Paul", nom: "Moreau" }, lot: "A12B" },
  { nom: "Diphtérie-Tétanos-Polio (DTP)", dose: 2, date: "2024-07-12", medecin: { prenom: "Dr Paul", nom: "Moreau" }, lot: "A19C" },
  { nom: "Coqueluche", dose: 2, date: "2024-07-12", medecin: { prenom: "Dr Paul", nom: "Moreau" } },
  { nom: "Hépatite B", dose: 2, date: "2024-07-12", medecin: { prenom: "Dr Paul", nom: "Moreau" } },
  { nom: "Pneumocoque", dose: 2, date: "2024-07-12", medecin: { prenom: "Dr Paul", nom: "Moreau" } },
  { nom: "Méningocoque C", dose: 1, date: "2024-08-14", medecin: { prenom: "Dr Sarah", nom: "Leroy" } },
  { nom: "Rougeole-Oreillons-Rubéole (ROR)", dose: 1, date: "2025-03-15", medecin: { prenom: "Dr Paul", nom: "Moreau" }, rappel: new Date(Date.now() + 20 * 864e5).toISOString() },
];

export const consentTypes = [
  { type: "soins_urgence", label: "Soins d'urgence et administration de médicaments" },
  { type: "partage_rsai", label: "Partage du dossier avec le RSAI de la crèche" },
  { type: "donnees_sante", label: "Traitement des données de santé (RGPD)" },
  { type: "transport", label: "Transport médicalisé en cas d'urgence" },
  { type: "droit_image", label: "Droit à l'image (photos d'activités)" },
];

export const demoConsentements = [
  { type: "soins_urgence", accorde: true, signePar: { prenom: "Claire", nom: "Martin" }, date: "2026-09-01" },
  { type: "partage_rsai", accorde: true, signePar: { prenom: "Claire", nom: "Martin" }, date: "2026-09-01" },
  { type: "donnees_sante", accorde: true, signePar: { prenom: "Claire", nom: "Martin" }, date: "2026-09-01" },
  { type: "droit_image", accorde: false, signePar: { prenom: "Claire", nom: "Martin" }, date: "2026-09-01" },
];

export const symptomesCatalogue: { cat: string; items: { id: string; label: string }[] }[] = [
  { cat: "Général", items: [{ id: "fievre", label: "Fièvre" }, { id: "fatigue", label: "Fatigue / somnolence" }, { id: "pleurs", label: "Pleurs inhabituels" }, { id: "perte_appetit", label: "Perte d'appétit" }] },
  { cat: "Respiration", items: [{ id: "toux", label: "Toux" }, { id: "nez", label: "Nez qui coule" }, { id: "sifflement", label: "Respiration sifflante" }, { id: "difficulte_respirer", label: "Difficulté à respirer" }] },
  { cat: "Peau", items: [{ id: "eruption", label: "Éruption / boutons" }, { id: "rougeur", label: "Rougeurs" }, { id: "gonflement", label: "Gonflement du visage" }] },
  { cat: "Digestif", items: [{ id: "vomissements", label: "Vomissements" }, { id: "diarrhee", label: "Diarrhée" }, { id: "douleur_ventre", label: "Douleur au ventre" }] },
  { cat: "Autres", items: [{ id: "oreille", label: "Douleur à l'oreille" }, { id: "gorge", label: "Gorge rouge" }, { id: "convulsions", label: "Convulsions" }] },
];

export type Risque = "faible" | "moyen" | "eleve";
export interface AnalyseIA {
  diagnostics: { nom: string; confiance: number }[];
  diagnostic_suggere: string;
  niveau_confiance: number;
  niveau_risque: Risque;
  orientation: "surveillance" | "consultation_24h" | "urgence_15";
  conseils: string[];
  symptoms_detectes: string[];
}

/** Moteur de démonstration (règles simples) en attendant POST /diagnostics/analyser. */
export function analyseDemo(symptomes: string[], temperature?: number, ageMois?: number, photo?: boolean): AnalyseIA {
  const has = (s: string) => symptomes.includes(s);
  const fievre = has("fievre") || (temperature ?? 0) >= 38;
  const d: { nom: string; confiance: number }[] = [];
  if (has("toux") && (has("sifflement") || has("difficulte_respirer"))) d.push({ nom: "Bronchiolite", confiance: 87.5 });
  if (has("toux") || has("nez")) d.push({ nom: "Rhinopharyngite", confiance: fievre ? 78 : 70 });
  if (has("eruption") && fievre) d.push({ nom: "Varicelle", confiance: photo ? 81 : 64 });
  if (has("eruption") && !fievre) d.push({ nom: "Eczéma / irritation cutanée", confiance: 58 });
  if (has("vomissements") || has("diarrhee")) d.push({ nom: "Gastro-entérite", confiance: 76 });
  if (has("oreille")) d.push({ nom: "Otite moyenne aiguë", confiance: 72 });
  if (has("gorge")) d.push({ nom: "Angine", confiance: 66 });
  if (has("gonflement")) d.push({ nom: "Réaction allergique", confiance: 74 });
  if (!d.length) d.push({ nom: fievre ? "Syndrome viral" : "Pas de pathologie évidente", confiance: 50 });
  d.sort((a, b) => b.confiance - a.confiance);

  const urgence = has("difficulte_respirer") || has("convulsions") || has("gonflement") || (temperature ?? 0) >= 40 || (fievre && (ageMois ?? 99) < 3);
  const moyen = !urgence && (fievre || has("sifflement") || has("vomissements") || has("oreille"));
  const niveau_risque: Risque = urgence ? "eleve" : moyen ? "moyen" : "faible";
  const conseils = urgence
    ? ["Appeler le 15 (SAMU) immédiatement.", "Ne pas laisser l'enfant seul, le garder en position confortable.", "Prévenir les parents."]
    : moyen
      ? ["Consulter un médecin dans les 24 h.", "Surveiller la température toutes les 2 h.", "Bien hydrater l'enfant."]
      : ["Surveillance simple.", "Noter l'évolution dans les transmissions.", "Reconsulter si les symptômes s'aggravent."];
  return {
    diagnostics: d.slice(0, 3),
    diagnostic_suggere: d[0]!.nom,
    niveau_confiance: d[0]!.confiance,
    niveau_risque,
    orientation: urgence ? "urgence_15" : moyen ? "consultation_24h" : "surveillance",
    conseils,
    symptoms_detectes: symptomes,
  };
}

export interface Plage { role: string; jours: number[]; debut: string; fin: string; actif: boolean }
export const demoPlages: Plage[] = [
  { role: "creche", jours: [1, 2, 3, 4, 5], debut: "07:00", fin: "19:00", actif: true },
  { role: "rsai", jours: [1, 2, 3, 4, 5], debut: "08:00", fin: "18:00", actif: true },
  { role: "medecin", jours: [1, 2, 3, 4, 5, 6], debut: "07:00", fin: "21:00", actif: false },
];
export const demoGeofences = [
  { etablissementId: "demo-soleil", nom: "Les Petits Soleils", lat: 48.8566, lng: 2.3522, rayonM: 150, roles: ["rsai"] },
];

/** Vrai si l'heure (HH:mm) et le jour (0=dim) tombent dans la plage. */
export function dansPlage(p: Plage, date: Date): boolean {
  if (!p.actif) return true;
  const hm = date.toTimeString().slice(0, 5);
  return p.jours.includes(date.getDay()) && hm >= p.debut && hm <= p.fin;
}

/** Distance en mètres entre deux points GPS. */
export function distanceM(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371000, r = Math.PI / 180;
  const dLat = (b.lat - a.lat) * r, dLng = (b.lng - a.lng) * r;
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * r) * Math.cos(b.lat * r) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function deviceName(ua = typeof navigator !== "undefined" ? navigator.userAgent : "") {
  if (/iPhone/.test(ua)) return "iPhone";
  if (/iPad/.test(ua)) return "iPad";
  const m = ua.match(/Android [\d.]+; ([^;)]+)/);
  if (m) return m[1]!.trim();
  const b = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "Navigateur";
  const os = /Windows/.test(ua) ? "Windows" : /Mac OS/.test(ua) ? "macOS" : /Linux/.test(ua) ? "Linux" : "";
  return `${b}${os ? " " + os : ""}`;
}

export interface Affectation {
  etablissement: { _id: string; nom: string; adresse?: string; lat: number; lng: number; rayonM: number };
  horaires: { jour: number; debut: string; fin: string }[];
  enfants?: number;
}
export const demoAffectations: Affectation[] = [
  { etablissement: { _id: "demo-soleil", nom: "Les Petits Soleils", adresse: "12 rue des Lilas, Paris 11e", lat: 48.8566, lng: 2.3522, rayonM: 150 }, enfants: 42,
    horaires: [{ jour: 1, debut: "08:00", fin: "12:00" }, { jour: 3, debut: "08:00", fin: "17:00" }, { jour: 4, debut: "08:00", fin: "18:00" }] },
  { etablissement: { _id: "demo-lune", nom: "La Lune Bleue", adresse: "5 av. Jean Jaurès, Paris 19e", lat: 48.8846, lng: 2.3795, rayonM: 150 }, enfants: 28,
    horaires: [{ jour: 2, debut: "09:00", fin: "17:00" }, { jour: 5, debut: "09:00", fin: "13:00" }] },
];

/** Une RSAI peut ouvrir les dossiers d'une crèche seulement si elle y est affectée, dans ses horaires et sur place. */
export function accesRsai(a: Affectation, date: Date, pos: { lat: number; lng: number } | null): { ok: boolean; motif?: "hors_plage" | "hors_zone"; distance?: number } {
  const hm = date.toTimeString().slice(0, 5);
  const dansHoraire = (a.horaires ?? []).some((h) => h.jour === date.getDay() && hm >= h.debut && hm <= h.fin);
  if (!dansHoraire) return { ok: false, motif: "hors_plage" };
  if (!pos) return { ok: false, motif: "hors_zone" };
  const d = distanceM(pos, a.etablissement);
  return d <= a.etablissement.rayonM ? { ok: true, distance: d } : { ok: false, motif: "hors_zone", distance: d };
}
