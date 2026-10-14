import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { demoTarifs } from "@/lib/forfaits";

export const Route = createFileRoute("/admin/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Kids'Med IA" },
      { name: "description", content: 'Grille tarifaire des plans.' },
      { property: "og:title", content: "Tarifs — Kids'Med IA" },
      { property: "og:description", content: 'Grille tarifaire des plans.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const roleLabel: Record<string, string> = { creche: "Crèche", rsai: "RSAI", medecin: "Médecin", parent: "Parent", tous: "Tous" };
const cols: Col[] = [{label:"Forfait",render:(r)=><span className="font-medium">{r.nom??r.plan}</span>},{label:"Rôle",render:(r)=><Pill>{roleLabel[r.roleCible]??"Tous"}</Pill>},{label:"Mensuel",render:(r)=>`${r.prixMensuel??r.prix??"—"} €`},{label:"Annuel",render:(r)=>`${r.prixAnnuel??"—"} €`},{label:"Statut",render:(r)=><Pill tone={r.actif===false?"danger":"success"}>{r.actif===false?"Désactivé":"Actif"}</Pill>}];

const crud: Crud = {"entity": "un forfait", "base": "/tarifs", "fields": [{"name": "nom", "label": "Nom du forfait", "type": "text", "required": true}, {"name": "roleCible", "label": "Rôle concerné", "type": "select", "options": ["creche", "rsai", "medecin", "parent", "tous"], "required": true}, {"name": "prixMensuel", "label": "Prix mensuel (€)", "type": "number", "required": true}, {"name": "prixAnnuel", "label": "Prix annuel (€)", "type": "number"}, {"name": "enfantsMax", "label": "Enfants inclus", "type": "number"}, {"name": "fonctionnalites", "label": "Fonctionnalités (une par ligne)", "type": "textarea"}, {"name": "actif", "label": "Actif", "type": "checkbox"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Forfaits par rôle" spec={specs.tarifsAll} demo={demoTarifs} cols={cols} icon={Tag} />;
}
