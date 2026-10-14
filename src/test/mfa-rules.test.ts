import { describe, expect, it } from "vitest";
import { defaultMethod, type PendingLogin } from "@/lib/api";

const p = (methodes?: PendingLogin["methodes"]): PendingLogin => ({ user: { email: "a@b.fr" }, methodes });

describe("choix de la 2e étape (éviter les SMS payants)", () => {
  it("utilise l'application d'authentification quand elle est activée", () => {
    expect(defaultMethod(p({ totp: true, passkey: true, sms: true, email: true }))).toBe("totp");
  });
  it("envoie par e-mail quand le compte n'a pas de téléphone", () => {
    expect(defaultMethod(p({ totp: false, passkey: false, sms: false, email: true }))).toBe("email");
  });
  it("reste sur le SMS sinon", () => {
    expect(defaultMethod(p({ totp: false, passkey: false, sms: true, email: true }))).toBe("sms");
    expect(defaultMethod(p())).toBe("sms");
  });
});
