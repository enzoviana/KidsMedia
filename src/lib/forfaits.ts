export interface Offre {
  id: string; nom: string; prix: number; inclus: string[]; joursEssai: number;
  prixAnnuel?: number | undefined;
  categorie?: string | undefined;
  engagementMois?: number | undefined;
  dureeMois?: number | undefined;
  description?: string | undefined;
}

/** Ne garde que les forfaits actifs destinés au rôle (ou à « tous »). */
export function forfaitsPourRole(rows: any[], role: string | null): Offre[] {
  return rows
    .filter((t) => t.actif !== false && (!t.roleCible || t.roleCible === "tous" || t.roleCible === role))
    .map((t) => ({
      id: String(t._id ?? t.id ?? t.nom),
      nom: t.nom ?? t.plan ?? "Forfait",
      // Le prix promotionnel est prioritaire lorsqu'il est renseigné.
      prix: Number(t.prixPromoMensuel ?? t.prixMensuel ?? t.prix ?? 0),
      prixAnnuel: t.prixPromoAnnuel ?? t.prixAnnuel ?? undefined,
      categorie: t.categorie ?? "abonnement",
      engagementMois: t.engagementMois ?? undefined,
      dureeMois: t.dureeMois ?? undefined,
      description: t.description ?? undefined,
      joursEssai: Math.max(0, Math.trunc(Number(t.joursEssai ?? 0) || 0)),
      inclus: Array.isArray(t.fonctionnalites) ? t.fonctionnalites : typeof t.fonctionnalites === "string" ? t.fonctionnalites.split("\n").filter(Boolean) : [],
    }));
}

export const demoTarifs: any[] = [
  {_id:"t1",nom:"Crèche Essentiel",roleCible:"creche",prixMensuel:79,prixAnnuel:790,joursEssai:0,actif:true,fonctionnalites:["Jusqu'à 30 enfants","Dossiers médicaux"]},
  {_id:"t2",nom:"Crèche Premium",roleCible:"creche",prixMensuel:149,prixAnnuel:1490,joursEssai:14,actif:true,fonctionnalites:["Jusqu'à 60 enfants","Analyse IA"]},
  {_id:"t3",nom:"RSAI Pro",roleCible:"rsai",prixMensuel:29,prixAnnuel:290,joursEssai:7,actif:true,fonctionnalites:["Multi-crèches","Géorepérage"]},
  {_id:"t4",nom:"Médecin Cabinet",roleCible:"medecin",prixMensuel:39,prixAnnuel:390,joursEssai:0,actif:true,fonctionnalites:["Ordonnances","Messagerie crèches"]},
  {_id:"t5",nom:"Parent Sérénité",roleCible:"parent",prixMensuel:4.99,prixAnnuel:49,joursEssai:0,actif:true,fonctionnalites:["Carnet vaccinal","Alertes"]},
  {_id:"t6",nom:"Groupe Territorial",roleCible:"directeur",prixMensuel:299,prixAnnuel:2990,joursEssai:0,actif:true,fonctionnalites:["Toutes les crèches du groupe","Supervision consolidée"]},
];
