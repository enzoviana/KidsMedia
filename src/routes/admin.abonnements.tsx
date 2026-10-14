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

const demo: any[] = [{etablissement:{nom:"Les Petits Soleils"},plan:"premium",montant:149,statut:"actif",dateFin:"2027-01-01"},{etablissement:{nom:"La Lune Bleue"},plan:"essentiel",montant:79,statut:"actif",dateFin:"2026-12-01"},{etablissement:{nom:"L'Étoile"},plan:"essentiel",montant:79,statut:"suspendu",dateFin:"2026-11-01"}];
const cols: Col[] = [{label:"Crèche",render:(r)=><span className="font-medium">{r.etablissement?.nom??r.etablissementId?.nom??r.etablissement??r.etablissementId??"—"}</span>},{label:"Plan",render:(r)=><Pill>{r.plan}</Pill>},{label:"Montant",render:(r)=>`${r.montant??"—"} €`},{label:"Fin",render:(r)=>fmtDate(r.dateFin)},{label:"Statut",render:(r)=><Pill tone={r.statut==="actif"?"success":"danger"}>{r.statut}</Pill>}];

const crud: Crud = {"entity": "un abonnement", "base": "/abonnements", "fields": [{"name": "etablissementId", "label": "Crèche", "lookup": "etablissement", "required": true}, {"name": "plan", "label": "Formule", "type": "select", "required": true, "options": ["essentiel", "premium", "entreprise"]}, {"name": "statut", "label": "Statut", "type": "select", "options": ["actif", "essai", "suspendu", "annule"]}, {"name": "dateFin", "label": "Échéance", "type": "date"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Abonnements" spec={specs.abos} demo={demo} cols={cols} icon={CreditCard} />;
}
