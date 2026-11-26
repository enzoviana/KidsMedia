import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, Building2, Check, HeartPulse, Stethoscope, Users } from "lucide-react";
import {
  MarketingLayout,
  CtaBand,
  SectionHeading,
  CheckItem,
  PageHero,
} from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/tarifs")({
  head: () =>
    seoHead({
      title: "Tarifs — Crèches, groupes, RSAI, médecins et parents | Kids'Med IA",
      description:
        "Tarifs Kids'Med IA : formule Essentiel, Premium, Groupe territorial, RSAI, médecin et espace parent. Abonnement de groupe disponible, tarifs personnalisables sur demande.",
      path: "/tarifs",
      keywords: [
        "tarif logiciel crèche",
        "prix dossier médical enfant",
        "abonnement crèche",
        "logiciel RSAI",
      ],
    }),
  component: Page,
});

const FAQ = [
  {
    question: "Les tarifs sont-ils définitifs ?",
    answer:
      "Les montants affichés sont indicatifs. Chaque structure reçoit une proposition adaptée à sa taille, à ses besoins et au nombre de crèches du groupe.",
  },
  {
    question: "Existe-t-il un abonnement de groupe ?",
    answer:
      "Oui. Le groupe territorial porte un abonnement unique qui couvre toutes les crèches rattachées. Les crèches du groupe n'ont pas d'abonnement individuel.",
  },
  {
    question: "L'espace parent est-il payant ?",
    answer:
      "L'accès parent est inclus avec la crèche. Il permet de consulter le suivi de l'enfant, les documents et les alertes.",
  },
  {
    question: "Peut-on bénéficier d'une promotion avec engagement annuel ?",
    answer:
      "Oui. L'administration peut créer des offres promotionnelles liées à un engagement annuel, ainsi que des offres ponctuelles. Les conditions sont précisées dans le devis.",
  },
];

const PLANS = [
  {
    icon: Building2,
    name: "Essentiel",
    price: "79",
    period: "€ / mois",
    audience: "Crèche de moins de 30 enfants",
    features: [
      "Dossier enfant et section",
      "Transmissions quotidiennes",
      "Traitements et ordonnances",
      "Documents et alertes",
      "Espace parent inclus",
    ],
  },
  {
    icon: Building2,
    name: "Premium",
    price: "149",
    period: "€ / mois",
    audience: "Crèche avec coordination santé",
    highlight: true,
    features: [
      "Enfants illimités",
      "Aide IA aux symptômes",
      "QR code d'urgence",
      "Coordination RSAI",
      "Supervision et exports",
    ],
  },
  {
    icon: Building2,
    name: "Groupe territorial",
    price: "299",
    period: "€ / mois",
    audience: "Réseau / groupe de crèches",
    features: [
      "Toutes les crèches du groupe",
      "Comptes directeur territorial",
      "Abonnement mutualisé",
      "Supervision consolidée",
      "Aucun abonnement individuel par crèche",
    ],
  },
  {
    icon: HeartPulse,
    name: "RSAI",
    price: "19",
    period: "€ / mois",
    audience: "Référente santé et accueil inclusif",
    features: [
      "Multi-crèches",
      "Affectations et planning",
      "Géorepérage",
      "Registres de soins",
      "Avis et coordination",
    ],
  },
  {
    icon: Stethoscope,
    name: "Médecin",
    price: "29",
    period: "€ / mois",
    audience: "Pédiatre ou médecin de crèche",
    features: [
      "Patients liés",
      "Ordonnances",
      "Diagnostics et retours",
      "Messagerie sécurisée",
      "Documents partagés",
    ],
  },
  {
    icon: Users,
    name: "Parent",
    price: "0",
    period: "€",
    audience: "Famille rattachée à une crèche",
    features: [
      "Suivi du jour",
      "Documents de l'enfant",
      "Consentements",
      "Alertes de la crèche",
      "Droits RGPD",
    ],
  },
];

function Page() {
  return (
    <MarketingLayout>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Tarifs", path: "/tarifs" },
          ]),
          faqJsonLd(FAQ),
          {
            "@context": "https://schema.org",
            "@type": "OfferCatalog",
            name: "Formules Kids'Med IA",
            itemListElement: PLANS.map((plan) => ({
              "@type": "Offer",
              name: plan.name,
              description: plan.audience,
              priceCurrency: "EUR",
              price: plan.price,
            })),
          },
        ]}
      />
      <PageHero
        eyebrow="Tarifs"
        title="Un tarif clair pour chaque mission."
        lead="Les montants sont indicatifs hors taxes. Nous ajustons la formule à votre organisation, avec un devis et une démonstration personnalisés."
      >
        <p className="text-xs text-white/45">
          Tarifs indicatifs — dernière mise à jour : novembre 2026.
        </p>
      </PageHero>
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8 lg:py-24">
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((plan) => (
            <article
              key={plan.name}
              className={`card-tilt relative flex flex-col rounded-[2rem] border bg-white p-6 shadow-sm ${plan.highlight ? "border-[#2f6bff] ring-4 ring-[#2f6bff]/10" : "border-black/10"}`}
            >
              {plan.highlight && (
                <span className="absolute -top-3 left-6 rounded-full bg-brand-gradient px-3 py-1 text-[11px] font-bold text-on-vivid">
                  Recommandé
                </span>
              )}
              <plan.icon className="h-6 w-6 text-brand-blue" />
              <h2 className="mt-4 font-display text-xl font-semibold">{plan.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{plan.audience}</p>
              <p className="mt-5 font-display text-4xl font-semibold">
                {plan.price}{" "}
                <span className="text-sm font-normal text-muted-foreground">{plan.period}</span>
              </p>
              <ul className="mt-5 flex-1 space-y-2.5">
                {plan.features.map((f) => (
                  <CheckItem key={f}>{f}</CheckItem>
                ))}
              </ul>
              <Link
                to="/contact"
                className={`mt-6 inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold transition ${plan.highlight ? "bg-brand-gradient text-on-vivid" : "border hover:bg-accent"}`}
              >
                Demander une démo <ArrowRight className="h-4 w-4" />
              </Link>
            </article>
          ))}
        </div>

        <div className="mt-12 grid gap-6 rounded-[2rem] border border-black/10 bg-white p-6 shadow-sm md:grid-cols-3">
          {[
            [
              "Sans engagement caché",
              "Les conditions, la durée et les modalités de résiliation sont précisées dans le devis.",
            ],
            [
              "Facturation lisible",
              "Un abonnement par structure ou par groupe, avec les options clairement identifiées.",
            ],
            ["Accompagnement", "Paramétrage, import des données et prise en main des équipes."],
          ].map(([title, text]) => (
            <div key={title} className="flex gap-3">
              <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-green" />
              <div>
                <p className="font-semibold">{title}</p>
                <p className="text-sm text-muted-foreground">{text}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mx-auto mt-16 max-w-3xl">
          <SectionHeading center eyebrow="Questions fréquentes" title="Tarifs et abonnements" />
          <div className="mt-6 divide-y divide-black/10 overflow-hidden rounded-[2rem] border border-black/10 bg-white">
            {FAQ.map((item) => (
              <details key={item.question} className="group p-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-medium">
                  {item.question}
                  <span className="text-brand-blue transition group-open:rotate-45" aria-hidden>
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{item.answer}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        title="Besoin d'un devis précis ?"
        text="Indiquez-nous le nombre de crèches, d'enfants et de professionnels : nous revenons vers vous avec une proposition adaptée."
        primary="Demander un devis"
      />
    </MarketingLayout>
  );
}
