import { createFileRoute, Link } from "@tanstack/react-router";
import { Building2 } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/etablissements/")({
  head: () => ({
    meta: [
      { title: "Crèches — Kids'Med IA" },
      { name: "description", content: 'Répertoire des crèches partenaires.' },
      { property: "og:title", content: "Crèches — Kids'Med IA" },
      { property: "og:description", content: 'Répertoire des crèches partenaires.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{_id:"demo-soleil",nom:"Crèche Les Petits Soleils",ville:"Lyon",capacite:48,actif:true},{_id:"demo-lune",nom:"Crèche La Lune Bleue",ville:"Paris",capacite:36,actif:true},{_id:"demo-etoile",nom:"Micro-crèche L'Étoile",ville:"Nantes",capacite:10,actif:false}];
const cols: Col[] = [{label:"Crèche",render:(r)=><Link to="/etablissements/$etablissementId" params={{etablissementId:String(r._id??r.id??"")}} className="font-medium text-primary hover:underline">{r.nom??"—"}</Link>},{label:"Ville",render:(r)=>r.ville??r.adresse?.ville??"—"},{label:"Capacité",render:(r)=>r.capacite??"—"},{label:"Statut",render:(r)=><Pill tone={r.actif===false?"danger":"success"}>{r.actif===false?"Inactif":"Actif"}</Pill>}];

const crud: Crud = {"entity": "une crèche", "base": "/etablissements", "view": "etablissement", "fields": [{"name": "nom", "label": "Nom", "type": "text", "required": true}, {"name": "adresse", "label": "Adresse", "type": "address", "required": true}, {"name": "capacite", "label": "Capacité", "type": "number"}, {"name": "telephone", "label": "Téléphone", "type": "tel"}, {"name": "email", "label": "E-mail", "type": "email"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage crud={crud} title="Crèches" spec={specs.etabs} demo={demo} cols={cols} icon={Building2} />;
}
