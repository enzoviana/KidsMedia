import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight, Check, HeartPulse, Lock, Mail, Menu, ShieldCheck, Sparkles, X,
} from "lucide-react";
import { getSession, roleToKey, type RoleKey } from "@/lib/api";

const ESPACE: Record<RoleKey, string> = {
  parent: "/parent",
  creche: "/creche",
  rsai: "/rsai",
  medecin: "/medecin",
  directeur: "/directeur",
  admin: "/admin",
  dev: "/dev",
};

const NAV = [
  { label: "Fonctionnalités", to: "/fonctionnalites" as const },
  { label: "Tarifs", to: "/tarifs" as const },
  { label: "Sécurité & RGPD", to: "/securite-rgpd" as const },
  { label: "À propos", to: "/a-propos" as const },
  { label: "Contact", to: "/contact" as const },
];

function useEspaceHref() {
  const [href, setHref] = useState("/connexion");
  useEffect(() => {
    const session = getSession();
    const role = session && !session.demo ? roleToKey(session.user.role) : null;
    if (role) setHref(ESPACE[role]);
  }, []);
  return href;
}

export function MarketingHeader() {
  const [open, setOpen] = useState(false);
  const espaceHref = useEspaceHref();
  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-background/85 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
        <Link to="/" className="flex shrink-0 items-center gap-2" aria-label="Kids'Med IA — accueil">
          <img src="/logo.png" alt="" className="h-9 w-9 rounded-xl object-contain" />
          <span className="font-display text-lg font-bold tracking-tight">
            <span className="text-brand-blue">Kids'</span><span className="text-brand-green">Med</span><span className="text-brand-pink">IA</span>
          </span>
        </Link>
        <nav aria-label="Navigation principale" className="hidden flex-1 items-center justify-center gap-1 lg:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition hover:bg-accent hover:text-foreground" activeProps={{ className: "bg-accent text-foreground" }}>
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-2">
          <Link to={espaceHref} className="hidden rounded-xl border px-4 py-2 text-sm font-semibold transition hover:bg-accent sm:inline-flex">
            Mon espace
          </Link>
          <Link to="/contact" className="inline-flex items-center gap-1.5 rounded-xl bg-brand-gradient px-4 py-2 text-sm font-semibold text-on-vivid shadow-sm transition hover:opacity-90">
            Demander une démo <ArrowRight className="h-4 w-4" />
          </Link>
          <button type="button" className="inline-flex h-10 w-10 items-center justify-center rounded-xl border lg:hidden" aria-label={open ? "Fermer le menu" : "Ouvrir le menu"} aria-expanded={open} onClick={() => setOpen((v) => !v)}>
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>
      {open && (
        <nav aria-label="Navigation mobile" className="border-t bg-background px-4 py-3 lg:hidden">
          <ul className="space-y-1">
            {NAV.map((item) => (
              <li key={item.to}><Link to={item.to} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-medium hover:bg-accent">{item.label}</Link></li>
            ))}
            <li><Link to={espaceHref} onClick={() => setOpen(false)} className="block rounded-lg px-3 py-2.5 text-sm font-semibold text-brand-blue">Mon espace</Link></li>
          </ul>
        </nav>
      )}
    </header>
  );
}

export function MarketingFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="" className="h-10 w-10 rounded-xl object-contain" />
            <span className="font-display text-lg font-bold"><span className="text-brand-blue">Kids'</span><span className="text-brand-green">Med</span><span className="text-brand-pink">IA</span></span>
          </Link>
          <p className="mt-4 max-w-sm text-sm leading-relaxed text-muted-foreground">
            La santé des tout-petits, partagée en toute confiance entre crèches, RSAI, médecins et parents.
          </p>
          <p className="mt-4 flex items-center gap-2 text-sm text-muted-foreground"><Mail className="h-4 w-4" /> <a href="mailto:contact@kidsmed.fr" className="underline-offset-4 hover:underline">contact@kidsmed.fr</a></p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5 text-brand-green" /> RGPD</span>
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><Lock className="h-3.5 w-3.5 text-brand-blue" /> Données en France</span>
            <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><Sparkles className="h-3.5 w-3.5 text-brand-pink" /> IA d'aide</span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold">Produit</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/fonctionnalites" className="hover:text-foreground">Fonctionnalités</Link></li>
            <li><Link to="/tarifs" className="hover:text-foreground">Tarifs</Link></li>
            <li><Link to="/securite-rgpd" className="hover:text-foreground">Sécurité & RGPD</Link></li>
            <li><Link to="/contact" className="hover:text-foreground">Demander une démo</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Ressources</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/a-propos" className="hover:text-foreground">À propos</Link></li>
            <li><Link to="/connexion" className="hover:text-foreground">Se connecter</Link></li>
            <li><Link to="/inscription" className="hover:text-foreground">Créer un compte parent</Link></li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold">Légal</p>
          <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
            <li><Link to="/mentions-legales" className="hover:text-foreground">Mentions légales</Link></li>
            <li><Link to="/confidentialite" className="hover:text-foreground">Confidentialité</Link></li>
            <li><Link to="/cgu" className="hover:text-foreground">CGU</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t px-4 py-5 text-center text-xs text-muted-foreground">
        © 2026 Kids'Med IA · DataFuse. Tous droits réservés. L'assistance IA ne remplace pas un avis médical.
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <a href="#contenu" className="sr-only rounded-lg bg-primary px-4 py-2 text-primary-foreground focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]">Aller au contenu</a>
      <MarketingHeader />
      <main id="contenu">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function Eyebrow({ children }: { children: ReactNode }) {
  return <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-brand-blue">{children}</p>;
}

export function SectionHeading({ eyebrow, title, lead, center }: { eyebrow?: string; title: string; lead?: string; center?: boolean }) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
      <h2 className="font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
      {lead && <p className="mt-4 text-base leading-relaxed text-muted-foreground sm:text-lg">{lead}</p>}
    </div>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return <li className="flex gap-2.5 text-sm leading-relaxed"><Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" /><span>{children}</span></li>;
}

export function CtaBand({ title = "Prêt à simplifier la santé des tout-petits ?", text = "Échangeons sur vos besoins : crèche, réseau de crèches, RSAI ou cabinet médical.", primary = "Demander une démo" }: { title?: string; text?: string; primary?: string }) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-3xl bg-brand-gradient p-[1px] shadow-xl">
        <div className="relative overflow-hidden rounded-[calc(1.5rem-1px)] bg-card px-6 py-12 text-center sm:px-12">
          <div aria-hidden className="pointer-events-none absolute -right-20 -top-24 h-64 w-64 rounded-full bg-brand-pink/10 blur-3xl" />
          <div aria-hidden className="pointer-events-none absolute -bottom-24 -left-20 h-64 w-64 rounded-full bg-brand-blue/10 blur-3xl" />
          <HeartPulse className="mx-auto h-10 w-10 text-brand-pink" />
          <h2 className="mx-auto mt-4 max-w-2xl font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">{text}</p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3 text-sm font-semibold text-on-vivid shadow-sm transition hover:opacity-90">{primary} <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/tarifs" className="inline-flex items-center gap-2 rounded-xl border bg-background px-6 py-3 text-sm font-semibold transition hover:bg-accent">Voir les tarifs</Link>
          </div>
        </div>
      </div>
    </section>
  );
}
