import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowRight,
  BrainCircuit,
  Eye,
  FileCheck2,
  KeyRound,
  Lock,
  Scale,
  Server,
  ShieldCheck,
  UserCheck,
} from "lucide-react";
import {
  MarketingLayout,
  CtaBand,
  SectionHeading,
  CheckItem,
  PageHero,
} from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd, faqJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/securite-rgpd")({
  head: () =>
    seoHead({
      title: "Sécurité et RGPD — Données de santé petite enfance | Kids'Med IA",
      description:
        "Sécurité et RGPD chez Kids'Med IA : accès par rôle, double authentification, journalisation, droits des personnes, encadrement de l'IA et protection des données de santé des enfants.",
      path: "/securite-rgpd",
      keywords: [
        "RGPD crèche",
        "sécurité données santé",
        "protection données enfants",
        "DPO crèche",
        "IA santé RGPD",
      ],
    }),
  component: Page,
});

const FAQ = [
  {
    question: "Kids'Med IA est-il conforme au RGPD ?",
    answer:
      "La plateforme est conçue autour des principes du RGPD : finalité, minimisation, limitation de conservation, sécurité et droits des personnes. La conformité globale dépend aussi des pratiques de chaque structure et de ses contrats de sous-traitance.",
  },
  {
    question: "Qui peut consulter le dossier d'un enfant ?",
    answer:
      "Uniquement les personnes autorisées et liées au dossier : la crèche de l'enfant, les parents liés, le médecin lié, la RSAI affectée selon son périmètre, et l'administration pour la supervision.",
  },
  {
    question: "Les accès sont-ils journalisés ?",
    answer:
      "Oui, les consultations et modifications sensibles sont tracées afin de permettre le contrôle, l'audit et la réponse aux demandes RGPD.",
  },
  {
    question: "Comment exercer ses droits ?",
    answer:
      "Les personnes peuvent demander l'accès, la rectification, l'effacement ou la limitation depuis leur espace ou en écrivant à contact@kidsmed.fr. Chaque demande est suivie avec un délai légal.",
  },
];

