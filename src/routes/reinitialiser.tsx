import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/reinitialiser")({
  head: () => ({
    meta: [
      { title: "Nouveau mot de passe — Kids'Med IA" },
      { name: "description", content: "Choisissez un nouveau mot de passe avec le lien ou le code reçu par e-mail." },
      { property: "og:title", content: "Nouveau mot de passe — Kids'Med IA" },
      { property: "og:description", content: "Réinitialisation sécurisée du mot de passe." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function messageErreur(status: number, j: any): string {
  const serveur = String(j?.error ?? j?.message ?? "").trim();
  if (status === 400) return "Lien ou code invalide ou expiré. Vérifiez le code à 6 chiffres reçu par e-mail, ou demandez un nouveau lien depuis la page de connexion.";
  if (status === 404) return "La réinitialisation n'est pas disponible sur ce serveur. Contactez le support.";
  if (status === 429) return "Trop de tentatives. Patientez quelques minutes avant de réessayer.";
  if (status >= 500) return "Le serveur a rencontré une erreur. Réessayez dans quelques instants.";
  return serveur || `Réinitialisation impossible (erreur ${status}).`;
}

function Page() {
  const [token, setToken] = useState("");
  const [useCode, setUseCode] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    const raw = new URLSearchParams(window.location.search).get("token") ?? "";
    if (!raw || raw === "undefined" || raw === "null") {
      setToken("");
      setUseCode(true);
      if (raw) setMsg({ ok: false, text: "Le lien reçu est incomplet. Saisissez votre e-mail et le code à 6 chiffres présent dans l'e-mail." });
      return;
    }
    setToken(raw);
    setUseCode(false);
  }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pwd = String(f.get("pwd"));
    const conf = String(f.get("conf"));
    if (pwd.length < 8) return setMsg({ ok: false, text: "Le mot de passe doit contenir au moins 8 caractères." });
    if (pwd !== conf) return setMsg({ ok: false, text: "Les deux mots de passe ne correspondent pas." });
    setBusy(true);
    setMsg(null);
    try {
      const body = token && !useCode
        ? { token, nouveauMotDePasse: pwd }
        : { email: String(f.get("email") ?? "").trim(), code: String(f.get("code") ?? "").trim(), nouveauMotDePasse: pwd };
      const r = await fetch(`${API_BASE}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.success === false) throw new Error(messageErreur(r.status, j));
      setMsg({ ok: true, text: "Mot de passe modifié. Vous pouvez maintenant vous connecter." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  const parLien = !!token && !useCode;

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /><h1 className="font-display text-xl font-semibold">Nouveau mot de passe</h1></div>

        {parLien ? (
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">Lien de réinitialisation détecté. Choisissez votre nouveau mot de passe.</p>
            <button type="button" onClick={() => { setUseCode(true); setMsg(null); }} className="text-sm text-primary underline">
              Je préfère utiliser le code à 6 chiffres reçu par e-mail
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-muted-foreground">
              Saisissez votre e-mail et le code à 6 chiffres reçu. Le lien et le code expirent après 15 minutes.
            </p>
            <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" autoComplete="email" required /></div>
            <div className="space-y-1.5"><Label htmlFor="code">Code à 6 chiffres</Label><Input id="code" name="code" inputMode="numeric" autoComplete="one-time-code" maxLength={6} required /></div>
          </>
        )}

        <div className="space-y-1.5"><Label htmlFor="pwd">Nouveau mot de passe</Label><Input id="pwd" name="pwd" type="password" autoComplete="new-password" minLength={8} required /></div>
        <div className="space-y-1.5"><Label htmlFor="conf">Confirmer le mot de passe</Label><Input id="conf" name="conf" type="password" autoComplete="new-password" minLength={8} required /></div>

        {msg && (
          <div role={msg.ok ? "status" : "alert"} className={`flex items-start gap-2 rounded-lg p-3 text-sm ${msg.ok ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive"}`}>
            {msg.ok && <MailCheck className="mt-0.5 h-4 w-4 shrink-0" />}
            <span>{msg.text}</span>
          </div>
        )}

        <Button type="submit" className="w-full" disabled={busy || msg?.ok}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Valider le nouveau mot de passe</Button>

        {!msg?.ok && (
          <p className="text-center text-xs text-muted-foreground">
            Lien ou code expiré ? <Link to="/connexion" className="text-primary underline">Recevoir un nouveau lien</Link>.
          </p>
        )}
        <Link to="/connexion" className="block text-center text-sm text-muted-foreground underline">Retour à la connexion</Link>
      </form>
    </main>
  );
}
