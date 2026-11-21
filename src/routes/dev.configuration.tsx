import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { CheckCircle2, KeyRound, Loader2, Mail, MessageSquareText, MapPin, RefreshCw, Save, Send, XCircle } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { apiFetch } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";

export const Route = createFileRoute("/dev/configuration")({
  head: () => ({
    meta: [
      { title: "Clés API & messages — Console développeur" },
      { name: "description", content: "Clés d'envoi d'e-mails, de SMS, de géolocalisation et messages système." },
      { property: "og:title", content: "Clés API & messages — Kids'Med IA" },
      { property: "og:description", content: "Configuration technique réservée au développeur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type F = { key: string; label: string; secret?: boolean; long?: boolean; hint?: string };
const groups: { title: string; icon: typeof Mail; fields: F[] }[] = [
  { title: "E-mails", icon: Mail, fields: [
    { key: "EMAIL_PROVIDER", label: "Fournisseur", hint: "auto (SMTP en priorité), smtp ou sendgrid" },
    { key: "SMTP_HOST", label: "Serveur SMTP", hint: "smtp.hostinger.com" },
    { key: "SMTP_PORT", label: "Port SMTP", hint: "587 (STARTTLS) ou 465 (SSL)" },
    { key: "SMTP_SECURE", label: "Connexion SSL directe", hint: "true pour le port 465, sinon false" },
    { key: "SMTP_USER", label: "Identifiant SMTP", hint: "adresse e-mail complète du compte" },
    { key: "SMTP_PASSWORD", label: "Mot de passe SMTP", secret: true },
    { key: "EMAIL_FROM", label: "Adresse d'envoi", hint: "contact@votredomaine.fr" },
    { key: "SMTP_FROM_NAME", label: "Nom affiché de l'expéditeur", hint: "Kids'Med IA" },
    { key: "SENDGRID_API_KEY", label: "Clé API SendGrid (secours)", secret: true },
  ]},
  { title: "SMS (Twilio)", icon: MessageSquareText, fields: [
    { key: "TWILIO_ACCOUNT_SID", label: "Account SID", secret: true },
    { key: "TWILIO_AUTH_TOKEN", label: "Auth Token", secret: true },
    { key: "TWILIO_FROM", label: "Numéro d'envoi", hint: "+33…" },
  ]},
  { title: "Localisation", icon: MapPin, fields: [
    { key: "GEOCODING_API_KEY", label: "Clé géocodage (facultatif)", secret: true, hint: "Vide = API Adresse française gratuite" },
  ]},
  { title: "Messages système", icon: KeyRound, fields: [
    { key: "MSG_MFA", label: "SMS de code de connexion", long: true, hint: "{code} sera remplacé" },
    { key: "MSG_ALERTE_ACCES", label: "Alerte d'accès refusé (admin)", long: true, hint: "{nom}, {motif}, {lieu}" },
  ]},
];
const demo = { EMAIL_PROVIDER: "sendgrid", SENDGRID_API_KEY: "SG.••••a1b2", EMAIL_FROM: "contact@kidsmed.fr", TWILIO_ACCOUNT_SID: "", TWILIO_AUTH_TOKEN: "", TWILIO_FROM: "", GEOCODING_API_KEY: "", MSG_MFA: "Kids'Med : votre code est {code}. Valable 10 minutes.", MSG_ALERTE_ACCES: "Accès refusé pour {nom} : {motif} ({lieu})." };

function Page() {
  const r = useApiOrDemo<Record<string, string>>(specs.devConfig, demo);
  const [v, setV] = useState<Record<string, string>>({});
  const [test, setTest] = useState("");
  const [diag, setDiag] = useState<any>(null);
  const [diagBusy, setDiagBusy] = useState(false);
  useEffect(() => { setV({}); }, [r.data]);
  const cur = (k: string) => v[k] ?? (groups.flatMap((g) => g.fields).find((f) => f.key === k)?.secret ? "" : r.data?.[k] ?? "");

  async function verifier() {
    setDiagBusy(true);
    try { setDiag(await apiFetch("/developer/config/email/diagnostic")); }
    catch (e) { toast.error((e as Error).message); }
    finally { setDiagBusy(false); }
  }
  async function save() {
    try {
      const res = await send("PUT", specs.devConfigSet.path, v);
      toast.success(`Configuration enregistrée${res.demo ? " (démo)" : ""}`);
      if (!res.demo) await verifier();
    } catch (e) { toast.error((e as Error).message); }
  }
  async function tester(canal: "email" | "sms") {
    if (!test) { toast.error("Indiquez un e-mail ou un numéro."); return; }
    try {
      const res = await send<any>("POST", specs.devConfigTest.path, { canal, destinataire: test });
      if (res.demo) { toast.success("Test simulé (démo)"); return; }
      const d = res.data ?? {};
      if (d.envoye) toast.success(`Test ${canal} envoyé (${d.mode ?? "ok"})`);
      else toast.warning("Le test n'a pas pu être envoyé", {
        description: d.diagnostic?.smtp?.note ?? d.erreur ?? (d.simule ? "Aucun fournisseur réel configuré : mode simulation." : "Consultez les logs du serveur."),
        duration: 20_000,
      });
      setDiag(d.diagnostic ?? diag);
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <DashboardShell role="dev" title="Clés API & messages" actions={<Button onClick={save}><Save className="mr-1 h-4 w-4" />Enregistrer</Button>}>
      <p className="text-sm text-muted-foreground">Les clés sont stockées côté serveur et ne sont jamais réaffichées en clair. Laissez un champ de clé vide pour la conserver. Sans valeur ici, le serveur utilise ses variables d'environnement Render.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.title} title={g.title} icon={g.icon} spec={specs.devConfig} demo={r.demo} reason={r.reason}>
            <div className="space-y-3">
              {g.fields.map((f) => (
                <label key={f.key} className="block space-y-1 text-sm">
                  <span className="font-medium">{f.label}</span>
                  {f.long
                    ? <Textarea value={cur(f.key)} onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))} />
                    : <Input type={f.secret ? "password" : "text"} autoComplete="off" placeholder={f.secret ? (r.data?.[f.key] || "Non configurée") : f.hint} value={cur(f.key)} onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))} />}
                  {f.hint && f.long && <span className="text-xs text-muted-foreground">{f.hint}</span>}
                </label>
              ))}
            </div>
          </Panel>
        ))}
        <Panel title="Tester l'envoi" icon={Send}>
          <div className="flex flex-wrap gap-2">
            <Input className="min-w-48 flex-1" placeholder="e-mail ou +33…" value={test} onChange={(e) => setTest(e.target.value)} />
            <Button variant="outline" onClick={() => tester("email")}>E-mail</Button>
            <Button variant="outline" onClick={() => tester("sms")}>SMS</Button>
          </div>
        </Panel>
        <Panel
          title="Diagnostic e-mail"
          icon={Mail}
          actions={<Button size="sm" variant="outline" onClick={verifier} disabled={diagBusy}>{diagBusy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-1 h-4 w-4" />}Vérifier</Button>}
        >
          {!diag ? (
            <p className="text-sm text-muted-foreground">
              Vérifiez quel fournisseur est réellement utilisé et si le port SMTP est joignable depuis le serveur.
              Sur Render, les ports 25/465/587 sont bloqués pour les services gratuits.
            </p>
          ) : (
            <div className="space-y-2 text-sm">
              <p>Mode effectif : <strong>{diag.mode ?? "—"}</strong>{diag.simule ? " (simulation)" : ""} · demandé : <code>{diag.providerDemande ?? "—"}</code></p>
              <p>Adresse d'envoi : <strong>{diag.adresseEnvoi?.email ?? "—"}</strong>{diag.adresseEnvoi?.name ? ` (${diag.adresseEnvoi.name})` : ""}</p>
              <p className="flex flex-wrap items-center gap-2">
                SMTP : <code>{diag.smtp?.hote ?? "—"}:{diag.smtp?.port ?? "—"}</code>
                {diag.smtp?.joignable === true && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" />joignable</span>}
                {diag.smtp?.joignable === false && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />injoignable</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Identifiant : {diag.smtp?.utilisateur || "non configuré"} · mot de passe : {diag.smtp?.motDePasseConfigure ? "configuré" : "absent"} · SendGrid : {diag.sendgrid?.configure ? "configuré" : "absent"}
              </p>
              {diag.smtp?.note && <p className="rounded-lg bg-warning/15 p-3 text-xs">{diag.smtp.note}</p>}
              {diag.smtp?.erreur && <p className="text-xs text-destructive">Erreur de connexion : {diag.smtp.erreur}</p>}
            </div>
          )}
        </Panel>
      </div>
    </DashboardShell>
  );
}
