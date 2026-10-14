import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, MapPin, ShieldAlert, Save, FileLock2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, DataPanel, Pill, Empty, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { demoPlages, demoGeofences, type Plage } from "@/lib/demo-medical";

export const Route = createFileRoute("/admin/securite")({
  head: () => ({
    meta: [
      { title: "Sécurité d'accès — Kids'Med IA" },
      { name: "description", content: "Plages horaires par rôle, géorepérage des RSAI et alertes d'accès refusés." },
      { property: "og:title", content: "Sécurité d'accès — Kids'Med IA" },
      { property: "og:description", content: "Horaires autorisés, géorepérage et tentatives d'accès." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const jours = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const roleL: Record<string, string> = { creche: "Crèche", rsai: "RSAI", medecin: "Médecin", parent: "Parent" };
const demoAlertes = [
  { user: { prenom: "Inès", nom: "Garcia", role: "rsai" }, motif: "hors_zone", adresse_ip: "92.184.3.7", device: "Samsung Galaxy S22", createdAt: new Date().toISOString() },
  { user: { prenom: "Nadia", nom: "Roux", role: "creche" }, motif: "hors_plage", adresse_ip: "82.64.1.10", device: "Chrome Windows", createdAt: new Date(Date.now() - 864e5).toISOString() },
];
const demoRgpd = [{ type: "effacement", user: { prenom: "Julien", nom: "Bernard" }, statut: "recue", createdAt: new Date().toISOString() }];

function Page() {
  const r = useApiOrDemo<any>(specs.accesRegles, { plages: demoPlages, geofences: demoGeofences });
  const [plages, setPlages] = useState<Plage[]>([]);
  const [geos, setGeos] = useState<any[]>([]);
  useEffect(() => { setPlages(r.data?.plages ?? []); setGeos(r.data?.geofences ?? []); }, [r.data]);
  const upd = (i: number, p: Partial<Plage>) => setPlages((x) => x.map((y, j) => (j === i ? { ...y, ...p } : y)));

  async function save() {
    const res = await send("PUT", specs.accesReglesSet.path, { plages, geofences: geos });
    toast.success(`Règles enregistrées${res.demo ? " (démo)" : ""}`);
  }

  return (
    <DashboardShell role="admin" title="Sécurité d'accès" actions={<Button onClick={save}><Save className="mr-1 h-4 w-4" />Enregistrer</Button>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Plages horaires autorisées" icon={Clock} spec={specs.accesRegles} demo={r.demo} reason={r.reason}>
          <div className="space-y-4">
            {plages.map((p, i) => (
              <div key={p.role} className="rounded-xl border p-3">
                <div className="mb-2 flex items-center justify-between"><span className="font-medium">{roleL[p.role] ?? p.role}</span><Switch checked={p.actif} onCheckedChange={(v) => upd(i, { actif: v })} aria-label={`Activer ${p.role}`} /></div>
                <div className="mb-2 flex flex-wrap gap-1">
                  {jours.map((j, d) => (
                    <button key={j} type="button" onClick={() => upd(i, { jours: p.jours.includes(d) ? p.jours.filter((x) => x !== d) : [...p.jours, d] })}
                      className={`rounded-md border px-2 py-1 text-xs ${p.jours.includes(d) ? "border-primary bg-primary text-primary-foreground" : ""}`}>{j}</button>
                  ))}
                </div>
                <div className="flex items-center gap-2 text-sm"><Input type="time" value={p.debut} onChange={(e) => upd(i, { debut: e.target.value })} className="w-32" />à<Input type="time" value={p.fin} onChange={(e) => upd(i, { fin: e.target.value })} className="w-32" /></div>
              </div>
            ))}
          </div>
        </Panel>
        <Panel title="Géorepérage des crèches" icon={MapPin} spec={specs.accesRegles} demo={r.demo} reason={r.reason}>
          <p className="mb-3 text-sm text-muted-foreground">Les RSAI ne peuvent ouvrir un dossier que lorsqu'elles sont dans ce périmètre.</p>
          {geos.map((g, i) => (
            <div key={g.etablissementId} className="mb-3 rounded-xl border p-3 text-sm">
              <p className="mb-2 font-medium">{g.nom}</p>
              <div className="grid grid-cols-3 gap-2">
                <label>Latitude<Input type="number" step="0.0001" value={g.lat} onChange={(e) => setGeos((x) => x.map((y, j) => (j === i ? { ...y, lat: Number(e.target.value) } : y)))} /></label>
                <label>Longitude<Input type="number" step="0.0001" value={g.lng} onChange={(e) => setGeos((x) => x.map((y, j) => (j === i ? { ...y, lng: Number(e.target.value) } : y)))} /></label>
                <label>Rayon (m)<Input type="number" value={g.rayonM} onChange={(e) => setGeos((x) => x.map((y, j) => (j === i ? { ...y, rayonM: Number(e.target.value) } : y)))} /></label>
              </div>
              <Button size="sm" variant="outline" className="mt-2" onClick={() => navigator.geolocation?.getCurrentPosition((p) => setGeos((x) => x.map((y, j) => (j === i ? { ...y, lat: +p.coords.latitude.toFixed(5), lng: +p.coords.longitude.toFixed(5) } : y))))}><MapPin className="mr-1 h-3 w-3" />Utiliser ma position</Button>
            </div>
          ))}
        </Panel>
        <DataPanel title="Tentatives d'accès refusées" icon={ShieldAlert} spec={specs.accesAlertes} demoData={demoAlertes}>
          {(d) => toList(d).length ? (
            <ul className="space-y-2 text-sm">{toList(d).map((a, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0"><span><strong>{fullName(a.user)}</strong> <span className="text-muted-foreground">({a.user?.role})</span></span><Pill tone="danger">{a.motif === "hors_zone" ? "Hors zone" : "Hors horaires"}</Pill><span className="text-xs text-muted-foreground">{fmtDate(a.createdAt)} · {a.device} · {a.adresse_ip}</span></li>)}</ul>
          ) : <Empty />}
        </DataPanel>
        <DataPanel title="Demandes RGPD" icon={FileLock2} spec={specs.rgpdDemandes} demoData={demoRgpd}>
          {(d) => toList(d).length ? (
            <ul className="space-y-2 text-sm">{toList(d).map((a, i) => <li key={i} className="flex items-center justify-between gap-2"><span>{fullName(a.user)} — {a.type}</span><Pill tone="warning">{a.statut}</Pill></li>)}</ul>
          ) : <Empty />}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
