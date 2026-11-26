import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { CheckCircle2, Clock, Loader2, Mail, Send, ShieldCheck } from "lucide-react";
import { MarketingLayout, SectionHeading } from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd } from "@/lib/seo";
import { API_BASE } from "@/lib/api";

export const Route = createFileRoute("/contact")({
  head: () =>
    seoHead({
      title: "Contact et demande de démo — Kids'Med IA",
      description:
        "Contactez Kids'Med IA pour une démonstration, un devis crèche, un réseau de crèches, une RSAI ou un cabinet médical. Réponse sous 1 à 2 jours ouvrés.",
      path: "/contact",
      keywords: ["contact Kids'Med IA", "démo logiciel crèche", "devis crèche", "logiciel RSAI"],
    }),
  component: Page,
});

const ROLES = [
  ["creche", "Crèche"],
  ["groupe", "Réseau / groupe de crèches"],
  ["rsai", "RSAI"],
  ["medecin", "Médecin / cabinet"],
  ["parent", "Parent"],
  ["autre", "Autre"],
];

const SUJETS = [
  ["demo", "Demander une démonstration"],
  ["tarifs", "Obtenir un devis / tarifs"],
  ["fonctionnalites", "Question sur les fonctionnalités"],
  ["rgpd", "Sécurité et RGPD"],
  ["partenariat", "Partenariat"],
  ["support", "Support"],
  ["autre", "Autre demande"],
];

