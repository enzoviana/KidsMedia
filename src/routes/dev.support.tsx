import { createFileRoute, Link } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/support")({
  head: () => ({
    meta: [
      { title: "Support — Kids'Med IA" },
      { name: "description", content: 'Tickets de support technique.' },
      { property: "og:title", content: "Support — Kids'Med IA" },
      { property: "og:description", content: 'Tickets de support technique.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{titre:"Impossible d'uploader un PDF",priorite:"haute",statut:"ouvert",createdAt:new Date().toISOString()},{titre:"Notification en double",priorite:"normale",statut:"en_cours",createdAt:"2026-10-05"},{titre:"Erreur export",priorite:"basse",statut:"resolu",createdAt:"2026-09-30"}];
const cols: Col[] = [{label:"Ticket",render:(r)=><span className="font-medium">{r.titre}</span>},{label:"Priorité",render:(r)=><Pill tone={r.priorite==="haute"||r.priorite==="urgente"?"danger":"default"}>{r.priorite}</Pill>},{label:"Statut",render:(r)=><Pill tone={r.statut==="resolu"?"success":"warning"}>{String(r.statut).replace("_"," ")}</Pill>},{label:"Créé",render:(r)=>fmtDate(r.createdAt)}];

const crud: Crud = {"entity": "un ticket", "base": "/developer/support/tickets", "fields": [{"name": "titre", "label": "Titre", "type": "text", "required": true}, {"name": "priorite", "label": "Priorité", "type": "select", "required": true, "options": ["basse", "normale", "haute", "urgente"]}, {"name": "statut", "label": "Statut", "type": "select", "options": ["ouvert", "en_cours", "resolu"]}, {"name": "description", "label": "Description", "type": "textarea"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Support" spec={specs.devTickets} demo={demo} cols={cols} icon={LifeBuoy} />;
}
