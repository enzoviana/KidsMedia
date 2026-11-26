import { useEffect, useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  HeartPulse,
  Lock,
  Mail,
  Menu,
  ShieldCheck,
  Sparkles,
  X,
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
  { label: "Sécurité", to: "/securite-rgpd" as const },
  { label: "À propos", to: "/a-propos" as const },
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
  const [scrolled, setScrolled] = useState(false);
  const espaceHref = useEspaceHref();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <div className="relative z-50 overflow-hidden bg-[#0b1020] text-white">
        <div className="mx-auto flex max-w-7xl items-center justify-center gap-2 px-4 py-2 text-center text-[11px] font-medium tracking-wide sm:text-xs">
          <Sparkles className="h-3.5 w-3.5 text-[#ff9ec4]" />
          Nouveau : l’aide IA aux symptômes et le QR d’urgence, pensés pour le terrain.
          <Link
            to="/fonctionnalites"
            className="hidden items-center gap-1 underline decoration-white/30 underline-offset-4 hover:decoration-white sm:inline-flex"
          >
            Découvrir <ArrowUpRight className="h-3 w-3" />
          </Link>
        </div>
      </div>
      <header
        className={`sticky top-0 z-40 transition-all duration-300 ${scrolled ? "border-b border-black/10 bg-[#f7f5ef]/90 shadow-[0_10px_40px_-20px_rgba(11,16,32,0.35)] backdrop-blur-xl" : "bg-[#f7f5ef]/70 backdrop-blur-md"}`}
      >
        <div className="mx-auto flex h-[72px] max-w-7xl items-center gap-4 px-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="group flex shrink-0 items-center gap-2.5"
            aria-label="Kids'Med IA — accueil"
          >
            <img
              src="/logo.png"
              alt=""
              className="h-10 w-10 rounded-2xl object-contain transition group-hover:scale-105"
            />
            <span className="font-display text-[19px] font-bold tracking-tight text-[#0b1020]">
              Kids’<span className="text-[#2f6bff]">Med</span>
              <span className="text-[#ef4f8f]">IA</span>
            </span>
          </Link>
          <nav
            aria-label="Navigation principale"
            className="hidden flex-1 items-center justify-center gap-1 lg:flex"
          >
            {NAV.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className="rounded-full px-4 py-2 text-sm font-semibold text-[#4d5261] transition hover:bg-white hover:text-[#0b1020]"
                activeProps={{ className: "bg-white text-[#0b1020] shadow-sm" }}
              >
                {item.label}
              </Link>
            ))}
            <Link
              to="/contact"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#4d5261] transition hover:bg-white hover:text-[#0b1020]"
              activeProps={{ className: "bg-white text-[#0b1020] shadow-sm" }}
            >
              Contact
            </Link>
          </nav>
          <div className="ml-auto flex items-center gap-2">
            <Link
              to={espaceHref}
              className="hidden rounded-full border border-black/10 bg-white/60 px-4 py-2.5 text-sm font-semibold text-[#0b1020] transition hover:bg-white sm:inline-flex"
            >
              Mon espace
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-1.5 rounded-full bg-[#0b1020] px-4 py-2.5 text-sm font-semibold text-white shadow-[0_10px_30px_-12px_rgba(11,16,32,0.7)] transition hover:bg-[#1b2440]"
            >
              Demander une démo
              <ArrowUpRight className="h-4 w-4 transition group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-black/10 bg-white/60 lg:hidden"
              aria-label={open ? "Fermer le menu" : "Ouvrir le menu"}
              aria-expanded={open}
              onClick={() => setOpen((v) => !v)}
            >
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
        {open && (
          <nav
            aria-label="Navigation mobile"
            className="border-t border-black/10 bg-[#f7f5ef] px-4 py-4 lg:hidden"
          >
            <ul className="space-y-1">
              {[...NAV, { label: "Contact", to: "/contact" as const }].map((item) => (
                <li key={item.to}>
                  <Link
                    to={item.to}
                    onClick={() => setOpen(false)}
                    className="block rounded-xl px-4 py-3 text-sm font-semibold hover:bg-white"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li className="pt-2">
                <Link
                  to={espaceHref}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl bg-white px-4 py-3 text-sm font-bold text-[#2f6bff]"
                >
                  Mon espace
                </Link>
              </li>
            </ul>
          </nav>
        )}
      </header>
    </>
  );
}

export function MarketingFooter() {
  return (
    <footer className="relative overflow-hidden bg-[#0b1020] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-32 top-0 h-80 w-80 rounded-full bg-[#2f6bff]/25 blur-[110px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-24 bottom-0 h-80 w-80 rounded-full bg-[#ef4f8f]/20 blur-[110px]"
      />
      <div className="relative mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.5fr_1fr_1fr_1fr] lg:px-8">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <img
              src="/logo.png"
              alt=""
              className="h-11 w-11 rounded-2xl bg-white/95 p-1 object-contain"
            />
            <span className="font-display text-xl font-bold">
              Kids’<span className="text-[#7fa7ff]">Med</span>
              <span className="text-[#ff8fbe]">IA</span>
            </span>
          </Link>
          <p className="mt-5 max-w-sm text-sm leading-relaxed text-white/60">
            La santé des tout-petits, partagée en toute confiance entre crèches, RSAI, médecins et
            parents.
          </p>
          <a
            href="mailto:contact@kidsmed.fr"
            className="mt-5 inline-flex items-center gap-2 text-sm text-white/70 transition hover:text-white"
          >
            <Mail className="h-4 w-4" /> contact@kidsmed.fr
          </a>
          <div className="mt-6 flex flex-wrap gap-2 text-[11px] text-white/65">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-[#9dffc8]" /> RGPD
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <Lock className="h-3.5 w-3.5 text-[#8fb4ff]" /> Données protégées
            </span>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-white/15 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#ff9ec4]" /> IA d’aide
            </span>
          </div>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Produit</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/fonctionnalites" className="transition hover:text-white">
                Fonctionnalités
              </Link>
            </li>
            <li>
              <Link to="/tarifs" className="transition hover:text-white">
                Tarifs
              </Link>
            </li>
            <li>
              <Link to="/securite-rgpd" className="transition hover:text-white">
                Sécurité & RGPD
              </Link>
            </li>
            <li>
              <Link to="/contact" className="transition hover:text-white">
                Demander une démo
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Ressources</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/a-propos" className="transition hover:text-white">
                À propos
              </Link>
            </li>
            <li>
              <Link to="/connexion" className="transition hover:text-white">
                Se connecter
              </Link>
            </li>
            <li>
              <Link to="/inscription" className="transition hover:text-white">
                Créer un compte parent
              </Link>
            </li>
          </ul>
        </div>
        <div>
          <p className="text-sm font-semibold text-white">Légal</p>
          <ul className="mt-4 space-y-2.5 text-sm text-white/60">
            <li>
              <Link to="/mentions-legales" className="transition hover:text-white">
                Mentions légales
              </Link>
            </li>
            <li>
              <Link to="/confidentialite" className="transition hover:text-white">
                Confidentialité
              </Link>
            </li>
            <li>
              <Link to="/cgu" className="transition hover:text-white">
                CGU
              </Link>
            </li>
          </ul>
        </div>
      </div>
      <div className="relative border-t border-white/10 px-4 py-6 text-center text-xs text-white/45">
        © 2026 Kids’Med IA · DataFuse. L’assistance IA ne remplace pas un avis médical.
      </div>
    </footer>
  );
}

export function MarketingLayout({ children }: { children: ReactNode }) {
  return (
    <div className="marketing-site min-h-screen bg-[#f7f5ef] text-[#0b1020] antialiased">
      <a
        href="#contenu"
        className="sr-only rounded-full bg-[#0b1020] px-5 py-3 text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[60]"
      >
        Aller au contenu
      </a>
      <MarketingHeader />
      <main id="contenu">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function Eyebrow({ children, light }: { children: ReactNode; light?: boolean | undefined }) {
  return (
    <p
      className={`mb-4 inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-[11px] font-bold uppercase tracking-[0.16em] ${light ? "border-white/15 bg-white/10 text-white/80" : "border-black/10 bg-white text-[#4d5261]"}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-[#2f6bff]" />
      {children}
    </p>
  );
}

export function SectionHeading({
  eyebrow,
  title,
  lead,
  center,
  light,
}: {
  eyebrow?: string | undefined;
  title: string;
  lead?: string | undefined;
  center?: boolean | undefined;
  light?: boolean | undefined;
}) {
  return (
    <div className={center ? "mx-auto max-w-3xl text-center" : "max-w-3xl"}>
      {eyebrow && <Eyebrow light={light}>{eyebrow}</Eyebrow>}
      <h2
        className={`text-balance font-display text-[clamp(2rem,4vw,3.6rem)] font-semibold leading-[1.02] tracking-[-0.045em] ${light ? "text-white" : "text-[#0b1020]"}`}
      >
        {title}
      </h2>
      {lead && (
        <p
          className={`mt-5 text-pretty text-base leading-relaxed sm:text-lg ${light ? "text-white/65" : "text-[#5a6070]"}`}
        >
          {lead}
        </p>
      )}
    </div>
  );
}

export function CheckItem({ children }: { children: ReactNode }) {
  return (
    <li className="flex gap-3 text-sm leading-relaxed">
      <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full bg-[#e7f8ee] text-[#1a9d5a]">
        <Check className="h-3 w-3" strokeWidth={3} />
      </span>
      <span>{children}</span>
    </li>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  children,
}: {
  eyebrow: string;
  title: string;
  lead: string;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden bg-[#0b1020] text-white">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-20 top-0 h-96 w-96 rounded-full bg-[#2f6bff]/30 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-20 bottom-0 h-96 w-96 rounded-full bg-[#ef4f8f]/25 blur-[120px]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute left-1/2 top-1/2 h-72 w-72 -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#9dffc8]/10 blur-[100px]"
      />
      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-24">
        <Eyebrow light>{eyebrow}</Eyebrow>
        <h1 className="max-w-4xl text-balance font-display text-[clamp(2.5rem,5vw,4.8rem)] font-semibold leading-[0.98] tracking-[-0.055em]">
          {title}
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg leading-relaxed text-white/65">{lead}</p>
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function CtaBand({
  title = "Prêt à simplifier la santé des tout-petits ?",
  text = "Échangeons sur vos besoins : crèche, réseau de crèches, RSAI ou cabinet médical.",
  primary = "Demander une démo",
}: {
  title?: string;
  text?: string;
  primary?: string;
}) {
  return (
    <section className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0b1020] px-6 py-16 text-center text-white shadow-[0_40px_100px_-40px_rgba(11,16,32,0.55)] sm:px-12">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-24 -top-24 h-72 w-72 rounded-full bg-[#2f6bff]/40 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-[#ef4f8f]/35 blur-[100px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute left-1/2 top-0 h-56 w-56 -translate-x-1/2 rounded-full bg-[#9dffc8]/15 blur-[80px]"
        />
        <div className="relative">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-white/15 bg-white/10">
            <HeartPulse className="h-7 w-7 text-[#ff9ec4]" />
          </span>
          <h2 className="mx-auto mt-5 max-w-2xl text-balance font-display text-[clamp(2rem,4vw,3.4rem)] font-semibold leading-[1.02] tracking-[-0.05em]">
            {title}
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-pretty text-white/60">{text}</p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#0b1020] transition hover:bg-[#e9e6dc]"
            >
              {primary}
              <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
            </Link>
            <Link
              to="/tarifs"
              className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
            >
              Voir les tarifs
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
