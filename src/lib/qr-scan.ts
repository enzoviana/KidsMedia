/** Cible utile lue dans le QR code d'un enfant. */
export interface ChildQr {
  /** Code de liaison imprimé (ex. LEA-4821). */
  code?: string;
  /** Identifiant du dossier enfant (ex. UUID Prisma). */
  id?: string;
  /** Jeton du QR d'urgence public (32 caractères), à résoudre via /urgence/:code. */
  urgence?: string;
}

const CODE_RE = /^[A-Za-z0-9]{2,6}-\d{3,6}$/;

function decode(value: string): string {
  try { return decodeURIComponent(value); } catch { return value; }
}

/** Extrait le code de liaison, l'ID d'enfant ou le jeton d'urgence d'un contenu de QR code. */
export function parseChildQr(raw: string): ChildQr | null {
  const t = (raw ?? "").trim();
  if (!t) return null;

  // Carte QR de la PWA parent : /app?enfant=<id>&urgence=<code>
  const pwa = t.match(/[?&]enfant=([^&#]+)/i);
  if (pwa) return { id: decode(pwa[1]!) };

  // Ancien format de liaison : kidsmed://lier/LEA-4821
  const lier = t.match(/lier\/([A-Za-z0-9]{2,6}-\d{3,6})/i);
  if (lier) return { code: lier[1]!.toUpperCase() };

  // Lien direct vers un dossier : /enfants/<id>
  const dossier = t.match(/enfants\/([A-Za-z0-9_-]+)/i);
  if (dossier && dossier[1]!.toLowerCase() !== "lier-code") return { id: dossier[1]! };

  // Carte QR d'urgence du parent : /urgence/<jeton ou code de liaison>
  const urgence = t.match(/urgence\/([A-Za-z0-9-]+)/i);
  if (urgence) {
    const value = decode(urgence[1]!);
    return CODE_RE.test(value) ? { code: value.toUpperCase() } : { urgence: value };
  }

  if (CODE_RE.test(t)) return { code: t.toUpperCase() };
  return null;
}
