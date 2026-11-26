import { createFileRoute, Link } from "@tanstack/react-router";
import { LegalPage } from "@/components/marketing/legal-page";
import { JsonLd } from "@/components/marketing/json-ld";
import { seoHead, breadcrumbJsonLd } from "@/lib/seo";

export const Route = createFileRoute("/confidentialite")({
  head: () =>
    seoHead({
      title: "Politique de confidentialité — Kids'Med IA",
      description:
        "Comment Kids'Med IA collecte, utilise, protège et conserve les données personnelles et les données de santé des enfants et des professionnels.",
      path: "/confidentialite",
    }),
  component: Page,
});

function Page() {
  return (
    <LegalPage
      title="Politique de confidentialité"
      description="Comment nous traitons les données personnelles et les données de santé au sein de Kids'Med IA."
      updated="26 novembre 2026"
    >
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Accueil", path: "/" },
          { name: "Confidentialité", path: "/confidentialite" },
        ])}
      />
      <section>
        <h2>1. Responsable du traitement</h2>
        <p>
          Pour les données de santé des enfants et les données de fonctionnement des crèches,{" "}
          <strong>la structure (crèche, réseau ou cabinet)</strong> est responsable du traitement.
          Kids'Med IA agit comme <strong>sous-traitant</strong> selon ses instructions et dans le
          cadre du contrat conclu.
        </p>
        <p>
          Pour les données de prospection, de contact et de compte personnel, Kids'Med IA / DataFuse
          est responsable du traitement.
        </p>
        <p>
          Contact : <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>.
        </p>
      </section>
      <section>
        <h2>2. Données collectées</h2>
        <ul>
          <li>
            <strong>Compte et identité :</strong> nom, prénom, e-mail, téléphone, rôle, structure de
            rattachement.
          </li>
          <li>
            <strong>Dossier enfant :</strong> identité, date de naissance, section, allergies,
            antécédents, PAI, groupe sanguin, mesures, vaccins, documents et transmissions.
          </li>
          <li>
            <strong>Données de santé :</strong> traitements, ordonnances, signalements, diagnostics
            d'aide, documents médicaux.
          </li>
          <li>
            <strong>Données de fonctionnement :</strong> présences, affectations, horaires,
            géolocalisation professionnelle, journaux de sécurité.
          </li>
          <li>
            <strong>Contact :</strong> nom, e-mail, téléphone, structure, sujet et contenu du
            message.
          </li>
          <li>
            <strong>Technique :</strong> adresse IP, navigateur, appareil et journaux nécessaires à
            la sécurité.
          </li>
        </ul>
      </section>
      <section>
        <h2>3. Finalités et bases légales</h2>
        <ul>
          <li>
            <strong>Fournir le service</strong> et gérer les dossiers : exécution du contrat.
          </li>
          <li>
            <strong>Assurer le suivi de santé et la continuité des soins :</strong> consentement et
            intérêt vital lorsque la loi le permet.
          </li>
          <li>
            <strong>Sécurité, audit et prévention des accès non autorisés :</strong> intérêt
            légitime et obligations légales.
          </li>
          <li>
            <strong>Répondre aux demandes de contact :</strong> consentement ou intérêt légitime.
          </li>
          <li>
            <strong>Respect des obligations légales :</strong> obligation légale.
          </li>
        </ul>
      </section>
      <section>
        <h2>4. Destinataires et sous-traitants</h2>
        <p>
          Les données sont accessibles aux personnes autorisées et liées au dossier : crèche de
          l'enfant, parents liés, médecin lié, RSAI affectée selon son périmètre, administration
          pour la supervision. Les accès sont limités par rôle et journalisés.
        </p>
        <p>
          Des prestataires techniques peuvent intervenir pour l'hébergement, l'e-mail, le paiement,
          la sécurité et la base de données. Ils sont encadrés par des engagements de
          confidentialité et de sécurité. La liste détaillée est communiquée à chaque structure lors
          de la mise en place.
        </p>
      </section>
      <section>
        <h2>5. Durées de conservation</h2>
        <p>
          Les données sont conservées pendant la durée nécessaire à la fourniture du service et
          selon les obligations légales applicables. Les dossiers enfants sont conservés selon la
          politique de la structure et les durées réglementaires. Les demandes de contact sont
          conservées le temps nécessaire au traitement de la demande, puis supprimées ou archivées.
        </p>
      </section>
      <section>
        <h2>6. Sécurité</h2>
        <p>
          Nous mettons en œuvre des mesures techniques et organisationnelles : contrôle d'accès par
          rôle, double authentification, journalisation, liens privés signés, géorepérage,
          sauvegardes et procédures de restauration. Aucun système n'étant infaillible, les
          incidents sont traités selon une procédure documentée.
        </p>
      </section>
      <section>
        <h2>7. Vos droits</h2>
        <p>
          Vous disposez selon les cas des droits d'accès, de rectification, d'effacement, de
          limitation, d'opposition et de portabilité. Vous pouvez exercer ces droits depuis votre
          espace ou en écrivant à <a href="mailto:contact@kidsmed.fr">contact@kidsmed.fr</a>. Une
          réponse est apportée dans les délais légaux. Vous pouvez également saisir la CNIL.
        </p>
        <p>
          Pour les données de santé d'un enfant, la demande peut être adressée à la structure
          responsable de l'enfant, qui coordonne la réponse avec Kids'Med IA.
        </p>
      </section>
      <section>
        <h2>8. Cookies et stockage local</h2>
        <p>
          Le site utilise des stockages techniques nécessaires à la session, à la sécurité et au
          fonctionnement de l'application. Aucun cookie publicitaire n'est déposé par défaut. Les
          outils de mesure d'audience, s'ils sont activés, doivent respecter les règles de
          consentement applicables.
        </p>
      </section>
      <section>
        <h2>9. Modifications</h2>
        <p>
          Cette politique peut être mise à jour pour refléter les évolutions du service ou de la
          réglementation. La date de dernière mise à jour est indiquée en haut de page. Consultez
          également les <Link to="/mentions-legales">mentions légales</Link> et les{" "}
          <Link to="/cgu">conditions d'utilisation</Link>.
        </p>
      </section>
    </LegalPage>
  );
}
