import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Clock, MapPin, ShieldAlert, Save, RotateCcw, FileLock2, Settings2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, DataPanel, Pill, Empty, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";

export const Route = createFileRoute("/admin/securite")({
  head: () => ({
    meta: [
      { title: "Sécurité d'accès — Kids'Med IA" },
      { name: "description", content: "Horaires et géorepérage par défaut des crèches, surcharges par établissement et alertes d'accès refusés." },
      { property: "og:title", content: "Sécurité d'accès — Kids'Med IA" },
      { property: "og:description", content: "Valeurs par défaut des crèches, géorepérage et tentatives d'accès." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];
const defaultPlages = [1, 2, 3, 4, 5, 6, 7].map((jour) => ({ jour, debut: "08:00", fin: "20:00" }));
const demoDefauts = { rayonMetres: 50, blocageHorsZone: true, plagesHoraires: defaultPlages };
const demoEtablissements = [
  { id: "demo-soleil", nom: "Les Petits Soleils", ville: "Paris", securitePersonnalisee: false, effectif: demoDefauts },
  { id: "demo-etoile", nom: "Les Petits Étoiles", ville: "Lyon", securitePersonnalisee: true, effectif: { rayonMetres: 150, blocageHorsZone: true, plagesHoraires: [1, 2, 3, 4, 5].map((jour) => ({ jour, debut: "07:00", fin: "19:00" })) } },
];
const demoAlertes = [
  { user: { prenom: "Inès", nom: "Garcia", role: "rsai" }, motif: "hors_zone", adresse_ip: "92.184.3.7", device: "Samsung Galaxy S22", createdAt: new Date().toISOString() },
  { user: { prenom: "Nadia", nom: "Roux", role: "creche" }, motif: "hors_plage", adresse_ip: "82.64.1.10", device: "Chrome Windows", createdAt: new Date(Date.now() - 864e5).toISOString() },
];
const demoRgpd = [{ type: "effacement", user: { prenom: "Julien", nom: "Bernard" }, statut: "recue", createdAt: new Date().toISOString() }];

function plagesLabel(plages: { jour: number; debut: string; fin: string }[] | undefined) {
  if (!plages?.length) return "aucune restriction horaire";
  const first = plages[0]!;
  const same = plages.every((p) => p.debut === first.debut && p.fin === first.fin);
  if (!same) return plages.map((p) => `${JOURS[p.jour - 1]} ${p.debut}–${p.fin}`).join(", ");
  if (plages.length === 7) return `tous les jours ${first.debut}–${first.fin}`;
  return `${plages.map((p) => JOURS[p.jour - 1]).join(" ")} ${first.debut}–${first.fin}`;
}

function Page() {
  const qc = useQueryClient();
  const r = useApiOrDemo<any>(specs.accesRegles, { defauts: demoDefauts, etablissements: demoEtablissements });
  const [defauts, setDefauts] = useState(demoDefauts);
  const [etabs, setEtabs] = useState<any[]>(demoEtablissements);
  const [busy, setBusy] = useState(false);
  useEffect(() => {
    if (r.data?.defauts) setDefauts(r.data.defauts);
    if (Array.isArray(r.data?.etablissements)) setEtabs(r.data.etablissements);
  }, [r.data]);

  const updDefaut = (p: Partial<typeof demoDefauts>) => setDefauts((d) => ({ ...d, ...p }));
  const toggleJour = (j: number) => setDefauts((d) => ({
    ...d,
    plagesHoraires: d.plagesHoraires.some((x) => x.jour === j)
      ? d.plagesHoraires.filter((x) => x.jour !== j)
      : [...d.plagesHoraires, { jour: j, debut: "08:00", fin: "20:00" }].sort((a, b) => a.jour - b.jour),
  }));
  const setH = (j: number, k: "debut" | "fin", v: string) => setDefauts((d) => ({
    ...d,
    plagesHoraires: d.plagesHoraires.map((x) => (x.jour === j ? { ...x, [k]: v } : x)),
  }));

  async function saveDefauts() {
    setBusy(true);
    try {
      const res = await send("PUT", specs.accesReglesSet.path, { defauts });
      toast.success(`Valeurs par défaut enregistrées${res.demo ? " (démo)" : ""}`);
      if (!res.demo) {
        qc.invalidateQueries({ queryKey: ["api", specs.accesRegles.id] });
        qc.invalidateQueries({ queryKey: ["api", specs.etabSecurite.id] });
      }
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  async function resetEtab(id: string) {
    setBusy(true);
    try {
      const res = await send("PUT", specs.etabSecuriteSet.path, { utiliserDefauts: true }, { etablissementId: id });
      setEtabs((rows) => rows.map((row) => (row.id === id ? { ...row, securitePersonnalisee: false, effectif: defauts } : row)));
      toast.success(`Valeurs par défaut réappliquées${res.demo ? " (démo)" : ""}`);
      if (!res.demo) qc.invalidateQueries({ queryKey: ["api", specs.accesRegles.id] });
    } catch (e) {
      toast.error((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell role="admin" title="Sécurité d'accès" actions={<Button onClick={saveDefauts} disabled={busy}><Save className="mr-1 h-4 w-4" />Enregistrer les valeurs par défaut</Button>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <Panel title="Valeurs par défaut des crèches" icon={Clock} spec={specs.accesRegles} demo={r.demo} reason={r.reason}>
          <p className="mb-4 text-sm text-muted-foreground">
            Ces valeurs s'appliquent à toutes les crèches qui n'ont pas de réglage personnalisé dans leur fiche.
          </p>
          <div className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="defaut-rayon" className="text-sm font-medium">Rayon par défaut : {defauts.rayonMetres} m</label>
              <div className="flex items-center gap-3">
                <input id="defaut-rayon" type="range" min={10} max={500} step={10} value={defauts.rayonMetres} onChange={(e) => updDefaut({ rayonMetres: Number(e.target.value) })} className="flex-1 accent-[var(--primary)]" />
                <Input type="number" min={10} max={5000} value={defauts.rayonMetres} onChange={(e) => updDefaut({ rayonMetres: Math.max(10, Math.min(5000, Number(e.target.value) || 50)) })} className="w-24" />
              </div>
              <p className="text-xs text-muted-foreground">Recommandé : 50 m. Chaque crèche peut définir son propre rayon dans sa fiche.</p>
            </div>
            <div className="flex items-center justify-between rounded-xl border p-3">
              <div>
                <p className="font-medium">Géorepérage actif par défaut</p>
                <p className="text-xs text-muted-foreground">Une RSAI doit être dans le périmètre pour ouvrir un dossier.</p>
              </div>
              <Switch checked={defauts.blocageHorsZone} onCheckedChange={(v) => updDefaut({ blocageHorsZone: v })} />
            </div>
            <div className="space-y-2">
              <p className="font-medium">Horaires d'accès autorisés par défaut</p>
              <div className="flex flex-wrap gap-1">
                {JOURS.map((label, i) => {
                  const jour = i + 1;
                  const active = defauts.plagesHoraires.some((p) => p.jour === jour);
                  return <Button key={label} type="button" size="sm" variant={active ? "default" : "outline"} onClick={() => toggleJour(jour)}>{label}</Button>;
                })}
              </div>
              {defauts.plagesHoraires.map((p) => (
                <div key={p.jour} className="flex items-center gap-2">
                  <span className="w-10 text-muted-foreground">{JOURS[p.jour - 1]}</span>
                  <Input type="time" value={p.debut} onChange={(e) => setH(p.jour, "debut", e.target.value)} className="w-28" />
                  –
                  <Input type="time" value={p.fin} onChange={(e) => setH(p.jour, "fin", e.target.value)} className="w-28" />
                </div>
              ))}
            </div>
          </div>
        </Panel>

        <Panel title="Crèches — état du géorepérage" icon={MapPin} spec={specs.accesRegles} demo={r.demo} reason={r.reason}>
          <p className="mb-3 text-sm text-muted-foreground">
            Une crèche sans réglage personnalisé utilise les valeurs par défaut ci-contre. Ouvrez sa fiche pour modifier son rayon ou ses horaires.
          </p>
          {etabs.length === 0 ? <Empty /> : (
            <ul className="space-y-2 text-sm">
              {etabs.map((e) => (
                <li key={e.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border p-3">
                  <div className="min-w-0">
                    <p className="font-medium">{e.nom}{e.ville ? <span className="ml-2 text-xs font-normal text-muted-foreground">{e.ville}</span> : null}</p>
                    <p className="text-xs text-muted-foreground">
                      {e.effectif?.rayonMetres ?? 50} m · {plagesLabel(e.effectif?.plagesHoraires)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Pill tone={e.securitePersonnalisee ? "warning" : "success"}>{e.securitePersonnalisee ? "Personnalisé" : "Défaut"}</Pill>
                    <Button size="sm" variant="outline" asChild><Link to="/etablissements/$etablissementId" params={{ etablissementId: e.id }}><Settings2 className="mr-1 h-3.5 w-3.5" />Configurer</Link></Button>
                    {e.securitePersonnalisee && <Button size="sm" variant="ghost" onClick={() => resetEtab(e.id)} disabled={busy}><RotateCcw className="mr-1 h-3.5 w-3.5" />Défauts</Button>}
                  </div>
                </li>
              ))}
            </ul>
          )}
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
