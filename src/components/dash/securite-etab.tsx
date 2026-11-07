import { useState } from "react";
import { ShieldCheck, Loader2, Plus, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Panel } from "./widgets";
import { AddressInput, type AddressPick } from "./address";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { specs } from "@/lib/specs";
import { useApiOrDemo } from "@/lib/use-api";
import { send } from "@/lib/mutate";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

const demoDefauts = {
  rayonMetres: 50,
  blocageHorsZone: true,
  plagesHoraires: [1, 2, 3, 4, 5, 6, 7].map((jour) => ({ jour, debut: "08:00", fin: "20:00" })),
};

const demo = {
  adresse: "12 rue des Lilas, 69003 Lyon",
  latitude: 45.7578,
  longitude: 4.8461,
  rayonMetres: 50,
  blocageHorsZone: true,
  plagesHoraires: demoDefauts.plagesHoraires,
  ipsAutorisees: [] as string[],
  securitePersonnalisee: false,
  defauts: demoDefauts,
  effectif: demoDefauts,
};

export function SecuriteEtab({ etablissementId }: { etablissementId: string }) {
  const r = useApiOrDemo<any>(specs.etabSecurite, demo, { etablissementId });
  return <Panel title="Sécurité & géorepérage" icon={ShieldCheck} spec={specs.etabSecurite} demo={r.demo} reason={r.reason}>
    <Form key={JSON.stringify(r.data)} init={{ ...demo, ...(r.data ?? {}) }} etablissementId={etablissementId} />
  </Panel>;
}

function plagesLabel(plages: { jour: number; debut: string; fin: string }[]) {
  if (!plages?.length) return "aucune restriction horaire";
  const first = plages[0]!;
  const same = plages.every((p) => p.debut === first.debut && p.fin === first.fin);
  if (!same) return plages.map((p) => `${JOURS[p.jour - 1]} ${p.debut}–${p.fin}`).join(", ");
  if (plages.length === 7) return `tous les jours ${first.debut}–${first.fin}`;
  return `${plages.map((p) => JOURS[p.jour - 1]).join(" ")} ${first.debut}–${first.fin}`;
}

