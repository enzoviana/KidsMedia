import { enfantIdOf } from "./demo-enfants";

const DOC_URL_KEYS = ["url", "lien", "fileUrl", "fichierUrl", "downloadUrl"] as const;

function asRecord(value: unknown): Record<string, unknown> | null {
  return value !== null && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

function stringValue(value: unknown): string {
  return typeof value === "string" ? value.trim() : "";
}

/** URL du fichier joint, y compris lorsque le serveur l'imbrique (fichier/document). */
export function documentUrlOf(row: unknown): string {
  const record = asRecord(row);
  if (!record) return "";
  for (const key of DOC_URL_KEYS) {
    const value = stringValue(record[key]);
    if (value) return value;
  }
  for (const key of ["fichier", "file", "document", "pieceJointe"]) {
    const nested = record[key];
    if (typeof nested === "string" && /^(https?:\/\/|\/|data:|blob:)/i.test(nested)) return nested;
    const nestedRecord = asRecord(nested);
    if (!nestedRecord) continue;
    for (const inner of DOC_URL_KEYS) {
      const value = stringValue(nestedRecord[inner]);
      if (value) return value;
    }
  }
  return "";
}

/** Enfant concerné par une ligne (document, traitement, transmission…). */
export function childIdOfRow(row: unknown): string | null {
  const record = asRecord(row);
  if (!record) return null;
  return enfantIdOf(record["enfant"] ?? record["enfantId"] ?? null);
}

export function childNameOf(row: unknown): string {
  const record = asRecord(row);
  if (!record) return "l'enfant";
  const enfant = asRecord(record["enfant"]);
  const prenom = stringValue(enfant?.["prenom"] ?? record["prenom"]);
  const nom = stringValue(enfant?.["nom"] ?? record["nom"]);
  return [prenom, nom].filter(Boolean).join(" ") || "l'enfant";
}
