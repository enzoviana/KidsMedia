/** Données de démonstration de l'application mobile (/app). Jamais persistées côté serveur. */
const now = Date.now();
const h = (n: number) => new Date(now - n * 3600_000).toISOString();

export const mEnfants: any[] = [
  {
    id: "lucas", prenom: "Lucas", nom: "Martin", age: "2 ans", groupeSanguin: "A+", poids: 13, taille: 88, statut: "sain", pai: true,
    etablissement: { nom: "Les Petits Lutins" }, section: "Coccinelles",
    allergies: [{ nom: "Arachides", reaction: "Choc anaphylactique" }, { nom: "Fruits à coque", reaction: "Urticaire" }],
    vaccins: [{ nom: "DTP", statut: "a_jour" }, { nom: "ROR", statut: "a_jour" }, { nom: "Hépatite B", statut: "a_jour" }, { nom: "Méningocoque C", statut: "rappel" }],
    paiDetail: { type: "Allergie alimentaire", conduite: "En cas de contact avec arachides : administrer EpiPen immédiatement et appeler le 15. Surveiller les symptômes (gonflement, difficultés respiratoires).", medecin: "Dr. Sophie Lemaire — 01 42 00 00 00" },
    autorisations: [{ id: "a1", medicament: "Doliprane 2,4 %", condition: "Si fièvre > 38,5 °C", signe: true }, { id: "a2", medicament: "EpiPen 0,15 mg", condition: "Réaction allergique grave", signe: true }, { id: "a3", medicament: "Ventoline", condition: "Gêne respiratoire", signe: false }],
    sorties: [{ id: "s1", nom: "Claire Martin", relation: "Mère", piece: "CNI ••••4821", verifie: true }, { id: "s2", nom: "Paul Martin", relation: "Père", piece: "CNI ••••1937", verifie: true }, { id: "s3", nom: "Jeanne Roux", relation: "Grand-mère", piece: "Passeport ••••0042", verifie: false }],
    temperatures: [{ t: 36.8, at: h(30) }, { t: 37.2, at: h(26) }, { t: 38.1, at: h(22) }, { t: 38.6, at: h(18) }, { t: 37.9, at: h(10) }, { t: 37.1, at: h(4) }],
    logs: [{ id: "l1", type: "repas", heure: "08:30", detail: "Petit-déjeuner : biberon 210 ml", obs: "Tout bu" }, { id: "l2", type: "sieste", heure: "12:45", detail: "Sieste 1 h 40", obs: "Endormissement rapide" }, { id: "l3", type: "change", heure: "15:10", detail: "Change", obs: "RAS" }, { id: "l4", type: "repas", heure: "16:00", detail: "Goûter : compote + biscuit", obs: "Moitié mangée" }],
    notes: [{ id: "n1", texte: "Lucas a adoré l'atelier peinture ce matin !", auteur: "Équipe Coccinelles", at: h(5), interne: false }, { id: "n2", texte: "Surveiller l'appétit, un peu moins mangé depuis 2 jours.", auteur: "Inès (RSAI)", at: h(20), interne: true }],
  },
  {
    id: "emma", prenom: "Emma", nom: "Bernard", age: "3 ans", groupeSanguin: "O+", poids: 14, taille: 95, statut: "symptomes", pai: false,
    etablissement: { nom: "Les Petits Lutins" }, section: "Papillons", allergies: [],
    vaccins: [{ nom: "DTP", statut: "a_jour" }, { nom: "ROR", statut: "rappel" }], autorisations: [{ id: "a1", medicament: "Doliprane 2,4 %", condition: "Si fièvre > 38,5 °C", signe: true }],
    sorties: [{ id: "s1", nom: "Julie Bernard", relation: "Mère", piece: "CNI ••••7710", verifie: true }],
    temperatures: [{ t: 37.0, at: h(10) }, { t: 38.4, at: h(5) }, { t: 38.9, at: h(2) }],
    logs: [{ id: "l1", type: "repas", heure: "11:45", detail: "Déjeuner", obs: "Peu mangé" }],
    notes: [{ id: "n1", texte: "Toux et fièvre ce matin, parents prévenus.", auteur: "Équipe Papillons", at: h(3), interne: false }],
  },
  {
    id: "noah", prenom: "Noah", nom: "Dubois", age: "2 ans", groupeSanguin: "B+", poids: 12, taille: 86, statut: "attention", pai: false,
    etablissement: { nom: "Les Petits Lutins" }, section: "Coccinelles", allergies: [{ nom: "Lactose", reaction: "Troubles digestifs" }],
    vaccins: [{ nom: "DTP", statut: "a_jour" }], autorisations: [], sorties: [{ id: "s1", nom: "Marc Dubois", relation: "Père", piece: "CNI ••••5521", verifie: true }],
    temperatures: [{ t: 37.3, at: h(6) }, { t: 37.5, at: h(2) }], logs: [{ id: "l1", type: "sieste", heure: "13:00", detail: "Sieste 1 h", obs: "Agité" }], notes: [],
  },
];

