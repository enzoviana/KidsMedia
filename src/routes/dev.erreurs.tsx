import { createFileRoute, Link } from "@tanstack/react-router";
import { Bug } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/erreurs")({
  head: () => ({
    meta: [
      { title: "Erreurs — Kids'Med IA" },
      { name: "description", content: 'Erreurs serveur récentes.' },
      { property: "og:title", content: "Erreurs — Kids'Med IA" },
      { property: "og:description", content: 'Erreurs serveur récentes.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{message:"Cannot read properties of undefined (reading 'etablissementId')",endpoint:"GET /api/enfants",level:"error",count:14,resolved:false,lastSeen:new Date().toISOString()},{message:"Timeout OpenAI",endpoint:"POST /api/diagnostics",level:"warning",count:3,resolved:false,lastSeen:new Date().toISOString()}];
const cols: Col[] = [{label:"Erreur",render:(r)=><span className="font-mono text-xs">{r.message}</span>},{label:"Endpoint",render:(r)=><code className="text-xs">{r.endpoint}</code>},{label:"Niveau",render:(r)=><Pill tone={r.level==="error"?"danger":"warning"}>{r.level}</Pill>},{label:"Occurrences",render:(r)=>r.count},{label:"Statut",render:(r)=><Pill tone={r.resolved?"success":"warning"}>{r.resolved?"Résolue":"Ouverte"}</Pill>}];

const crud: Crud = {"entity": "une erreur", "base": "/developer/errors", "noCreate": true, "fields": [{"name": "resolved", "label": "Résolue", "type": "checkbox"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Erreurs" spec={specs.devErrors} demo={demo} cols={cols} icon={Bug} />;
}
