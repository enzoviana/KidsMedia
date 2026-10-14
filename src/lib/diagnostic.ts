import { API_BASE } from "./api";

/** Diagnostic détaillé du dernier appel ayant basculé en démo, par spec. */
export interface Diagnostic {
  kind: "demo-session" | "param" | "not-found" | "auth" | "forbidden" | "validation" | "server" | "network" | "text";
  method: string;
  url: string;
  status?: number | undefined;
  message: string;
  body?: unknown;
  at: string;
}

const store = new Map<string, Diagnostic>();
export const setDiag = (id: string, d: Diagnostic | null) => (d ? store.set(id, d) : store.delete(id));
export const getDiag = (id: string) => store.get(id);

export function classify(status: number | undefined, message: string): Diagnostic["kind"] {
  if (status === undefined) return /fetch|network|réseau/i.test(message) ? "network" : "server";
  if (status === 404 || /route non trouv|not found/i.test(message)) return "not-found";
  if (status === 401) return "auth";
  if (status === 403) return "forbidden";
  if (status === 400 || status === 422) return "validation";
  return "server";
}

export const explain: Record<Diagnostic["kind"], { title: string; text: string; fix: string }> = {
  "demo-session": { title: "Session de démonstration", text: "Vous explorez en mode démo : aucune requête n'est envoyée au serveur.", fix: "Connectez-vous avec un vrai compte pour voir vos données." },
  param: { title: "Information manquante", text: "Il manque un identifiant nécessaire pour construire l'adresse de la requête.", fix: "Le profil renvoyé par /auth/me doit contenir cet identifiant (ex. etablissementId)." },
  "not-found": { title: "Route introuvable (404)", text: "Le serveur répond, mais cette adresse n'existe pas sur votre backend.", fix: "Vérifiez que la route est déclarée dans Express, montée sous /api, et déployée sur Render." },
  auth: { title: "Non authentifié (401)", text: "Le jeton de connexion est absent ou expiré, et le renouvellement a échoué.", fix: "Déconnectez-vous puis reconnectez-vous." },
  forbidden: { title: "Permissions insuffisantes (403)", text: "Vous êtes connecté, mais votre rôle n'a pas accès à cette ressource.", fix: "Autorisez ce rôle dans le middleware de la route, ou vérifiez l'appartenance à l'établissement." },
  validation: { title: "Requête refusée (400)", text: "Le serveur a rejeté les paramètres envoyés.", fix: "Comparez les champs envoyés au format attendu par le contrôleur." },
  server: { title: "Erreur serveur", text: "La route existe mais a planté pendant le traitement.", fix: "Consultez les logs Render au moment de l'appel (souvent une erreur Prisma)." },
  network: { title: "Serveur injoignable", text: "Aucune réponse : le serveur Render est peut-être en veille ou hors ligne.", fix: "Patientez ~30 s que Render redémarre, puis rechargez la page." },
  text: { title: "Exigence non appelable", text: "Cette ligne décrit une règle, pas une adresse appelable.", fix: "À implémenter côté serveur." },
};

export function curlOf(d: Diagnostic, token = "<VOTRE_TOKEN>") {
  return `curl -X ${d.method} "${d.url}" -H "Authorization: Bearer ${token}"`;
}

export const fullUrl = (path: string) => `${API_BASE}${path}`;
