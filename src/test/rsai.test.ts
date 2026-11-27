import { describe, expect, it } from "vitest";
import { departementLabel, distanceLabel, estDisponible, peutNoterRsai, rsaiLocalisation } from "../lib/rsai";

describe("Fiche et annuaire RSAI", () => {
  it("affiche une distance lisible", () => {
    expect(distanceLabel(null)).toBe("—");
    expect(distanceLabel(0.35)).toBe("350 m");
    expect(distanceLabel(2.84)).toBe("2.8 km");
    expect(distanceLabel("12.0")).toBe("12.0 km");
    expect(distanceLabel("inconnue")).toBe("—");
  });

  it("affiche uniquement le département, jamais l'adresse exacte", () => {
    expect(departementLabel({ departement: "75" })).toBe("75");
    expect(departementLabel({ codePostal: "75011" })).toBe("75");
    expect(departementLabel({ codePostal: "97400" })).toBe("974");
    expect(departementLabel(null)).toBe("—");
    expect(rsaiLocalisation({ region: "Île-de-France", departement: "75", secteur: "Paris Est" })).toBe("Département 75 · Île-de-France · Paris Est");
    expect(rsaiLocalisation({ region: "Bretagne" })).toBe("Bretagne");
    expect(rsaiLocalisation(null)).toBe("Région non renseignée");
  });

  it("calcule la pastille de disponibilité selon la mission en cours", () => {
    expect(estDisponible({ missionEnCours: false })).toBe(true);
    expect(estDisponible({ missionEnCours: true })).toBe(false);
    expect(estDisponible({ affectations: [{ statut: "terminee", terminee: true }] })).toBe(true);
    expect(estDisponible({ affectations: [{ statut: "active", dateDebut: "2026-01-01", dateFin: null }] })).toBe(false);
    expect(estDisponible({ affectations: [{ statut: "active", dateDebut: "2027-01-01", dateFin: "2027-06-01" }] })).toBe(true);
    expect(estDisponible({})).toBeNull();
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
