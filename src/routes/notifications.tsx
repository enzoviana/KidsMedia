import { createFileRoute, Link } from "@tanstack/react-router";
import { Bell, CheckCheck } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { send } from "@/lib/mutate";
import { useApiOrDemo } from "@/lib/use-api";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { DocumentAlerts } from "@/components/dash/coordination";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Kids'Med IA" },
      { name: "description", content: 'Vos alertes et rappels.' },
      { property: "og:title", content: "Notifications — Kids'Med IA" },
      { property: "og:description", content: 'Vos alertes et rappels.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{titre:"Document à valider",message:"Certificat de Noah en attente",lu:false,createdAt:new Date().toISOString()},{titre:"Traitement",message:"Ventoline de Noah à 12h30",lu:false,createdAt:new Date().toISOString()},{titre:"Bienvenue",message:"Votre compte est actif",lu:true,createdAt:"2026-09-01"}];
const cols: Col[] = [{label:"Date",render:(r)=>fmtDate(r.createdAt)},{label:"Titre",render:(r)=><span className={r.lu?"":"font-semibold"}>{r.titre??r.type}</span>},{label:"Message",render:(r)=>r.message??"—"},{label:"",render:(r)=>r.lu?null:<Pill tone="warning">Nouveau</Pill>}];

const crud: Crud = {"entity": "une notification", "base": "/notifications", "noCreate": true, "noEdit": true, "fields": []};

function Page() {
  void Link; void EnfantLink; void fullName;
  const qc = useQueryClient();
  // Alertes rafraîchies toutes les 30 s
  useApiOrDemo(specs.notifs, demo, undefined, { refetchInterval: 30_000 });
  const toutLire = async () => {
    try {
      const res = await send("PATCH", specs.notifsToutLire.path);
      qc.invalidateQueries({ queryKey: ["api", specs.notifs.id] });
      toast.success(res.demo ? "Tout est marqué comme lu (démo)" : "Tout est marqué comme lu");
    } catch (e) { toast.error((e as Error).message); }
  };
  return <ListPage crud={crud} before={<DocumentAlerts />} actions={<Button variant="outline" onClick={toutLire}><CheckCheck className="mr-1 h-4 w-4" />Tout marquer comme lu</Button>} title="Notifications" spec={specs.notifs} demo={demo} cols={cols} icon={Bell} />;
}