function Page() {
  const [form, setForm] = useState({ nom: "", email: "", telephone: "", etablissement: "", role: "creche", sujet: "demo", message: "", consentement: false, website: "" });
  const [etat, setEtat] = useState<"idle" | "busy" | "ok" | "error">("idle");
  const [erreur, setErreur] = useState("");
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target instanceof HTMLInputElement && e.target.type === "checkbox" ? e.target.checked : e.target.value }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErreur("");
    if (form.message.trim().length < 10) { setErreur("Merci de préciser votre demande (10 caractères minimum)."); return; }
    if (!form.consentement) { setErreur("Merci d'accepter le traitement de vos données pour vous répondre."); return; }
    setEtat("busy");
    try {
      const r = await fetch(`${API_BASE}/contact`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, message: form.message.trim() }),
      });
      const j = await r.json().catch(() => ({}));
      if (!r.ok || j?.success === false) throw new Error(j?.error ?? j?.message ?? "Envoi impossible pour le moment.");
      setEtat("ok");
    } catch (err) {
      setErreur((err as Error).message === "Failed to fetch" ? "Le serveur ne répond pas. Réessayez ou écrivez à contact@kidsmed.fr." : (err as Error).message);
      setEtat("error");
    }
  }

  return (
    <MarketingLayout>
      <JsonLd data={[breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Contact", path: "/contact" }]), {
        "@context": "https://schema.org",
        "@type": "ContactPage",
        name: "Contact Kids'Med IA",
        url: "https://kidsmedia.vercel.app/contact",
        mainEntity: { "@type": "Organization", name: "Kids'Med IA", email: "contact@kidsmed.fr" },
      }]} />
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Contact" title="Parlons de votre structure." lead="Une démonstration, un devis, une question sur la sécurité ou simplement envie de découvrir la plateforme ? Écrivez-nous." />
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
        <div className="rounded-3xl border bg-card p-6 shadow-sm sm:p-8">
          {etat === "ok" ? (
            <div className="flex flex-col items-center py-12 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-full bg-brand-green/15 text-brand-green"><CheckCircle2 className="h-8 w-8" /></span>
              <h2 className="mt-5 font-display text-2xl font-semibold">Message bien reçu.</h2>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Merci pour votre confiance. Notre équipe vous répond sous 1 à 2 jours ouvrés à l'adresse indiquée.</p>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link to="/" className="rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-on-vivid">Retour à l'accueil</Link>
                <Link to="/fonctionnalites" className="rounded-xl border px-5 py-2.5 text-sm font-semibold hover:bg-accent">Voir les fonctionnalités</Link>
              </div>
            </div>
          ) : (
            <form onSubmit={submit} className="space-y-4">
              <input tabIndex={-1} autoComplete="off" aria-hidden="true" name="website" value={form.website} onChange={set("website")} className="hidden" />
              <div className="grid gap-4 sm:grid-cols-2">
                <div><label htmlFor="nom" className="mb-1.5 block text-sm font-medium">Nom et prénom *</label><input id="nom" required autoComplete="name" value={form.nom} onChange={set("nom")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-brand-blue/30 focus:ring-2" /></div>
                <div><label htmlFor="email" className="mb-1.5 block text-sm font-medium">E-mail *</label><input id="email" type="email" required autoComplete="email" value={form.email} onChange={set("email")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-brand-blue/30 focus:ring-2" /></div>
                <div><label htmlFor="telephone" className="mb-1.5 block text-sm font-medium">Téléphone</label><input id="telephone" type="tel" autoComplete="tel" value={form.telephone} onChange={set("telephone")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-brand-blue/30 focus:ring-2" /></div>
                <div><label htmlFor="etablissement" className="mb-1.5 block text-sm font-medium">Crèche / structure</label><input id="etablissement" autoComplete="organization" value={form.etablissement} onChange={set("etablissement")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm outline-none ring-brand-blue/30 focus:ring-2" /></div>
                <div><label htmlFor="role" className="mb-1.5 block text-sm font-medium">Votre rôle</label><select id="role" value={form.role} onChange={set("role")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm">{ROLES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
                <div><label htmlFor="sujet" className="mb-1.5 block text-sm font-medium">Sujet</label><select id="sujet" value={form.sujet} onChange={set("sujet")} className="h-11 w-full rounded-xl border bg-background px-3 text-sm">{SUJETS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select></div>
              </div>
              <div><label htmlFor="message" className="mb-1.5 block text-sm font-medium">Votre message *</label><textarea id="message" required rows={6} value={form.message} onChange={set("message")} placeholder="Nombre de crèches, d'enfants, besoins principaux…" className="w-full rounded-xl border bg-background px-3 py-2.5 text-sm outline-none ring-brand-blue/30 focus:ring-2" /></div>
              <label className="flex items-start gap-2.5 text-xs leading-relaxed text-muted-foreground">
                <input type="checkbox" checked={form.consentement} onChange={set("consentement")} className="mt-0.5 h-4 w-4 rounded border" />
                <span>J'accepte que mes données soient utilisées pour traiter ma demande. Elles ne servent pas à de la prospection non sollicitée. Voir la <Link to="/confidentialite" className="text-brand-blue underline">politique de confidentialité</Link>.</span>
              </label>
              {erreur && <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">{erreur}</p>}
              <button type="submit" disabled={etat === "busy"} className="inline-flex items-center justify-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-vivid shadow-sm transition hover:opacity-90 disabled:opacity-70">
                {etat === "busy" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} {etat === "busy" ? "Envoi…" : "Envoyer ma demande"}
              </button>
            </form>
          )}
        </div>

        <aside className="space-y-4">
          <div className="rounded-3xl border bg-card p-6">
            <Mail className="h-6 w-6 text-brand-blue" />
            <h2 className="mt-3 font-display text-xl font-semibold">Écrire directement</h2>
            <p className="mt-2 text-sm text-muted-foreground">Pour toute demande urgente ou pour joindre un document :</p>
            <a href="mailto:contact@kidsmed.fr" className="mt-3 inline-flex font-medium text-brand-blue hover:underline">contact@kidsmed.fr</a>
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <Clock className="h-6 w-6 text-brand-pink" />
            <h2 className="mt-3 font-display text-xl font-semibold">Délai de réponse</h2>
            <p className="mt-2 text-sm text-muted-foreground">Nous répondons généralement sous 1 à 2 jours ouvrés. La démonstration dure environ 30 minutes.</p>
          </div>
          <div className="rounded-3xl border bg-card p-6">
            <ShieldCheck className="h-6 w-6 text-brand-green" />
            <h2 className="mt-3 font-display text-xl font-semibold">Vos données</h2>
            <p className="mt-2 text-sm text-muted-foreground">Les informations du formulaire servent uniquement à répondre à votre demande. Vous pouvez demander leur suppression à tout moment.</p>
          </div>
        </aside>
      </section>
    </MarketingLayout>
  );
}
