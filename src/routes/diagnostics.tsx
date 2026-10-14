import { createFileRoute, Link } from "@tanstack/react-router";
import { BrainCircuit } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/diagnostics")({
  head: () => ({
    meta: [
      { title: "Diagnostics IA — Kids'Med IA" },
      { name: "description", content: "Analyses de symptômes par l'IA." },
      { property: "og:title", content: "Diagnostics IA — Kids'Med IA" },
      { property: "og:description", content: "Analyses de symptômes par l'IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{enfant:{prenom:"Léa",nom:"Martin"},symptomes:["fièvre","toux"],resultat:"Rhinopharyngite probable",confiance:0.82,createdAt:new Date().toISOString()},{enfant:{prenom:"Lucas",nom:"Durand"},symptomes:["éruption"],resultat:"Varicelle à confirmer",confiance:0.64,createdAt:new Date().toISOString()}];
const cols: Col[] = [{label:"Date",render:(r)=>fmtDate(r.createdAt)},{label:"Enfant",render:(r)=><EnfantLink e={r.enfant} />},{label:"Symptômes",render:(r)=>(r.symptomes??[]).join(", ")},{label:"Résultat",render:(r)=><span className="font-medium">{r.resultat??"—"}</span>},{label:"Confiance",render:(r)=><Pill tone={(r.confiance??0)>0.75?"success":"warning"}>{Math.round((r.confiance??0)*100)} %</Pill>}];

const crud: Crud = {"entity": "un diagnostic", "base": "/diagnostics", "noEdit": true, "fields": [{"name": "enfant", "label": "Enfant", "lookup": "enfant", "required": true}, {"name": "symptomes", "label": "Symptômes", "type": "textarea", "required": true}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Diagnostics IA" spec={specs.diagEnfants} demo={demo} cols={cols} icon={BrainCircuit} />;
}
