/** Extrait le code de liaison (ex. LEA-4821) ou l'ID d'enfant d'un contenu de QR code. */
export function parseChildQr(raw: string): { code?: string; id?: string } | null {
  const t = (raw ?? "").trim();
  if (!t) return null;
  const lier = t.match(/lier\/([A-Za-z0-9]{2,6}-\d{3,6})/);
  if (lier) return { code: lier[1]!.toUpperCase() };
  const dossier = t.match(/enfants\/([A-Za-z0-9_-]+)/);
  if (dossier) return { id: dossier[1]! };
  if (/^[A-Za-z0-9]{2,6}-\d{3,6}$/.test(t)) return { code: t.toUpperCase() };
  return null;
}
