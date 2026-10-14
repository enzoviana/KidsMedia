import { describe, expect, it } from "vitest";
import { canReadNote, documentEtat, validRating, validSchedule } from "../lib/coordination";
describe("Coordination médicale", () => {
  it("alerte avant expiration et après expiration", () => {
    const now = new Date("2026-10-08T12:00:00");
    expect(documentEtat({ dateValidite: "2026-10-20" }, now)).toBe("expiration_proche");
    expect(documentEtat({ dateValidite: "2026-10-05" }, now)).toBe("expire");
    expect(documentEtat({ dateValidite: "2027-03-01" }, now)).toBe("valide");
  });
  it("le médecin lit les notes publiques et médicales, pas le parent pour les médicales", () => {
    expect(canReadNote("medecin", "medicale")).toBe(true);
    expect(canReadNote("medecin", "publique")).toBe(true);
    expect(canReadNote("parent", "medicale")).toBe(false);
    expect(canReadNote("parent", "publique")).toBe(true);
  });
  it("une note RSAI ou établissement est comprise entre 1 et 5", () => {
    expect(validRating(1)).toBe(true); expect(validRating(5)).toBe(true);
    expect(validRating(0)).toBe(false); expect(validRating(6)).toBe(false); expect(validRating(2.5)).toBe(false);
  });
  it("une affectation exige des jours et horaires cohérents", () => {
    expect(validSchedule("08:00", "18:00", [1, 2, 3])).toBe(true);
    expect(validSchedule("18:00", "08:00", [1])).toBe(false);
    expect(validSchedule("08:00", "18:00", [])).toBe(false);
  });
});