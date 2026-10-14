import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { KeyRound, Loader2 } from "lucide-react";
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

function Page() {
  const [token, setToken] = useState("");
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setToken(new URLSearchParams(window.location.search).get("token") ?? ""); }, []);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const pwd = String(f.get("pwd")), conf = String(f.get("conf"));
    if (pwd.length < 8) return setMsg({ ok: false, text: "8 caractères minimum." });
    if (pwd !== conf) return setMsg({ ok: false, text: "Les deux mots de passe ne correspondent pas." });
    setBusy(true);
    try {
      const body = token ? { token, nouveauMotDePasse: pwd } : { email: f.get("email"), code: f.get("code"), nouveauMotDePasse: pwd };
      const r = await fetch(`${API_BASE}/auth/reset-password`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.success === false) throw new Error(r.status === 404 ? "Le serveur ne propose pas encore la réinitialisation." : j?.message ?? j?.error ?? `Erreur ${r.status}`);
      setMsg({ ok: true, text: "Mot de passe modifié. Vous pouvez vous connecter." });
    } catch (err) { setMsg({ ok: false, text: (err as Error).message }); } finally { setBusy(false); }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <form onSubmit={submit} className="w-full max-w-sm space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <div className="flex items-center gap-2"><KeyRound className="h-5 w-5 text-primary" /><h1 className="font-display text-xl font-semibold">Nouveau mot de passe</h1></div>
        {!token && <>
          <p className="text-sm text-muted-foreground">Saisissez votre e-mail et le code à 6 chiffres reçu.</p>
          <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" required /></div>
          <div className="space-y-1.5"><Label htmlFor="code">Code</Label><Input id="code" name="code" inputMode="numeric" maxLength={6} required /></div>
        </>}
        <div className="space-y-1.5"><Label htmlFor="pwd">Nouveau mot de passe</Label><Input id="pwd" name="pwd" type="password" minLength={8} required /></div>
        <div className="space-y-1.5"><Label htmlFor="conf">Confirmer</Label><Input id="conf" name="conf" type="password" minLength={8} required /></div>
        {msg && <p className={`rounded-lg p-3 text-sm ${msg.ok ? "bg-success/10" : "bg-destructive/10 text-destructive"}`}>{msg.text}</p>}
        <Button type="submit" className="w-full" disabled={busy || msg?.ok}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Valider</Button>
        <Link to="/connexion" className="block text-center text-sm text-muted-foreground underline">Retour à la connexion</Link>
      </form>
    </main>
  );
}
