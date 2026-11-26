import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/legal-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/mentions-legales")({
  head: () => seoHead({
    title: "Mentions légales — Kids'Med IA",
    description: "Mentions légales de Kids'Med IA : éditeur, hébergeurs, propriété intellectuelle, données personnelles et contact.",
    path: "/mentions-legales",
  }),
  component: Page,
});

function Page() {
  return (
    <LegalPage title="Mentions légales" description="Informations relatives à l'éditeur et aux hébergeurs du service Kids'Med IA." updated="26 novembre 2026">
      <JsonLd data={breadcrumbJsonLd([{ name: "Accueil", path: "/" }, { name: "Mentions légales", path: "/mentions-legales" }])} />
      <section>
        <h2>Éditeur du site</h2>
        <p><strong>Kids'Med IA</strong>, édité par <strong>DataFuse</strong>.</p>
        <p>Contact : <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>.</p>
        <p>Les informations d'immatriculation et l'adresse du siège peuvent être communiquées sur demande écrite à l'adresse ci-dessus.</p>
      </section>
      <section>
        <h2>Direction de la publication</h2>
        <p>La direction de la publication est assurée par l'équipe Kids'Med IA.</p>
      </section>
      <section>
        <h2>Hébergement</h2>
        <p>Le site et l'application sont hébergés par <strong>Vercel Inc.</strong> et <strong>Render Services, Inc.</strong>, selon la configuration technique du service. Les modalités de traitement des données sont détaillées dans la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
      </section>
      <section>
        <h2>Propriété intellectuelle</h2>
        <p>L'ensemble des contenus, marques, interfaces, textes, illustrations et éléments logiciels présents sur le site sont protégés par le droit de la propriété intellectuelle. Toute reproduction ou réutilisation non autorisée est interdite.</p>
        <p>Les données de santé et les dossiers des enfants restent la propriété des personnes et structures concernées. Kids'Med IA agit selon les instructions du responsable de traitement.</p>
      </section>
      <section>
        <h2>Données personnelles et cookies</h2>
        <p>Le site utilise uniquement des cookies et stockages techniques nécessaires au fonctionnement du service et à la sécurité. Aucun cookie publicitaire n'est déposé par défaut.</p>
        <p>Pour exercer vos droits ou poser une question : <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>. Consultez la <Link to="/confidentialite">politique de confidentialité</Link>.</p>
      </section>
      <section>
        <h2>Signalement</h2>
        <p>Pour signaler un contenu illicite ou un incident de sécurité : <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>.</p>
      </section>
    </LegalPage>
  );
}
