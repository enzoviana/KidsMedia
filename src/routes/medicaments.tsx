import { createFileRoute, Link } from "@tanstack/react-router";
import { Pill as PillIcon } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/medicaments")({
  head: () => ({
    meta: [
      { title: "Médicaments — Kids'Med IA" },
      { name: "description", content: 'Traitements en cours et prises du jour.' },
      { property: "og:title", content: "Médicaments — Kids'Med IA" },
      { property: "og:description", content: 'Traitements en cours et prises du jour.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{nom:"Doliprane 2,4 %",posologie:"5 ml",frequence:"Si fièvre",enfant:{prenom:"Léa",nom:"Martin"},actif:true},{nom:"Ventoline",posologie:"2 bouffées",frequence:"12h30",enfant:{prenom:"Noah",nom:"Bernard"},actif:true},{nom:"Amoxicilline",posologie:"4 ml",frequence:"3 fois / jour",enfant:{prenom:"Jade",nom:"Petit"},actif:false}];
const cols: Col[] = [{label:"Médicament",render:(r)=><span className="font-medium">{r.nom}</span>},{label:"Enfant",render:(r)=><EnfantLink e={r.enfant} />},{label:"Posologie",render:(r)=>r.posologie??"—"},{label:"Fréquence",render:(r)=>r.frequence??"—"},{label:"Statut",render:(r)=><Pill tone={r.actif===false?"default":"success"}>{r.actif===false?"Terminé":"En cours"}</Pill>}];

const crud: Crud = {"entity": "un traitement", "base": "/medicaments", "fields": [{"name": "nom", "label": "Médicament", "type": "text", "required": true}, {"name": "enfant", "label": "Enfant", "lookup": "enfant", "required": true}, {"name": "posologie", "label": "Posologie", "type": "text", "required": true}, {"name": "heure", "label": "Heure", "type": "text"}, {"name": "dateDebut", "label": "Début", "type": "date"}, {"name": "dateFin", "label": "Fin", "type": "date"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Médicaments" spec={specs.medicEtab} demo={demo} cols={cols} icon={PillIcon} />;
}
