import { describe, it, expect } from "vitest";
import { analyseDemo, dansPlage, distanceM } from "@/lib/demo-medical";

describe("règles du cahier des charges", () => {
  it("difficulté à respirer = urgence, appel du 15", () => {
    const r = analyseDemo(["toux", "difficulte_respirer"]);
    expect(r.niveau_risque).toBe("eleve");
    expect(r.orientation).toBe("urgence_15");
  });
  it("fièvre à 40 °C = urgence", () => {
    expect(analyseDemo(["fievre"], 40).niveau_risque).toBe("eleve");
  });
  it("fièvre simple = consultation sous 24 h", () => {
    expect(analyseDemo(["fievre", "nez"], 38.5).orientation).toBe("consultation_24h");
  });
  it("crèche limitée à 7h-19h en semaine", () => {
    const p = { role: "creche", jours: [1, 2, 3, 4, 5], debut: "07:00", fin: "19:00", actif: true };
    expect(dansPlage(p, new Date(2026, 9, 8, 10, 0))).toBe(true); // jeudi 10h
    expect(dansPlage(p, new Date(2026, 9, 8, 20, 0))).toBe(false); // jeudi 20h
    expect(dansPlage(p, new Date(2026, 9, 11, 10, 0))).toBe(false); // dimanche
  });
  it("distance GPS ~ 0 au même point", () => {
    expect(distanceM({ lat: 48.85, lng: 2.35 }, { lat: 48.85, lng: 2.35 })).toBeLessThan(1);
  });
});

import { accesRsai, demoAffectations } from "@/lib/demo-medical";
describe("accès RSAI", () => {
  const a = demoAffectations[0]!; // lundi 8h-12h, mercredi, jeudi 8h-18h
  const surPlace = { lat: a.etablissement.lat, lng: a.etablissement.lng };
  it("autorisé dans ses horaires et sur place", () => {
    expect(accesRsai(a, new Date(2026, 9, 8, 10, 0), surPlace).ok).toBe(true); // jeudi 10h
  });
  it("refusé hors horaires même sur place", () => {
    expect(accesRsai(a, new Date(2026, 9, 6, 10, 0), surPlace).motif).toBe("hors_plage"); // mardi
  });
  it("refusé hors zone dans ses horaires", () => {
    expect(accesRsai(a, new Date(2026, 9, 8, 10, 0), { lat: 48.9, lng: 2.4 }).motif).toBe("hors_zone");
  });
});
