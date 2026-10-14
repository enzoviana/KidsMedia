import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Fingerprint, Laptop, Smartphone, Trash2 } from "lucide-react";
import { apiFetch, getSession, setDeviceToken } from "@/lib/api";
import { qrDataUrl } from "@/lib/qr";

interface Etat { totp: boolean; passkeys: { id: string; nom: string; createdAt: string }[]; appareils: { id: string; nom: string; expiresAt: string }[] }
const DEMO: Etat = { totp: false, passkeys: [], appareils: [{ id: "d1", nom: "iPhone · Safari", expiresAt: new Date(Date.now() + 20 * 864e5).toISOString() }] };
const date = (s: string) => new Date(s).toLocaleDateString("fr-FR", { day: "numeric", month: "short" });

/** Réglages sans SMS : application d'authentification, passkeys, appareils de confiance. */
export function SecuritySettings({ compact }: { compact?: boolean }) {
  const demo = !getSession() || !!getSession()?.demo;
  const [e, setE] = useState<Etat | null>(null);
  const [setup, setSetup] = useState<{ secret: string; qr: string } | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const t = compact ? "text-[13px]" : "text-sm";

  async function load() {
    if (demo) { setE((x) => x ?? DEMO); return; }
    try { setE(await apiFetch<Etat>("/auth/securite")); } catch (x) { toast.error((x as Error).message); setE(DEMO); }
  }
  useEffect(() => { void load(); }, []);

  async function run(f: () => Promise<void>, ok: string) {
    setBusy(true);
    try { await f(); toast.success(demo ? `${ok} (démo)` : ok); if (!demo) await load(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
  }

  const startTotp = () => run(async () => {
    const r = demo ? { secret: "JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP", otpauthUrl: "otpauth://totp/Kids'Med%20IA:demo?secret=JBSWY3DPEHPK3PXPJBSWY3DPEHPK3PXP&issuer=Kids'Med%20IA" }
      : await apiFetch<{ secret: string; otpauthUrl: string }>("/auth/totp/setup", { method: "POST", body: "{}" });
    setSetup({ secret: r.secret, qr: qrDataUrl(r.otpauthUrl, 360) });
  }, "Scannez le QR code");
  const enableTotp = () => run(async () => {
    if (!demo) await apiFetch("/auth/totp/enable", { method: "POST", body: JSON.stringify({ code }) });
    else setE((x) => x && { ...x, totp: true });
    setSetup(null); setCode("");
  }, "Application d'authentification activée");
  const disableTotp = () => run(async () => {
    if (!demo) await apiFetch("/auth/totp", { method: "DELETE" }); else setE((x) => x && { ...x, totp: false });
  }, "Application désactivée");
  const addPasskey = () => run(async () => {
    if (demo) { setE((x) => x && { ...x, passkeys: [{ id: crypto.randomUUID(), nom: "Cet appareil", createdAt: new Date().toISOString() }, ...x.passkeys] }); return; }
    const { startRegistration } = await import("@simplewebauthn/browser");
    const opts = await apiFetch<any>("/auth/passkeys/register-options", { method: "POST", body: "{}" });
    const response = await startRegistration(opts);
    await apiFetch("/auth/passkeys", { method: "POST", body: JSON.stringify({ response, nom: navigator.platform || "Passkey" }) });
  }, "Passkey enregistrée");
  const delPasskey = (id: string) => run(async () => {
    if (!demo) await apiFetch(`/auth/passkeys/${id}`, { method: "DELETE" }); else setE((x) => x && { ...x, passkeys: x.passkeys.filter((p) => p.id !== id) });
  }, "Passkey supprimée");
  const delDevice = (id?: string) => run(async () => {
    if (!demo) await apiFetch(id ? `/auth/appareils/${id}` : "/auth/appareils", { method: "DELETE" });
    else setE((x) => x && { ...x, appareils: id ? x.appareils.filter((a) => a.id !== id) : [] });
    if (!id) setDeviceToken(getSession()?.user.email, null);
  }, id ? "Appareil retiré" : "Tous les appareils ont été retirés");

  if (!e) return <p className={`${t} text-muted-foreground`}>Chargement…</p>;
  const btn = `rounded-full border border-border px-3 py-1 font-semibold ${t} disabled:opacity-50`;
  const row = "flex items-center gap-2.5";

  return (
    <div className={`space-y-4 ${t}`}>
      <p className="text-muted-foreground">Évitez les SMS : utilisez une application ou Face ID, et mémorisez vos appareils habituels.</p>

      <section className="space-y-2">
        <div className={row}><Smartphone className="h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">Application d'authentification</p><p className="text-muted-foreground">Google Authenticator, Apple, Microsoft…</p></div>
          {e.totp ? <button className={btn} disabled={busy} onClick={disableTotp}>Désactiver</button> : !setup && <button className={btn} disabled={busy} onClick={startTotp}>Activer</button>}</div>
        {e.totp && <p className="font-semibold text-brand-green">Activée : plus besoin de SMS à la connexion.</p>}
        {setup && (
          <div className="space-y-2 rounded-2xl border border-border p-3">
            <p>1. Scannez ce QR code avec votre application.</p>
            <img src={setup.qr} alt="QR code d'activation" className="mx-auto w-40 rounded-xl bg-background p-2" />
            <p className="text-muted-foreground">Ou saisissez la clé : <code className="break-all font-mono text-foreground">{setup.secret.match(/.{1,4}/g)?.join(" ")}</code></p>
            <p>2. Saisissez le code affiché.</p>
            <div className="flex gap-2">
              <input inputMode="numeric" maxLength={6} value={code} onChange={(x) => setCode(x.target.value.replace(/\D/g, ""))} placeholder="123456" aria-label="Code de l'application"
                className="min-w-0 flex-1 rounded-xl border border-border bg-transparent px-3 py-1.5 tracking-[0.3em] outline-none" />
              <button className={btn} disabled={busy || code.length < 6} onClick={enableTotp}>Valider</button>
            </div>
          </div>
        )}
      </section>

      <section className="space-y-2">
        <div className={row}><Fingerprint className="h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">Passkeys (Face ID, Touch ID)</p><p className="text-muted-foreground">Connexion d'un regard, sans code.</p></div>
          <button className={btn} disabled={busy} onClick={addPasskey}>Ajouter</button></div>
        {e.passkeys.map((p) => <div key={p.id} className={`${row} pl-6`}><span className="flex-1">{p.nom} · {date(p.createdAt)}</span><button aria-label={`Supprimer ${p.nom}`} onClick={() => delPasskey(p.id)}><Trash2 className="h-4 w-4 text-destructive" /></button></div>)}
      </section>

      <section className="space-y-2">
        <div className={row}><Laptop className="h-4 w-4 shrink-0" /><div className="min-w-0 flex-1"><p className="font-semibold">Appareils de confiance</p><p className="text-muted-foreground">Pas de code pendant 30 jours sur ces appareils.</p></div>
          {e.appareils.length > 0 && <button className={btn} disabled={busy} onClick={() => delDevice()}>Tout retirer</button>}</div>
        {e.appareils.length === 0 ? <p className="pl-6 text-muted-foreground">Aucun appareil mémorisé.</p> : e.appareils.map((a) => (
          <div key={a.id} className={`${row} pl-6`}><span className="flex-1">{a.nom} · jusqu'au {date(a.expiresAt)}</span><button aria-label={`Retirer ${a.nom}`} onClick={() => delDevice(a.id)}><Trash2 className="h-4 w-4 text-destructive" /></button></div>))}
      </section>
    </div>
  );
}
