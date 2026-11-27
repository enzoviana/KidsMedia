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
import { toList } from "@/lib/api";

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
const demoAlertes: any[] = [{ _id: "alerte-demo-1", enfant: { _id: "demo-noah", prenom: "Noah", nom: "Bernard" }, type: "Certificat médical d'aptitude", motif: "manquant", dateValidite: null }];
const cols: Col[] = [{label:"Date",render:(r)=>fmtDate(r.createdAt)},{label:"Titre",render:(r)=><span className={r.lu?"":"font-semibold"}>{r.titre??r.type}</span>},{label:"Message",render:(r)=>r.message??"—"},{label:"",render:(r)=>r.lu?null:<Pill tone="warning">Nouveau</Pill>}];

const crud: Crud = {"entity": "une notification", "base": "/notifications", "noCreate": true, "noEdit": true, "noDelete": true, "fields": []};
const MOTIFS: Record<string, string> = { manquant: "Manquant", expire: "Expiré", expiration_proche: "Expire bientôt", rejete: "Rejeté" };

function Page() {
  void Link; void EnfantLink; void fullName;
  const qc = useQueryClient();
  // Alertes rafraîchies toutes les 30 s
  useApiOrDemo(specs.notifs, demo, undefined, { refetchInterval: 30_000 });
  // Les alertes documentaires sont intégrées à cette page unique, sans panneau externe.
  const alertes = useApiOrDemo<unknown>(specs.alertesDocuments, demoAlertes, undefined, { refetchInterval: 30_000 });
  const alertesRows = (alertes.demo ? demoAlertes : toList(alertes.data)).map((a: any) => ({
    _id: `alerte-doc-${a._id ?? a.documentId ?? a.type}`,
    createdAt: a.dateValidite ?? "",
    titre: `Document — ${a.type ?? "pièce obligatoire"}`,
    message: `${fullName(a.enfant)} · ${MOTIFS[a.motif] ?? a.motif ?? "à fournir"}`,
    lu: false,
    enfant: a.enfant,
    type: a.type,
  }));
  const toutLire = async () => {
    try {
      const res = await send("PATCH", specs.notifsToutLire.path);
      qc.invalidateQueries({ queryKey: ["api", specs.notifs.id] });
      toast.success(res.demo ? "Tout est marqué comme lu (démo)" : "Tout est marqué comme lu");
    } catch (e) { toast.error((e as Error).message); }
  };
  return <ListPage crud={crud} additionalRows={alertesRows} sortRows={(a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime()} actions={<Button variant="outline" onClick={toutLire}><CheckCheck className="mr-1 h-4 w-4" />Tout marquer comme lu</Button>} title="Notifications" spec={specs.notifs} demo={demo} cols={cols} icon={Bell} />;
}
