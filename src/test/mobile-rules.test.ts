import { describe, expect, it } from "vitest";
import { canEdit, canSeeInternal, feverColor } from "@/lib/mobile-demo";

describe("permissions du dossier enfant mobile", () => {
  it("le parent lit le quotidien sans éditer", () => { expect(canEdit("quotidien", "parent")).toBe(false); });
  it("crèche et RSAI éditent quotidien et fièvre", () => { expect(canEdit("quotidien", "creche")).toBe(true); expect(canEdit("fievre", "rsai")).toBe(true); });
  it("seul le parent signe le PAI", () => { expect(canEdit("pai", "parent")).toBe(true); expect(canEdit("pai", "creche")).toBe(false); });
  it("la RSAI ne modifie pas les sorties", () => { expect(canEdit("sorties", "rsai")).toBe(false); expect(canEdit("sorties", "creche")).toBe(true); });
  it("les notes internes sont cachées au parent", () => { expect(canSeeInternal("parent")).toBe(false); expect(canSeeInternal("rsai")).toBe(true); });
  it("38 °C et plus est en rouge", () => { expect(feverColor(38)).toBe("pink"); expect(feverColor(37)).toBe("green"); });
});
