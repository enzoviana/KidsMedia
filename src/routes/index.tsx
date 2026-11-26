import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight,
  ArrowUpRight,
  Baby,
  BellRing,
  BrainCircuit,
  Building2,
  CheckCircle2,
  FileText,
  HeartHandshake,
  HeartPulse,
  Lock,
  MessageSquareText,
  Pill,
  QrCode,
  ShieldCheck,
  Sparkles,
  Stethoscope,
  Users,
} from "lucide-react";
import { isStandalone } from "@/components/pwa/install";
import { MarketingLayout, CtaBand, SectionHeading, CheckItem } from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, organizationJsonLd, softwareJsonLd, faqJsonLd } from "@/lib/seo";
import enfantPhoto from "@/assets/enfant-demo.jpg";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Kids'Med IA — Dossier de santé partagé pour crèches, RSAI, médecins et parents",
      description:
        "Plateforme santé petite enfance : dossier partagé, transmissions, traitements, aide IA au signalement des symptômes, QR d'urgence et conformité RGPD. Demandez une démo.",
      path: "/",
      keywords: [
        "santé crèche",
        "logiciel crèche",
        "dossier médical enfant",
        "RSAI",
        "petite enfance",
        "RGPD santé",
        "IA symptômes",
      ],
    }),
  component: Home,
});

const FAQ = [
  {
    question: "Qui peut utiliser Kids'Med IA ?",
    answer:
      "Les crèches, les réseaux et groupes de crèches, les RSAI, les médecins et les parents. Chaque rôle dispose d'un espace dédié et de droits d'accès limités à ce qui le concerne.",
  },
  {
    question: "Les données de santé sont-elles protégées ?",
    answer:
      "La plateforme applique les principes du RGPD : accès par rôle, minimisation, journalisation, liens privés et exercice des droits. Les modalités d'hébergement et de sous-traitance sont précisées dans la politique de confidentialité.",
  },
  {
    question: "L'IA remplace-t-elle le médecin ?",
    answer:
      "Non. L'aide IA qualifie des symptômes déclarés et propose une orientation de vigilance. Elle ne pose pas de diagnostic et ne remplace jamais une consultation médicale ou les consignes des professionnels de santé.",
  },
  {
    question: "Comment fonctionne une invitation parent ?",
    answer:
      "La crèche peut lier un parent par e-mail. La personne reçoit un lien sécurisé vers la page d'inscription, crée son profil, puis le dossier de son enfant est automatiquement rattaché à son compte.",
  },
  {
    question: "Peut-on gérer plusieurs crèches et un abonnement de groupe ?",
    answer:
      "Oui. Le rôle Direction territoriale supervise toutes les crèches d'un groupe. L'abonnement est porté par le groupe : les crèches rattachées n'ont pas d'abonnement individuel.",
  },
];

const MARQUEE = [
  "Dossier partagé",
  "Transmissions",
  "Traitements",
  "QR d'urgence",
  "Aide IA",
  "Coordination RSAI",
  "Espace parent",
  "Documents obligatoires",
  "RGPD",
  "Multi-crèches",
];

