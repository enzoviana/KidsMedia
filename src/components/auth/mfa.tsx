import { useState } from "react";
import { Fingerprint, Mail, MessageSquareText, Smartphone } from "lucide-react";
import { defaultMethod, mfaPasskey, mfaSend, mfaVerify, maskPhone, type PendingLogin, type Session } from "@/lib/api";

export type MfaMethod = "totp" | "passkey" | "sms" | "email";

/** État de l'étape 2 : méthode choisie, « se souvenir de l'appareil », envoi et vérification. */
export function useMfa(pending: PendingLogin | null, setPending: (p: PendingLogin) => void) {
  const [methode, setMethode] = useState<MfaMethod | null>(null);
  const [remember, setRemember] = useState(true);
  const current: MfaMethod = methode ?? (pending ? defaultMethod(pending) : "sms");
  return {
    methode: current, remember, setRemember,
    reset: () => setMethode(null),
    async choose(m: MfaMethod) {
      setMethode(m);
      if (pending && (m === "sms" || m === "email") && pending.canal !== m) setPending(await mfaSend(pending, m));
    },
    verify: (code: string): Promise<Session> => mfaVerify(pending!, code, { methode: current === "totp" ? "totp" : "code", remember }),
    passkey: (): Promise<Session> => mfaPasskey(pending!, remember),
  };
}

/** Le code n'est envoyé qu'au choix SMS/e-mail : avec une application ou une passkey, aucun SMS n'est payé. */
export function mfaNeedsSend(p: PendingLogin) {
  const m = defaultMethod(p);
  return m === "sms" || m === "email";
}

export function mfaHint(p: PendingLogin | null, m: MfaMethod) {
  if (!p) return "";
  if (p.mfaDemo) return "Envoi indisponible : saisissez le code temporaire 123456.";
  if (m === "totp") return "Ouvrez votre application d'authentification (Google Authenticator, Apple, Microsoft…) et saisissez le code à 6 chiffres.";
  if (m === "passkey") return "Cliquez sur le bouton ci-dessous pour vous authentifier avec Face ID, Touch ID, votre empreinte ou votre clé de sécurité.";
  if (m === "email") return p.canal === "email" ? `Un code à 6 chiffres a été envoyé à ${p.user.email ?? "votre adresse e-mail"}.` : `Un code à 6 chiffres sera envoyé à ${p.user.email ?? "votre adresse e-mail"}.`;
  return p.canal === "sms" ? `Un code à 6 chiffres a été envoyé par SMS au ${maskPhone(p.phone)}.` : `Un code à 6 chiffres sera envoyé par SMS au ${maskPhone(p.phone)}.`;
}

const LABEL: Record<MfaMethod, { l: string; i: typeof Mail }> = {
  totp: { l: "Application", i: Smartphone }, passkey: { l: "Face ID", i: Fingerprint }, sms: { l: "SMS", i: MessageSquareText }, email: { l: "E-mail", i: Mail },
};

/** Choix de la méthode + case « Se souvenir de cet appareil 30 jours ». */
export function MfaSwitcher({ pending, mfa, compact }: { pending: PendingLogin; mfa: ReturnType<typeof useMfa>; compact?: boolean }) {
  const [showAll, setShowAll] = useState(false);
  const m = pending.methodes;
  const list: MfaMethod[] = (["passkey", "email", "totp", "sms"] as MfaMethod[]).filter((k) =>
    pending.mfaDemo ? k === "sms" || k === "email" : !m ? k === "sms" || k === "email" : k === "email" ? m.email : m[k]);
  const size = compact ? "text-xs px-2.5 py-1" : "text-sm px-3 py-1.5";
  const primary = list[0];
  const alternatives = list.slice(1);

  return (
    <div className="space-y-2.5">
      {list.length > 0 && (
        <div className="space-y-2">
          {/* Méthode principale toujours affichée */}
          {primary && (
            <div className="flex flex-wrap justify-center gap-1.5" role="radiogroup" aria-label="Méthode de vérification">
              {(() => {
                const I = LABEL[primary].i;
                const on = mfa.methode === primary;
                return (
                  <button key={primary} type="button" role="radio" aria-checked={on} onClick={() => mfa.choose(primary)}
                    className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition ${size} ${on ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground"}`}>
                    <I className="h-3.5 w-3.5" />{LABEL[primary].l}
                  </button>
                );
              })()}
            </div>
          )}

          {/* Lien "Essayer une autre méthode" */}
          {alternatives.length > 0 && !showAll && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAll(true)}
                className="text-sm text-primary hover:underline"
              >
                Essayer une autre méthode
              </button>
            </div>
          )}

          {/* Méthodes alternatives (affichées au clic) */}
          {showAll && alternatives.length > 0 && (
            <div className="flex flex-wrap justify-center gap-1.5">
              {alternatives.map((k) => {
                const I = LABEL[k].i;
                const on = mfa.methode === k;
                return (
                  <button key={k} type="button" role="radio" aria-checked={on} onClick={() => mfa.choose(k)}
                    className={`inline-flex items-center gap-1.5 rounded-full border font-semibold transition ${size} ${on ? "border-transparent bg-foreground text-background" : "border-border text-muted-foreground"}`}>
                    <I className="h-3.5 w-3.5" />{LABEL[k].l}
                  </button>
                );
              })}
            </div>
          )}

          {/* Lien pour réduire */}
          {showAll && alternatives.length > 0 && (
            <div className="text-center">
              <button
                type="button"
                onClick={() => setShowAll(false)}
                className="text-xs text-muted-foreground hover:text-foreground"
              >
                Réduire
              </button>
            </div>
          )}
        </div>
      )}
      <label className={`flex items-center justify-center gap-2 text-muted-foreground ${compact ? "text-xs" : "text-sm"}`}>
        <input type="checkbox" checked={mfa.remember} onChange={(e) => mfa.setRemember(e.target.checked)} className="h-4 w-4 accent-current" />
        Se souvenir de cet appareil pendant 30 jours
      </label>
    </div>
  );
}
