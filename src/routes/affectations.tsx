import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { MapPinned, Clock, MapPin, CheckCircle2, XCircle, Baby } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, Pill } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { getSession, toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { demoAffectations, accesRsai, type Affectation } from "@/lib/demo-medical";
import { RatingButton } from "@/components/dash/coordination";
import { useCoordination } from "@/lib/coordination";

export const Route = createFileRoute("/affectations")({
  head: () => ({
    meta: [
      { title: "Mes affectations — RSAI — Kids'Med IA" },
      { name: "description", content: "Les crèches où vous êtes affectée, vos horaires et votre droit d'accès en ce moment." },
      { property: "og:title", content: "Mes affectations — Kids'Med IA" },
      { property: "og:description", content: "Crèches, horaires et accès aux dossiers pour les RSAI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const jours = ["Dimanche", "Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi"];

/** Accepte les formats serveur (horaires[] ou jours/debut/fin, creche ou etablissement, valeurs nulles). */
function normalize(a: any, i: number): Affectation {
  const e = a?.etablissement ?? a?.creche ?? {};
  const debut = a?.debut ?? a?.heureDebut ?? "08:00";
  const fin = a?.fin ?? a?.heureFin ?? "18:00";
  const rawJours = Array.isArray(a?.jours) ? a.jours : typeof a?.jours === "string" ? a.jours.split(",") : [];
  const horaires = Array.isArray(a?.horaires) ? a.horaires : rawJours.map((j: any) => ({ jour: Number(j), debut, fin }));
  return {
    etablissement: {
      _id: String(e._id ?? e.id ?? a?.etablissementId ?? a?.crecheId ?? `aff-${i}`),
      nom: e.nom ?? e.name ?? "Crèche",
      adresse: typeof e.adresse === "string" ? e.adresse : e.adresse?.rue ?? "",
      lat: Number(e.lat ?? e.latitude ?? 0), lng: Number(e.lng ?? e.longitude ?? 0), rayonM: Number(e.rayonM ?? 150),
    },
    horaires,
    enfants: a?.enfants,
  };
}

function Page() {
  const r = useApiOrDemo<unknown>(specs.rsaiAffectations, demoAffectations);
  const store = useCoordination();
  const mapped = store.affectations.filter((a) => a.statut === "active").map((a): Affectation | null => {
    const base = demoAffectations.find((d) => d.etablissement._id === a.etablissement?._id) ?? demoAffectations[0];
    if (!base) return null;
    return { ...base, etablissement: { ...base.etablissement, ...a.etablissement }, horaires: a.jours.map((jour: number) => ({ jour, debut: a.debut, fin: a.fin })) };
  }).filter((a): a is Affectation => a !== null);
  const list = r.demo ? mapped : toList(r.data).map(normalize);
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null);
  const [sim, setSim] = useState<string | null>(null); // démo : id de la crèche où l'on « est »
  const demo = !!getSession()?.demo;

  useEffect(() => {
    if (demo || !("geolocation" in navigator)) return;
    navigator.geolocation.getCurrentPosition((p) => setPos({ lat: p.coords.latitude, lng: p.coords.longitude }), () => setPos(null));
  }, [demo]);

  const now = new Date();
  return (
    <DashboardShell role="rsai" title="Mes affectations">
      {demo && (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-xs">
          <span className="font-medium">Démo — je suis actuellement :</span>
          <Button size="sm" variant={sim === null ? "default" : "outline"} onClick={() => setSim(null)}>Hors de toute crèche</Button>
          {list.map((a) => <Button key={a.etablissement._id} size="sm" variant={sim === a.etablissement._id ? "default" : "outline"} onClick={() => setSim(a.etablissement._id)}><MapPin className="mr-1 h-3 w-3" />{a.etablissement.nom}</Button>)}
        </div>
      )}
      <div className="grid gap-4 lg:grid-cols-2">
        {list.map((a) => {
          const p = demo ? (sim === a.etablissement._id ? { lat: a.etablissement.lat, lng: a.etablissement.lng } : null) : pos;
          // En démo, on considère qu'on est dans ses horaires si l'on se place sur le site.
          const res = demo ? (p ? { ok: true } : { ok: false, motif: "hors_zone" as const }) : accesRsai(a, now, p);
          return (
            <Panel key={a.etablissement._id} title={a.etablissement.nom} icon={MapPinned} spec={specs.rsaiAffectations} demo={r.demo} reason={r.reason}>
              <p className="mb-3 text-sm text-muted-foreground">{a.etablissement.adresse} · périmètre {a.etablissement.rayonM} m</p>
              <div className={`mb-4 flex items-center gap-3 rounded-xl border-2 p-3 ${res.ok ? "border-success bg-success/10" : "border-destructive/50 bg-destructive/5"}`}>
                {res.ok ? <CheckCircle2 className="h-5 w-5 text-success" /> : <XCircle className="h-5 w-5 text-destructive" />}
                <div className="text-sm">
                  <p className="font-semibold">{res.ok ? "Accès aux dossiers autorisé maintenant" : "Accès aux dossiers bloqué"}</p>
                  {!res.ok && <p className="text-muted-foreground">{res.motif === "hors_plage" ? "Vous êtes en dehors de vos horaires de travail ici." : "Vous n'êtes pas sur place."}</p>}
                </div>
              </div>
              <p className="mb-2 flex items-center gap-1.5 text-xs uppercase tracking-wider text-muted-foreground"><Clock className="h-3 w-3" />Mes horaires</p>
              <ul className="mb-4 space-y-1 text-sm">
                {a.horaires.map((h, i) => <li key={i} className="flex justify-between"><span>{jours[h.jour]}</span><span className="flex items-center gap-2">{h.jour === now.getDay() && <Pill tone="success">Aujourd'hui</Pill>}<span className="font-medium">{h.debut} – {h.fin}</span></span></li>)}
              </ul>
              <Button size="sm" disabled={!res.ok} asChild={res.ok}>
                {res.ok ? <Link to="/enfants"><Baby className="mr-1 h-4 w-4" />Voir les {a.enfants ?? ""} enfants</Link> : <span><Baby className="mr-1 h-4 w-4" />Dossiers verrouillés</span>}
              </Button>
              <div className="mt-3"><RatingButton target="etablissement" id={a.etablissement._id} name={a.etablissement.nom} /></div>
            </Panel>
          );
        })}
      </div>
    </DashboardShell>
  );
}
