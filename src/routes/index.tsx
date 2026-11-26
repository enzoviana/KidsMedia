import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ArrowRight, Baby, BellRing, BrainCircuit, Building2, CalendarCheck, CheckCircle2, ClipboardList,
  FileText, HeartHandshake, HeartPulse, Lock, MessageSquareText, Pill, QrCode, ShieldCheck,
  Sparkles, Stethoscope, UserRound, Users,
} from "lucide-react";
import { isStandalone } from "@/components/pwa/install";
import { MarketingLayout, CtaBand, SectionHeading, CheckItem } from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, organizationJsonLd, softwareJsonLd, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/")({
  head: () =>
    seoHead({
      title: "Kids'Med IA — Dossier de santé partagé pour crèches, RSAI, médecins et parents",
      description:
        "Plateforme santé petite enfance : dossier partagé, transmissions, traitements, aide IA au signalement des symptômes, QR d'urgence et conformité RGPD. Demandez une démo.",
      path: "/",
      keywords: ["santé crèche", "logiciel crèche", "dossier médical enfant", "RSAI", "petite enfance", "RGPD santé", "IA symptômes"],
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
    question: "Les données de santé sont-elles hébergées en France ?",
    answer:
      "L'application est conçue pour un hébergement maîtrisé et des données de santé protégées. Les modalités exactes d'hébergement et de sous-traitance sont précisées dans la politique de confidentialité et le contrat conclu avec chaque structure.",
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

function Home() {
  useEffect(() => {
    if (isStandalone()) window.location.replace("/app");
  }, []);

  return (
    <MarketingLayout>
      <JsonLd data={[organizationJsonLd, softwareJsonLd, faqJsonLd(FAQ)]} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div aria-hidden className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_20%_10%,oklch(0.85_0.1_240/0.35),transparent_42%),radial-gradient(circle_at_85%_20%,oklch(0.88_0.1_350/0.3),transparent_45%),radial-gradient(circle_at_55%_95%,oklch(0.88_0.12_145/0.28),transparent_50%)]" />
        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-4 pb-20 pt-14 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8 lg:pb-28 lg:pt-20">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border bg-card/80 px-3 py-1.5 text-xs font-semibold text-muted-foreground shadow-sm">
              <Sparkles className="h-3.5 w-3.5 text-brand-pink" /> Santé petite enfance · IA d'aide · RGPD
            </p>
            <h1 className="mt-6 font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-6xl">
              La santé des tout-petits, <span className="bg-brand-gradient bg-clip-text text-transparent">partagée en toute confiance.</span>
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              Kids'Med IA réunit crèches, RSAI, médecins et parents autour d'un dossier clair, sécurisé et accessible au bon moment : transmissions, traitements, documents, alertes et QR d'urgence.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-6 py-3.5 text-sm font-semibold text-on-vivid shadow-lg shadow-brand-blue/20 transition hover:opacity-90">
                Demander une démo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/fonctionnalites" className="inline-flex items-center gap-2 rounded-xl border bg-card px-6 py-3.5 text-sm font-semibold transition hover:bg-accent">
                Découvrir la plateforme
              </Link>
            </div>
            <ul className="mt-8 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
              <li className="inline-flex items-center gap-1.5"><ShieldCheck className="h-4 w-4 text-brand-green" /> Conforme RGPD</li>
              <li className="inline-flex items-center gap-1.5"><Lock className="h-4 w-4 text-brand-blue" /> Accès par rôle</li>
              <li className="inline-flex items-center gap-1.5"><HeartPulse className="h-4 w-4 text-brand-pink" /> Pensé avec les pros</li>
            </ul>
          </div>

          {/* Visuel produit abstrait, sans données personnelles */}
          <div className="relative mx-auto w-full max-w-md">
            <div aria-hidden className="absolute -inset-6 rounded-[2.5rem] bg-brand-gradient opacity-10 blur-2xl" />
            <div className="relative rounded-3xl border bg-card/95 p-5 shadow-2xl backdrop-blur">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue"><Baby className="h-5 w-5" /></span>
                  <div><p className="text-sm font-semibold">Dossier partagé</p><p className="text-xs text-muted-foreground">Crèche · Parents · Médecin</p></div>
                </div>
                <span className="rounded-full bg-brand-green/15 px-2.5 py-1 text-[11px] font-semibold text-brand-green">À jour</span>
              </div>
              <div className="mt-5 space-y-2.5">
                {[
                  { icon: MessageSquareText, label: "Transmissions du jour", value: "Repas, sieste, humeur" },
                  { icon: Pill, label: "Traitements", value: "Horaires et administrations" },
                  { icon: FileText, label: "Documents", value: "PAI, ordonnances, vaccins" },
                  { icon: BrainCircuit, label: "Signalement IA", value: "Orientation de vigilance" },
                ].map((row) => (
                  <div key={row.label} className="flex items-center gap-3 rounded-2xl border bg-background/60 p-3">
                    <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-foreground"><row.icon className="h-4 w-4" /></span>
                    <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{row.label}</p><p className="truncate text-xs text-muted-foreground">{row.value}</p></div>
                    <CheckCircle2 className="h-4 w-4 text-brand-green" />
                  </div>
                ))}
              </div>
              <div className="mt-4 flex items-center gap-2 rounded-2xl bg-brand-pink/10 p-3 text-xs text-foreground">
                <QrCode className="h-5 w-5 shrink-0 text-brand-pink" />
                QR d'urgence : les informations vitales accessibles aux secours, sans ouvrir le dossier complet.
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bandeau confiance */}
      <section className="border-y bg-card/60">
        <div className="mx-auto grid max-w-7xl gap-6 px-4 py-8 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Building2, title: "Crèches & réseaux", text: "Un quotidien plus fluide" },
            { icon: Stethoscope, title: "RSAI & médecins", text: "Une coordination lisible" },
            { icon: Users, title: "Parents", text: "Une information rassurante" },
            { icon: ShieldCheck, title: "Conformité", text: "RGPD et traçabilité" },
          ].map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="grid h-10 w-10 place-items-center rounded-xl bg-accent"><item.icon className="h-5 w-5 text-brand-blue" /></span>
              <div><p className="text-sm font-semibold">{item.title}</p><p className="text-xs text-muted-foreground">{item.text}</p></div>
            </div>
          ))}
        </div>
      </section>

      {/* Problème / solution */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Le quotidien"
          title="Moins de messages éparpillés. Plus de temps pour les enfants."
          lead="Les informations de santé se perdent entre cahiers, e-mails, appels et documents papier. Kids'Med IA remet chaque information au bon endroit, pour la bonne personne."
        />
        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {[
            { icon: ClipboardList, title: "Un dossier unique", text: "Identité, allergies, PAI, vaccins, traitements et documents réunis dans un dossier partagé." },
            { icon: BellRing, title: "Les bonnes alertes", text: "Signalements, documents manquants ou échéances : chacun est notifié selon son rôle." },
            { icon: HeartHandshake, title: "Une relation apaisée", text: "La crèche, les parents et les professionnels de santé parlent enfin le même langage." },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border bg-card p-6 shadow-sm">
              <span className="grid h-12 w-12 place-items-center rounded-2xl bg-brand-gradient text-on-vivid"><item.icon className="h-6 w-6" /></span>
              <h3 className="mt-5 font-display text-xl font-semibold">{item.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Fonctionnalités */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Fonctionnalités" title="Tout ce qu'il faut pour suivre la santé d'un enfant, sans friction." lead="Des outils simples pour les équipes, utiles pour les familles et rassurants pour les professionnels." />
          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {[
              { icon: Baby, title: "Dossier enfant", text: "Identité, section, allergies, antécédents, mesures et photo du dossier." },
              { icon: MessageSquareText, title: "Transmissions", text: "Repas, sieste, humeur, changes et informations du jour partagés aux parents." },
              { icon: Pill, title: "Traitements", text: "Ordonnances, posologies, horaires et preuve d'administration." },
              { icon: BrainCircuit, title: "Aide IA aux symptômes", text: "Un questionnaire guidé pour qualifier les signes et orienter vers la bonne vigilance." },
              { icon: QrCode, title: "QR d'urgence", text: "Les données vitales accessibles aux secours, sans exposer le dossier complet." },
              { icon: CalendarCheck, title: "Coordination RSAI", text: "Affectations, horaires, géorepérage et registres de soins ou d'incidents." },
              { icon: FileText, title: "Documents obligatoires", text: "Suivi des pièces d'inscription, validités et relances automatiques." },
              { icon: UserRound, title: "Espace parent", text: "Le parent consulte le suivi, les documents et les alertes de son enfant." },
              { icon: ShieldCheck, title: "Sécurité & traçabilité", text: "Droits par rôle, journalisation des accès et principes RGPD." },
            ].map((item) => (
              <article key={item.title} className="group rounded-2xl border bg-card p-6 transition hover:-translate-y-0.5 hover:shadow-lg">
                <item.icon className="h-6 w-6 text-brand-blue" />
                <h3 className="mt-4 font-display text-lg font-semibold">{item.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p>
              </article>
            ))}
          </div>
          <div className="mt-10 text-center">
            <Link to="/fonctionnalites" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">Voir toutes les fonctionnalités <ArrowRight className="h-4 w-4" /></Link>
          </div>
        </div>
      </section>

      {/* Rôles */}
      <section className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading center eyebrow="Un espace par rôle" title="Chacun voit ce qui le concerne." lead="Un socle commun, des permissions précises : la bonne information, au bon niveau." />
        <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-5">
          {[
            { icon: Building2, title: "Crèche", text: "Enfants, équipe, transmissions, traitements, documents." },
            { icon: HeartPulse, title: "RSAI", text: "Missions, affectations, registres et dossiers sur site." },
            { icon: Stethoscope, title: "Médecin", text: "Patients liés, ordonnances, diagnostics et échanges." },
            { icon: Users, title: "Parent", text: "Suivi du jour, alertes, documents et démarches." },
            { icon: Building2, title: "Direction territoriale", text: "Supervision consolidée des crèches du groupe." },
          ].map((item) => (
            <article key={item.title} className="rounded-2xl border bg-card p-5 text-center shadow-sm">
              <span className="mx-auto grid h-11 w-11 place-items-center rounded-2xl bg-accent"><item.icon className="h-5 w-5 text-brand-pink" /></span>
              <h3 className="mt-3 font-display text-base font-semibold">{item.title}</h3>
              <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="border-y bg-card/60 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Mise en route" title="Un démarrage simple, accompagné." lead="De la création de la structure à l'invitation des parents, chaque étape est pensée pour aller vite." />
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: "1", title: "Créez votre structure", text: "Renseignez la crèche, ses sections, son équipe et ses règles d'accès." },
              { n: "2", title: "Importez les enfants et les liens", text: "Invitez les parents par e-mail ou partagez le code de liaison de l'enfant." },
              { n: "3", title: "Travaillez au quotidien", text: "Transmissions, traitements, documents et alertes sont accessibles à tous les bons rôles." },
            ].map((step) => (
              <li key={step.n} className="relative rounded-3xl border bg-card p-6">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-brand-gradient font-display text-lg font-bold text-on-vivid">{step.n}</span>
                <h3 className="mt-4 font-display text-xl font-semibold">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{step.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Sécurité */}
      <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 py-20 sm:px-6 lg:grid-cols-2 lg:px-8">
        <div>
          <SectionHeading eyebrow="Sécurité & RGPD" title="La confiance se construit dans les détails." lead="Les données de santé des enfants méritent une attention particulière. Kids'Med IA applique les principes de minimisation, de finalité et de contrôle d'accès." />
          <ul className="mt-8 grid gap-3 sm:grid-cols-2">
            <CheckItem>Accès limités par rôle et par lien avec l'enfant</CheckItem>
            <CheckItem>Journalisation des consultations et modifications</CheckItem>
            <CheckItem>Double authentification et appareils de confiance</CheckItem>
            <CheckItem>Chiffrement des échanges et documents privés</CheckItem>
            <CheckItem>Droits RGPD : accès, rectification, effacement</CheckItem>
            <CheckItem>Géorepérage et plages horaires pour les professionnels</CheckItem>
          </ul>
          <div className="mt-8"><Link to="/securite-rgpd" className="inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline">En savoir plus sur la sécurité <ArrowRight className="h-4 w-4" /></Link></div>
        </div>
        <div className="rounded-3xl border bg-card p-6 shadow-sm">
          <div className="flex items-center gap-3 border-b pb-4"><ShieldCheck className="h-6 w-6 text-brand-green" /><p className="font-display text-lg font-semibold">Principes appliqués</p></div>
          <dl className="mt-4 space-y-4 text-sm">
            {[
              ["Minimisation", "Chaque rôle ne voit que les données nécessaires à sa mission."],
              ["Traçabilité", "Les accès et actions sensibles sont journalisés."],
              ["Maîtrise", "Les parents exercent leurs droits depuis leur espace."],
              ["Transparence", "Les finalités et durées de conservation sont documentées."],
            ].map(([k, v]) => (
              <div key={k}><dt className="font-semibold">{k}</dt><dd className="text-muted-foreground">{v}</dd></div>
            ))}
          </dl>
        </div>
      </section>

      {/* Tarifs aperçu */}
      <section className="bg-card/50 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading center eyebrow="Tarifs" title="Des formules lisibles, adaptées à chaque structure." lead="Tarifs indicatifs hors taxes. Les groupes de crèches bénéficient d'un abonnement unique porté par le groupe." />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {[
              { name: "Essentiel", price: "79 €", period: "/ mois", text: "Pour une crèche qui démarre.", items: ["Jusqu'à 30 enfants", "Transmissions", "Documents", "Espace parent"] },
              { name: "Premium", price: "149 €", period: "/ mois", text: "Pour aller plus loin au quotidien.", items: ["Enfants illimités", "Aide IA aux symptômes", "Coordination RSAI", "QR d'urgence"], highlight: true },
              { name: "Groupe", price: "299 €", period: "/ mois", text: "Pour superviser plusieurs crèches.", items: ["Toutes les crèches du groupe", "Direction territoriale", "Abonnement mutualisé", "Supervision consolidée"] },
            ].map((plan) => (
              <article key={plan.name} className={`relative rounded-3xl border bg-card p-6 shadow-sm ${plan.highlight ? "ring-2 ring-brand-blue" : ""}`}>
                {plan.highlight && <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-bold text-on-vivid">Le plus choisi</span>}
                <h3 className="font-display text-xl font-semibold">{plan.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{plan.text}</p>
                <p className="mt-5 font-display text-4xl font-semibold">{plan.price}<span className="text-sm font-normal text-muted-foreground"> {plan.period}</span></p>
                <ul className="mt-5 space-y-2.5">{plan.items.map((item) => <CheckItem key={item}>{item}</CheckItem>)}</ul>
                <Link to="/contact" className="mt-6 inline-flex w-full items-center justify-center rounded-xl border px-4 py-2.5 text-sm font-semibold transition hover:bg-accent">Demander une démo</Link>
              </article>
            ))}
          </div>
          <div className="mt-8 text-center text-sm"><Link to="/tarifs" className="font-semibold text-brand-blue hover:underline">Voir tous les tarifs, y compris parents, RSAI et médecins</Link></div>
        </div>
      </section>

      {/* FAQ */}
      <section className="mx-auto max-w-4xl px-4 py-20 sm:px-6 lg:px-8">
        <SectionHeading center eyebrow="Questions fréquentes" title="Vous vous demandez peut-être…" />
        <div className="mt-8 divide-y rounded-3xl border bg-card">
          {FAQ.map((item) => (
            <details key={item.question} className="group p-5 open:bg-accent/30">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                {item.question}
                <span className="text-brand-blue transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
            </details>
          ))}
        </div>
      </section>

      <CtaBand />
    </MarketingLayout>
  );
}
