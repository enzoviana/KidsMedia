import { Heart } from "lucide-react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Baby, HeartPulse, Stethoscope, Loader2, ArrowLeft, MessageSquareText, KeyRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import logo from "@/assets/logo.png.asset.json";
import { MfaSwitcher, mfaHint, mfaNeedsSend, useMfa } from "@/components/auth/mfa";
import { ApiError, forgotPassword, loginStart, mfaSend, roleToKey, setSession, type RoleKey, type PendingLogin, SECURITY_EVENT, type SecurityBlock } from "@/lib/api";
import { SecurityBlockedScreen } from "@/components/dash/security-blocked";
import { roleHome, roleLabels } from "@/components/dash/shell";

export const Route = createFileRoute("/connexion")({
  head: () => ({
    meta: [
      { title: "Connexion — Kids'Med IA" },
      { name: "description", content: "Connectez-vous à votre espace Kids'Med IA : crèche, RSAI, médecin, admin ou développeur." },
      { property: "og:title", content: "Connexion — Kids'Med IA" },
      { property: "og:description", content: "Un seul accès pour tous les professionnels de Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Connexion,
});

const demos: { role: RoleKey; icon: typeof Baby }[] = [
  { role: "creche", icon: Baby },
  { role: "rsai", icon: HeartPulse },
  { role: "medecin", icon: Stethoscope },
  { role: "parent", icon: Heart },
];

function Connexion() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [showDemo, setShowDemo] = useState(false);
  const [forgot, setForgot] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotMsg, setForgotMsg] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [block, setBlock] = useState<SecurityBlock | null>(null);
  useEffect(() => {
    const on = (e: Event) => setBlock((e as CustomEvent<SecurityBlock>).detail);
    window.addEventListener(SECURITY_EVENT, on);
    return () => window.removeEventListener(SECURITY_EVENT, on);
  }, []);

  const [pending, setPending] = useState<PendingLogin | null>(null);
  const mfa = useMfa(pending, setPending);
  const [demoRole, setDemoRole] = useState<RoleKey | null>(null);
  const [code, setCode] = useState("");
  const [timer, setTimer] = useState(0);
  useEffect(() => {
    if (timer <= 0) return;
    const t = setTimeout(() => setTimer((x) => x - 1), 1000);
    return () => clearTimeout(t);
  }, [timer]);

  const msg = (err: unknown) => ((err as Error).message === "Failed to fetch" ? "Le serveur ne répond pas. Réessayez dans un instant." : (err as Error).message);

  async function sendForgot(e: React.FormEvent) {
    e.preventDefault();
    setForgotMsg(null);
    setForgotLoading(true);
    try {
      setForgotMsg(await forgotPassword(forgotEmail));
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      const detail = (err as Error).message;
      setForgotMsg(
        status === 404 || /route non trouv/i.test(detail)
          ? "La route /auth/forgot-password n'existe pas encore sur le serveur : l'e-mail n'a pas pu être envoyé."
          : detail,
      );
    } finally {
      setForgotLoading(false);
    }
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const p = await loginStart(email, password);
      if (!roleToKey(p.user.role)) {
        setError(`Le rôle « ${p.user.role ?? "inconnu"} » n'a pas d'espace sur ce tableau de bord.`);
        return;
      }
      if (p.session) { navigate({ to: roleHome[roleToKey(p.session.user.role)!] }); return; }
      mfa.reset();
      setPending(mfaNeedsSend(p) ? await mfaSend(p, p.methodes && !p.methodes.sms ? "email" : "sms") : p);
      setCode("");
      setTimer(60);
    } catch (err) {
      setError(msg(err));
    } finally {
      setLoading(false);
    }
  }

  async function resend() {
    if (demoRole) { setTimer(60); return; }
    if (!pending) return;
    setError(null);
    try { setPending(await mfaSend(pending, mfa.methode === "email" ? "email" : "sms")); setTimer(60); } catch (err) { setError(msg(err)); }
  }

  async function viaPasskey() {
    setError(null); setLoading(true);
    try { const s = await mfa.passkey(); const k = roleToKey(s.user.role); if (k) navigate({ to: roleHome[k] }); } catch (err) { setError(msg(err)); } finally { setLoading(false); }
  }

  async function verify(e?: React.FormEvent) {
    e?.preventDefault();
    if (mfa.methode === "passkey") { await viaPasskey(); return; }
    if (code.length < 6) return;
    setError(null);
    setLoading(true);
    try {
      if (demoRole) {
        if (code !== "123456") throw new Error("Code incorrect. En mode démo, le code est 123456.");
        setSession({ demo: true, user: { prenom: "Démo", nom: roleLabels[demoRole], role: demoRole, email: "demo@kidsmed.ia", telephone: "+33600000044" } });
        navigate({ to: roleHome[demoRole] });
        return;
      }
      if (!pending) return;
      const s = await mfa.verify(code);
      const k = roleToKey(s.user.role);
      if (!k) { setSession(null); setError("Rôle inconnu."); return; }
      navigate({ to: roleHome[k] });
    } catch (err) {
      setError(msg(err));
    } finally {
      setLoading(false);
    }
  }

  function demo(role: RoleKey) {
    setDemoRole(role);
    setPending({ user: { role, email: "demo@kidsmed.ia" }, phone: "+33600000044" });
    setCode("123456");
    setTimer(60);
    setError(null);
  }

  const step2 = !!pending;
  if (block) return <SecurityBlockedScreen block={block} onRetry={() => { setBlock(null); setError(null); setPending(null); }} />;

  return (
    <div className="grid min-h-screen bg-background lg:grid-cols-2">
      <div className="relative hidden overflow-hidden bg-brand-gradient lg:block">
        <div className="absolute inset-0 bg-background/10" />
        <div className="relative flex h-full flex-col justify-between p-12 text-primary-foreground" style={{ color: "oklch(0.99 0 0)" }}>
          <p className="font-display text-xl font-semibold">Kids'Med IA</p>
          <div>
            <h2 className="font-display text-5xl font-semibold leading-tight">La santé des tout-petits, partagée en toute confiance.</h2>
            <p className="mt-4 max-w-md text-lg opacity-90">Crèches, RSAI, médecins et équipes techniques réunis sur une seule plateforme.</p>
          </div>
          <p className="text-sm opacity-80">Conforme RGPD · Données hébergées en France</p>
        </div>
      </div>
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <img src={logo.url} alt="Kids'Med IA" className="mx-auto h-28 w-28 object-contain" />
          <h1 className="mt-4 text-center font-display text-2xl font-semibold">Connexion</h1>
          <p className="mt-1 text-center text-sm text-muted-foreground">Une seule connexion pour tous les espaces</p>
          {step2 ? (
            <form onSubmit={verify} className="mt-8 space-y-5">
              <div className="flex items-start gap-3 rounded-xl bg-accent/60 p-3 text-sm">
                <MessageSquareText className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <p>{demoRole ? "Mode démo : le code est 123456." : mfaHint(pending, mfa.methode)}</p>
              </div>
              {pending && !demoRole && <MfaSwitcher pending={pending} mfa={mfa} />}
              {mfa.methode !== "passkey" && <div className="flex justify-center">
                <InputOTP maxLength={6} value={code} onChange={setCode} autoFocus>
                  <InputOTPGroup>{[0, 1, 2, 3, 4, 5].map((i) => <InputOTPSlot key={i} index={i} />)}</InputOTPGroup>
                </InputOTP>
              </div>}
              {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
              <Button type="submit" className="w-full" disabled={loading || (mfa.methode !== "passkey" && code.length < 6)}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />} {mfa.methode === "passkey" ? "Utiliser Face ID / Touch ID" : "Vérifier et se connecter"}
              </Button>
              <div className="flex items-center justify-between text-sm">
                <button type="button" onClick={() => { setPending(null); setDemoRole(null); setError(null); }} className="inline-flex items-center gap-1 text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Retour</button>
                <button type="button" disabled={timer > 0} onClick={resend} className="text-primary disabled:text-muted-foreground">{timer > 0 ? `Renvoyer le code (${timer} s)` : "Renvoyer le code"}</button>
              </div>
            </form>
          ) : (
          <form onSubmit={submit} className="mt-8 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="vous@exemple.fr" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pw">Mot de passe</Label>
              <Input id="pw" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="button" onClick={() => { setForgot(true); setForgotMsg(null); }} className="flex items-center gap-1.5 text-sm text-primary hover:underline">
              <KeyRound className="h-3.5 w-3.5" /> Mot de passe oublié ?
            </button>
            {error && <p className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">{error}</p>}
            <Button type="submit" className="w-full" disabled={loading}>
              {loading && <Loader2 className="h-4 w-4 animate-spin" />} Se connecter
            </Button>
          </form>
          )}
          {!step2 && <div className="mt-8">
            {!showDemo ? (
              <Button type="button" variant="outline" className="w-full" onClick={() => setShowDemo(true)}>Explorer en mode démo</Button>
            ) : (
              <div>
                <p className="mb-3 text-center text-sm text-muted-foreground">Choisissez votre rôle</p>
                <div className="grid grid-cols-2 gap-2">
                  {demos.map(({ role, icon: Icon }) => (
                    <button key={role} type="button" onClick={() => demo(role)} data-theme={role}
                      className="flex items-center gap-2 rounded-xl border bg-card p-3 text-sm text-card-foreground transition hover:border-primary">
                      <span className="grid h-8 w-8 place-items-center rounded-lg bg-primary text-primary-foreground"><Icon className="h-4 w-4" /></span>
                      {roleLabels[role]}
                    </button>
                  ))}
                </div>
                <button type="button" onClick={() => setShowDemo(false)} className="mt-3 w-full text-center text-sm text-muted-foreground hover:text-foreground">Annuler</button>
              </div>
            )}
          </div>}
        </div>
      </div>
      <Dialog open={forgot} onOpenChange={setForgot}>
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>Mot de passe oublié</DialogTitle>
            <DialogDescription>Saisissez votre e-mail : un lien de réinitialisation vous sera envoyé.</DialogDescription>
          </DialogHeader>
          <form onSubmit={sendForgot} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="forgot-email">E-mail</Label>
              <Input id="forgot-email" type="email" required value={forgotEmail} onChange={(e) => setForgotEmail(e.target.value)} placeholder="vous@exemple.fr" />
            </div>
            {forgotMsg && <p className="rounded-lg bg-accent/60 p-3 text-sm">{forgotMsg}</p>}
            <Button type="submit" className="w-full" disabled={forgotLoading}>
              {forgotLoading && <Loader2 className="h-4 w-4 animate-spin" />} Envoyer le lien
            </Button>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