function Form({ init, etablissementId }: { init: typeof demo; etablissementId: string }) {
  const qc = useQueryClient();
  const defauts = init.defauts ?? demoDefauts;
  const effectif = init.effectif ?? {
    rayonMetres: init.rayonMetres ?? defauts.rayonMetres,
    blocageHorsZone: init.blocageHorsZone ?? defauts.blocageHorsZone,
    plagesHoraires: init.plagesHoraires ?? defauts.plagesHoraires,
  };
  const [adr, setAdr] = useState<{ label: string; latitude: number; longitude: number } | null>(init.latitude ? { label: init.adresse ?? "", latitude: init.latitude, longitude: init.longitude } : null);
  const [rayon, setRayon] = useState(Number(effectif.rayonMetres ?? defauts.rayonMetres));
  const [bloc, setBloc] = useState(!!effectif.blocageHorsZone);
  const [plages, setPlages] = useState<any[]>(effectif.plagesHoraires ?? defauts.plagesHoraires);
  const [ips, setIps] = useState<string[]>(init.ipsAutorisees ?? []);
  const [ip, setIp] = useState("");
  const [busy, setBusy] = useState(false);
  const [custom, setCustom] = useState(!!init.securitePersonnalisee);

  const toggleJour = (j: number) => setPlages((p) => p.some((x) => x.jour === j) ? p.filter((x) => x.jour !== j) : [...p, { jour: j, debut: "08:00", fin: "20:00" }].sort((a, b) => a.jour - b.jour));
  const setH = (j: number, k: "debut" | "fin", v: string) => setPlages((p) => p.map((x) => (x.jour === j ? { ...x, [k]: v } : x)));

  function invalidate() {
    qc.invalidateQueries({ queryKey: ["api", specs.etabSecurite.id] });
    qc.invalidateQueries({ queryKey: ["api", specs.accesRegles.id] });
  }

  async function save() {
    setBusy(true);
    try {
      const res = await send("PUT", specs.etabSecuriteSet.path, {
        adresse: adr?.label,
        latitude: adr?.latitude,
        longitude: adr?.longitude,
        rayonMetres: rayon,
        blocageHorsZone: bloc,
        plagesHoraires: plages,
        ipsAutorisees: ips,
        securitePersonnalisee: true,
      }, { etablissementId });
      setCustom(true);
      toast.success(`Règles de sécurité enregistrées${res.demo ? " (démo)" : ""}`);
      if (!res.demo) invalidate();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  async function resetDefauts() {
    setBusy(true);
    try {
      const res = await send("PUT", specs.etabSecuriteSet.path, { utiliserDefauts: true }, { etablissementId });
      setCustom(false);
      setRayon(Number(defauts.rayonMetres));
      setBloc(!!defauts.blocageHorsZone);
      setPlages(defauts.plagesHoraires);
      toast.success(`Valeurs par défaut appliquées${res.demo ? " (démo)" : ""}`);
      if (!res.demo) invalidate();
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }

  return (
    <div className="space-y-5 text-sm">
      <div className={`rounded-xl border p-3 ${custom ? "border-primary/40 bg-primary/5" : "border-dashed"}`}>
        <p className="font-medium">{custom ? "Valeurs personnalisées pour cette crèche" : "Valeurs par défaut de la plateforme"}</p>
        <p className="mt-1 text-xs text-muted-foreground">
          {custom
            ? "Cette crèche n'utilise pas les valeurs globales. Vous pouvez revenir aux défauts à tout moment."
            : `Rayon ${defauts.rayonMetres} m · ${plagesLabel(defauts.plagesHoraires)}. Modifiez puis enregistrez pour personnaliser cette crèche.`}
        </p>
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="secu-adr">Adresse de la crèche (centre du périmètre)</Label>
        <AddressInput id="secu-adr" defaultValue={init.adresse ?? ""} onPick={(a: AddressPick | null) => a && setAdr(a)} />
        {adr && <iframe title="Carte du périmètre" className="h-56 w-full rounded-xl border" loading="lazy" src={`https://www.openstreetmap.org/export/embed.html?bbox=${adr.longitude - rayon / 70000},${adr.latitude - rayon / 111000},${adr.longitude + rayon / 70000},${adr.latitude + rayon / 111000}&layer=mapnik&marker=${adr.latitude},${adr.longitude}`} />}
        <p className="text-xs text-muted-foreground">{adr ? `GPS : ${adr.latitude.toFixed(5)}, ${adr.longitude.toFixed(5)}` : "Aucune position GPS : choisissez une adresse dans la liste."}</p>
      </div>
      <div className="space-y-1.5">
        <Label htmlFor="secu-rayon">Rayon autorisé : {rayon} m</Label>
        <input id="secu-rayon" type="range" min={50} max={2000} step={10} value={rayon} onChange={(e) => setRayon(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
      </div>
      <div className="flex items-center justify-between rounded-xl border p-3">
        <div><p className="font-medium">Bloquer l'accès aux dossiers hors zone ou hors horaires</p><p className="text-xs text-muted-foreground">Les tentatives refusées sont journalisées et signalées à l'admin.</p></div>
        <Switch checked={bloc} onCheckedChange={setBloc} />
      </div>
      <div className="space-y-2">
        <p className="font-medium">Horaires d'accès autorisés</p>
        <div className="flex flex-wrap gap-1">{JOURS.map((l, i) => { const j = i + 1; const on = plages.some((x) => x.jour === j); return <Button key={l} type="button" size="sm" variant={on ? "default" : "outline"} onClick={() => toggleJour(j)}>{l}</Button>; })}</div>
        {plages.map((p) => (
          <div key={p.jour} className="flex items-center gap-2"><span className="w-10 text-muted-foreground">{JOURS[p.jour - 1]}</span>
            <Input type="time" value={p.debut} onChange={(e) => setH(p.jour, "debut", e.target.value)} className="w-28" />–
            <Input type="time" value={p.fin} onChange={(e) => setH(p.jour, "fin", e.target.value)} className="w-28" /></div>
        ))}
      </div>
      <div className="space-y-2">
        <p className="font-medium">Adresses IP autorisées (optionnel)</p>
        <div className="flex gap-2"><Input value={ip} onChange={(e) => setIp(e.target.value)} placeholder="ex. 82.64.12.5" /><Button type="button" variant="outline" onClick={() => { if (ip.trim()) { setIps([...ips, ip.trim()]); setIp(""); } }}><Plus className="h-4 w-4" /></Button></div>
        {ips.map((x) => <div key={x} className="flex items-center justify-between rounded-md bg-muted px-2 py-1 font-mono text-xs">{x}<Button size="icon" variant="ghost" onClick={() => setIps(ips.filter((y) => y !== x))}><Trash2 className="h-3.5 w-3.5" /></Button></div>)}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={save} disabled={busy}>{busy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Enregistrer les règles</Button>
        {custom && <Button variant="outline" onClick={resetDefauts} disabled={busy}><RotateCcw className="mr-1 h-4 w-4" />Revenir aux valeurs par défaut</Button>}
      </div>
    </div>
  );
}
