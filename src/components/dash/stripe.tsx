import { useState } from "react";
import { CreditCard, Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { getSession } from "@/lib/api";

export const plans = [
  { id: "essentiel", nom: "Essentiel", prix: 79, inclus: ["Jusqu'à 30 enfants", "Dossiers médicaux", "Transmissions"] },
  { id: "premium", nom: "Premium", prix: 149, inclus: ["Jusqu'à 60 enfants", "Analyse IA des symptômes", "RSAI et médecins liés"] },
  { id: "entreprise", nom: "Entreprise", prix: 299, inclus: ["Enfants illimités", "Multi-crèches", "Support prioritaire"] },
];

/** Paiement Stripe simulé : en réel, l'API renvoie l'URL Stripe Checkout et on y redirige. */
export function StripeCheckout({ plan, catalog, onClose, onPaid }: { plan: string | null; catalog?: { id: string; nom: string; prix: number }[]; onClose: () => void; onPaid: (plan: string) => void }) {
  const p = (catalog ?? plans).find((x) => x.id === plan);
  const [busy, setBusy] = useState(false);
  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!p) return;
    setBusy(true);
    try {
      const s = getSession();
      if (s && !s.demo && specs.stripeCheckout.status === "ok") {
        const r = await send<{ url: string }>("POST", specs.stripeCheckout.path, { plan: p.id, periodicite: "mensuel" });
        window.location.href = r.data.url;
        return;
      }
      await new Promise((r) => setTimeout(r, 1200));
      onPaid(p.id);
      toast.success(`Paiement accepté (simulation Stripe) — formule ${p.nom} active`);
      onClose();
    } finally { setBusy(false); }
  }
  return (
    <Dialog open={!!p} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2"><CreditCard className="h-5 w-5" />Paiement sécurisé</DialogTitle>
          <DialogDescription>Formule {p?.nom} — {p?.prix} € / mois. Simulation Stripe : aucune somme n'est prélevée. Carte de test : 4242 4242 4242 4242.</DialogDescription>
        </DialogHeader>
        <form onSubmit={pay} className="space-y-3">
          <div><Label htmlFor="card">Numéro de carte</Label><Input id="card" defaultValue="4242 4242 4242 4242" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><Label htmlFor="exp">Expiration</Label><Input id="exp" defaultValue="12/30" required /></div>
            <div><Label htmlFor="cvc">CVC</Label><Input id="cvc" defaultValue="123" required /></div>
          </div>
          <Button type="submit" className="w-full" disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Lock className="mr-2 h-4 w-4" />}Payer {p?.prix} €</Button>
          <p className="text-center text-xs text-muted-foreground">Paiement traité par Stripe</p>
        </form>
      </DialogContent>
    </Dialog>
  );
}
