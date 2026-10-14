import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { EnfantLink } from "@/components/dash/crud";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/admin/logs")({
  head: () => ({
    meta: [
      { title: "Journaux — Kids'Med IA" },
      { name: "description", content: 'Traçabilité et sécurité.' },
      { property: "og:title", content: "Journaux — Kids'Med IA" },
      { property: "og:description", content: 'Traçabilité et sécurité.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const now = Date.now();
const demo: any[] = [
  {action:"consultation_dossier",utilisateur:{prenom:"Inès",nom:"Garcia",role:"rsai"},enfant:{prenom:"Léa"},adresse_ip:"82.64.1.10",device:"Samsung Galaxy S22",date:new Date(now).toISOString()},
  {action:"modification_dossier",utilisateur:{prenom:"Dr Paul",nom:"Moreau",role:"medecin"},enfant:{prenom:"Noah"},adresse_ip:"90.12.4.8",device:"Chrome macOS",date:new Date(now-36e5).toISOString()},
  {action:"tentative_connexion",utilisateur:{prenom:"inconnu@x.fr"},adresse_ip:"45.12.8.2",device:"Firefox Linux",date:new Date(now-72e5).toISOString()},
  {action:"acces_refuse",utilisateur:{prenom:"Nadia",nom:"Roux",role:"creche"},enfant:{prenom:"Jade"},adresse_ip:"82.64.1.10",device:"iPhone",date:new Date(now-864e5).toISOString()},
];
const tone = (a: string) => a === "acces_refuse" || a === "tentative_connexion" ? "danger" : a === "modification_dossier" ? "warning" : "default";
const cols: Col[] = [{label:"Date",render:(r)=>fmtDate(r.date??r.createdAt)},{label:"Action",render:(r)=><Pill tone={tone(r.action??r.type)}>{String(r.action??r.type).replace("_"," ")}</Pill>},{label:"Utilisateur",render:(r)=>fullName(r.utilisateur??r.user??r.userId)},{label:"Dossier",render:(r)=>r.enfant ? <EnfantLink e={r.enfant} /> : "—"},{label:"Appareil",render:(r)=>r.device??"—"},{label:"IP",render:(r)=><code className="text-xs">{r.adresse_ip??r.ip??"—"}</code>}];

function Page() {
  void Link; void Pill; void fullName; void fmtDate;
  return <ListPage title="Journaux" spec={specs.logsSecu} demo={demo} cols={cols} icon={ShieldAlert} />;
}
