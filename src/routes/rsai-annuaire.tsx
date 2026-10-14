import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { useState } from "react";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { FormDialog as NoteDialog } from "@/components/dash/crud";
import { Button } from "@/components/ui/button";
import { send } from "@/lib/mutate";
import { getSession, roleToKey } from "@/lib/api";
import { RatingButton } from "@/components/dash/coordination";
import { Link as RouterLink } from "@tanstack/react-router";

function NoteCell({ r }: { r: any }) {
  const [open, setOpen] = useState(false);
  const [m, setM] = useState<{ n: number; c: number }>({ n: r.noteMoyenne ?? 0, c: r.nbAvis ?? 0 });
  const canRate = roleToKey(getSession()?.user.role) === "creche";
  return (
    <span className="flex items-center gap-2">
      <span className="flex items-center gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-3.5 w-3.5 ${i <= Math.round(m.n) ? "fill-warning text-warning" : "text-muted-foreground"}`} />)}</span>
      <span className="text-xs text-muted-foreground">{m.n ? m.n.toFixed(1) : "—"} ({m.c})</span>
      {canRate && <Button size="sm" variant="ghost" onClick={() => setOpen(true)}>Noter</Button>}
      <NoteDialog open={open} onOpenChange={setOpen} title={`Noter ${fullName(r)}`} submitLabel="Publier l'avis"
        fields={[{ name: "note", label: "Note (1 à 5)", type: "select", options: ["5", "4", "3", "2", "1"], required: true }, { name: "commentaire", label: "Commentaire", type: "textarea" }]}
        onSubmit={async (v) => {
          const note = Number(v.note);
          const res = await send("POST", specs.rsaiNoter.path, { note, commentaire: v.commentaire }, { rsaiId: r._id });
          setM((x) => ({ n: (x.n * x.c + note) / (x.c + 1), c: x.c + 1 }));
          toast.success(`Avis publié${res.demo ? " (démo)" : ""}`);
        }} />
    </span>
  );
}

export const Route = createFileRoute("/rsai-annuaire")({
  head: () => ({
    meta: [
      { title: "RSAI — Kids'Med IA" },
      { name: "description", content: 'Référents Santé et Accueil Inclusif.' },
      { property: "og:title", content: "RSAI — Kids'Med IA" },
      { property: "og:description", content: 'Référents Santé et Accueil Inclusif.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{_id:"r1",noteMoyenne:4.6,nbAvis:12,prenom:"Nadia",nom:"Roux",etablissements:["Les Petits Soleils","La Lune Bleue"],email:"n.roux@exemple.fr",tel:"06 00 00 00 03"},{_id:"r2",noteMoyenne:3.9,nbAvis:5,prenom:"Thomas",nom:"Blanc",etablissements:["L'Étoile"],email:"t.blanc@exemple.fr",tel:"06 00 00 00 04"}];
const cols: Col[] = [{label:"RSAI",render:(r)=><span className="font-medium">{fullName(r)}</span>},{label:"Crèches suivies",render:(r)=>(r.etablissements??[]).map((e:any)=>e.nom??e).join(", ")||"—"},{label:"Note",render:(r)=><RatingButton id={r._id} name={fullName(r)} average={r.noteMoyenne} count={r.nbAvis} />},{label:"Contact",render:(r)=><span className="text-muted-foreground">{r.email??"—"} · {r.tel??""}</span>}];

const crud: Crud = {"entity": "un RSAI", "base": "/users", "extra": {"role": "rsai"}, "fields": [{"name": "prenom", "label": "Prénom", "type": "text", "required": true}, {"name": "nom", "label": "Nom", "type": "text", "required": true}, {"name": "email", "label": "E-mail", "type": "email", "required": true}, {"name": "tel", "label": "Téléphone", "type": "tel"}]};

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  const role = roleToKey(getSession()?.user.role);
  const navigate = useNavigate();
  return <ListPage crud={role === "admin" || role === "dev" ? crud : undefined} actions={role === "creche" ? <Button asChild><RouterLink to="/coordination">Demander une RSAI</RouterLink></Button> : undefined} title="RSAI" spec={specs.rsais} demo={demo} cols={cols} icon={HeartPulse}
    onOpenRow={(r) => navigate({ to: "/fiche-rsai/$rsaiId", params: { rsaiId: String(r._id ?? r.id ?? "demo") } })} />;
}
