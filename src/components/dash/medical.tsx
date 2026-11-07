import { SecurityBlockedScreen } from "./security-blocked";
import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Syringe, ShieldCheck, Plus, Eye, MapPin, Clock, Lock, FileLock2, Sparkles, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Panel, Pill, Empty, fullName, fmtDate } from "./widgets";
import { FormDialog } from "./crud";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { toList, getSession, roleToKey } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { vaccinsObligatoires, demoVaccins, consentTypes, demoConsentements, demoPlages, dansPlage, deviceName } from "@/lib/demo-medical";

/* ---------------- Carnet vaccinal ---------------- */
export function VaccinPanel({ enfantId }: { enfantId: string }) {
  const r = useApiOrDemo<unknown>(specs.vaccins, demoVaccins, { enfantId });
  const [extra, setExtra] = useState<any[]>([]);
  const [open, setOpen] = useState(false);
  const all = [...extra, ...toList(r.data)];
  const now = Date.now();
  return (
    <Panel title="Carnet vaccinal (11 vaccins obligatoires)" icon={Syringe} spec={specs.vaccins} demo={r.demo} reason={r.reason}
      actions={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Injection</Button>}>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-2">Vaccin</th><th>Doses</th><th>Dernière injection</th><th>Prescripteur</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {vaccinsObligatoires.map((v) => {
              const inj = all.filter((x) => x.nom === v.nom).sort((a, b) => String(b.date).localeCompare(String(a.date)));
              const last = inj[0];
              const rappel = inj.find((x) => x.rappel)?.rappel;
              const soon = rappel && new Date(rappel).getTime() - now < 30 * 864e5;
              const tone = inj.length >= v.doses.length ? "success" : soon ? "warning" : inj.length ? "default" : "danger";
              const label = inj.length >= v.doses.length ? "À jour" : soon ? `Rappel ${fmtDate(rappel)}` : inj.length ? "En cours" : "Non fait";
              return (
                <tr key={v.nom} className="border-t">
                  <td className="py-2 font-medium">{v.nom}</td>
                  <td>{inj.length}/{v.doses.length} <span className="text-xs text-muted-foreground">({v.doses.join(", ")})</span></td>
                  <td>{last ? fmtDate(last.date) : "—"}</td>
                  <td>{last ? fullName(last.medecin) : "—"}</td>
                  <td><Pill tone={tone}>{label}</Pill></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <FormDialog open={open} onOpenChange={setOpen} title="Ajouter une injection"
        fields={[
          { name: "nom", label: "Vaccin", type: "select", options: vaccinsObligatoires.map((v) => v.nom), required: true },
          { name: "dose", label: "Dose n°", type: "number", required: true },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "medecin", label: "Médecin prescripteur", lookup: "medecin", required: true },
          { name: "lot", label: "N° de lot", type: "text" },
          { name: "rappel", label: "Date de rappel", type: "date" },
        ]}
        onSubmit={async (v) => {
          const res = await send("POST", specs.vaccinAdd.path, v, { enfantId });
          setExtra((x) => [{ ...v, medecin: { _id: v.medecin } }, ...x]);
          toast.success(res.demo ? "Injection ajoutée (démo)" : "Injection ajoutée");
        }} />
    </Panel>
  );
}

/* ---------------- Consentements & RGPD ---------------- */
export function ConsentPanel({ enfantId }: { enfantId: string }) {
  const r = useApiOrDemo<unknown>(specs.consentements, demoConsentements, { enfantId });
  const [over, setOver] = useState<Record<string, boolean>>({});
  const list = toList(r.data);
  const isParent = roleToKey(getSession()?.user.role) === "parent" || getSession()?.demo;
  return (
    <Panel title="Consentements parentaux" icon={ShieldCheck} spec={specs.consentements} demo={r.demo} reason={r.reason} actions={<RgpdButton enfantId={enfantId} />}>
      <ul className="space-y-3 text-sm">
        {consentTypes.map((c) => {
          const row = list.find((x) => x.type === c.type);
          const val = over[c.type] ?? row?.accorde ?? false;
          return (
            <li key={c.type} className="flex items-center justify-between gap-3">
              <div>
                <p className="font-medium">{c.label}</p>
                <p className="text-xs text-muted-foreground">{row ? `Signé par ${fullName(row.signePar)} le ${fmtDate(row.date)}` : "Non renseigné"}</p>
              </div>
              <Switch checked={val} disabled={!isParent} aria-label={c.label} onCheckedChange={async (accorde) => {
                const res = await send("PUT", specs.consentementSet.path, { accorde, signature: fullName(getSession()?.user) }, { enfantId, type: c.type });
                setOver((o) => ({ ...o, [c.type]: accorde }));
                toast.success(`${accorde ? "Consentement accordé" : "Consentement retiré"}${res.demo ? " (démo)" : ""}`);
              }} />
            </li>
          );
        })}
      </ul>
    </Panel>
  );
}

