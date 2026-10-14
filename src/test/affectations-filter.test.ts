import { describe, expect, it } from "vitest";
import { filterAffectations, statutAffectation } from "@/lib/affectations-filter";

const now = new Date("2026-10-11");
const rows = [
  { rsai: { nom: "Nadia Roux" }, etablissement: { nom: "Petits Loups" }, dateDebut: "2026-01-05", dateFin: null, statut: "active" },
  { rsai: { nom: "Léa Martin" }, etablissement: { nom: "Soleils" }, dateDebut: "2025-02-01", dateFin: "2025-06-30", statut: "active" },
  { rsai: { nom: "Ines" }, etablissement: { nom: "Soleils" }, dateDebut: "2027-01-01", statut: "active" },
];

describe("filtres affectations", () => {
  it("garde seulement l'année choisie", () => expect(filterAffectations(rows, 2025, "toutes", "", now)).toHaveLength(1));
  it("classe à venir et terminée", () => {
    expect(statutAffectation(rows[2], now)).toBe("a_venir");
    expect(statutAffectation(rows[1], now)).toBe("terminee");
  });
  it("recherche sans accents", () => expect(filterAffectations(rows, 2025, "toutes", "lea", now)).toHaveLength(1));
});
