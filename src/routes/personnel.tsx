import { createFileRoute, Link } from "@tanstack/react-router";
import { Users } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/personnel")({
  head: () => ({
    meta: [
      { title: "Personnel — Kids'Med IA" },
      { name: "description", content: 'Équipe de la crèche.' },
      { property: "og:title", content: "Personnel — Kids'Med IA" },
      { property: "og:description", content: 'Équipe de la crèche.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{prenom:"Sophie",nom:"Lambert",poste:"Auxiliaire de puériculture",actif:true},{prenom:"Karim",nom:"Benali",poste:"EJE",actif:true},{prenom:"Inès",nom:"Moreau",poste:"Directrice",actif:true},{prenom:"Paul",nom:"Girard",poste:"Agent",actif:false}];
const cols: Col[] = [{label:"Nom",render:(r)=><span className="font-medium">{fullName(r)}</span>},{label:"Poste",render:(r)=>r.poste??r.fonction??"—"},{label:"Statut",render:(r)=><Pill tone={r.actif===false?"danger":"success"}>{r.actif===false?"Inactif":"Actif"}</Pill>}];

const crud: Crud = {"entity": "un membre du personnel", "base": "/personnels", "extra": {"etablissementId": ":etablissementId"}, "fields": [{"name": "prenom", "label": "Prénom", "type": "text", "required": true}, {"name": "nom", "label": "Nom", "type": "text", "required": true}, {"name": "poste", "label": "Poste", "type": "select", "options": ["Auxiliaire", "Éducateur", "Infirmier", "Directeur", "Agent"]}, {"name": "email", "label": "E-mail", "type": "email"}, {"name": "telephone", "label": "Téléphone", "type": "tel"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Personnel" spec={specs.personnel} demo={demo} cols={cols} icon={Users} />;
}
