import { createFileRoute, Link } from "@tanstack/react-router";
import { CreditCard } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/admin/abonnements")({
  head: () => ({
    meta: [
      { title: "Abonnements — Kids'Med IA" },
      { name: "description", content: 'Formules souscrites par les crèches.' },
      { property: "og:title", content: "Abonnements — Kids'Med IA" },
      { property: "og:description", content: 'Formules souscrites par les crèches.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{groupe:{nom:"Groupe Île-de-France"},plan:"premium",prixMensuel:149,statut:"actif",dateFin:"2027-01-01"},{etablissement:{nom:"La Lune Bleue"},plan:"essentiel",prixMensuel:79,statut:"actif",dateFin:"2026-12-01"},{etablissement:{nom:"L'Étoile"},plan:"essentiel",prixMensuel:79,statut:"suspendu",dateFin:"2026-11-01"}];
const portee = (r: any) => r.groupe?.nom
  ? <span><Pill tone="default">Groupe</Pill> <span className="font-medium">{r.groupe.nom}</span></span>
  : <span className="font-medium">{r.etablissement?.nom ?? r.etablissementId?.nom ?? r.etablissement ?? r.etablissementId ?? "—"}</span>;
const cols: Col[] = [{label:"Portée",render:portee},{label:"Plan",render:(r)=><Pill>{r.plan}</Pill>},{label:"Montant",render:(r)=>`${r.prixMensuel ?? r.montant ?? "—"} €`},{label:"Fin",render:(r)=>fmtDate(r.dateFin)},{label:"Statut",render:(r)=><Pill tone={r.statut==="actif"?"success":"danger"}>{r.statut}</Pill>}];

const crud: Crud = { entity: "un abonnement", base: "/abonnements", fields: [
  { name: "groupeId", label: "Groupe territorial (recommandé si la crèche a un groupe)", lookup: "groupe" },
  { name: "etablissementId", label: "Crèche (hors groupe uniquement)", lookup: "etablissement" },
  { name: "plan", label: "Formule", type: "select", required: true, options: ["essentiel", "premium", "entreprise"] },
  { name: "prixMensuel", label: "Montant mensuel (€)", type: "number" },
  { name: "statut", label: "Statut", type: "select", options: ["actif", "essai", "suspendu", "annule"] },
  { name: "dateDebut", label: "Début", type: "date" },
  { name: "dateFin", label: "Échéance", type: "date" },
  { name: "gratuit", label: "Gratuit (geste commercial)", type: "checkbox" },
] };

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Abonnements" spec={specs.abos} demo={demo} cols={cols} icon={CreditCard} />;
}
