import { describe, expect, it } from "vitest";
import { defaultMethod, type PendingLogin } from "@/lib/api";

const p = (methodes?: PendingLogin["methodes"]): PendingLogin => ({ user: { email: "a@b.fr" }, methodes });

/**
 * Priorité de la 2e étape (documentée dans src/lib/api.ts) :
 * passkey > e-mail > TOTP > SMS. L'e-mail est privilégié pour éviter les SMS payants,
 * la passkey reste devant car elle n'envoie aucun code.
 */
describe("choix de la 2e étape (éviter les SMS payants)", () => {
  it("privilégie la passkey quand elle est disponible", () => {
    expect(defaultMethod(p({ totp: true, passkey: true, sms: true, email: true }))).toBe("passkey");
  });

  it("utilise l'e-mail quand aucune passkey n'est enregistrée", () => {
    expect(defaultMethod(p({ totp: true, passkey: false, sms: true, email: true }))).toBe("email");
  });

  it("utilise l'application d'authentification si l'e-mail est indisponible", () => {
    expect(defaultMethod(p({ totp: true, passkey: false, sms: true, email: false }))).toBe("totp");
  });

  it("garde le SMS en dernier recours", () => {
    expect(defaultMethod(p({ totp: false, passkey: false, sms: true, email: false }))).toBe("sms");
    expect(defaultMethod(p())).toBe("sms");
  });

  it("n'envoie jamais de SMS quand l'e-mail est disponible", () => {
    expect(defaultMethod(p({ totp: false, passkey: false, sms: true, email: true }))).not.toBe("sms");
  });
});
