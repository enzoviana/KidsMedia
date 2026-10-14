import { describe, it, expect } from "vitest";
import { validTemperature, feverAlert } from "@/lib/terrain-rules";
import { canEdit } from "@/lib/mobile-demo";

describe("terrain", () => {
  it("accepte 34–43 °C seulement", () => { expect(validTemperature(38.2)).toBe(true); expect(validTemperature(45)).toBe(false); expect(validTemperature(33.9)).toBe(false); });
  it("alerte fièvre à partir de 38,5 °C", () => { expect(feverAlert(38.5)).toBe(true); expect(feverAlert(38.4)).toBe(false); });
  it("un parent peut noter la température", () => { expect(canEdit("fievre", "parent")).toBe(true); });
});
