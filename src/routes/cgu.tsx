import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/legal-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/cgu")({
  head: () =>
    seoHead({
      title: "Conditions générales d'utilisation — Kids'Med IA",
      description:
        "Conditions générales d'utilisation de la plateforme Kids'Med IA : accès, comptes, obligations, données de santé, aide IA, responsabilité et résiliation.",
      path: "/cgu",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="Conditions générales d'utilisation"
      description="Les règles d'utilisation de la plateforme Kids'Med IA."
      updated="26 novembre 2026"
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "CGU", path: "/cgu" },
        ])}
      />
      <section>
        <h2>1. Objet</h2>
        <p>
          Les présentes conditions encadrent l'accès et l'utilisation de la plateforme Kids'Med IA,
          destinée au suivi de santé des jeunes enfants et à la coordination entre crèches, RSAI,
          médecins et parents.
        </p>
      </section>
      <section>
        <h2>2. Accès au service</h2>
        <p>
          L'accès nécessite un compte personnel et, pour les professionnels, un rattachement validé
          à une structure. Les comptes sont nominatifs et ne doivent pas être partagés.
          L'utilisateur s'engage à fournir des informations exactes et à maintenir la
          confidentialité de ses identifiants.
        </p>
        <p>
          La double authentification et les appareils de confiance peuvent être proposés ou exigés
          selon le rôle. Toute suspicion d'accès non autorisé doit être signalée sans délai.
        </p>
      </section>
      <section>
        <h2>3. Obligations des utilisateurs</h2>
        <ul>
          <li>Utiliser le service conformément à sa finalité et aux droits dont il dispose.</li>
          <li>Ne consulter que les dossiers pour lesquels un lien ou une autorisation existe.</li>
          <li>Ne pas contourner les contrôles d'accès, ni extraire massivement des données.</li>
          <li>Signaler toute erreur, faille ou incident de sécurité.</li>
          <li>
            Respecter le secret professionnel, la vie privée et la dignité des enfants et des
            familles.
          </li>
        </ul>
      </section>
      <section>
        <h2>4. Données de santé et responsabilités</h2>
        <p>
          La structure professionnelle demeure responsable des données qu'elle renseigne et des
          décisions qu'elle prend. Les parents sont responsables de l'exactitude des informations
          qu'ils transmettent. Kids'Med IA fournit un outil de partage et de traçabilité.
        </p>
        <p>
          Les documents et informations médicaux ne doivent être déposés que dans le cadre autorisé
          par le consentement ou la réglementation applicable.
        </p>
      </section>
      <section>
        <h2>5. Aide IA — limites</h2>
        <p>
          L'aide IA au signalement des symptômes est un outil d'aide à la vigilance. Elle ne réalise
          pas de diagnostic médical, ne prescrit aucun traitement et ne remplace pas l'évaluation
          d'un professionnel de santé. En cas d'urgence, il faut contacter immédiatement les secours
          (15, 112) ou un médecin.
        </p>
        <p>
          Les résultats peuvent comporter une marge d'erreur. L'utilisateur doit toujours exercer
          son jugement et vérifier les informations importantes.
        </p>
      </section>
      <section>
        <h2>6. Disponibilité et maintenance</h2>
        <p>
          Le service est fourni avec une obligation de moyens. Des interruptions peuvent survenir
          pour maintenance, sécurité ou cas de force majeure. Kids'Med IA s'efforce de prévenir les
          indisponibilités significatives et de rétablir le service dans les meilleurs délais.
        </p>
      </section>
      <section>
        <h2>7. Propriété intellectuelle</h2>
        <p>
          La plateforme, ses marques, interfaces et composants logiciels sont protégés.
          L'utilisateur bénéficie d'un droit d'usage personnel, non exclusif et non transférable,
          limité à la durée de son accès. Les données saisies restent la propriété des structures et
          des personnes concernées.
        </p>
      </section>
      <section>
        <h2>8. Suspension et résiliation</h2>
        <p>
          Un compte peut être suspendu en cas de non-respect des présentes conditions, de risque de
          sécurité ou de demande légale. La résiliation de l'abonnement d'une structure met fin à
          l'accès selon les modalités du contrat, sans préjudice des obligations de conservation
          légale.
        </p>
      </section>
      <section>
        <h2>9. Droit applicable</h2>
        <p>
          Les présentes conditions sont soumises au droit français. En cas de litige, les parties
          rechercheront une solution amiable avant toute action judiciaire. Les consommateurs
          peuvent également recourir à un médiateur compétent.
        </p>
        <p>
          Pour toute question : <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>. Voir
          aussi la <Link to="/confidentialite">politique de confidentialité</Link> et les{" "}
          <Link to="/mentions-legales">mentions légales</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
