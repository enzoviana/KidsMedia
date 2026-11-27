/** Règles d'affichage de la fenêtre SOS (le serveur reste l'autorité). */
export const SOS_MAX_SCANS = 5;
export const SOS_DUREE_HEURES = 5;

export interface SosWindow {
  id?: string;
  statut?: string;
  motif?: string | null;
  maxScans?: number;
  dureeHeures?: number;
  scansUtilises?: number;
  scansRestants?: number;
  expiresAt?: string;
}

export interface SosDeclenchement {
  sos?: SosWindow;
  qrPartage?: boolean;
  consentementRequis?: boolean;
  qrToken?: string | null;
}

export function sosRemaining(sos?: SosWindow | null): number {
  if (!sos) return 0;
  const max = sos.maxScans ?? SOS_MAX_SCANS;
  const restants = sos.scansRestants;
  if (typeof restants === "number") return Math.max(0, restants);
  return Math.max(0, max - (sos.scansUtilises ?? 0));
}

export function sosExpiresLabel(expiresAt?: string | null): string {
  if (!expiresAt) return "—";
  const d = new Date(expiresAt);
  if (Number.isNaN(d.getTime())) return "—";
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });
}

export function sosStatutLabel(statut?: string | null): string {
  switch (statut) {
    case "ouverte": return "Ouverte";
    case "sans_partage": return "Sans partage QR (consentement manquant)";
    case "cloturee": return "Clôturée";
    case "expiree": return "Expirée";
    default: return statut || "—";
  }
}

/** Réponse simulée en mode démo, alignée sur le contrat serveur et le consentement. */
export function demoSos(qrToken?: string | null, partage = true): SosDeclenchement {
  return {
    qrPartage: partage,
    consentementRequis: !partage,
    qrToken: partage ? qrToken ?? "demo-sos" : null,
    sos: {
      statut: partage ? "ouverte" : "sans_partage",
      maxScans: SOS_MAX_SCANS,
      dureeHeures: SOS_DUREE_HEURES,
      scansUtilises: 0,
      scansRestants: partage ? SOS_MAX_SCANS : 0,
      expiresAt: new Date(Date.now() + SOS_DUREE_HEURES * 3600e3).toISOString(),
    },
  };
}
