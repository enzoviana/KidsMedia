import { SecurityBlockedScreen } from "./security-blocked";
import { useEffect, useState, type ReactNode } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Syringe, ShieldCheck, Plus, Eye, MapPin, Clock, Lock, FileLock2, Sparkles, Loader2, Siren } from "lucide-react";
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
import { SOS_MAX_SCANS, sosExpiresLabel, sosStatutLabel } from "@/lib/sos";

/* ---------------- Carnet vaccinal & vaccins exigés ---------------- */
const demoReferences = vaccinsObligatoires.map((v, i) => {
  const injections = demoVaccins.filter((x) => x.nom === v.nom);
  return { _id: `ref-${i}`, nom: v.nom, niveau: "obligatoire", dosesAttendues: v.doses.length, doses: injections.length, aJour: injections.length >= v.doses.length, manquant: injections.length < v.doses.length, portee: "nationale" };
});
const demoVaccinData = {
  references: demoReferences,
  injections: demoVaccins,
  bilan: {
    obligatoiresTotal: demoReferences.length,
    obligatoiresAJour: demoReferences.filter((r) => r.aJour).length,
    obligatoiresManquants: demoReferences.filter((r) => !r.aJour).length,
    recommandesTotal: 0,
    recommandesFaits: 0,
    aJour: demoReferences.every((r) => r.aJour),
  },
};

