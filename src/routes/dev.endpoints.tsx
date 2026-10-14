import { createFileRoute, Link } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/endpoints")({
  head: () => ({
    meta: [
      { title: "Endpoints — Kids'Med IA" },
      { name: "description", content: "Toutes les routes de l'API." },
      { property: "og:title", content: "Endpoints — Kids'Med IA" },
      { property: "og:description", content: "Toutes les routes de l'API." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{method:"POST",path:"/api/auth/login",calls24h:1240,avgMs:180},{method:"GET",path:"/api/enfants",calls24h:3410,avgMs:95},{method:"GET",path:"/api/notifications/count-unread",calls24h:9800,avgMs:22},{method:"POST",path:"/api/diagnostics",calls24h:86,avgMs:2400}];
const cols: Col[] = [{label:"Méthode",render:(r)=><Pill>{r.method}</Pill>},{label:"Chemin",render:(r)=><code className="text-xs">{r.path}</code>},{label:"Appels 24h",render:(r)=>r.calls24h},{label:"Latence",render:(r)=>`${r.avgMs} ms`}];

function Page() {
  void Link; void Pill; void fullName; void fmtDate;
  return <ListPage title="Endpoints" spec={specs.devEndpoints} demo={demo} cols={cols} icon={Network} />;
}
