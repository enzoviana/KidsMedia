import { describe, expect, it } from "vitest";
import { consentTypes } from "../lib/demo-medical";
import { SOS_DUREE_HEURES, SOS_MAX_SCANS, demoSos, sosExpiresLabel, sosRemaining, sosStatutLabel } from "../lib/sos";

describe("Fenêtre SOS / QR d'urgence", () => {
  it("expose le consentement RGPD dédié au partage d'urgence par QR", () => {
    expect(consentTypes.some((c) => c.type === "acces_urgence_qr")).toBe(true);
  });

  it("limite le partage à 5 scans sur 5 heures", () => {
    expect(SOS_MAX_SCANS).toBe(5);
    expect(SOS_DUREE_HEURES).toBe(5);
  });

  it("calcule les scans restants", () => {
    expect(sosRemaining({ scansUtilises: 2 })).toBe(3);
    expect(sosRemaining({ scansUtilises: 5 })).toBe(0);
    expect(sosRemaining({ scansUtilises: 6 })).toBe(0);
    expect(sosRemaining({ scansRestants: 1, scansUtilises: 0 })).toBe(1);
    expect(sosRemaining(null)).toBe(0);
  });

  it("affiche un statut lisible", () => {
    expect(sosStatutLabel("ouverte")).toBe("Ouverte");
    expect(sosStatutLabel("sans_partage")).toContain("consentement");
    expect(sosStatutLabel("expiree")).toBe("Expirée");
  });

  it("formate l'expiration et fournit une réponse de démo cohérente", () => {
    expect(sosExpiresLabel(null)).toBe("—");
    const demo = demoSos("jeton-demo");
    expect(demo.qrPartage).toBe(true);
    expect(demo.qrToken).toBe("jeton-demo");
    expect(demo.sos?.maxScans).toBe(SOS_MAX_SCANS);
    expect(demo.sos?.scansRestants).toBe(SOS_MAX_SCANS);
  });

  it("ne simule pas un partage QR sans consentement parental", () => {
    const demo = demoSos("jeton-demo", false);
    expect(demo.qrPartage).toBe(false);
    expect(demo.consentementRequis).toBe(true);
    expect(demo.qrToken).toBeNull();
    expect(demo.sos?.statut).toBe("sans_partage");
    expect(demo.sos?.scansRestants).toBe(0);
  });
});