function Home() {
  useEffect(() => {
    if (isStandalone()) window.location.replace("/app");
  }, []);

  return (
    <MarketingLayout>
      <JsonLd data={[organizationJsonLd, softwareJsonLd, faqJsonLd(FAQ)]} />

      {/* HERO */}
      <section className="relative overflow-hidden bg-[#0b1020] text-white">
        <div
          aria-hidden
          className="pointer-events-none absolute -left-40 -top-32 h-[34rem] w-[34rem] rounded-full bg-[#2f6bff]/35 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-10 h-[30rem] w-[30rem] rounded-full bg-[#ef4f8f]/30 blur-[130px]"
        />
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-0 left-1/3 h-72 w-72 rounded-full bg-[#9dffc8]/15 blur-[100px]"
        />
        <div className="relative mx-auto grid max-w-7xl items-center gap-14 px-4 pb-20 pt-16 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:px-8 lg:pb-28 lg:pt-24">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3.5 py-1.5 text-[11px] font-semibold uppercase tracking-[0.16em] text-white/80 backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-[#ff9ec4]" /> Santé petite enfance · IA d’aide
            </p>
            <h1 className="mt-7 text-balance font-display text-[clamp(3rem,6vw,5.8rem)] font-semibold leading-[0.92] tracking-[-0.06em]">
              La santé des tout-petits,
              <span className="block bg-gradient-to-r from-[#8fb4ff] via-[#9dffc8] to-[#ff9ec4] bg-clip-text text-transparent">
                sans zone d’ombre.
              </span>
            </h1>
            <p className="mt-7 max-w-xl text-pretty text-lg leading-relaxed text-white/65">
              Un seul espace pour relier la crèche, les parents, la RSAI et le médecin.
              Transmissions, traitements, documents, alertes et QR d’urgence : l’essentiel, au bon
              moment.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link
                to="/contact"
                className="group inline-flex items-center gap-2 rounded-full bg-white px-6 py-3.5 text-sm font-bold text-[#0b1020] shadow-[0_20px_50px_-20px_rgba(255,255,255,0.5)] transition hover:bg-[#e9e6dc]"
              >
                Demander une démo{" "}
                <ArrowRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </Link>
              <Link
                to="/fonctionnalites"
                className="inline-flex items-center gap-2 rounded-full border border-white/20 px-6 py-3.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                Explorer la plateforme
              </Link>
            </div>
            <div className="mt-9 flex flex-wrap items-center gap-x-6 gap-y-3 text-[13px] text-white/55">
              <span className="inline-flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#9dffc8]" /> Conforme RGPD
              </span>
              <span className="inline-flex items-center gap-2">
                <Lock className="h-4 w-4 text-[#8fb4ff]" /> Accès par rôle
              </span>
              <span className="inline-flex items-center gap-2">
                <HeartPulse className="h-4 w-4 text-[#ff9ec4]" /> Pensé avec le terrain
              </span>
            </div>
          </div>

          {/* Composition photo + UI flottante */}
          <div className="relative mx-auto w-full max-w-[30rem] lg:max-w-none">
            <div
              aria-hidden
              className="marketing-glow absolute -inset-8 rounded-[3rem] bg-gradient-to-tr from-[#2f6bff]/40 via-[#9dffc8]/20 to-[#ef4f8f]/40 blur-3xl"
            />
            <div className="relative">
              <div className="relative overflow-hidden rounded-[2.75rem] border border-white/15 bg-white/10 p-2 shadow-[0_50px_120px_-40px_rgba(0,0,0,0.8)]">
                <div className="overflow-hidden rounded-[2.25rem]">
                  <img
                    src={enfantPhoto}
                    alt="Enfant souriant avec de la peinture sur les joues"
                    width={816}
                    height={816}
                    className="h-[24rem] w-full object-cover sm:h-[30rem]"
                    loading="eager"
                    fetchPriority="high"
                  />
                </div>
                <div className="pointer-events-none absolute inset-0 rounded-[2.75rem] ring-1 ring-inset ring-white/20" />
              </div>

              <div className="marketing-float absolute -left-4 top-10 w-[13.5rem] rounded-2xl border border-white/20 bg-white/95 p-3.5 text-[#0b1020] shadow-2xl backdrop-blur sm:-left-10">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-[#fff1f6] text-[#ef4f8f]">
                    <BellRing className="h-4.5 w-4.5" />
                  </span>
                  <div>
                    <p className="text-xs font-bold">Alerte douce</p>
                    <p className="text-[11px] text-[#5a6070]">Parents prévenus</p>
                  </div>
                </div>
                <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0b1020]/10">
                  <div className="h-full w-3/4 rounded-full bg-gradient-to-r from-[#ef4f8f] to-[#ffb1cf]" />
                </div>
              </div>

              <div
                className="marketing-float absolute -bottom-6 -right-3 w-[15.5rem] rounded-2xl border border-white/20 bg-white/95 p-4 text-[#0b1020] shadow-2xl backdrop-blur sm:-right-8"
                style={{ animationDelay: "-2.4s" }}
              >
                <div className="flex items-center justify-between">
                  <p className="text-xs font-bold">Dossier partagé</p>
                  <span className="rounded-full bg-[#e7f8ee] px-2 py-0.5 text-[10px] font-bold text-[#1a9d5a]">
                    À jour
                  </span>
                </div>
                <div className="mt-3 space-y-2">
                  {[
                    { icon: MessageSquareText, label: "Transmissions" },
                    { icon: Pill, label: "Traitements" },
                    { icon: FileText, label: "Documents" },
                  ].map((row) => (
                    <div
                      key={row.label}
                      className="flex items-center gap-2 rounded-xl bg-[#f7f5ef] px-2.5 py-2"
                    >
                      <row.icon className="h-3.5 w-3.5 text-[#2f6bff]" />
                      <span className="flex-1 text-[11px] font-medium">{row.label}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-[#1a9d5a]" />
                    </div>
                  ))}
                </div>
              </div>

              <div
                className="marketing-float absolute -bottom-10 left-4 hidden items-center gap-2 rounded-full border border-white/20 bg-[#101830] px-4 py-2 text-[11px] font-semibold text-white shadow-xl sm:flex"
                style={{ animationDelay: "-4s" }}
              >
                <QrCode className="h-4 w-4 text-[#9dffc8]" /> QR d’urgence sécurisé
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <section
        aria-label="Fonctionnalités clés"
        className="overflow-hidden border-y border-black/10 bg-[#f7f5ef] py-5"
      >
        <div className="marketing-marquee flex w-max items-center gap-8 whitespace-nowrap">
          {[...MARQUEE, ...MARQUEE].map((item, index) => (
            <span
              key={`${item}-${index}`}
              className="inline-flex items-center gap-3 text-sm font-semibold text-[#5a6070]"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-[#2f6bff]" /> {item}
            </span>
          ))}
        </div>
      </section>

      {/* BENTO */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="La plateforme"
            title="Un dossier qui suit l’enfant, pas les outils."
            lead="Chaque information reste à sa place, accessible aux bonnes personnes. Les équipes gagnent du temps, les familles gagnent en clarté."
          />
          <Link
            to="/fonctionnalites"
            className="hidden items-center gap-2 text-sm font-bold text-[#2f6bff] underline-grow sm:inline-flex"
          >
            Voir les fonctionnalités <ArrowRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="mt-12 grid gap-4 lg:grid-cols-12">
          <article className="card-tilt relative overflow-hidden rounded-[2rem] border border-black/10 bg-white p-7 shadow-sm lg:col-span-7 lg:row-span-2">
            <div className="flex items-center justify-between">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-[#eef3ff] text-[#2f6bff]">
                <Baby className="h-6 w-6" />
              </span>
              <span className="rounded-full bg-[#e7f8ee] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#1a9d5a]">
                Vue unique
              </span>
            </div>
            <h3 className="mt-6 font-display text-3xl font-semibold tracking-[-0.04em]">
              Le dossier de l’enfant, enfin lisible.
            </h3>
            <p className="mt-3 max-w-lg text-sm leading-relaxed text-[#5a6070]">
              Identité, allergies, PAI, vaccins, traitements, transmissions et documents dans une
              fiche pensée pour le terrain.
            </p>
            <div className="mt-7 rounded-2xl border border-black/10 bg-[#f7f5ef] p-4">
              <div className="flex items-center gap-3 border-b border-black/10 pb-3">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-[#2f6bff] to-[#ef4f8f] text-sm font-bold text-white">
                  L
                </span>
                <div>
                  <p className="text-sm font-bold">Léa M.</p>
                  <p className="text-[11px] text-[#5a6070]">Section Bébés · 18 mois</p>
                </div>
                <span className="ml-auto rounded-full bg-white px-2.5 py-1 text-[10px] font-bold text-[#ef4f8f]">
                  PAI actif
                </span>
              </div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-[11px]">
                {[
                  ["Allergies", "Arachide"],
                  ["Groupe", "A+"],
                  ["Traitement", "2 / jour"],
                  ["Documents", "4 validés"],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl bg-white px-3 py-2">
                    <p className="text-[#5a6070]">{k}</p>
                    <p className="font-semibold">{v}</p>
                  </div>
                ))}
              </div>
            </div>
          </article>

          {[
            {
              icon: MessageSquareText,
              title: "Transmissions vivantes",
              text: "Repas, sieste, humeur, changes : les parents suivent la journée sans appeler.",
              tone: "bg-[#eef3ff] text-[#2f6bff]",
            },
            {
              icon: BrainCircuit,
              title: "IA qui aide, sans décider",
              text: "Un questionnaire guide la vigilance et oriente vers le bon niveau de soin.",
              tone: "bg-[#fff1f6] text-[#ef4f8f]",
            },
            {
              icon: ShieldCheck,
              title: "Sécurité par défaut",
              text: "Accès par rôle, journalisation et liens privés pour les documents médicaux.",
              tone: "bg-[#e7f8ee] text-[#1a9d5a]",
            },
            {
              icon: HeartPulse,
              title: "Coordination RSAI",
              text: "Affectations, horaires, géorepérage et registres au même endroit.",
              tone: "bg-[#fff7e8] text-[#b7791f]",
            },
          ].map((item, index) => (
            <article
              key={item.title}
              className={`card-tilt rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm ${index < 2 ? "lg:col-span-5" : "lg:col-span-6"}`}
            >
              <span className={`grid h-11 w-11 place-items-center rounded-2xl ${item.tone}`}>
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-5 font-display text-xl font-semibold tracking-[-0.03em]">
                {item.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[#5a6070]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* QUOTIDIEN */}
      <section className="relative overflow-hidden bg-[#0b1020] py-20 text-white lg:py-28">
        <div
          aria-hidden
          className="pointer-events-none absolute -right-32 top-0 h-96 w-96 rounded-full bg-[#2f6bff]/25 blur-[120px]"
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
            <SectionHeading
              light
              eyebrow="Le quotidien"
              title="Du premier accueil au départ du soir."
              lead="Kids’Med IA épouse les gestes réels de la crèche, sans ajouter une couche de complexité."
            />
            <div className="grid gap-3 sm:grid-cols-3">
              {[
                ["08:12", "Accueil", "Allergies et PAI visibles immédiatement."],
                ["11:40", "Transmission", "Repas et humeur partagés aux parents."],
                ["15:05", "Vigilance", "Signalement IA et message à la RSAI."],
              ].map(([time, title, text]) => (
                <div
                  key={time}
                  className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 backdrop-blur"
                >
                  <p className="font-mono text-[11px] text-[#9dffc8]">{time}</p>
                  <p className="mt-2 text-sm font-bold">{title}</p>
                  <p className="mt-1 text-xs leading-relaxed text-white/50">{text}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-12 grid gap-4 md:grid-cols-3">
            {[
              {
                icon: Building2,
                title: "Une crèche, une équipe",
                text: "Les professionnels retrouvent les enfants, les sections, les traitements et les documents sans quitter leur espace.",
                link: "/fonctionnalites",
              },
              {
                icon: Users,
                title: "Un parent rassuré",
                text: "Le suivi du jour, les alertes et les documents sont accessibles simplement, depuis le web ou l’application.",
                link: "/fonctionnalites",
              },
              {
                icon: Stethoscope,
                title: "Des pros coordonnés",
                text: "RSAI et médecins interviennent avec le bon niveau d’information et une traçabilité claire.",
                link: "/securite-rgpd",
              },
            ].map((item) => (
              <Link
                key={item.title}
                to={item.link}
                className="group rounded-[2rem] border border-white/10 bg-white/[0.05] p-6 transition hover:border-white/25 hover:bg-white/[0.08]"
              >
                <div className="flex items-start justify-between">
                  <span className="grid h-11 w-11 place-items-center rounded-2xl bg-white/10">
                    <item.icon className="h-5 w-5 text-[#8fb4ff]" />
                  </span>
                  <ArrowUpRight className="h-5 w-5 text-white/30 transition group-hover:text-white" />
                </div>
                <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">{item.text}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* RÔLES */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <SectionHeading
          center
          eyebrow="Un espace par rôle"
          title="Chacun voit ce qui le concerne."
          lead="Un socle commun, des permissions précises. La bonne information, au bon niveau."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            {
              icon: Building2,
              title: "Crèche",
              text: "Enfants, équipe, transmissions, traitements.",
              color: "from-[#2f6bff] to-[#6f95ff]",
            },
            {
              icon: HeartPulse,
              title: "RSAI",
              text: "Missions, affectations, registres et dossiers.",
              color: "from-[#ef4f8f] to-[#ff8fbe]",
            },
            {
              icon: Stethoscope,
              title: "Médecin",
              text: "Patients liés, ordonnances et échanges.",
              color: "from-[#1a9d5a] to-[#6fdc9f]",
            },
            {
              icon: Users,
              title: "Parent",
              text: "Suivi du jour, alertes et démarches.",
              color: "from-[#b7791f] to-[#f6c667]",
            },
            {
              icon: Building2,
              title: "Direction",
              text: "Supervision des crèches du groupe.",
              color: "from-[#5b4b8a] to-[#a98de0]",
            },
          ].map((item) => (
            <article
              key={item.title}
              className="card-tilt rounded-[2rem] border border-black/10 bg-white p-5 text-center shadow-sm"
            >
              <span
                className={`mx-auto grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br ${item.color} text-white shadow-lg`}
              >
                <item.icon className="h-5 w-5" />
              </span>
              <h3 className="mt-4 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-[#5a6070]">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* SÉCURITÉ */}
      <section className="bg-[#edeae1] py-20 lg:py-28">
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-4 sm:px-6 lg:grid-cols-2 lg:px-8">
          <div>
            <SectionHeading
              eyebrow="Sécurité & RGPD"
              title="La confiance ne se décrète pas. Elle se construit."
              lead="Les données de santé des enfants méritent une attention particulière. Kids’Med IA applique les principes de minimisation, de finalité et de contrôle d’accès."
            />
            <ul className="mt-8 grid gap-3 sm:grid-cols-2">
              <CheckItem>Accès limités par rôle et par lien avec l’enfant</CheckItem>
              <CheckItem>Journalisation des consultations et modifications</CheckItem>
              <CheckItem>Double authentification et appareils de confiance</CheckItem>
              <CheckItem>Documents médicaux servis par liens privés signés</CheckItem>
              <CheckItem>Droits RGPD : accès, rectification, effacement</CheckItem>
              <CheckItem>Géorepérage et plages horaires pour les professionnels</CheckItem>
            </ul>
            <Link
              to="/securite-rgpd"
              className="mt-8 inline-flex items-center gap-2 text-sm font-bold text-[#2f6bff] underline-grow"
            >
              En savoir plus sur la sécurité <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="relative">
            <div
              aria-hidden
              className="absolute -inset-4 rounded-[2.5rem] bg-gradient-to-br from-[#2f6bff]/15 via-transparent to-[#ef4f8f]/15 blur-2xl"
            />
            <div className="relative rounded-[2rem] border border-black/10 bg-white p-6 shadow-xl">
              <div className="flex items-center gap-3 border-b border-black/10 pb-4">
                <ShieldCheck className="h-6 w-6 text-[#1a9d5a]" />
                <p className="font-display text-lg font-semibold">Principes appliqués</p>
              </div>
              <dl className="mt-5 space-y-5 text-sm">
                {[
                  ["Minimisation", "Chaque rôle ne voit que les données nécessaires à sa mission."],
                  ["Traçabilité", "Les accès et actions sensibles sont journalisés."],
                  ["Maîtrise", "Les parents exercent leurs droits depuis leur espace."],
                  ["Transparence", "Les finalités et durées de conservation sont documentées."],
                ].map(([k, v], i) => (
                  <div key={k} className="flex gap-4">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-[#f7f5ef] font-mono text-[11px] font-bold text-[#2f6bff]">
                      0{i + 1}
                    </span>
                    <div>
                      <dt className="font-bold">{k}</dt>
                      <dd className="mt-0.5 text-[#5a6070]">{v}</dd>
                    </div>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </div>
      </section>

      {/* TARIFS APERÇU */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8 lg:py-28">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading
            eyebrow="Tarifs"
            title="Des formules lisibles, sans surprise."
            lead="Tarifs indicatifs hors taxes. Les groupes de crèches bénéficient d’un abonnement unique porté par le groupe."
          />
          <Link
            to="/tarifs"
            className="hidden items-center gap-2 text-sm font-bold text-[#2f6bff] underline-grow sm:inline-flex"
          >
            Voir tous les tarifs <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {[
            {
              name: "Essentiel",
              price: "79",
              text: "Pour une crèche qui démarre.",
              items: ["Jusqu’à 30 enfants", "Transmissions", "Documents", "Espace parent"],
            },
            {
              name: "Premium",
              price: "149",
              text: "Pour aller plus loin au quotidien.",
              items: [
                "Enfants illimités",
                "Aide IA aux symptômes",
                "Coordination RSAI",
                "QR d’urgence",
              ],
              highlight: true,
            },
            {
              name: "Groupe",
              price: "299",
              text: "Pour superviser plusieurs crèches.",
              items: [
                "Toutes les crèches du groupe",
                "Direction territoriale",
                "Abonnement mutualisé",
                "Supervision consolidée",
              ],
            },
          ].map((plan) => (
            <article
              key={plan.name}
              className={`relative flex flex-col rounded-[2rem] border bg-white p-6 shadow-sm ${plan.highlight ? "border-[#2f6bff] ring-4 ring-[#2f6bff]/10" : "border-black/10"}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-[#2f6bff] px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-white">
                  Le plus choisi
                </span>
              )}
              <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
              <p className="mt-1 text-sm text-[#5a6070]">{plan.text}</p>
              <p className="mt-5 font-display text-5xl font-semibold tracking-[-0.05em]">
                {plan.price}
                <span className="text-sm font-normal text-[#5a6070]"> € / mois</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.items.map((item) => (
                  <CheckItem key={item}>{item}</CheckItem>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-full px-5 py-3 text-sm font-bold transition ${plan.highlight ? "bg-[#0b1020] text-white hover:bg-[#1b2440]" : "border border-black/10 bg-white hover:bg-[#f7f5ef]"}`}
              >
                Demander une démo
              </Link>
            </article>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 pb-20 sm:px-6 lg:px-8">
        <SectionHeading
          center
          eyebrow="Questions fréquentes"
          title="Vous vous demandez peut-être…"
        />
        <div className="mt-8 divide-y divide-black/10 overflow-hidden rounded-[2rem] border border-black/10 bg-white">
          {FAQ.map((item) => (
            <details key={item.question} className="group p-6 open:bg-[#f7f5ef]">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-5 font-semibold">
                {item.question}
                <span
                  className="grid h-7 w-7 shrink-0 place-items-center rounded-full border border-black/10 text-[#2f6bff] transition group-open:rotate-45"
                  aria-hidden
                >
                  +
                </span>
              </summary>
              <p className="mt-3 max-w-3xl text-sm leading-relaxed text-[#5a6070]">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand />
    </MarketingLayout>
  );
}
