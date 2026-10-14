export const demoEnfants: any[] = [
  { _id: "demo-lea", prenom: "Léa", nom: "Martin", dateNaissance: "2024-03-12", sexe: "F", section: "Bébés", groupeSanguin: "A+", allergies: ["Arachide"], antecedents: ["Bronchiolite (2025)"], pai: true, codeLiaison: "LEA-4821", parents: [{ prenom: "Claire", nom: "Martin", tel: "06 11 22 33 44", email: "claire.martin@exemple.fr" }] },
  { _id: "demo-noah", prenom: "Noah", nom: "Bernard", dateNaissance: "2023-07-02", sexe: "M", section: "Moyens", groupeSanguin: "O+", allergies: [], antecedents: [], pai: false, codeLiaison: "NOA-1937", parents: [{ prenom: "Julien", nom: "Bernard", tel: "06 22 33 44 55" }] },
  { _id: "demo-jade", prenom: "Jade", nom: "Petit", dateNaissance: "2022-11-20", sexe: "F", section: "Grands", groupeSanguin: "B+", allergies: ["Lactose"], antecedents: ["Otites"], pai: true, codeLiaison: "JAD-5502", parents: [{ prenom: "Sarah", nom: "Petit", tel: "06 33 44 55 66" }] },
  { _id: "demo-lucas", prenom: "Lucas", nom: "Durand", dateNaissance: "2023-01-15", sexe: "M", section: "Moyens", groupeSanguin: "A-", allergies: [], antecedents: [], pai: false, codeLiaison: "LUC-7710", parents: [{ prenom: "Marie", nom: "Durand", email: "marie.durand@exemple.fr" }] },
];

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Identifiant d'enfant à partir d'un objet/ID ; en démo, déduit du prénom. */
export function enfantIdOf(e: any): string | null {
  if (!e) return null;
  if (typeof e === "string") return /^[a-f0-9]{24}$|^demo-/.test(e) ? e : null;
  const id = e._id ?? e.id;
  if (id) return String(id);
  if (e.prenom) return `demo-${norm(String(e.prenom))}`;
  return null;
}

export function demoEnfant(id: string) {
  return demoEnfants.find((e) => e._id === id) ?? { ...demoEnfants[0], _id: id, prenom: id.replace(/^demo-/, "").replace(/^./, (c) => c.toUpperCase()), nom: "", codeLiaison: `${id.slice(5, 8).toUpperCase() || "ENF"}-0000` };
}

export const docsInscription = ["Certificat médical d'aptitude", "Carnet de vaccination", "Justificatif de domicile", "Attestation CAF", "Autorisation de soins", "PAI signé (si allergie)"];
