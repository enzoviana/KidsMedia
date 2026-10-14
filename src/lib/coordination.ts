import { useEffect, useSyncExternalStore } from "react";
import type { RoleKey } from "./api";
import { getSession } from "./api";
import { send } from "./mutate";
import type { RouteSpec } from "./specs";

export const rsaChoices = [{ _id: "r1", nom: "Nadia Roux" }, { _id: "r2", nom: "Thomas Blanc" }];
export const etabChoices = [{ _id: "demo-soleil", nom: "Les Petits Soleils" }, { _id: "demo-lune", nom: "La Lune Bleue" }];
export const demoDocuments = [
  { _id: "doc-1", type: "Carnet de vaccination", nom: "Carnet-vaccination.pdf", enfant: { _id: "demo-noah", prenom: "Noah", nom: "Bernard" }, statut: "valide", dateValidite: "2026-10-20", createdAt: "2026-09-20" },
  { _id: "doc-2", type: "Ordonnance", nom: "Ordonnance-Lea.pdf", enfant: { _id: "demo-lea", prenom: "Léa", nom: "Martin" }, statut: "valide", dateValidite: "2026-10-05", createdAt: "2026-09-01" },
];
export function documentEtat(doc: { dateValidite?: string; statut?: string }, now = new Date()) {
  if (doc.statut === "rejete") return "rejete";
  if (!doc.dateValidite) return "valide";
  const end = new Date(`${doc.dateValidite.slice(0, 10)}T23:59:59`);
  if (!Number.isFinite(+end)) return "valide";
  const days = (+end - +now) / 86400000;
  return days < 0 ? "expire" : days <= 30 ? "expiration_proche" : "valide";
}
export function canReadNote(role: RoleKey, visibility: string) {
  return visibility === "publique" || ["creche", "rsai", "medecin", "admin", "dev"].includes(role);
}
export function validRating(note: number) { return Number.isInteger(note) && note >= 1 && note <= 5; }
export function validSchedule(debut: string, fin: string, jours: number[]) {
  return /^([01]\d|2[0-3]):[0-5]\d$/.test(debut) && /^([01]\d|2[0-3]):[0-5]\d$/.test(fin) && debut < fin && jours.length > 0 && jours.every((j) => Number.isInteger(j) && j >= 0 && j <= 6);
}
/** Absent endpoints are deliberately simulated, never sent to an unrelated real route. */
export async function writeSpec(spec: RouteSpec, body?: unknown, vars?: Record<string, string | undefined>) {
  if (spec.method === "GET") throw new Error("Une lecture ne peut pas être utilisée comme écriture.");
  if (/\s/.test(spec.path)) {
    await new Promise((r) => setTimeout(r, 250));
    return { demo: true, data: body, reason: "Exigence décrite en texte, pas une URL appelable" };
  }
  try {
    return await send<any>(spec.method, spec.path, body, vars);
  } catch (e) {
    return { demo: true, data: body, reason: `Erreur API sur ${spec.method} ${spec.path} : ${(e as Error).message}` };
  }
}

type Store = { documents: any[]; notes: any[]; echanges: any[]; avis: any[]; affectations: any[]; demandes: any[] };
const initial: Store = {
  documents: [],
  notes: [
    { _id: "note-1", enfantId: "demo-lea", contenu: "Léa a bien mangé et participé aux activités.", visibilite: "publique", auteurNom: "Les Petits Soleils", auteurRole: "creche", createdAt: "2026-10-08" },
    { _id: "note-2", enfantId: "demo-lea", contenu: "Toux persistante observée ce matin ; avis médical demandé.", visibilite: "medicale", auteurNom: "Les Petits Soleils", auteurRole: "creche", createdAt: "2026-10-08" },
  ],
  echanges: [{ _id: "ech-1", enfantId: "demo-lea", action: "demande", type: "Carnet de vaccination", destinataire: "parent", expediteurRole: "medecin", message: "Merci de transmettre le carnet à jour.", statut: "en_attente", createdAt: "2026-10-08" }],
  avis: [{ _id: "avis-1", cibleType: "rsai", cibleId: "r1", cibleNom: "Nadia Roux", auteurNom: "Les Petits Soleils", auteurRole: "creche", note: 5, commentaire: "Accompagnement attentif et disponible.", createdAt: "2026-10-01" }],
  affectations: [{ _id: "aff-1", rsai: rsaChoices[0], etablissement: etabChoices[0], jours: [1, 2, 3, 4, 5], debut: "08:00", fin: "18:00", dateDebut: "2026-09-01", statut: "active" }],
  demandes: [{ _id: "dem-1", etablissement: etabChoices[1], motif: "Accompagnement pour un nouveau PAI", dateSouhaitee: "2026-10-15", statut: "en_attente" }],
};
let state = initial;
let owner: string | undefined;
const listeners = new Set<() => void>();
export function updateCoordination(key: keyof Store, update: (rows: any[]) => any[]) {
  const session = getSession();
  const nextOwner = session?.demo ? "demo" : session?.user._id;
  if (owner !== nextOwner) { state = initial; owner = nextOwner; }
  state = { ...state, [key]: update(state[key]) };
  listeners.forEach((fn) => fn());
}
export function useCoordination() {
  useEffect(() => {
    const session = getSession();
    const nextOwner = session?.demo ? "demo" : session?.user._id ?? session?.user.id;
    if (owner !== nextOwner) { state = initial; owner = nextOwner; listeners.forEach((fn) => fn()); }
  }, []);
  return useSyncExternalStore((fn) => { listeners.add(fn); return () => { listeners.delete(fn); }; }, () => state, () => initial);
}
export const localId = () => `demo-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;