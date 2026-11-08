import { createFileRoute, Link } from "@tanstack/react-router";
import { FileText } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { UploadDocButton } from "@/components/dash/upload";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { useCoordination, documentEtat, demoDocuments } from "@/lib/coordination";
import { getSession, roleToKey } from "@/lib/api";

export const Route = createFileRoute("/documents")({
  head: () => ({
    meta: [
      { title: "Documents — Kids'Med IA" },
      { name: "description", content: 'Pièces des familles et validation.' },
      { property: "og:title", content: "Documents — Kids'Med IA" },
      { property: "og:description", content: 'Pièces des familles et validation.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{type:"Certificat de vaccination",statut:"en_attente",enfant:{prenom:"Noah",nom:"Bernard"},createdAt:"2026-10-02"},{type:"Attestation d'assurance",statut:"valide",enfant:{prenom:"Jade",nom:"Petit"},createdAt:"2026-09-20"},{type:"PAI",statut:"rejete",enfant:{prenom:"Léa",nom:"Martin"},createdAt:"2026-09-28"}];
const cols: Col[] = [{label:"Document",render:(r)=><span className="inline-flex items-center gap-2 font-medium">{documentEtat(r) !== "valide" && <span aria-label="Alerte documentaire" title="Document à traiter" className="h-2 w-2 shrink-0 rounded-full bg-destructive" />}{r.type??r.nom}</span>},{label:"Enfant",render:(r)=><EnfantLink e={r.enfant} />},{label:"Date",render:(r)=>fmtDate(r.createdAt)},{label:"Statut",render:(r)=><Pill tone={r.statut==="valide"?"success":r.statut==="rejete"?"danger":"warning"}>{String(r.statut??"").replace("_"," ")}</Pill>}];

const crud: Crud = {"entity": "un document", "base": "/documents", "view": "document", "noCreate": true, "fields": [{"name": "type", "label": "Type", "type": "text", "required": true}, {"name": "statut", "label": "Statut", "type": "select", "options": ["en_attente", "valide", "rejete"]}, {"name": "dateValidite", "label": "Valide jusqu'au", "type": "date"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  const store = useCoordination();
  const role = roleToKey(getSession()?.user.role) ?? "parent";
  const spec = ["creche", "rsai"].includes(role) ? specs.docsEtab : specs.documentsAccessibles;
  const extraCols: Col[] = [...cols, { label: "Expiration", render: (d) => <Pill tone={documentEtat(d) === "expire" ? "danger" : documentEtat(d) === "expiration_proche" ? "warning" : "default"}>{d.dateValidite ? fmtDate(d.dateValidite) : "Sans échéance"}</Pill> }];
  return <ListPage
    crud={crud}
    additionalRows={store.documents}
    actions={<UploadDocButton />}
    title="Documents"
    spec={spec}
    demo={[...demoDocuments, ...demo]}
    cols={extraCols}
    icon={FileText}
    sortRows={(a, b) => {
      // Les documents en alerte (manquant, rejeté, expiré, bientôt expiré) passent en tête.
      const alert = (d: any) => (documentEtat(d) === "valide" ? 1 : 0);
      return alert(a) - alert(b) || String(b.createdAt ?? "").localeCompare(String(a.createdAt ?? ""));
    }}
  />;
}
