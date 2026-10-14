import { createFileRoute, Link } from "@tanstack/react-router";
import { LayoutGrid } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/sections")({
  head: () => ({
    meta: [
      { title: "Sections — Kids'Med IA" },
      { name: "description", content: "Groupes d'enfants, capacité et référents." },
      { property: "og:title", content: "Sections — Kids'Med IA" },
      { property: "og:description", content: "Groupes d'enfants, capacité et référents." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{nom:"Bébés",capacite:12,effectif:10,referent:"Sophie L."},{nom:"Moyens",capacite:16,effectif:15,referent:"Karim B."},{nom:"Grands",capacite:20,effectif:17,referent:"Inès M."}];
const cols: Col[] = [{label:"Section",render:(r)=><span className="font-medium">{r.nom}</span>},{label:"Effectif",render:(r)=>`${r.effectif??r.enfants?.length??0} / ${r.capacite??"—"}`},{label:"Référent",render:(r)=>fullName(r.referent)}];

const crud: Crud = {"entity": "une section", "base": "/sections", "extra": {"etablissementId": ":etablissementId"}, "fields": [{"name": "nom", "label": "Nom", "type": "text", "required": true}, {"name": "ageMin", "label": "Âge min (mois)", "type": "number"}, {"name": "ageMax", "label": "Âge max (mois)", "type": "number"}, {"name": "capacite", "label": "Capacité", "type": "number"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Sections" spec={specs.sections} demo={demo} cols={cols} icon={LayoutGrid} />;
}