export function VaccinPanel({ enfantId }: { enfantId: string }) {
  const qc = useQueryClient();
  const r = useApiOrDemo<any>(specs.vaccinsReferenceEnfant, demoVaccinData, { enfantId }, { fallbackToDemo: !!getSession()?.demo });
  const [open, setOpen] = useState(false);
  const data = r.data ?? demoVaccinData;
  const references = Array.isArray(data.references) ? data.references : [];
  const injections = Array.isArray(data.injections) ? data.injections : [];
  const bilan = { ...demoVaccinData.bilan, ...(data.bilan ?? {}) };
  bilan.obligatoiresTotal = Number(bilan.obligatoiresTotal) || 0;
  bilan.obligatoiresAJour = Number(bilan.obligatoiresAJour) || 0;
  bilan.obligatoiresManquants = Number(bilan.obligatoiresManquants) || 0;
  bilan.recommandesTotal = Number(bilan.recommandesTotal) || 0;
  bilan.recommandesFaits = Number(bilan.recommandesFaits) || 0;
  const manquants = references.filter((v: any) => v.niveau === "obligatoire" && !v.aJour);
  const now = Date.now();
  const options = references.length ? references.map((v: any) => v.nom) : vaccinsObligatoires.map((v) => v.nom);
  return (
    <Panel
      title={`Carnet vaccinal & vaccins exigés${bilan.obligatoiresTotal ? ` (${bilan.obligatoiresAJour}/${bilan.obligatoiresTotal} obligatoires à jour)` : ""}`}
      icon={Syringe}
      spec={specs.vaccinsReferenceEnfant}
      demo={r.demo}
      reason={r.reason}
      actions={<Button size="sm" variant="outline" onClick={() => setOpen(true)}><Plus className="mr-1 h-4 w-4" />Injection</Button>}
    >
      {bilan.obligatoiresTotal > 0 && (
        <div className={`mb-4 flex flex-wrap items-center gap-2 rounded-xl border p-3 text-sm ${bilan.aJour ? "border-success/40 bg-success/10" : "border-destructive/40 bg-destructive/5"}`}>
          <Pill tone={bilan.aJour ? "success" : "danger"}>{bilan.aJour ? "Dossier vaccinal à jour" : `${bilan.obligatoiresManquants} vaccin(s) obligatoire(s) manquant(s)`}</Pill>
          <span className="text-muted-foreground">{bilan.obligatoiresAJour}/{bilan.obligatoiresTotal} obligatoires · {bilan.recommandesFaits}/{bilan.recommandesTotal} recommandés</span>
          {manquants.length > 0 && <span className="text-xs text-destructive">{manquants.slice(0, 3).map((v: any) => v.nom).join(", ")}{manquants.length > 3 ? "…" : ""}</span>}
        </div>
      )}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="py-2">Vaccin</th><th>Niveau</th><th>Doses</th><th>Dernière injection</th><th>Prescripteur</th><th>Statut</th></tr>
          </thead>
          <tbody>
            {references.map((v: any) => {
              const inj = injections.filter((x: any) => String(x.nom).toLowerCase() === String(v.nom).toLowerCase()).sort((a: any, b: any) => String(b.date).localeCompare(String(a.date)));
              const last = inj[0];
              const rappel = inj.find((x: any) => x.rappel)?.rappel;
              const soon = rappel && new Date(rappel).getTime() - now < 30 * 864e5;
              const tone = v.aJour ? "success" : v.niveau === "recommande" ? "default" : soon ? "warning" : inj.length ? "default" : "danger";
              const label = v.aJour ? "À jour" : soon ? `Rappel ${fmtDate(rappel)}` : inj.length ? "En cours" : v.niveau === "recommande" ? "Recommandé" : "Non fait";
              return (
                <tr key={v._id ?? v.nom} className="border-t">
                  <td className="py-2 font-medium">{v.nom}</td>
                  <td><Pill tone={v.niveau === "obligatoire" ? "danger" : "warning"}>{v.niveau === "obligatoire" ? "Obligatoire" : "Recommandé"}</Pill></td>
                  <td>{inj.length}/{v.dosesAttendues ?? 1}</td>
                  <td>{last ? fmtDate(last.date) : "—"}</td>
                  <td>{last ? fullName(last.medecin) : "—"}</td>
                  <td><Pill tone={tone}>{label}</Pill></td>
                </tr>
              );
            })}
            {!references.length && <tr><td colSpan={6} className="py-4 text-center text-muted-foreground">Aucun vaccin de référence configuré.</td></tr>}
          </tbody>
        </table>
      </div>
      <FormDialog open={open} onOpenChange={setOpen} title="Ajouter une injection"
        fields={[
          { name: "nom", label: "Vaccin", type: "select", options, required: true },
          { name: "dose", label: "Dose n°", type: "number", required: true },
          { name: "date", label: "Date", type: "date", required: true },
          { name: "medecin", label: "Médecin prescripteur", lookup: "medecin", required: true },
          { name: "lot", label: "N° de lot", type: "text" },
          { name: "rappel", label: "Date de rappel", type: "date" },
        ]}
        onSubmit={async (v) => {
          const res = await send("POST", specs.vaccinAdd.path, v, { enfantId });
          qc.invalidateQueries({ queryKey: ["api", specs.vaccinsReferenceEnfant.id] });
          qc.invalidateQueries({ queryKey: ["api", specs.vaccins.id] });
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

/* ---------------- SOS : fenêtres et scans d'urgence ---------------- */
const demoSosList = [{
  id: "sos-demo-1", motif: "Réaction allergique", statut: "ouverte", maxScans: SOS_MAX_SCANS, dureeHeures: 5,
  scansUtilises: 2, scansRestants: 3,
  createdAt: new Date(Date.now() - 2 * 3600e3).toISOString(),
  expiresAt: new Date(Date.now() + 3 * 3600e3).toISOString(),
  declenchePar: { prenom: "Claire", nom: "Martin", role: "parent" },
  scans: [
    { id: "scan-1", ip: "82.64.1.10", device: "iPhone — Safari", scannedAt: new Date(Date.now() - 3600e3).toISOString() },
    { id: "scan-2", ip: "90.12.4.8", device: "Chrome — Android", scannedAt: new Date(Date.now() - 1800e3).toISOString() },
  ],
}];

export function SosHistorique({ enfantId }: { enfantId: string }) {
  const r = useApiOrDemo<unknown>(specs.sosEnfant, demoSosList, { enfantId });
  const qc = useQueryClient();
  const role = roleToKey(getSession()?.user?.role);
  const outilTemps = role === "admin" || role === "dev";
  const list = toList(r.data);
  async function simuler(id: string, body: Record<string, unknown>, message: string) {
    try {
      const res = await send("POST", specs.sosSimuler.path, body, { sosId: id });
      qc.invalidateQueries({ queryKey: ["api", specs.sosEnfant.id] });
      toast.success(`${message}${res.demo ? " (démo)" : ""}`);
    } catch (e) { toast.error((e as Error).message); }
  }
  return (
    <Panel title="SOS & scans d'urgence" icon={Siren} spec={specs.sosEnfant} demo={r.demo} reason={r.reason}>
      {list.length ? (
        <ul className="space-y-4 text-sm">
          {list.map((s, i) => (
            <li key={s.id ?? i} className="border-b pb-3 last:border-0">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="font-medium">{s.motif ?? "SOS"}</span>
                <Pill tone={s.statut === "ouverte" ? "warning" : s.statut === "expiree" || s.statut === "cloturee" ? "default" : "danger"}>{sosStatutLabel(s.statut)}</Pill>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Déclenché le {fmtDate(s.createdAt)}
                {s.declenchePar ? ` par ${fullName(s.declenchePar)}` : ""} · {s.scansUtilises ?? s.scans?.length ?? 0}/{s.maxScans ?? SOS_MAX_SCANS} scans
                {s.expiresAt ? ` · expire le ${sosExpiresLabel(s.expiresAt)}` : ""}
              </p>
              {outilTemps && s.id && (
                <div className="mt-2 flex flex-wrap items-center gap-2 rounded-lg border border-dashed px-2 py-2 text-xs">
                  <span className="font-medium">Simulation du temps (admin/dev) :</span>
                  <Button size="sm" variant="outline" onClick={() => simuler(String(s.id), { heuresRestantes: 5 }, "Fenêtre replacée à 5 h")}>Remettre à 5 h</Button>
                  <Button size="sm" variant="outline" onClick={() => simuler(String(s.id), { scansUtilises: 5 }, "Quota rempli à 5 scans")}>Remplir 5 scans</Button>
                  <Button size="sm" variant="destructive" onClick={() => simuler(String(s.id), { expirer: true }, "Fenêtre expirée immédiatement")}>Simuler l'expiration</Button>
                </div>
              )}
              {(s.scans ?? []).length > 0 && (
                <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                  {(s.scans ?? []).map((scan: any, j: number) => (
                    <li key={scan.id ?? j} className="flex flex-wrap gap-x-2">
                      <span>{sosExpiresLabel(scan.scannedAt)}</span>
                      <span>{scan.ip ?? "IP inconnue"}</span>
                      <span>{scan.device ?? "Appareil inconnu"}</span>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      ) : <Empty text="Aucun SOS enregistré" />}
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