export function RgpdButton({ enfantId }: { enfantId?: string }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><FileLock2 className="mr-1 h-4 w-4" />Droits RGPD</Button>
      <FormDialog open={open} onOpenChange={setOpen} title="Exercer mes droits RGPD" description="La demande est traitée sous 30 jours maximum."
        fields={[
          { name: "type", label: "Type de demande", type: "select", options: ["acces", "rectification", "effacement", "anonymisation"], required: true },
          { name: "motif", label: "Précisions", type: "textarea" },
        ]}
        submitLabel="Envoyer la demande"
        onSubmit={async (v) => {
          const res = await send("POST", specs.rgpdEffacement.path, { ...v, enfantId });
          toast.success(`Demande envoyée${res.demo ? " (démo)" : ""}`);
        }} />
    </>
  );
}

/* ---------------- Historique des accès au dossier ---------------- */
const demoAcces = [
  { utilisateur: { prenom: "Inès", nom: "Garcia", role: "rsai" }, action: "consultation_dossier", date: new Date().toISOString(), adresse_ip: "82.64.1.10", device: "Samsung Galaxy S22" },
  { utilisateur: { prenom: "Dr Paul", nom: "Moreau", role: "medecin" }, action: "modification_dossier", date: new Date(Date.now() - 864e5).toISOString(), adresse_ip: "90.12.4.8", device: "Chrome macOS" },
  { utilisateur: { prenom: "Claire", nom: "Martin", role: "parent" }, action: "consultation_dossier", date: new Date(Date.now() - 2 * 864e5).toISOString(), adresse_ip: "78.1.2.3", device: "iPhone" },
];
export function AccesHistorique({ enfantId }: { enfantId: string }) {
  const r = useApiOrDemo<unknown>(specs.logsEnfant, demoAcces, { enfantId });
  const list = toList(r.data);
  return (
    <Panel title="Qui a consulté ce dossier" icon={Eye} spec={specs.logsEnfant} demo={r.demo} reason={r.reason}>
      {list.length ? (
        <ul className="space-y-2 text-sm">
          {list.map((l, i) => (
            <li key={i} className="flex flex-wrap items-center justify-between gap-2 border-b pb-2 last:border-0">
              <span><strong>{fullName(l.utilisateur)}</strong> <span className="text-muted-foreground">({l.utilisateur?.role})</span></span>
              <Pill tone={l.action === "modification_dossier" ? "warning" : l.action === "acces_refuse" ? "danger" : "default"}>{String(l.action).replace("_", " ")}</Pill>
              <span className="text-xs text-muted-foreground">{fmtDate(l.date)} · {l.device} · {l.adresse_ip}</span>
            </li>
          ))}
        </ul>
      ) : <Empty />}
    </Panel>
  );
}

/* ---------------- Contrôle d'accès (horaires + géorepérage) ---------------- */
type Etat = { ok: boolean; motif?: "hors_plage" | "hors_zone"; detail?: string } | null;

