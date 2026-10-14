// Templates d'e-mails transactionnels Kids'Med IA — HTML compatible clients mail (tables + styles inline).
// Variables au format {{variable}} à remplacer côté backend (Handlebars, Mustache ou String.replace).

export interface EmailTemplate {
  id: string;
  categorie: "Sécurité" | "Documents & santé" | "Coordination" | "Messagerie & facturation";
  nom: string;
  sujet: string;
  destinataires: string;
  declencheur: string;
  variables: Record<string, string>;
  html: string;
}

interface Block { titre: string; intro: string; corps?: string; cta?: { label: string; href: string }; note?: string; accent?: string }

const esc = (s: string) => s;

export function layout(sujet: string, b: Block): string {
  const accent = b.accent ?? "#2f7d6d";
  return `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>${esc(sujet)}</title>
</head>
<body style="margin:0;padding:0;background:#f4f6f5;font-family:Arial,Helvetica,sans-serif;color:#1f2a28;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f4f6f5;padding:32px 12px;">
<tr><td align="center">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background:#ffffff;border-radius:14px;overflow:hidden;border:1px solid #e3e8e6;">
<tr><td style="background:${accent};padding:22px 32px;">
<span style="font-size:20px;font-weight:bold;color:#ffffff;letter-spacing:.3px;">Kids'Med IA</span>
</td></tr>
<tr><td style="padding:32px;">
<h1 style="margin:0 0 16px;font-size:22px;line-height:1.3;color:#1f2a28;">${b.titre}</h1>
<p style="margin:0 0 16px;font-size:15px;line-height:1.6;">${b.intro}</p>
${b.corps ?? ""}
${b.cta ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0;"><tr><td style="background:${accent};border-radius:8px;">
<a href="${b.cta.href}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:bold;color:#ffffff;text-decoration:none;">${b.cta.label}</a>
</td></tr></table>` : ""}
${b.note ? `<p style="margin:16px 0 0;font-size:13px;line-height:1.5;color:#5d6b68;">${b.note}</p>` : ""}
</td></tr>
<tr><td style="padding:20px 32px;background:#f8faf9;border-top:1px solid #e3e8e6;font-size:12px;line-height:1.5;color:#7a8784;">
Cet e-mail vous a été envoyé par Kids'Med IA. Les données de santé sont hébergées conformément au RGPD.<br />
<a href="{{lien_preferences}}" style="color:#7a8784;">Gérer mes notifications</a> · <a href="{{lien_support}}" style="color:#7a8784;">Support</a>
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const box = (rows: [string, string][]) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 16px;background:#f4f8f7;border-radius:10px;">${rows
    .map(([k, v]) => `<tr><td style="padding:10px 16px;font-size:13px;color:#5d6b68;width:40%;">${k}</td><td style="padding:10px 16px;font-size:14px;font-weight:bold;">${v}</td></tr>`)
    .join("")}</table>`;

const code = (v: string) =>
  `<div style="margin:20px 0;padding:18px;text-align:center;background:#f4f8f7;border-radius:10px;font-size:32px;font-weight:bold;letter-spacing:8px;">${v}</div>`;

const common = { lien_preferences: "Lien de gestion des notifications", lien_support: "Lien vers le support" };

function t(x: Omit<EmailTemplate, "html" | "variables"> & { variables: Record<string, string>; block: Block }): EmailTemplate {
  return { ...x, variables: { ...x.variables, ...common }, html: layout(x.sujet, x.block) };
}

export const emailTemplates: EmailTemplate[] = [
  t({ id: "auth-forgot-password", categorie: "Sécurité", nom: "Mot de passe oublié", sujet: "Réinitialisez votre mot de passe",
    destinataires: "Tous les comptes", declencheur: "POST /auth/forgot-password",
    variables: { prenom: "Prénom de l'utilisateur", code: "Code à 6 chiffres", lien_action: "Lien de réinitialisation", expiration: "Durée de validité (ex. 15 minutes)" },
    block: { titre: "Réinitialisation du mot de passe", intro: "Bonjour {{prenom}}, vous avez demandé à réinitialiser votre mot de passe.", corps: code("{{code}}"),
      cta: { label: "Choisir un nouveau mot de passe", href: "{{lien_action}}" }, note: "Ce lien expire dans {{expiration}}. Si vous n'êtes pas à l'origine de cette demande, ignorez cet e-mail." } }),
  t({ id: "auth-welcome", categorie: "Sécurité", nom: "Bienvenue / activation", sujet: "Bienvenue sur Kids'Med IA",
    destinataires: "Nouveaux comptes", declencheur: "Création de compte (POST /users)",
    variables: { prenom: "Prénom", role: "Rôle (Crèche, RSAI…)", lien_action: "Lien d'activation" },
    block: { titre: "Bienvenue {{prenom}} !", intro: "Votre compte <strong>{{role}}</strong> a été créé. Activez-le en définissant votre mot de passe.",
      cta: { label: "Activer mon compte", href: "{{lien_action}}" }, note: "Ce lien est valable 72 heures." } }),
  t({ id: "auth-mfa-code", categorie: "Sécurité", nom: "Code de connexion (MFA)", sujet: "Votre code de connexion",
    destinataires: "Tous les comptes", declencheur: "POST /auth/mfa/send-code (canal e-mail)",
    variables: { prenom: "Prénom", code: "Code à 6 chiffres", expiration: "Durée de validité" },
    block: { titre: "Votre code de vérification", intro: "Bonjour {{prenom}}, voici votre code pour terminer la connexion :", corps: code("{{code}}"),
      note: "Valable {{expiration}}. Ne communiquez jamais ce code." } }),
  t({ id: "sec-alerte-acces", categorie: "Sécurité", nom: "Accès bloqué / connexion suspecte", sujet: "Alerte sécurité sur votre compte",
    destinataires: "Utilisateur + admin de la crèche", declencheur: "Refus du géorepérage ou nouvel appareil",
    variables: { prenom: "Prénom", date: "Date et heure", ip: "Adresse IP", appareil: "Appareil", lieu: "Localisation approximative", motif: "Motif du blocage", lien_action: "Lien de sécurisation" },
    block: { titre: "Accès bloqué sur votre compte", intro: "Bonjour {{prenom}}, une tentative d'accès a été bloquée :",
      corps: box([["Date", "{{date}}"], ["Adresse IP", "{{ip}}"], ["Appareil", "{{appareil}}"], ["Lieu", "{{lieu}}"], ["Motif", "{{motif}}"]]),
      cta: { label: "Sécuriser mon compte", href: "{{lien_action}}" }, note: "Si c'était vous, aucune action n'est nécessaire.", accent: "#b4442f" } }),
  t({ id: "doc-rappel-manquant", categorie: "Documents & santé", nom: "Rappel de document manquant", sujet: "Document manquant pour {{nom_enfant}}",
    destinataires: "Parents", declencheur: "Tâche planifiée /documents/alertes",
    variables: { prenom: "Prénom du parent", nom_enfant: "Prénom de l'enfant", nom_creche: "Crèche", document: "Document attendu", date_limite: "Date limite", lien_action: "Lien de dépôt" },
    block: { titre: "Un document est attendu", intro: "Bonjour {{prenom}}, la crèche <strong>{{nom_creche}}</strong> n'a pas encore reçu le document suivant pour {{nom_enfant}} :",
      corps: box([["Document", "{{document}}"], ["À fournir avant le", "{{date_limite}}"]]), cta: { label: "Déposer le document", href: "{{lien_action}}" }, accent: "#c07a1c" } }),
  t({ id: "doc-ordonnance-expirante", categorie: "Documents & santé", nom: "Ordonnance / PAI bientôt expiré", sujet: "L'ordonnance de {{nom_enfant}} expire bientôt",
    destinataires: "Parents + crèche", declencheur: "J-7 et J-1 avant dateFin",
    variables: { nom_enfant: "Prénom de l'enfant", document: "Ordonnance ou PAI", medecin: "Médecin prescripteur", date_expiration: "Date d'expiration", lien_action: "Lien du dossier" },
    block: { titre: "Document bientôt expiré", intro: "Le document médical de <strong>{{nom_enfant}}</strong> arrive à échéance.",
      corps: box([["Document", "{{document}}"], ["Médecin", "{{medecin}}"], ["Expire le", "{{date_expiration}}"]]), cta: { label: "Voir le dossier", href: "{{lien_action}}" },
      note: "Sans renouvellement, le traitement ne pourra plus être administré à la crèche.", accent: "#c07a1c" } }),
  t({ id: "doc-rappel-vaccin", categorie: "Documents & santé", nom: "Rappel vaccinal", sujet: "Vaccin à prévoir pour {{nom_enfant}}",
    destinataires: "Parents", declencheur: "Calendrier vaccinal (GET /enfants/:id/vaccins)",
    variables: { prenom: "Prénom du parent", nom_enfant: "Prénom de l'enfant", vaccin: "Vaccin", date_prevue: "Date recommandée", lien_action: "Lien du carnet" },
    block: { titre: "Rappel de vaccination", intro: "Bonjour {{prenom}}, selon le calendrier vaccinal, {{nom_enfant}} doit recevoir :",
      corps: box([["Vaccin", "{{vaccin}}"], ["À faire avant le", "{{date_prevue}}"]]), cta: { label: "Ouvrir le carnet vaccinal", href: "{{lien_action}}" } } }),
  t({ id: "doc-demande-medecin", categorie: "Documents & santé", nom: "Demande de document (médecin)", sujet: "{{medecin}} vous demande un document",
    destinataires: "Crèche ou parents", declencheur: "POST /coordination/demandes-documents",
    variables: { medecin: "Nom du médecin", nom_enfant: "Prénom de l'enfant", document: "Document demandé", message: "Message du médecin", lien_action: "Lien de dépôt" },
    block: { titre: "Nouvelle demande de document", intro: "<strong>{{medecin}}</strong> demande un document concernant {{nom_enfant}}.",
      corps: box([["Document", "{{document}}"]]) + `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;font-style:italic;color:#44524f;">« {{message}} »</p>`,
      cta: { label: "Répondre à la demande", href: "{{lien_action}}" } } }),
  t({ id: "trans-alerte-symptome", categorie: "Documents & santé", nom: "Transmission urgente", sujet: "Information importante concernant {{nom_enfant}}",
    destinataires: "Parents", declencheur: "Transmission marquée urgente / symptôme signalé",
    variables: { prenom: "Prénom du parent", nom_enfant: "Prénom de l'enfant", nom_creche: "Crèche", heure: "Heure", resume: "Résumé", lien_action: "Lien de la transmission" },
    block: { titre: "Transmission de la crèche", intro: "Bonjour {{prenom}}, la crèche <strong>{{nom_creche}}</strong> a signalé à {{heure}} :",
      corps: `<p style="margin:0 0 16px;padding:14px 16px;background:#fdf1ee;border-left:4px solid #b4442f;font-size:14px;line-height:1.6;">{{resume}}</p>`,
      cta: { label: "Voir la transmission", href: "{{lien_action}}" }, note: "En cas d'urgence vitale, appelez le 15.", accent: "#b4442f" } }),
  t({ id: "rsai-affectation", categorie: "Coordination", nom: "Nouvelle affectation RSAI", sujet: "Nouvelle affectation : {{nom_creche}}",
    destinataires: "RSAI + crèche", declencheur: "POST /coordination/affectations",
    variables: { prenom: "Prénom", nom_rsai: "Nom de la RSAI", nom_creche: "Crèche", adresse: "Adresse", horaires: "Jours et horaires", date_debut: "Date de début", lien_action: "Lien des affectations" },
    block: { titre: "Une affectation a été créée", intro: "Bonjour {{prenom}}, {{nom_rsai}} est affectée à <strong>{{nom_creche}}</strong>.",
      corps: box([["Adresse", "{{adresse}}"], ["Horaires", "{{horaires}}"], ["À partir du", "{{date_debut}}"]]), cta: { label: "Voir l'affectation", href: "{{lien_action}}" } } }),
  t({ id: "rsai-demande", categorie: "Coordination", nom: "Demande de RSAI", sujet: "{{nom_creche}} demande une RSAI",
    destinataires: "Administrateurs", declencheur: "POST /coordination/demandes-rsai",
    variables: { nom_creche: "Crèche", periode: "Période souhaitée", motif: "Motif", lien_action: "Lien de traitement" },
    block: { titre: "Nouvelle demande d'intervention", intro: "La crèche <strong>{{nom_creche}}</strong> sollicite une RSAI.",
      corps: box([["Période", "{{periode}}"], ["Motif", "{{motif}}"]]), cta: { label: "Traiter la demande", href: "{{lien_action}}" } } }),
  t({ id: "rsai-avis-recu", categorie: "Coordination", nom: "Nouvel avis reçu", sujet: "Vous avez reçu un nouvel avis",
    destinataires: "RSAI ou crèche notée", declencheur: "POST /coordination/avis",
    variables: { prenom: "Prénom", auteur: "Auteur de l'avis", note: "Note sur 5", commentaire: "Commentaire", lien_action: "Lien des avis" },
    block: { titre: "Nouvel avis : {{note}}/5", intro: "Bonjour {{prenom}}, <strong>{{auteur}}</strong> vous a laissé un avis :",
      corps: `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;font-style:italic;color:#44524f;">« {{commentaire}} »</p>`, cta: { label: "Voir mes avis", href: "{{lien_action}}" } } }),
  t({ id: "msg-nouveau-message", categorie: "Messagerie & facturation", nom: "Nouveau message", sujet: "Nouveau message de {{expediteur}}",
    destinataires: "Destinataire du message", declencheur: "POST /messages",
    variables: { prenom: "Prénom du destinataire", expediteur: "Expéditeur", objet: "Objet", apercu: "Extrait du message", lien_action: "Lien de la conversation" },
    block: { titre: "Vous avez un nouveau message", intro: "Bonjour {{prenom}}, <strong>{{expediteur}}</strong> vous a écrit :",
      corps: box([["Objet", "{{objet}}"]]) + `<p style="margin:0 0 16px;font-size:14px;line-height:1.6;color:#44524f;">{{apercu}}</p>`, cta: { label: "Répondre", href: "{{lien_action}}" } } }),
  t({ id: "abo-facture-recue", categorie: "Messagerie & facturation", nom: "Reçu de paiement", sujet: "Votre reçu Kids'Med IA — {{forfait}}",
    destinataires: "Titulaire de l'abonnement", declencheur: "Webhook Stripe invoice.paid",
    variables: { prenom: "Prénom", forfait: "Nom du forfait", montant: "Montant TTC", periode: "Période couverte", numero_facture: "N° de facture", lien_action: "Lien de la facture" },
    block: { titre: "Merci pour votre paiement", intro: "Bonjour {{prenom}}, votre paiement a bien été reçu.",
      corps: box([["Forfait", "{{forfait}}"], ["Montant", "{{montant}}"], ["Période", "{{periode}}"], ["Facture", "{{numero_facture}}"]]), cta: { label: "Télécharger la facture", href: "{{lien_action}}" } } }),
];

export function fillSample(html: string, vars: Record<string, string>): string {
  return html.replace(/\{\{(\w+)\}\}/g, (_, k: string) => (k.startsWith("lien") ? "#" : `<mark style="background:#fff3c4;">${vars[k] ?? k}</mark>`));
}
