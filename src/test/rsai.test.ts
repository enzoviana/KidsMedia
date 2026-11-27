import { describe, expect, it } from "vitest";
import { distanceLabel, peutNoterRsai, rsaiLocalisation } from "../lib/rsai";

describe("Fiche et annuaire RSAI", () => {
  it("affiche une distance lisible", () => {
    expect(distanceLabel(null)).toBe("—");
    expect(distanceLabel(0.35)).toBe("350 m");
    expect(distanceLabel(2.84)).toBe("2.8 km");
    expect(distanceLabel("12.0")).toBe("12.0 km");
    expect(distanceLabel("inconnue")).toBe("—");
  });

  it("compose la localisation région · ville · secteur", () => {
    expect(rsaiLocalisation({ region: "Île-de-France", ville: "Paris", secteur: "Paris Est" })).toBe("Île-de-France · Paris · Paris Est");
    expect(rsaiLocalisation({ region: "Bretagne" })).toBe("Bretagne");
    expect(rsaiLocalisation(null)).toBe("Région non renseignée");
  });

  it("n'ouvre la note qu'après une mission terminée", () => {
    expect(peutNoterRsai({ peutNoter: true })).toBe(true);
    expect(peutNoterRsai({ peutNoter: false })).toBe(false);
    expect(peutNoterRsai({ missionsTermineesAvecCreche: 1 })).toBe(true);
    expect(peutNoterRsai({ missionsTermineesAvecCreche: 0 })).toBe(false);
    expect(peutNoterRsai({ missionsTerminees: 3 })).toBe(true);
    expect(peutNoterRsai(null)).toBe(false);
  });
});
