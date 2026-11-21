import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { CheckCircle2, CreditCard, Globe, Info, KeyRound, Link2, Loader2, Mail, MapPin, MessageSquareText, RefreshCw, Save, Send, ShieldCheck, XCircle } from "lucide-react";
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
      { name: "description", content: "Toutes les variables d'envoi d'e-mails, de SMS, de paiement et de liens de l'application." },
      { property: "og:title", content: "Clés API & messages — Kids'Med IA" },
      { property: "og:description", content: "Configuration technique réservée au développeur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

type F = { key: string; label: string; secret?: boolean; long?: boolean; hint?: string; options?: string[] };
type G = { title: string; icon: typeof Mail; columns?: 2; fields: F[] };
const OUI_NON = ["true", "false"];

const groups: G[] = [
  { title: "E-mails", icon: Mail, fields: [
    { key: "EMAIL_PROVIDER", label: "Fournisseur", options: ["auto", "smtp", "sendgrid"], hint: "auto = SMTP prioritaire ; « valeur du serveur » efface le réglage enregistré" },
    { key: "SMTP_HOST", label: "Serveur SMTP", hint: "smtp.votredomaine.fr" },
    { key: "SMTP_PORT", label: "Port SMTP", hint: "587 (STARTTLS) ou 465 (SSL)" },
    { key: "SMTP_SECURE", label: "Connexion SSL directe", options: OUI_NON, hint: "true pour le port 465, sinon false" },
    { key: "SMTP_USER", label: "Identifiant SMTP", hint: "adresse e-mail complète du compte" },
    { key: "SMTP_PASSWORD", label: "Mot de passe SMTP", secret: true },
    { key: "SMTP_TLS_REJECT_UNAUTHORIZED", label: "Vérifier le certificat TLS", options: OUI_NON, hint: "true recommandé ; false seulement pour un certificat auto-signé" },
    { key: "EMAIL_FROM", label: "Adresse d'envoi", hint: "contact@votredomaine.fr" },
    { key: "SMTP_FROM_NAME", label: "Nom affiché de l'expéditeur", hint: "Kids'Med IA" },
    { key: "SENDGRID_API_KEY", label: "Clé API SendGrid (secours)", secret: true },
    { key: "EMAIL_MOCK_MODE", label: "Mode simulation", options: OUI_NON, hint: "true = aucun e-mail réellement envoyé" },
  ]},
  { title: "SMS & double authentification", icon: MessageSquareText, fields: [
    { key: "TWILIO_ACCOUNT_SID", label: "Account SID", secret: true },
    { key: "TWILIO_AUTH_TOKEN", label: "Auth Token", secret: true },
    { key: "TWILIO_FROM", label: "Numéro d'envoi", hint: "+33…" },
    { key: "MFA_DEMO_CODE", label: "Code SMS de démonstration", secret: true, hint: "Laisser vide en production" },
  ]},
  { title: "Application & liens des e-mails", icon: Link2, columns: 2, fields: [
    { key: "APP_NAME", label: "Nom de l'application", hint: "Kids'Med IA" },
    { key: "APP_SUPPORT_EMAIL", label: "E-mail de support", hint: "support@kidsmed.fr" },
    { key: "FRONTEND_URL", label: "URL du frontend", hint: "https://kidsmedia.vercel.app" },
    { key: "PUBLIC_URL", label: "URL publique de l'API", hint: "https://backendkids.onrender.com" },
    { key: "FRONTEND_LOGIN_URL", label: "Lien de connexion", hint: "…/connexion" },
    { key: "FRONTEND_RESET_PASSWORD_URL", label: "Lien de réinitialisation", hint: "…/reinitialiser" },
    { key: "FRONTEND_ACTIVATE_ACCOUNT_URL", label: "Lien d'activation", hint: "…/activate" },
    { key: "FRONTEND_MESSAGES_URL", label: "Lien messagerie", hint: "…/messages" },
    { key: "FRONTEND_TRANSMISSIONS_URL", label: "Lien transmissions", hint: "…/transmissions" },
    { key: "FRONTEND_AFFECTATIONS_URL", label: "Lien affectations RSAI", hint: "…/affectations" },
    { key: "FRONTEND_DOCUMENTS_URL", label: "Lien documents", hint: "…/documents" },
    { key: "FRONTEND_VACCINS_URL", label: "Lien vaccins", hint: "…/vaccins" },
    { key: "FRONTEND_ORDONNANCES_URL", label: "Lien ordonnances", hint: "…/ordonnances" },
    { key: "FRONTEND_FACTURES_URL", label: "Lien factures", hint: "…/factures" },
    { key: "FRONTEND_PREFERENCES_URL", label: "Lien préférences", hint: "…/preferences" },
    { key: "FRONTEND_SUPPORT_URL", label: "Lien support", hint: "…/support" },
  ]},
  { title: "Paiement (Stripe)", icon: CreditCard, fields: [
    { key: "STRIPE_SECRET_KEY", label: "Clé secrète Stripe", secret: true, hint: "sk_live_… ou sk_test_…" },
    { key: "STRIPE_WEBHOOK_SECRET", label: "Secret du webhook", secret: true, hint: "whsec_…" },
  ]},
  { title: "Sécurité & passkeys", icon: ShieldCheck, fields: [
    { key: "WEBAUTHN_RP_ID", label: "Domaine WebAuthn (RP ID)", hint: "kidsmedia.vercel.app" },
    { key: "WEBAUTHN_ORIGINS", label: "Origines autorisées WebAuthn", hint: "https://kidsmedia.vercel.app,http://localhost:8080" },
    { key: "FILE_SIGN_SECRET", label: "Secret des liens de fichiers", secret: true, hint: "Rotation : les anciens liens sont re-signés à la lecture" },
  ]},
  { title: "Accès API", icon: Globe, fields: [
    { key: "CORS_ORIGINS", label: "Origines autorisées (CORS)", hint: "https://kidsmedia.vercel.app,http://localhost:8080 — * pour tout autoriser" },
  ]},
  { title: "Localisation", icon: MapPin, fields: [
    { key: "GEOCODING_API_KEY", label: "Clé géocodage (facultatif)", secret: true, hint: "Vide = API Adresse française gratuite" },
  ]},
  { title: "Messages système", icon: KeyRound, fields: [
    { key: "MSG_MFA", label: "SMS de code de connexion", long: true, hint: "{code} sera remplacé" },
    { key: "MSG_ALERTE_ACCES", label: "Alerte d'accès refusé (admin)", long: true, hint: "{nom}, {motif}, {lieu}" },
  ]},
];

const LECTURE_SEULE = ["DATABASE_URL", "JWT_SECRET", "PORT", "UPLOAD_DIR", "NODE_ENV", "SEED_PASSWORD", "SEED_PHONE"];

const demo: Record<string, unknown> = {
  EMAIL_PROVIDER: "auto",
  SMTP_HOST: "smtp.kidsmed.fr",
  SMTP_PORT: "465",
  SMTP_SECURE: "true",
  SMTP_USER: "contact@kidsmed.fr",
  SMTP_TLS_REJECT_UNAUTHORIZED: "true",
  EMAIL_FROM: "contact@kidsmed.fr",
  SMTP_FROM_NAME: "Kids'Med IA",
  EMAIL_MOCK_MODE: "false",
  TWILIO_ACCOUNT_SID: "",
  TWILIO_AUTH_TOKEN: "",
  TWILIO_FROM: "",
  GEOCODING_API_KEY: "",
  APP_NAME: "Kids'Med IA",
  APP_SUPPORT_EMAIL: "support@kidsmed.fr",
  FRONTEND_URL: "https://kidsmedia.vercel.app",
  PUBLIC_URL: "https://backendkids.onrender.com",
  CORS_ORIGINS: "https://kidsmedia.vercel.app,http://localhost:8080",
  MSG_MFA: "Kids'Med : votre code est {code}. Valable 10 minutes.",
  MSG_ALERTE_ACCES: "Accès refusé pour {nom} : {motif} ({lieu}).",
  _lectureSeule: LECTURE_SEULE.map((key) => ({ key, configure: key === "DATABASE_URL" || key === "JWT_SECRET" })),
};

function Page() {
  const qc = useQueryClient();
  const r = useApiOrDemo<Record<string, any>>(specs.devConfig, demo);
  const [v, setV] = useState<Record<string, string>>({});
  const [test, setTest] = useState("");
  const [diag, setDiag] = useState<any>(null);
  const [diagBusy, setDiagBusy] = useState(false);
  useEffect(() => { setV({}); }, [r.data]);
  const cur = (f: F) => {
    if (v[f.key] !== undefined) return v[f.key];
    if (f.secret) return "";
    const value = r.data?.[f.key] ?? "";
    return f.options ? String(value).toLowerCase() : String(value);
  };

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
      setV({});
      if (!res.demo) {
        await qc.invalidateQueries({ queryKey: ["api", specs.devConfig.id] });
        await verifier();
      }
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

  const lectureSeule: { key: string; configure: boolean }[] =
    Array.isArray(r.data?.["_lectureSeule"]) && r.data["_lectureSeule"].length
      ? r.data["_lectureSeule"]
      : LECTURE_SEULE.map((key) => ({ key, configure: false }));

  return (
    <DashboardShell role="dev" title="Clés API & messages" actions={<Button onClick={save}><Save className="mr-1 h-4 w-4" />Enregistrer</Button>}>
      <p className="text-sm text-muted-foreground">Toutes les variables ci-dessous sont stockées côté serveur et appliquées immédiatement, sans redéploiement. Les clés ne sont jamais réaffichées en clair : laissez un champ de clé vide pour la conserver.</p>
      <div className="grid gap-4 lg:grid-cols-2">
        {groups.map((g) => (
          <Panel key={g.title} title={g.title} icon={g.icon} spec={specs.devConfig} demo={r.demo} reason={r.reason}>
            <div className={g.columns === 2 ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
              {g.fields.map((f) => (
                <label key={f.key} className="block space-y-1 text-sm">
                  <span className="font-medium">{f.label}
                    {r.data?.["_sources"]?.[f.key] && r.data["_sources"][f.key] !== "défaut" && (
                      <span className="ml-1 text-xs font-normal text-muted-foreground">· {r.data["_sources"][f.key]}</span>
                    )}
                  </span>
                  {f.long ? (
                    <Textarea value={cur(f)} onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))} />
                  ) : f.options ? (
                    <select
                      aria-label={f.label}
                      className="h-9 w-full rounded-md border bg-background px-3 text-sm"
                      value={cur(f)}
                      onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))}
                    >
                      <option value="">— valeur du serveur (efface) —</option>
                      {f.options.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                  ) : (
                    <Input type={f.secret ? "password" : "text"} autoComplete="off" placeholder={f.secret ? (r.data?.[f.key] || "Non configurée") : f.hint} value={cur(f)} onChange={(e) => setV((x) => ({ ...x, [f.key]: e.target.value }))} />
                  )}
                  {f.hint && (f.long || f.secret) && <span className="text-xs text-muted-foreground">{f.hint}</span>}
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
              {diag.raison && <p className="rounded-lg bg-muted p-3 text-xs">{diag.raison}</p>}
              <p>Mode effectif : <strong>{diag.mode ?? "—"}</strong>{diag.simule ? " (simulation)" : ""} · demandé : <code>{diag.providerDemande ?? "—"}</code>{diag.providerSource ? ` (source : ${diag.providerSource})` : ""}</p>
              <p>Adresse d'envoi : <strong>{diag.adresseEnvoi?.email ?? "—"}</strong>{diag.adresseEnvoi?.name ? ` (${diag.adresseEnvoi.name})` : ""}</p>
              <p className="flex flex-wrap items-center gap-2">
                SMTP : <code>{diag.smtp?.hote ?? "—"}:{diag.smtp?.port ?? "—"}</code>
                {diag.smtp?.joignable === true && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-4 w-4" />joignable</span>}
                {diag.smtp?.joignable === false && <span className="flex items-center gap-1 text-destructive"><XCircle className="h-4 w-4" />injoignable</span>}
              </p>
              <p className="text-xs text-muted-foreground">
                Identifiant : {diag.smtp?.utilisateur || "non configuré"} · mot de passe : {diag.smtp?.motDePasseConfigure ? "configuré" : "absent"} · certificat TLS : {diag.smtp?.verificationCertificat ?? "—"} · SendGrid : {diag.sendgrid?.configure ? "configuré" : "absent"}
              </p>
              {diag.smtp?.note && <p className="rounded-lg bg-warning/15 p-3 text-xs">{diag.smtp.note}</p>}
              {diag.smtp?.erreur && <p className="text-xs text-destructive">Erreur de connexion : {diag.smtp.erreur}</p>}
              {Array.isArray(diag.variables) && (
                <div className="mt-2 space-y-1 border-t pt-2 text-xs">
                  <p className="font-medium">Origine des valeurs</p>
                  {diag.variables.map((x: { key: string; source: string }) => (
                    <div key={x.key} className="flex items-center justify-between gap-2">
                      <code>{x.key}</code>
                      <span className="text-muted-foreground">{x.source}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </Panel>
        <Panel title="Variables non modifiables ici" icon={Info}>
          <p className="mb-2 text-xs text-muted-foreground">Ces variables sont lues au démarrage du serveur : elles se règlent dans l'environnement Render et nécessitent un redémarrage.</p>
          <ul className="space-y-1 text-sm">
            {lectureSeule.map((x) => (
              <li key={x.key} className="flex items-center justify-between gap-2">
                <code className="text-xs">{x.key}</code>
                <span className={x.configure ? "text-xs text-success" : "text-xs text-muted-foreground"}>{x.configure ? "défini" : "non défini"}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </div>
    </DashboardShell>
  );
}
