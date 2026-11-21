import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ArrowLeft, BadgeCheck, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { getSession, roleToKey, toList } from "@/lib/api";
import { send } from "@/lib/mutate";
import { useApiOrDemo } from "@/lib/use-api";
import { forfaitsPourRole, demoTarifs } from "@/lib/forfaits";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/abonnement/paiement")({
  validateSearch: (search: Record<string, unknown>) => ({
    plan: typeof search["plan"] === "string" ? search["plan"] : "",
    nom: typeof search["nom"] === "string" ? search["nom"] : "",
    periodicite: search["periodicite"] === "annuel" ? "annuel" as const : "mensuel" as const,
  }),
  head: () => ({
    meta: [
      { title: "Paiement — Kids'Med IA" },
      { name: "description", content: "Finalisez votre abonnement Kids'Med IA en toute sécurité." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Page,
});

type Intent = {
  abonnementId: string;
  clientSecret: string | null;
  publishableKey: string | null;
  montant: number;
  devise: string;
  plan: string;
  statut: string;
};

const euros = (centimes: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((centimes || 0) / 100);

const APPEARANCE: NonNullable<StripeElementsOptions["appearance"]> = {
  theme: "stripe",
  variables: {
    colorPrimary: "#4f46e5",
    colorBackground: "#ffffff",
    colorText: "#0f172a",
    colorTextSecondary: "#64748b",
    colorDanger: "#dc2626",
    fontFamily: "ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, sans-serif",
    borderRadius: "12px",
    spacingUnit: "5px",
  },
  rules: {
    ".Input": { boxShadow: "0 0 0 1px #e2e8f0", padding: "12px" },
    ".Input:focus": { boxShadow: "0 0 0 2px #6366f1" },
    ".Label": { fontWeight: "500", color: "#334155" },
  },
};

/** Étape 2 : formulaire Stripe natif (Payment Element), sans iframe de page. */
function PaymentForm({ montant, returnUrl, onSuccess }: { montant: number; returnUrl: string; onSuccess: () => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setMessage(null);
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: "if_required",
    });
    if (error) {
      setMessage(error.message ?? "Le paiement a été refusé.");
      setBusy(false);
      return;
    }
    if (paymentIntent && ["succeeded", "processing"].includes(paymentIntent.status)) {
      onSuccess();
      return;
    }
    setMessage("Le paiement n'a pas abouti. Vous pouvez réessayer.");
    setBusy(false);
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <PaymentElement options={{ layout: "tabs" }} />
      {message && (
        <p className="flex items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />{message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={!stripe || busy} className="h-12 w-full rounded-xl text-base font-semibold shadow-lg shadow-indigo-500/20">
        {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
        Payer {euros(montant)}
      </Button>
      <p className="text-center text-xs text-slate-500">
        Paiement chiffré et traité par Stripe. Aucune donnée bancaire ne transite par Kids'Med.
      </p>
    </form>
  );
}

function Steps() {
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs font-medium text-slate-500">
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-white"><Check className="h-3.5 w-3.5" /></span>Formule</li>
      <li className="h-px flex-1 bg-slate-200" />
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-indigo-600 text-white">2</span>Paiement</li>
      <li className="h-px flex-1 bg-slate-200" />
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-slate-300">3</span>Confirmation</li>
    </ol>
  );
}

function Page() {
  const { plan, nom, periodicite } = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const session = hydrated ? getSession() : null;
  const role = roleToKey(session?.user.role);

  const tarifs = useApiOrDemo<unknown>(specs.tarifsAll, demoTarifs);
  const offres = useMemo(() => forfaitsPourRole(toList(tarifs.data), role), [tarifs.data, role]);
  const offre = useMemo(() => offres.find((o) => o.id === plan) ?? offres.find((o) => o.nom === nom) ?? null, [offres, plan, nom]);

  const [intent, setIntent] = useState<Intent | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [demo, setDemo] = useState(false);
  const [done, setDone] = useState(false);
  const demande = useRef(false);

  useEffect(() => {
    if (!hydrated || demande.current) return;
    const s = getSession();
    if (!s) { void navigate({ to: "/connexion" }); return; }
    demande.current = true;

    const params = new URLSearchParams(window.location.search);
    const statutRedirection = params.get("redirect_status");
    const aboRedirige = params.get("abo");

    if (statutRedirection) {
      if (statutRedirection === "succeeded" && aboRedirige) {
        void (async () => {
          try { await send("POST", specs.paiementFinaliser.path, { abonnementId: aboRedirige }); }
          catch { /* le webhook reste la source de vérité */ }
          setDone(true);
          setChargement(false);
        })();
      } else {
        setErreur("Le paiement n'a pas abouti. Vous pouvez réessayer.");
        setChargement(false);
      }
      return;
    }

    if (s.demo) { setDemo(true); setChargement(false); return; }
    if (!plan && !nom) { setErreur("Aucun forfait sélectionné."); setChargement(false); return; }

    void (async () => {
      try {
        const r = await send<Intent>("POST", specs.paiementIntent.path, {
          tarifId: plan || undefined,
          plan: (offre?.nom ?? nom) || undefined,
          periodicite,
        });
        setIntent(r.data);
        if (!r.data.clientSecret || r.data.statut === "actif") setDone(true);
      } catch (e) {
        setErreur(e instanceof Error ? e.message : "Paiement indisponible.");
      } finally {
        setChargement(false);
      }
    })();
  }, [hydrated, navigate, plan, nom, periodicite, offre?.nom]);

  const finaliser = async () => {
    try {
      if (intent?.abonnementId) await send("POST", specs.paiementFinaliser.path, { abonnementId: intent.abonnementId });
    } catch { /* le webhook active l'abonnement */ }
    setDone(true);
  };

  const returnUrl = useMemo(() => {
    if (typeof window === "undefined" || !intent) return "";
    const u = new URL("/abonnement/paiement", window.location.origin);
    if (plan) u.searchParams.set("plan", plan);
    if (nom) u.searchParams.set("nom", nom);
    u.searchParams.set("periodicite", periodicite);
    u.searchParams.set("abo", intent.abonnementId);
    return u.toString();
  }, [intent, plan, nom, periodicite]);

  const stripePromise = useMemo(() => (intent?.publishableKey ? loadStripe(intent.publishableKey) : null), [intent?.publishableKey]);
  const elementsOptions = useMemo<StripeElementsOptions | null>(
    () => (intent?.clientSecret ? { clientSecret: intent.clientSecret, appearance: APPEARANCE, locale: "fr" } : null),
    [intent?.clientSecret],
  );

  const nomForfait = intent?.plan ?? offre?.nom ?? nom ?? "Votre formule";
  const montant = intent?.montant ?? (offre ? Math.round(offre.prix * 100) : 0);
  const avantages = offre?.inclus?.length ? offre.inclus : ["Dossiers médicaux centralisés", "Transmissions et suivi quotidien", "Support réactif"];

  return (
    <div className="min-h-screen bg-[radial-gradient(ellipse_at_top,_rgba(99,102,241,0.14),_transparent_60%)]">
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
        <Link to="/abonnement" className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 transition hover:text-slate-900">
          <ArrowLeft className="h-4 w-4" />Mon abonnement
        </Link>
        <div className="flex items-center gap-2 text-xs font-medium text-slate-500">
          <ShieldCheck className="h-4 w-4 text-emerald-600" />Paiement sécurisé
        </div>
      </header>

      <main className="mx-auto grid max-w-6xl gap-6 px-4 pb-16 sm:px-6 lg:grid-cols-[1fr_1.05fr] lg:gap-10">
        <section className="order-2 lg:order-1">
          <Steps />
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-indigo-600">Finalisation</p>
          <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">Activez votre formule en quelques secondes.</h1>
          <p className="mt-3 max-w-md text-sm text-slate-600">Un paiement unique, un abonnement mensuel, résiliable à tout moment. Vos données restent hébergées en Europe.</p>

          <div className="mt-8 overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-xl shadow-slate-200/60">
            <div className="bg-gradient-to-br from-indigo-600 via-indigo-600 to-violet-600 p-6 text-white">
              <div className="flex items-center justify-between">
                <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-3 py-1 text-xs font-medium backdrop-blur"><Sparkles className="h-3.5 w-3.5" />Kids'Med IA</span>
                <span className="text-xs text-white/80">Sans engagement</span>
              </div>
              <p className="mt-5 text-sm text-white/80">Votre formule</p>
              <p className="text-2xl font-semibold">{nomForfait}</p>
              <p className="mt-1 text-3xl font-bold">{euros(montant)}<span className="ml-1 text-sm font-normal text-white/80">/ {periodicite === "annuel" ? "an" : "mois"}</span></p>
            </div>
            <div className="space-y-4 p-6">
              <ul className="space-y-2 text-sm text-slate-700">
                {avantages.map((a) => (
                  <li key={a} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />{a}</li>
                ))}
              </ul>
              <div className="flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                <span className="text-slate-500">Total aujourd'hui</span>
                <span className="font-semibold text-slate-900">{euros(montant)}</span>
              </div>
              <div className="grid gap-2 text-xs text-slate-500 sm:grid-cols-3">
                <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-emerald-600" />Chiffré</span>
                <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-emerald-600" />PCI-DSS</span>
                <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-emerald-600" />RGPD</span>
              </div>
            </div>
          </div>
        </section>

        <section className="order-1 lg:order-2">
          <div className="rounded-3xl border border-slate-200 bg-white p-6 text-slate-900 shadow-2xl shadow-indigo-200/40 sm:p-8">
            {chargement ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-slate-500">
                <Loader2 className="h-6 w-6 animate-spin text-indigo-600" />
                <p className="text-sm">Préparation du paiement sécurisé…</p>
              </div>
            ) : erreur ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                <XCircle className="h-9 w-9 text-red-500" />
                <p className="text-lg font-semibold">Paiement indisponible</p>
                <p className="max-w-sm text-sm text-slate-500">{erreur}</p>
                <Button asChild variant="outline"><Link to="/abonnement">Revenir aux formules</Link></Button>
              </div>
            ) : done ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                <span className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Check className="h-8 w-8" /></span>
                <p className="text-2xl font-semibold">Paiement confirmé</p>
                <p className="max-w-sm text-sm text-slate-500">Votre formule <strong>{nomForfait}</strong> est active. Merci de votre confiance.</p>
                <Button asChild className="mt-2"><Link to="/abonnement">Voir mon abonnement</Link></Button>
              </div>
            ) : demo ? (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                <CreditCard className="h-9 w-9 text-indigo-600" />
                <p className="text-lg font-semibold">Mode démonstration</p>
                <p className="max-w-sm text-sm text-slate-500">Aucun paiement réel ne sera effectué.</p>
                <Button onClick={() => setDone(true)}>Simuler le paiement</Button>
              </div>
            ) : elementsOptions && stripePromise ? (
              <>
                <div className="mb-5">
                  <h2 className="text-lg font-semibold">Informations de paiement</h2>
                  <p className="text-sm text-slate-500">Carte bancaire, SEPA ou portefeuille selon votre pays.</p>
                </div>
                <Elements stripe={stripePromise} options={elementsOptions}>
                  <PaymentForm montant={montant} returnUrl={returnUrl} onSuccess={() => void finaliser()} />
                </Elements>
              </>
            ) : (
              <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                <CreditCard className="h-9 w-9 text-indigo-600" />
                <p className="text-lg font-semibold">Aucun moyen de paiement requis</p>
                <p className="text-sm text-slate-500">Votre formule est déjà active.</p>
                <Button asChild><Link to="/abonnement">Voir mon abonnement</Link></Button>
              </div>
            )}
          </div>
          <p className="mt-4 text-center text-xs text-slate-500">En validant, vous acceptez les conditions d'abonnement Kids'Med IA.</p>
        </section>
      </main>
    </div>
  );
}
