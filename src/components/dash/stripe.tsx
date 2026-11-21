import { useEffect, useRef, useState } from "react";
import { loadStripe, type StripeEmbeddedCheckout } from "@stripe/stripe-js";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { getSession } from "@/lib/api";

export const plans = [
  { id: "essentiel", nom: "Essentiel", prix: 79, inclus: ["Jusqu'à 30 enfants", "Dossiers médicaux", "Transmissions"] },
  { id: "premium", nom: "Premium", prix: 149, inclus: ["Jusqu'à 60 enfants", "Analyse IA des symptômes", "RSAI et médecins liés"] },
  { id: "entreprise", nom: "Entreprise", prix: 299, inclus: ["Enfants illimités", "Multi-crèches", "Support prioritaire"] },
];

type ReponseCheckout = {
  url?: string | null;
  clientSecret?: string | null;
  publishableKey?: string | null;
  embedded?: boolean;
  avertissement?: string;
};

type SessionEmbedded = { clientSecret: string; publishableKey: string };
type InitEmbedded = (options: { clientSecret: string; onComplete: () => void }) => Promise<StripeEmbeddedCheckout>;

/**
 * Selon la version de Stripe.js déployée, l'initialisation du Checkout embarqué
 * s'appelle `createEmbeddedCheckoutPage` ou `initEmbeddedCheckout`.
 */
function initialiseur(stripe: unknown): InitEmbedded | null {
  const s = stripe as { createEmbeddedCheckoutPage?: InitEmbedded; initEmbeddedCheckout?: InitEmbedded };
  const fn = s.createEmbeddedCheckoutPage ?? s.initEmbeddedCheckout;
  return fn ? fn.bind(stripe) : null;
}

/**
 * Formulaire de paiement Stripe embarqué dans notre propre dialogue :
 * l'utilisateur reste sur Kids'Med, aucun retour vers un hébergeur externe.
 */
function EmbeddedCheckout({ session, onComplete, onFallback }: { session: SessionEmbedded; onComplete: () => void; onFallback: () => void }) {
  const holder = useRef<HTMLDivElement>(null);
  const complete = useRef(onComplete);
  complete.current = onComplete;
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let stopped = false;
    let checkout: StripeEmbeddedCheckout | null = null;

    void (async () => {
      try {
        const stripe = await loadStripe(session.publishableKey);
        if (!stripe) throw new Error("Impossible de charger Stripe.js.");
        if (stopped) return;
        const init = initialiseur(stripe);
        if (!init) throw new Error("Le paiement embarqué n'est pas disponible dans cette version de Stripe.js.");
        const instance = await init({ clientSecret: session.clientSecret, onComplete: () => complete.current() });
        checkout = instance;
        if (stopped) { instance.destroy(); return; }
        if (holder.current) instance.mount(holder.current);
      } catch (e) {
        if (!stopped) setError(e instanceof Error ? e.message : "Paiement indisponible.");
      }
    })();

    return () => {
      stopped = true;
      checkout?.destroy();
    };
  }, [session.clientSecret, session.publishableKey]);

  return (
    <div className="space-y-2">
      {error ? (
        <div className="space-y-2 rounded-lg bg-destructive/10 p-3 text-sm text-destructive">
          <p>{error}</p>
          <Button type="button" variant="outline" size="sm" onClick={onFallback}>Continuer sur la page sécurisée Stripe</Button>
        </div>
      ) : (
        <p className="text-xs text-muted-foreground">Paiement sécurisé par Stripe — vous restez sur Kids'Med IA.</p>
      )}
      <div ref={holder} />
    </div>
  );
}

/** Paiement d'une formule : Checkout Stripe embarqué, repli sur la page hébergée si nécessaire. */
export function StripeCheckout({ plan, catalog, onClose, onPaid }: { plan: string | null; catalog?: { id: string; nom: string; prix: number }[]; onClose: () => void; onPaid: (plan: string) => void }) {
  const p = (catalog ?? plans).find((x) => x.id === plan);
  const [busy, setBusy] = useState(false);
  const [embed, setEmbed] = useState<SessionEmbedded | null>(null);
  const paidRef = useRef(false);

  useEffect(() => {
    setEmbed(null);
    paidRef.current = false;
  }, [plan]);

  function paid() {
    if (!p || paidRef.current) return;
    paidRef.current = true;
    onPaid(p.id);
    toast.success(`Paiement accepté — formule ${p.nom} activée`);
    onClose();
  }

  async function demarrer(embedded: boolean) {
    if (!p) return;
    setBusy(true);
    try {
      const s = getSession();
      if (s && !s.demo && specs.stripeCheckout.status === "ok") {
        const r = await send<ReponseCheckout>("POST", specs.stripeCheckout.path, { plan: p.id, periodicite: "mensuel", embedded });
        const d = r.data ?? {};
        if (embedded && d.clientSecret && d.publishableKey) {
          setEmbed({ clientSecret: d.clientSecret, publishableKey: d.publishableKey });
          return;
        }
        if (d.url) {
          if (d.avertissement) toast.info(d.avertissement);
          window.location.href = d.url;
          return;
        }
        throw new Error("Stripe n'a pas renvoyé de session de paiement.");
      }
      await new Promise((r) => setTimeout(r, 1200));
      paid();
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Paiement indisponible.");
    } finally { setBusy(false); }
  }

  function pay(e: React.FormEvent) {
    e.preventDefault();
    void demarrer(true);
  }

  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className={embed ? "max-w-2xl" : "max-w-md"}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Paiement sécurisé</DialogTitle>
          <DialogDescription>
            Formule {p?.nom} — {p?.prix} € / mois.{embed ? " Saisissez vos informations bancaires ci-dessous." : " Paiement traité par Stripe, sans quitter l'application."}
          </DialogDescription>
        </DialogHeader>

        {embed ? (
          <div className="space-y-3">
            <EmbeddedCheckout session={embed} onComplete={paid} onFallback={() => void demarrer(false)} />
            <Button type="button" variant="outline" className="w-full" onClick={onClose}>Annuler</Button>
          </div>
        ) : (
          <form onSubmit={pay} className="space-y-3">
            <div className="rounded-xl border bg-muted/40 p-4 text-sm">
              <p className="flex items-center justify-between"><span>Formule {p?.nom}</span><strong>{p?.prix} € / mois</strong></p>
              <p className="mt-1 text-xs text-muted-foreground">Facturation mensuelle, résiliable à tout moment.</p>
            </div>
            <Button type="submit" className="w-full" disabled={busy}>
              {busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}
              Payer {p?.prix} €
            </Button>
            <p className="text-center text-xs text-muted-foreground">Paiement traité par Stripe</p>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
