import { describe, expect, it } from "vitest";
import { parseChildQr } from "@/lib/qr-scan";

describe("parseChildQr", () => {
  it("lit le lien de liaison KidsMed", () => expect(parseChildQr("kidsmed://lier/lea-4821")).toEqual({ code: "LEA-4821" }));
  it("lit un lien de dossier", () => expect(parseChildQr("https://kidsmedia.vercel.app/enfants/abc123")).toEqual({ id: "abc123" }));
  it("accepte un code brut", () => expect(parseChildQr("LUC-1234")).toEqual({ code: "LUC-1234" }));
  it("refuse un QR étranger", () => expect(parseChildQr("https://example.com")).toBeNull());
});