function Page() {
  return (
    <MarketingLayout>
      <JsonLd
        data={[
          breadcrumbJsonLd([
            { name: "Accueil", path: "/" },
            { name: "Sécurité & RGPD", path: "/securite-rgpd" },
          ]),
          faqJsonLd(FAQ),
        ]}
      />
      <PageHero
        eyebrow="Sécurité & RGPD"
        title="Protéger les données de santé des enfants, par conception."
        lead="Un dossier de santé est sensible. Kids'Med IA applique une logique de moindre privilège, de traçabilité et de transparence, à chaque étape du parcours."
      >
        <div className="grid gap-3 sm:grid-cols-3">
          {[
            { icon: Lock, title: "Accès limité", text: "Chaque rôle ne voit que son périmètre." },
            { icon: Eye, title: "Traçabilité", text: "Les actions sensibles sont journalisées." },
            { icon: Scale, title: "Droits RGPD", text: "Accès, rectification et effacement." },
          ].map((item) => (
            <div
              key={item.title}
              className="rounded-2xl border border-white/10 bg-white/[0.06] p-5 backdrop-blur"
            >
              <item.icon className="h-5 w-5 text-[#8fb4ff]" />
              <p className="mt-3 font-semibold text-white">{item.title}</p>
              <p className="text-sm text-white/50">{item.text}</p>
            </div>
          ))}
        </div>
      </PageHero>

      <section className="mx-auto grid max-w-7xl gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:px-8 lg:py-24">
        <div>
          <SectionHeading eyebrow="Sécurité" title="Des garde-fous à chaque niveau." />
          <ul className="mt-6 space-y-3">
            <CheckItem>
              Authentification à deux étapes, passkeys et appareils de confiance
            </CheckItem>
            <CheckItem>Contrôle d'accès par rôle et vérification du lien avec l'enfant</CheckItem>
            <CheckItem>Journalisation des consultations, modifications et refus d'accès</CheckItem>
            <CheckItem>Documents médicaux servis par des liens privés signés</CheckItem>
            <CheckItem>Géorepérage et plages horaires pour les interventions sur site</CheckItem>
            <CheckItem>Sauvegardes et procédures de restauration documentées</CheckItem>
          </ul>
        </div>
        <div className="rounded-[2rem] border border-black/10 bg-white p-6">
          <div className="flex items-center gap-3">
            <Server className="h-6 w-6 text-brand-green" />
            <h2 className="font-display text-xl font-semibold">Hébergement et sous-traitants</h2>
          </div>
          <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
            L'hébergement, les fournisseurs d'e-mail, de paiement et d'analyse sont documentés dans
            la politique de confidentialité. Les contrats de sous-traitance et les mesures de
            sécurité sont revus avec chaque structure lors de la mise en place.
          </p>
          <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
            Les données sont configurées pour être conservées pendant la durée nécessaire au
            service, puis archivées ou supprimées selon les obligations légales et la politique de
            la structure.
          </p>
          <Link
            to="/confidentialite"
            className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-brand-blue hover:underline"
          >
            Lire la politique de confidentialité <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <section className="border-y border-black/10 bg-[#edeae1] py-16 lg:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="RGPD"
            title="Les droits des familles et des professionnels."
            lead="Kids'Med IA fournit les outils pour répondre aux demandes et documenter les traitements."
          />
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              {
                icon: UserCheck,
                title: "Accès",
                text: "Consulter les données détenues sur soi ou son enfant.",
              },
              {
                icon: FileCheck2,
                title: "Rectification",
                text: "Corriger une information inexacte ou incomplète.",
              },
              {
                icon: KeyRound,
                title: "Effacement",
                text: "Demander la suppression selon les obligations applicables.",
              },
              {
                icon: Scale,
                title: "Limitation",
                text: "Encadrer certains traitements et s'opposer lorsque la loi le permet.",
              },
            ].map((item) => (
              <div key={item.title} className="rounded-2xl border border-black/10 bg-white p-5">
                <item.icon className="h-5 w-5 text-brand-pink" />
                <p className="mt-3 font-semibold">{item.title}</p>
                <p className="text-sm text-muted-foreground">{item.text}</p>
              </div>
            ))}
          </div>
          <p className="mt-6 text-sm text-muted-foreground">
            Pour exercer un droit :{" "}
            <a
              href="mailto:contact@kidsmed.fr"
              className="font-medium text-brand-blue hover:underline"
            >
              contact@kidsmed.fr
            </a>
            . Une réponse est apportée dans les délais légaux.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-4xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-black/10 bg-white p-6 sm:p-8">
          <div className="flex items-start gap-4">
            <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand-pink/10">
              <BrainCircuit className="h-6 w-6 text-brand-pink" />
            </span>
            <div>
              <h2 className="font-display text-2xl font-semibold">
                Ce que fait — et ne fait pas — l'IA
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
                L'aide IA propose une orientation de vigilance à partir de symptômes déclarés. Elle
                ne pose pas de diagnostic, ne prescrit pas de traitement et ne remplace ni le
                jugement clinique ni l'appel aux secours. En cas de doute ou d'urgence, contactez
                immédiatement un professionnel de santé ou le 15 / 112.
              </p>
              <ul className="mt-5 space-y-2.5">
                <CheckItem>
                  Les résultats sont présentés comme une aide à la décision, avec un niveau de
                  confiance.
                </CheckItem>
                <CheckItem>
                  Les professionnels peuvent apporter un retour sur l'exactitude de l'analyse.
                </CheckItem>
                <CheckItem>
                  Les données utilisées restent limitées au dossier et au consentement prévu.
                </CheckItem>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <SectionHeading
            center
            eyebrow="Questions fréquentes"
            title="Sécurité et données de santé"
          />
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
        title="Une question sur la sécurité ou le RGPD ?"
        text="Notre équipe vous répond et peut vous accompagner dans la configuration de votre structure."
        primary="Nous contacter"
      />
    </MarketingLayout>
  );
}