export function AccessGuard({ enfantId, children }: { enfantId: string; children: ReactNode }) {
  const s = getSession();
  const role = roleToKey(s?.user.role);
  const concerne = role === "creche" || role === "rsai";
  const [etat, setEtat] = useState<Etat>(null);
  const [simHors, setSimHors] = useState<"none" | "plage" | "zone">("none");
  const [retry, setRetry] = useState(0);

  useEffect(() => {
    if (!concerne) { setEtat({ ok: true }); return; }
    let cancel = false;

    // Mode démo : simulation locale, sans appel serveur.
    if (s?.demo) {
      const plage = demoPlages.find((p) => p.role === role);
      const horsPlage = simHors === "plage" || (plage ? !dansPlage(plage, new Date()) : false);
      if (horsPlage) { setEtat({ ok: false, motif: "hors_plage", detail: `Plage autorisée : ${plage?.debut} – ${plage?.fin}.` }); return; }
      if (role === "rsai" && simHors === "zone") { setEtat({ ok: false, motif: "hors_zone", detail: "Vous êtes à 2,4 km de la crèche (rayon autorisé : 50 m)." }); return; }
      setEtat({ ok: true });
      return;
    }

    async function check(lat?: number, lng?: number) {
      try {
        const r = await send<{ autorise?: boolean; motif?: string; distanceM?: number; rayonMetres?: number }>("POST", specs.accesCheck.path, { enfantId, lat, lng, device: deviceName() });
        if (cancel) return;
        const d = r.data ?? {};
        if (d.autorise) { setEtat({ ok: true }); return; }
        const detail = d.motif === "hors_plage"
          ? "Accès en dehors des horaires autorisés de la crèche."
          : d.distanceM != null
            ? `Vous êtes à ${Math.round(d.distanceM)} m de la crèche (rayon autorisé : ${d.rayonMetres ?? "?"} m).`
            : "Accès hors du périmètre de la crèche.";
        setEtat({ ok: false, motif: d.motif === "hors_plage" ? "hors_plage" : "hors_zone", detail });
      } catch (e) {
        if (!cancel) setEtat({ ok: false, motif: "hors_zone", detail: (e as Error).message });
      }
    }

    if (role === "rsai") {
      if (!("geolocation" in navigator)) {
        setEtat({ ok: false, motif: "hors_zone", detail: "Géolocalisation indisponible : l'accès RSAI exige d'être sur place." });
        return;
      }
      navigator.geolocation.getCurrentPosition(
        (pos) => { void check(pos.coords.latitude, pos.coords.longitude); },
        () => { if (!cancel) setEtat({ ok: false, motif: "hors_zone", detail: "Position refusée : l'accès RSAI exige d'être sur place." }); },
        { timeout: 10_000 },
      );
    } else {
      // Crèche : le serveur vérifie les horaires (et la zone si une position est fournie).
      void check();
    }
    return () => { cancel = true; };
  }, [concerne, role, simHors, enfantId, s?.demo, retry]);

  const sim = concerne && s?.demo && (
    <div className="mb-4 flex flex-wrap items-center gap-2 rounded-xl border border-dashed p-3 text-xs">
      <span className="font-medium">Démo contrôle d'accès :</span>
      <Button size="sm" variant={simHors === "none" ? "default" : "outline"} onClick={() => setSimHors("none")}><MapPin className="mr-1 h-3 w-3" />Sur place</Button>
      <Button size="sm" variant={simHors === "plage" ? "default" : "outline"} onClick={() => setSimHors("plage")}><Clock className="mr-1 h-3 w-3" />Hors horaires</Button>
      {role === "rsai" && <Button size="sm" variant={simHors === "zone" ? "default" : "outline"} onClick={() => setSimHors("zone")}><MapPin className="mr-1 h-3 w-3" />Hors zone</Button>}
    </div>
  );

  if (concerne && etat === null) {
    return <div className="flex items-center justify-center gap-2 p-10 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Vérification de l'accès…</div>;
  }
  if (etat && !etat.ok) {
    return (
      <>
        <div className="relative z-[101]">{sim}</div>
        <SecurityBlockedScreen block={{ motif: etat.motif ?? "securite", message: etat.detail ?? "" }} onRetry={() => { setSimHors("none"); setRetry((x) => x + 1); }} />
      </>
    );
  }
  return <>{sim}{children}</>;
}

export function SignalerButton({ enfantId }: { enfantId: string }) {
  return <Button variant="outline" asChild><Link to="/analyse-ia" search={{ enfant: enfantId }}><Sparkles className="mr-1 h-4 w-4" />Signaler un symptôme</Link></Button>;
}
