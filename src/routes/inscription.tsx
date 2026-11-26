import { useEffect, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, KeyRound, Loader2, Mail, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { API_BASE } from "@/lib/api";

type Search = { email?: string; invitation?: string };

export const Route = createFileRoute("/inscription")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const o: Search = {};
    if (typeof s["email"] === "string" && s["email"]) o.email = s["email"];
    if (typeof s["invitation"] === "string" && s["invitation"]) o.invitation = s["invitation"];
    return o;
  },
  head: () => ({
    meta: [
      { title: "Créer mon compte — Kids'Med IA" },
      { name: "description", content: "Créez votre profil Kids'Med IA et rejoignez le dossier de votre enfant." },
      { property: "og:title", content: "Créer mon compte — Kids'Med IA" },
      { property: "og:description", content: "Inscription sécurisée à la plateforme de santé des tout-petits." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type Etat = { ok: true; invitations: number } | { ok: false; texte: string; dejaInscrit?: boolean } | null;

function Page() {
  const { email: emailInvite, invitation } = Route.useSearch();
  const invite = !!invitation;
  const [form, setForm] = useState({ prenom: "", nom: "", email: emailInvite ?? "", telephone: "", password: "", confirmation: "" });
  const [etat, setEtat] = useState<Etat>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (emailInvite) setForm((f) => ({ ...f, email: emailInvite }));
  }, [emailInvite]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setEtat(null);
    if (form.password.length < 8) return setEtat({ ok: false, texte: "Le mot de passe doit contenir au moins 8 caractères." });
    if (form.password !== form.confirmation) return setEtat({ ok: false, texte: "Les deux mots de passe ne correspondent pas." });
    setBusy(true);
    try {
      const r = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prenom: form.prenom.trim(),
          nom: form.nom.trim(),
          email: form.email.trim(),
          telephone: form.telephone.trim(),
          password: form.password,
          invitationToken: invitation || undefined,
          role: "parent",
        }),
      });
      const j = await r.json().catch(() => ({}));
      if (r.status === 409) {
        setEtat({ ok: false, dejaInscrit: true, texte: j?.error ?? "Un compte existe déjà avec cette adresse e-mail." });
        return;
      }
      if (!r.ok || j?.success === false) throw new Error(j?.error ?? j?.message ?? `Inscription impossible (erreur ${r.status}).`);
      setEtat({ ok: true, invitations: Number(j?.data?.invitationsAcceptees ?? j?.invitationsAcceptees ?? 0) });
    } catch (err) {
      setEtat({ ok: false, texte: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-4 rounded-2xl border bg-card p-6 shadow-sm">
        <img src="/logo.png" alt="Kids'Med IA" className="mx-auto h-20 w-20 object-contain" />
        <div className="text-center">
          <h1 className="font-display text-2xl font-semibold">Créer mon profil</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {invite ? "Vous avez été invité(e) à rejoindre un dossier enfant." : "Inscription réservée aux parents et aux personnes invitées par une crèche."}
          </p>
        </div>

        {invite && (
          <p className="rounded-xl bg-accent/60 p-3 text-sm">
            <Mail className="mr-1 inline h-4 w-4" />
            Utilisez l'adresse e-mail qui a reçu l'invitation. Le dossier de l'enfant sera rattaché automatiquement.
          </p>
        )}

        {etat?.ok ? (
          <div className="space-y-4 rounded-xl bg-success/10 p-4 text-sm text-success">
            <p className="flex items-center gap-2 font-medium"><CheckCircle2 className="h-5 w-5" />Compte créé avec succès.</p>
            <p className="text-foreground">
              {etat.invitations > 0
                ? `${etat.invitations} dossier(s) enfant ont été rattachés à votre compte. `
                : ""}
              Connectez-vous avec votre e-mail et votre mot de passe pour accéder à votre espace.
            </p>
            <Button asChild className="w-full"><Link to="/connexion">Se connecter</Link></Button>
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5"><Label htmlFor="prenom">Prénom *</Label><Input id="prenom" required autoComplete="given-name" value={form.prenom} onChange={set("prenom")} /></div>
              <div className="space-y-1.5"><Label htmlFor="nom">Nom *</Label><Input id="nom" required autoComplete="family-name" value={form.nom} onChange={set("nom")} /></div>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">E-mail *</Label>
              <Input id="email" type="email" required autoComplete="email" readOnly={invite} value={form.email} onChange={set("email")} />
            </div>
            <div className="space-y-1.5"><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" type="tel" autoComplete="tel" value={form.telephone} onChange={set("telephone")} /></div>
            <div className="space-y-1.5"><Label htmlFor="password">Mot de passe * (8 caractères min.)</Label><Input id="password" type="password" required minLength={8} autoComplete="new-password" value={form.password} onChange={set("password")} /></div>
            <div className="space-y-1.5"><Label htmlFor="confirmation">Confirmer le mot de passe *</Label><Input id="confirmation" type="password" required minLength={8} autoComplete="new-password" value={form.confirmation} onChange={set("confirmation")} /></div>

            {etat && !etat.ok && (
              <div role="alert" className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
                <p>{etat.texte}</p>
                {etat.dejaInscrit && (
                  <p className="mt-2 flex flex-wrap gap-3">
                    <Link to="/connexion" className="font-medium underline">Se connecter</Link>
                    <Link to="/reinitialiser" className="font-medium underline">Réinitialiser mon mot de passe</Link>
                  </p>
                )}
              </div>
            )}

            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
              {busy ? "Création…" : "Créer mon compte"}
            </Button>
            <p className="text-center text-xs text-muted-foreground">
              En vous inscrivant, vous acceptez le traitement de vos données de santé conformément au RGPD.
            </p>
            <p className="flex items-center justify-center gap-1 text-center text-sm text-muted-foreground">
              <KeyRound className="h-3.5 w-3.5" /> Déjà un compte ? <Link to="/connexion" className="text-primary underline">Se connecter</Link>
            </p>
          </form>
        )}
      </div>
    </main>
  );
}
