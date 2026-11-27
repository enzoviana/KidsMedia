import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { HeartPulse, MapPin, Star } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { type Crud } from "@/components/dash/crud";
import { Pill, fullName } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { send } from "@/lib/mutate";
import { getSession, roleToKey } from "@/lib/api";
import { RatingButton } from "@/components/dash/coordination";
import { departementLabel, estDisponible, peutNoterRsai, rsaiLocalisation } from "@/lib/rsai";
import { Link as RouterLink } from "@tanstack/react-router";

/**
 * Étoile de référente placée devant le nom : toujours visible si le statut est
 * actif, sinon révélée au survol pour l'administration (aucun fond coloré).
 */
function ReferenteName({ r }: { r: any }) {
  const [referente, setReferente] = useState(!!r.referente);
  const canToggle = ["admin", "dev"].includes(roleToKey(getSession()?.user.role) ?? "");
  if (!canToggle && !referente) return <span className="font-medium">{fullName(r)}</span>;
  return (
    <span className="group/name inline-flex items-center gap-1.5 font-medium">
      <button type="button" disabled={!canToggle}
        title={canToggle ? (referente ? "Retirer le statut de référente" : "Désigner comme référente de secteur") : "Référente de secteur"}
        aria-label={referente ? "Référente de secteur" : "Désigner comme référente de secteur"}
        onClick={async (e) => {
          e.stopPropagation();
          if (!canToggle) return;
          try {
            const res = await send("PATCH", specs.userReferente.path, { referente: !referente }, { userId: String(r._id ?? r.id) });
            setReferente(!referente);
            toast.success(`${!referente ? "RSAI désignée référente" : "Statut de référente retiré"}${res.demo ? " (démo)" : ""}`);
          } catch (err) { toast.error((err as Error).message); }
        }}
        className={`shrink-0 rounded p-0.5 transition-opacity ${referente ? "opacity-100" : "opacity-0 group-hover/row:opacity-70 group-hover/name:opacity-70 focus-visible:opacity-100"} ${canToggle ? "cursor-pointer" : "cursor-default"}`}>
        <Star className={`h-4 w-4 ${referente ? "fill-warning text-warning" : "text-muted-foreground"}`} />
      </button>
      {fullName(r)}
    </span>
  );
}

const localisation = (r: any) => rsaiLocalisation(r);

export const Route = createFileRoute("/rsai-annuaire")({
  head: () => ({
    meta: [
      { title: "RSAI — Kids'Med IA" },
      { name: "description", content: "Référents Santé et Accueil Inclusif de votre région." },
      { property: "og:title", content: "RSAI — Kids'Med IA" },
      { property: "og:description", content: "Trouver une RSAI proche de votre crèche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  { _id: "r1", noteMoyenne: 4.6, nbAvis: 12, prenom: "Nadia", nom: "Roux", departement: "75", missionsTerminees: 4, peutNoter: true, referente: true, missionEnCours: false, email: "n.roux@exemple.fr", tel: "06 00 00 00 03" },
  { _id: "r2", noteMoyenne: 3.9, nbAvis: 5, prenom: "Thomas", nom: "Blanc", departement: "75", missionsTerminees: 0, peutNoter: false, referente: false, missionEnCours: true, email: "t.blanc@exemple.fr", tel: "06 00 00 00 04" },
];

const cols: Col[] = [
  { label: "RSAI", render: (r) => <ReferenteName r={r} /> },
  { label: "Département", render: (r) => <span className="flex flex-wrap items-center gap-1 text-muted-foreground"><MapPin className="h-3.5 w-3.5" />{localisation(r)}{departementLabel(r) === "—" && <Pill tone="warning">département non renseigné</Pill>}</span> },
  { label: "Disponibilité", render: (r) => { const dispo = estDisponible(r); return dispo == null ? <span className="text-muted-foreground">—</span> : <Pill tone={dispo ? "success" : "warning"}>{dispo ? "Disponible" : "En mission"}</Pill>; } },
  { label: "Missions terminées", render: (r) => r.missionsTerminees ?? 0 },
  { label: "Note", render: (r) => <RatingButton id={r._id} name={fullName(r)} average={r.noteMoyenne} count={r.nbAvis} canRate={peutNoterRsai(r)} /> },
  { label: "Contact", render: (r) => <span className="text-muted-foreground">{r.email ?? "—"} · {r.tel ?? ""}</span> },
];

const crud: Crud = {
  entity: "une RSAI",
  base: "/users",
  extra: { role: "rsai" },
  fields: [
    { name: "prenom", label: "Prénom", type: "text", required: true },
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "telephone", label: "Téléphone", type: "tel" },
    { name: "qualification", label: "Qualification", type: "text" },
    { name: "departement", label: "Département", type: "text" },
    { name: "presentation", label: "Présentation", type: "textarea" },
    { name: "experienceAnnees", label: "Années d'expérience", type: "number" },
  ],
};

function Page() {
  void Link;
  const role = roleToKey(getSession()?.user.role);
  const navigate = useNavigate();
  const spec = role === "creche" ? specs.rsaisAlentours : specs.rsais;
  return (
    <ListPage
      crud={role === "admin" || role === "dev" ? crud : undefined}
      actions={role === "creche" ? <Button asChild><RouterLink to="/coordination">Demander une RSAI</RouterLink></Button> : undefined}
      title="RSAI"
      spec={spec}
      demo={demo}
      cols={cols}
      icon={HeartPulse}
      before={role === "creche" ? (
        <div className="rounded-2xl border bg-card p-4 text-sm text-card-foreground shadow-sm">
          <p className="flex items-center gap-2 font-medium"><MapPin className="h-4 w-4 text-primary" />RSAI de votre région, triées par distance</p>
          <p className="mt-1 text-muted-foreground">Les RSAI de la même région sont affichées en premier. Les fiches importées dont la région n'est pas encore renseignée suivent, signalées « région non renseignée » ; l'administration peut compléter leur fiche. Cliquez sur une ligne pour consulter le détail.</p>
        </div>
      ) : undefined}
      onOpenRow={(r) => navigate({ to: "/fiche-rsai/$rsaiId", params: { rsaiId: String(r._id ?? r.id ?? "demo") } })}
    />
  );
}
