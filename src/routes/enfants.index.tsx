import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Plus } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { demoEnfants } from "@/lib/demo-enfants";
import type { Crud } from "@/components/dash/crud";
import { EnfantLink } from "@/components/dash/crud";
import { LierCodeButton, ScanQrButton } from "@/components/dash/liaison";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/enfants/")({
  head: () => ({
    meta: [
      { title: "Enfants — Kids'Med IA" },
      { name: "description", content: 'Liste des enfants avec allergies, section et accès au dossier.' },
      { property: "og:title", content: "Enfants — Kids'Med IA" },
      { property: "og:description", content: 'Liste des enfants avec allergies, section et accès au dossier.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = demoEnfants;
const cols: Col[] = [{label:"Enfant",render:(r)=><EnfantLink e={r} />},{label:"Naissance",render:(r)=>fmtDate(r.dateNaissance)},{label:"Section",render:(r)=>typeof r.section==="object"?r.section?.nom:r.section??"—"},{label:"Allergies",render:(r)=>(r.allergies??[]).length?<Pill tone="danger">{(r.allergies??[]).join(", ")}</Pill>:<Pill tone="success">Aucune</Pill>}];

const crud: Crud = { entity: "un enfant", base: "/enfants", view: "enfant", noCreate: true, fields: [{name:"prenom",label:"Prénom",required:true},{name:"nom",label:"Nom",required:true},{name:"dateNaissance",label:"Naissance",type:"date"},{name:"section",label:"Section"},{name:"groupeSanguin",label:"Groupe sanguin"}] };

function Page() {
  void Link; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Enfants" spec={specs.enfantsEtab} demo={demo} cols={cols} icon={Baby} actions={<><ScanQrButton /><LierCodeButton /><Button asChild><Link to="/enfants/nouveau"><Plus className="mr-1 h-4 w-4"/>Ajouter</Link></Button></>} />;
}
