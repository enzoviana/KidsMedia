import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight, Baby, BellRing, BrainCircuit, Building2, CalendarCheck, ClipboardCheck, FileText,
  HeartPulse, MessageSquareText, Pill, QrCode, ShieldCheck, Stethoscope, UserRound, Users,
} from "lucide-react";
import { MarketingLayout, CtaBand, SectionHeading, CheckItem } from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, softwareJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/fonctionnalites")({
  head: () =>
    seoHead({
      title: "Fonctionnalités — Dossier de santé, transmissions et IA | Kids'Med IA",
      description:
        "Découvrez les fonctionnalités Kids'Med IA : dossier enfant partagé, transmissions, traitements, documents obligatoires, QR d'urgence, coordination RSAI et aide IA aux symptômes.",
      path: "/fonctionnalites",
      keywords: ["fonctionnalités crèche", "dossier médical enfant", "transmissions crèche", "logiciel petite enfance"],
    }),
  component: Page,
});

const BLOCKS = [
  {
    id: "dossier",
    icon: Baby,
    title: "Dossier enfant centralisé",
    text: "Toutes les informations utiles à la santé de l'enfant réunies dans une fiche unique, accessible uniquement aux personnes liées.",
    items: ["Identité, section et photo", "Allergies, antécédents, groupe sanguin et PAI", "Mesures, vaccins et documents", "Historique des accès et modifications"],
  },
  {
    id: "transmissions",
    icon: MessageSquareText,
    title: "Transmissions et quotidien",
    text: "Les équipes partagent les informations du jour aux parents sans multiplier les appels ou les cahiers.",
    items: ["Repas, sieste, humeur et changes", "Notes de la crèche et du médecin", "Accusés de lecture et suivi", "Visibilité publique ou médicale"],
  },
  {
    id: "traitements",
    icon: Pill,
    title: "Traitements et ordonnances",
    text: "Le suivi des médicaments devient traçable, de l'ordonnance à l'administration.",
    items: ["Posologies et horaires", "Preuve d'administration", "Ordonnances liées au dossier", "Alertes de fin ou de renouvellement"],
  },
  {
    id: "ia",
    icon: BrainCircuit,
    title: "Aide IA au signalement des symptômes",
    text: "Un questionnaire guidé aide à qualifier les signes observés et à proposer une orientation de vigilance. L'IA ne remplace jamais un médecin.",
    items: ["Symptômes, température et durée", "Niveau de vigilance et conseils", "Partage encadré avec les professionnels", "Retour du médecin pour améliorer l'aide"],
  },
  {
    id: "urgence",
    icon: QrCode,
    title: "QR code d'urgence",
    text: "En cas d'urgence, les secours accèdent aux informations vitales sans ouvrir tout le dossier.",
    items: ["Identité et allergies", "Groupe sanguin et PAI", "Traitements en cours", "Contacts des proches"],
  },
  {
    id: "documents",
    icon: ClipboardCheck,
    title: "Documents obligatoires",
    text: "Les pièces d'inscription, certificats et autorisations sont suivis avec leurs échéances.",
    items: ["Pièces exigées par la crèche", "Statuts manquant, rejeté, expiré", "Relances et alertes", "Dépôt sécurisé par les parents"],
  },
  {
    id: "rsai",
    icon: HeartPulse,
    title: "Coordination RSAI",
    text: "Les crèches et les RSAI organisent les interventions, les horaires et les comptes rendus.",
    items: ["Affectations et planning", "Géorepérage et plages horaires", "Registres de soins et d'incidents", "Avis et suivi de qualité"],
  },
  {
    id: "parents",
    icon: UserRound,
    title: "Espace parent",
    text: "Les familles retrouvent le suivi de leur enfant et les démarches au même endroit.",
    items: ["Suivi du jour", "Documents et consentements", "Alertes de la crèche", "Droits RGPD"],
  },
  {
    id: "securite",
    icon: ShieldCheck,
    title: "Sécurité et conformité",
    text: "Une plateforme conçue pour les données de santé : rôles, journalisation et principes RGPD.",
    items: ["Accès par rôle", "Double authentification", "Journal des consultations", "Export et effacement"],
  },
];

function Page() {
  return (
    <MarketingLayout>
      <JsonLd data={[softwareJsonLd, breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Fonctionnalités", path: "/fonctionnalites" }])]} />
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-20">
          <SectionHeading
            eyebrow="Fonctionnalités"
            title="Un outil complet, sans surcharger les équipes."
            lead="Kids'Med IA couvre le quotidien de la crèche, la coordination des professionnels de santé et l'information des parents."
          />
          <div className="mt-8 flex flex-wrap gap-2">
            {BLOCKS.map((b) => <a key={b.id} href={`#${b.id}`} className="rounded-full border bg-background px-3 py-1.5 text-xs font-medium text-muted-foreground transition hover:text-foreground">{b.title}</a>)}
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          {BLOCKS.map((block, index) => (
            <article key={block.id} id={block.id} className={`scroll-mt-24 rounded-3xl border bg-card p-6 shadow-sm ${index % 2 ? "lg:mt-10" : ""}`}>
              <div className="flex items-start gap-4">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-gradient text-on-vivid"><block.icon className="h-6 w-6" /></span>
                <div>
                  <h2 className="font-display text-xl font-semibold">{block.title}</h2>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{block.text}</p>
                </div>
              </div>
              <ul className="mt-5 grid gap-2 sm:grid-cols-2">{block.items.map((item) => <CheckItem key={item}>{item}</CheckItem>)}</ul>
            </article>
          ))}
        </div>

        <div className="mt-14 grid gap-5 rounded-3xl border bg-card p-6 sm:grid-cols-3">
          {[
            { icon: Building2, title: "Crèche", text: "Le quotidien des enfants et des équipes." },
            { icon: Stethoscope, title: "Professionnels", text: "RSAI et médecins coordonnent sans perdre le fil." },
            { icon: Users, title: "Parents", text: "Une information claire, au bon moment." },
          ].map((item) => (
            <div key={item.title} className="flex gap-3">
              <item.icon className="h-5 w-5 shrink-0 text-brand-blue" />
              <div><p className="font-semibold">{item.title}</p><p className="text-sm text-muted-foreground">{item.text}</p></div>
            </div>
          ))}
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-vivid">Demander une démo <ArrowRight className="h-4 w-4" /></Link>
          <Link to="/tarifs" className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent">Voir les tarifs</Link>
          <Link to="/securite-rgpd" className="inline-flex items-center gap-2 rounded-xl border bg-card px-5 py-3 text-sm font-semibold hover:bg-accent">Sécurité & RGPD</Link>
        </div>
      </div>

      <CtaBand />
    </MarketingLayout>
  );
}