export const mNotifs = [
  { id: "n1", type: "vaccin", titre: "Rappel de vaccination", message: "Le rappel de vaccination de Lucas est prévu la semaine prochaine.", at: h(2), lu: false },
  { id: "n2", type: "symptome", titre: "Symptômes signalés", message: "Emma a présenté des symptômes ce matin à la crèche.", at: h(5), lu: false },
  { id: "n3", type: "message", titre: "Nouveau message", message: "Vous avez reçu un message de la crèche Les Petits Lutins.", at: h(26), lu: true },
];

export const mDiagnostics = [
  { id: "d1", enfant: { prenom: "Lucas", nom: "Martin" }, symptomes: ["Fièvre", "Toux"], resultat: "Infection virale bénigne", confiance: 85, at: h(20), conseil: "Hydratation, surveillance de la température, consulter si > 48 h." },
  { id: "d2", enfant: { prenom: "Lucas", nom: "Martin" }, symptomes: ["Éruption cutanée"], resultat: "Érythème fessier", confiance: 78, at: h(24 * 9), conseil: "Crème protectrice, changes fréquents." },
];

export const mTraitements = [
  { id: "t1", enfant: { prenom: "Emma", nom: "Bernard" }, nom: "Amoxicilline 250 mg", posologie: "5 ml", heures: ["09:00", "13:00", "17:00"], donnees: ["09:00"], fin: "Encore 4 jours", medecin: "Dr. Lemaire" },
];

export const mMemos = [
  { id: "m1", enfant: "Lucas", type: "objet", texte: "Lucas est allergique aux arachides. Vérifier systématiquement les étiquettes.", traite: false },
  { id: "m2", enfant: "Noah", type: "ravitaillement", texte: "Stock de couches épuisé, prévenir les parents.", traite: false },
];

export const mRsai = {
  nom: "Inès Moreau", qualification: "Infirmière puéricultrice", note: 4.8, nbAvis: 12,
  missions: [
    { id: "mi1", creche: "Les Petits Lutins", adresse: "12 rue des Lilas, Lyon", horaire: "08:00 – 12:00", statut: "en_cours" },
    { id: "mi2", creche: "Les Petits Anges", adresse: "4 place Bellecour, Lyon", horaire: "14:00 – 17:30", statut: "a_venir" },
  ],
};
export const mRegistres = [
  { id: "r1", titre: "Registre des soins", type: "soins", entrees: [{ at: h(3), texte: "Lucas — Doliprane 2,4 % (6 ml), fièvre 38,6 °C", auteur: "Inès" }, { at: h(27), texte: "Emma — Lavage de nez", auteur: "Inès" }] },
  { id: "r2", titre: "Registre des incidents", type: "incidents", entrees: [{ at: h(50), texte: "Noah — Chute toboggan, bosse frontale, glace appliquée, parents prévenus", auteur: "Équipe" }] },
];
export const mAvis = [
  { id: "av1", auteur: "Les Petits Lutins", note: 5, texte: "Très professionnelle, à l'écoute des équipes et des enfants.", at: h(24 * 4) },
  { id: "av2", auteur: "Les Petits Anges", note: 4, texte: "Ponctuelle et rigoureuse sur les protocoles PAI.", at: h(24 * 20) },
];

export const SYMPTOMES = ["Fièvre", "Toux", "Respiration sifflante", "Nez qui coule", "Éruption cutanée", "Vomissements", "Diarrhée", "Fatigue", "Mal de gorge", "Mal d'oreille"];

/** Règles d'édition du dossier enfant par section et par rôle (CDC mobile). */
export type Section = "apercu" | "quotidien" | "fievre" | "notes" | "pai" | "sorties";
export type MRole = "parent" | "creche" | "rsai";
const EDIT: Record<Section, MRole[]> = {
  apercu: [], quotidien: ["creche", "rsai"], fievre: ["parent", "creche", "rsai"], notes: ["parent", "creche", "rsai"], pai: ["parent"], sorties: ["parent", "creche"],
};
export const canEdit = (s: Section, r: string) => (EDIT[s] as string[]).includes(r);
export const canSeeInternal = (r: string) => r === "creche" || r === "rsai";
export const feverColor = (t: number) => (t >= 38 ? "pink" : t >= 37.5 ? "warn" : "green");
export const ago = (iso: string) => { const m = Math.max(1, Math.round((Date.now() - new Date(iso).getTime()) / 60000)); return m < 60 ? `il y a ${m} min` : m < 1440 ? `il y a ${Math.round(m / 60)} h` : `il y a ${Math.round(m / 1440)} j`; };
