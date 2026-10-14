import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { Stethoscope } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/medecins")({
  head: () => ({
    meta: [
      { title: "Médecins — Kids'Med IA" },
      { name: "description", content: 'Annuaire des médecins partenaires.' },
      { property: "og:title", content: "Médecins — Kids'Med IA" },
      { property: "og:description", content: 'Annuaire des médecins partenaires.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{prenom:"Claire",nom:"Moreau",specialite:"Pédiatre",rpps:"10101234567",tel:"04 72 00 00 01",email:"c.moreau@exemple.fr"},{prenom:"Hugo",nom:"Lefèvre",specialite:"Médecin généraliste",rpps:"10109876543",tel:"01 45 00 00 02",email:"h.lefevre@exemple.fr"}];
const cols: Col[] = [{label:"Médecin",render:(r)=><span className="font-medium">Dr {fullName(r)}</span>},{label:"Spécialité",render:(r)=>r.specialite??"—"},{label:"RPPS",render:(r)=>r.rpps??"—"},{label:"Contact",render:(r)=><span className="text-muted-foreground">{r.email??"—"} · {r.tel??""}</span>}];

const crud: Crud = {"entity": "un médecin", "base": "/users", "extra": {"role": "medecin"}, "fields": [{"name": "prenom", "label": "Prénom", "type": "text", "required": true}, {"name": "nom", "label": "Nom", "type": "text", "required": true}, {"name": "specialite", "label": "Spécialité", "type": "text"}, {"name": "rpps", "label": "N° RPPS", "type": "text"}, {"name": "email", "label": "E-mail", "type": "email", "required": true}, {"name": "tel", "label": "Téléphone", "type": "tel"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  const navigate = useNavigate();
  return <ListPage crud={crud} title="Médecins" spec={specs.medecins} demo={demo} cols={cols} icon={Stethoscope}
    onOpenRow={(r) => navigate({ to: "/fiche-medecin/$medecinId", params: { medecinId: String(r._id ?? r.id ?? "demo") } })} />;
}
