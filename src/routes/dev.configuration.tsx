import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { KeyRound, Mail, MessageSquareText, MapPin, Save, Send } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
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
    { key: "EMAIL_PROVIDER", label: "Fournisseur", hint: "resend ou sendgrid" },
    { key: "RESEND_API_KEY", label: "Clé API e-mail", secret: true },
    { key: "EMAIL_FROM", label: "Adresse d'envoi", hint: "contact@kidsmed.fr" },
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
const demo = { EMAIL_PROVIDER: "resend", RESEND_API_KEY: "re_••••a1b2", EMAIL_FROM: "contact@kidsmed.fr", TWILIO_ACCOUNT_SID: "", TWILIO_AUTH_TOKEN: "", TWILIO_FROM: "", GEOCODING_API_KEY: "", MSG_MFA: "Kids'Med : votre code est {code}. Valable 10 minutes.", MSG_ALERTE_ACCES: "Accès refusé pour {nom} : {motif} ({lieu})." };

function Page() {
  const r = useApiOrDemo<Record<string, string>>(specs.devConfig, demo);
  const [v, setV] = useState<Record<string, string>>({});
  const [test, setTest] = useState("");
  useEffect(() => { setV({}); }, [r.data]);
  const cur = (k: string) => v[k] ?? (groups.flatMap((g) => g.fields).find((f) => f.key === k)?.secret ? "" : r.data?.[k] ?? "");

  async function save() {
    const res = await send("PUT", specs.devConfigSet.path, v);
    toast.success(`Configuration enregistrée${res.demo ? " (démo)" : ""}`);
  }
  async function tester(canal: "email" | "sms") {
    if (!test) { toast.error("Indiquez un e-mail ou un numéro."); return; }
    try { const res = await send("POST", specs.devConfigTest.path, { canal, destinataire: test }); toast.success(`Test envoyé${res.demo ? " (démo)" : ""}`); }
    catch (e) { toast.error((e as Error).message); }
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
      </div>
    </DashboardShell>
  );
}
