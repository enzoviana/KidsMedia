import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, HeartHandshake, HeartPulse, Lightbulb, ShieldCheck, Sparkles, Users } from "lucide-react";
import { MarketingLayout, CtaBand, SectionHeading, CheckItem } from "@/components/marketing/layout";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, organizationJsonLd, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/a-propos")({
  head: () =>
    seoHead({
      title: "À propos — La santé des tout-petits, partagée | Kids'Med IA",
      description:
        "Kids'Med IA est né d'une conviction : la santé des jeunes enfants mérite des outils simples, fiables et respectueux de la vie privée. Découvrez notre mission et nos valeurs.",
      path: "/a-propos",
      keywords: ["Kids'Med IA", "santé petite enfance", "logiciel crèche français", "mission santé enfant"],
    }),
  component: Page,
});

function Page() {
  return (
    <MarketingLayout>
      <JsonLd data={[organizationJsonLd, breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "À propos", path: "/a-propos" }])]} />
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center sm:px-6 lg:py-20">
          <SectionHeading center eyebrow="À propos" title="La santé des tout-petits mérite mieux qu'un cahier perdu." lead="Kids'Med IA relie les personnes qui prennent soin des enfants : les équipes de crèche, les RSAI, les médecins et les familles." />
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-6 md:grid-cols-3">
          {[
            { icon: HeartPulse, title: "Notre mission", text: "Rendre l'information de santé des enfants accessible au bon moment, sans ajouter de complexité aux équipes." },
            { icon: ShieldCheck, title: "Notre exigence", text: "Traiter les données de santé avec le sérieux qu'elles méritent : sécurité, transparence et respect du RGPD." },
            { icon: HeartHandshake, title: "Notre conviction", text: "La confiance entre crèche, professionnels et parents se construit avec des outils clairs et utiles." },
          ].map((item) => (
            <article key={item.title} className="rounded-3xl border bg-card p-6 shadow-sm"><item.icon className="h-6 w-6 text-brand-pink" /><h2 className="mt-4 font-display text-xl font-semibold">{item.title}</h2><p className="mt-2 text-sm leading-relaxed text-muted-foreground">{item.text}</p></article>
          ))}
        </div>

        <div className="mt-14 grid items-center gap-10 lg:grid-cols-2">
          <div>
            <SectionHeading eyebrow="Nos valeurs" title="Simple pour les équipes. Rassurant pour les familles." />
            <ul className="mt-6 space-y-3">
              <CheckItem><b>Utile d'abord.</b> Chaque fonctionnalité doit faire gagner du temps ou améliorer le suivi.</CheckItem>
              <CheckItem><b>Minimal par défaut.</b> On n'affiche que ce qui est nécessaire, au rôle qui en a besoin.</CheckItem>
              <CheckItem><b>Transparent.</b> Les limites de l'IA et les règles d'accès sont expliquées clairement.</CheckItem>
              <CheckItem><b>Humain.</b> La technologie accompagne les professionnels, elle ne les remplace pas.</CheckItem>
            </ul>
          </div>
          <div className="rounded-3xl border bg-card p-7">
            <Sparkles className="h-7 w-7 text-brand-blue" />
            <h3 className="mt-4 font-display text-2xl font-semibold">Pensé avec le terrain</h3>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Les parcours reprennent les gestes du quotidien : accueillir un enfant, transmettre une information, administrer un traitement, prévenir un parent, documenter une intervention ou rassurer une famille.
            </p>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
              Kids'Med IA est développé par DataFuse, avec une approche produit centrée sur la petite enfance et la protection des données personnelles.
            </p>
            <div className="mt-5 flex flex-wrap gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><Lightbulb className="h-3.5 w-3.5" /> Clarté</span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><Users className="h-3.5 w-3.5" /> Terrain</span>
              <span className="inline-flex items-center gap-1 rounded-full border px-2.5 py-1"><ShieldCheck className="h-3.5 w-3.5" /> Confiance</span>
            </div>
          </div>
        </div>

        <div className="mt-16 rounded-3xl border bg-card p-7 sm:p-10">
          <div className="grid gap-8 lg:grid-cols-[1.4fr_1fr] lg:items-center">
            <div>
              <h2 className="font-display text-2xl font-semibold sm:text-3xl">Vous souhaitez en savoir plus ?</h2>
              <p className="mt-3 text-muted-foreground">Présentez-nous votre crèche, votre réseau ou votre pratique. Nous vous montrons la plateforme et répondons à vos questions.</p>
            </div>
            <div className="flex flex-wrap gap-3 lg:justify-end">
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-3 text-sm font-semibold text-on-vivid">Nous contacter <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/fonctionnalites" className="inline-flex items-center gap-2 rounded-xl border px-5 py-3 text-sm font-semibold hover:bg-accent">Voir les fonctionnalités</Link>
            </div>
          </div>
        </div>
      </section>
      <CtaBand />
    </MarketingLayout>
  );
}
