import { createFileRoute, Link } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/documents-obligatoires")({
  head: () => ({
    meta: [
      { title: "Documents obligatoires — Kids'Med IA" },
      { name: "description", content: "Documents exigés par l'établissement." },
      { property: "og:title", content: "Documents obligatoires — Kids'Med IA" },
      { property: "og:description", content: "Documents exigés par l'établissement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{nom:"Carnet de vaccination",description:"Vaccins obligatoires à jour",obligatoire:true,actif:true},{nom:"Attestation d'assurance",description:"Responsabilité civile",obligatoire:true,actif:true},{nom:"Autorisation de sortie",description:"Sorties extérieures",obligatoire:false,actif:true}];
const cols: Col[] = [{label:"Document",render:(r)=><span className="font-medium">{r.nom}</span>},{label:"Description",render:(r)=>r.description??"—"},{label:"Obligatoire",render:(r)=><Pill tone={r.obligatoire?"warning":"default"}>{r.obligatoire?"Oui":"Facultatif"}</Pill>}];

const crud: Crud = {"entity": "un document obligatoire", "base": "/documents-obligatoires", "extra": {"etablissementId": ":etablissementId"}, "fields": [{"name": "nom", "label": "Nom du document", "type": "text", "required": true}, {"name": "description", "label": "Description", "type": "textarea"}, {"name": "obligatoireInscription", "label": "Obligatoire pour l'inscription", "type": "checkbox"}, {"name": "validiteMois", "label": "Validité (mois)", "type": "number"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Documents obligatoires" spec={specs.docsOblig} demo={demo} cols={cols} icon={ClipboardCheck} />;
}
