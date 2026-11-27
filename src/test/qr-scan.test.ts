import { describe, expect, it } from "vitest";
import { parseChildQr } from "@/lib/qr-scan";

describe("parseChildQr", () => {
  it("lit le lien de liaison KidsMed", () => expect(parseChildQr("kidsmed://lier/lea-4821")).toEqual({ code: "LEA-4821" }));
  it("lit un lien de dossier", () => expect(parseChildQr("https://kidsmedia.vercel.app/enfants/abc123")).toEqual({ id: "abc123" }));
  it("accepte un code brut", () => expect(parseChildQr("LUC-1234")).toEqual({ code: "LUC-1234" }));
  it("lit la carte QR de la PWA parent", () => expect(parseChildQr("https://kidsmedia.vercel.app/app?enfant=demo-lea&urgence=LEA-4821")).toEqual({ id: "demo-lea" }));
  it("lit un QR d'urgence parent avec un code de liaison", () => expect(parseChildQr("https://kidsmedia.vercel.app/urgence/LEA-4821")).toEqual({ code: "LEA-4821" }));
  it("lit un QR d'urgence parent avec un jeton dédié", () => {
    const token = "3f0c3a5e5f5e4e3e9a1a2b3c4d5e6f70";
    expect(parseChildQr(`https://kidsmedia.vercel.app/urgence/${token}`)).toEqual({ urgence: token });
  });
  it("refuse un QR étranger", () => expect(parseChildQr("https://example.com")).toBeNull());
});
