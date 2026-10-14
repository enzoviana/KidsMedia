import { createFileRoute, Link } from "@tanstack/react-router";
import { NotebookPen } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/transmissions")({
  head: () => ({
    meta: [
      { title: "Transmissions — Kids'Med IA" },
      { name: "description", content: 'Cahier de liaison numérique.' },
      { property: "og:title", content: "Transmissions — Kids'Med IA" },
      { property: "og:description", content: 'Cahier de liaison numérique.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{type:"repas",contenu:"A fini son assiette.",enfant:{prenom:"Lucas",nom:"Durand"},createdAt:new Date().toISOString()},{type:"sieste",contenu:"Sieste de 13h à 14h45.",enfant:{prenom:"Emma",nom:"Leroy"},createdAt:new Date().toISOString()},{type:"sante",contenu:"37,9 °C, parents prévenus.",enfant:{prenom:"Léa",nom:"Martin"},createdAt:new Date().toISOString()}];
const cols: Col[] = [{label:"Date",render:(r)=>fmtDate(r.createdAt)},{label:"Enfant",render:(r)=><EnfantLink e={r.enfant} />},{label:"Type",render:(r)=><Pill>{r.type}</Pill>},{label:"Contenu",render:(r)=>r.contenu??r.message??"—"}];

const crud: Crud = {"entity": "une transmission", "base": "/transmissions", "extra": {"etablissementId": ":etablissementId"}, "fields": [{"name": "enfant", "label": "Enfant", "lookup": "enfant", "required": true}, {"name": "type", "label": "Type", "type": "select", "required": true, "options": ["repas", "sieste", "change", "sante", "activite", "note"]}, {"name": "contenu", "label": "Contenu", "type": "textarea", "required": true}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Transmissions" spec={specs.transEtab} demo={demo} cols={cols} icon={NotebookPen} />;
}
