import { createFileRoute, Link } from "@tanstack/react-router";
import { ScrollText } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { UploadDocButton } from "@/components/dash/upload";
import { useCoordination } from "@/lib/coordination";

export const Route = createFileRoute("/ordonnances")({
  head: () => ({
    meta: [
      { title: "Ordonnances — Kids'Med IA" },
      { name: "description", content: 'Ordonnances et dates de validité.' },
      { property: "og:title", content: "Ordonnances — Kids'Med IA" },
      { property: "og:description", content: 'Ordonnances et dates de validité.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{enfant:{prenom:"Jade",nom:"Petit"},medicaments:[{nom:"Amoxicilline"}],dateDebut:"2026-10-01",dateFin:"2026-10-10",medecin:{prenom:"Dr",nom:"Moreau"}},{enfant:{prenom:"Noah",nom:"Bernard"},medicaments:[{nom:"Ventoline"}],dateDebut:"2026-09-01",dateFin:"2027-03-01",medecin:{prenom:"Dr",nom:"Moreau"}}];
const cols: Col[] = [{label:"Enfant",render:(r)=><EnfantLink e={r.enfant} />},{label:"Traitement / Fichier",render:(r)=>r.nom || (r.medicaments??[]).map((m:any)=>m.nom??m).join(", ")||"—"},{label:"Médecin",render:(r)=>fullName(r.medecin)},{label:"Validité",render:(r)=>`${fmtDate(r.dateDebut)} → ${fmtDate(r.dateFin ?? r.dateValidite)}`}];

const crud: Crud = {"entity": "une ordonnance", "base": "/ordonnances", "fields": [{"name": "enfant", "label": "Enfant", "lookup": "enfant", "required": true}, {"name": "medicaments", "label": "Médicaments (séparés par virgules)", "type": "text", "required": true}, {"name": "dateDebut", "label": "Début", "type": "date", "required": true}, {"name": "dateFin", "label": "Fin", "type": "date", "required": true}, {"name": "notes", "label": "Notes", "type": "textarea"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  const store = useCoordination();
  return <ListPage crud={crud} additionalRows={store.documents.filter((d) => d.type === "Ordonnance")} actions={<UploadDocButton defaultType="Ordonnance" label="Téléverser une ordonnance" />} title="Ordonnances" spec={specs.ordoMedecin} demo={demo} cols={cols} icon={ScrollText} />;
}
