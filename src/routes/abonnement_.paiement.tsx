import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useRef, useState } from "react";
import { loadStripe, type StripeElementsOptions } from "@stripe/stripe-js";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { ArrowLeft, BadgeCheck, Check, CreditCard, Loader2, Lock, ShieldCheck, Sparkles, XCircle } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { getSession, roleToKey, toList, type RoleKey } from "@/lib/api";
import { send } from "@/lib/mutate";
import { useApiOrDemo } from "@/lib/use-api";
import { forfaitsPourRole, demoTarifs } from "@/lib/forfaits";
import { useHydrated } from "@/lib/use-hydrated";

export const Route = createFileRoute("/abonnement_/paiement")({
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
  mode?: "setup" | "payment";
  setupIntentId?: string;
  joursEssai?: number;
  prixMensuel?: number;
};

/** Couleur d'accent Stripe alignée sur le thème du rôle (les tokens sont en oklch). */
const ACCENTS: Record<RoleKey, string> = {
  creche: "#2f9e5f",
  rsai: "#2f7dd1",
  medecin: "#d6417f",
  parent: "#e07a2b",
  admin: "#3b4252",
  dev: "#3d8f87",
};

const euros = (centimes: number) =>
  new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format((centimes || 0) / 100);

function appearance(primary: string): NonNullable<StripeElementsOptions["appearance"]> {
  return {
    theme: "stripe",
    variables: {
      colorPrimary: primary,
      colorBackground: "#ffffff",
      colorText: "#1f2937",
      colorTextSecondary: "#6b7280",
      colorDanger: "#dc2626",
      fontFamily: "Figtree, ui-sans-serif, system-ui, -apple-system, 'Segoe UI', sans-serif",
      borderRadius: "12px",
      spacingUnit: "5px",
    },
    rules: {
      ".Input": { boxShadow: "0 0 0 1px #e5e7eb", padding: "12px" },
      ".Input:focus": { boxShadow: `0 0 0 2px ${primary}` },
      ".Label": { fontWeight: "500", color: "#374151" },
    },
  };
}

/** Étape 2 : formulaire Stripe natif (Payment Element), sans iframe de page. */
function PaymentForm({ montant, returnUrl, mode, onSuccess }: { montant: number; returnUrl: string; mode: "setup" | "payment"; onSuccess: (setupIntentId?: string) => void }) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!stripe || !elements) return;
    setBusy(true);
    setMessage(null);

    if (mode === "setup") {
      const { error, setupIntent } = await stripe.confirmSetup({
        elements,
        confirmParams: { return_url: returnUrl },
        redirect: "if_required",
      });
      if (error) {
        setMessage(error.message ?? "La carte a été refusée.");
        setBusy(false);
        return;
      }
      if (setupIntent && setupIntent.status === "succeeded") {
        onSuccess(setupIntent.id);
        return;
      }
      setMessage("La carte n'a pas pu être enregistrée. Vous pouvez réessayer.");
      setBusy(false);
      return;
    }

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
        <p className="flex items-start gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
          <XCircle className="mt-0.5 h-4 w-4 shrink-0" />{message}
        </p>
      )}
      <Button type="submit" size="lg" disabled={!stripe || busy} className="h-12 w-full rounded-xl text-base font-semibold shadow-sm">
        {busy ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Lock className="mr-2 h-5 w-5" />}
        {mode === "setup" ? "Démarrer l'essai gratuit" : `Payer ${euros(montant)}`}
      </Button>
      <p className="text-center text-xs text-muted-foreground">
        {mode === "setup"
          ? "Aucun débit aujourd'hui. Votre carte est enregistrée pour la fin de l'essai."
          : "Paiement chiffré et traité par Stripe. Aucune donnée bancaire ne transite par Kids'Med."}
      </p>
    </form>
  );
}

function Steps() {
  return (
    <ol className="flex items-center gap-2 text-xs font-medium text-muted-foreground">
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-success text-white"><Check className="h-3.5 w-3.5" /></span>Formule</li>
      <li className="h-px flex-1 bg-border" />
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary text-primary-foreground">2</span><span className="text-foreground">Paiement</span></li>
      <li className="h-px flex-1 bg-border" />
      <li className="flex items-center gap-2"><span className="flex h-6 w-6 items-center justify-center rounded-full border border-border">3</span>Confirmation</li>
    </ol>
  );
}

function Page() {
  const { plan, nom, periodicite } = Route.useSearch();
  const navigate = useNavigate();
  const hydrated = useHydrated();
  const session = hydrated ? getSession() : null;
  const role = roleToKey(session?.user.role);
  const accent = ACCENTS[role ?? "creche"];

  const tarifs = useApiOrDemo<unknown>(specs.tarifsAll, demoTarifs);
  const offres = useMemo(() => forfaitsPourRole(toList(tarifs.data), role), [tarifs.data, role]);
  const offre = useMemo(() => offres.find((o) => o.id === plan) ?? offres.find((o) => o.nom === nom) ?? null, [offres, plan, nom]);

  const [intent, setIntent] = useState<Intent | null>(null);
  const [erreur, setErreur] = useState<string | null>(null);
  const [chargement, setChargement] = useState(true);
  const [demo, setDemo] = useState(false);
  const [done, setDone] = useState(false);
  const [resultat, setResultat] = useState<{ essai?: number; dateFin?: string } | null>(null);
  const demande = useRef(false);

  useEffect(() => {
    if (!hydrated || demande.current) return;
    const s = getSession();
    if (!s) { void navigate({ to: "/connexion" }); return; }
    demande.current = true;

    const params = new URLSearchParams(window.location.search);
    const statutRedirection = params.get("redirect_status");
    const aboRedirige = params.get("abo");
    const setupRedirige = params.get("setup_intent");

    if (statutRedirection) {
      if (statutRedirection === "succeeded" && aboRedirige) {
        void (async () => {
          try {
            const r = await send<{ essai?: number; dateFin?: string }>("POST", specs.paiementFinaliser.path, {
              abonnementId: aboRedirige,
              ...(setupRedirige ? { setupIntentId: setupRedirige } : {}),
            });
            setResultat(r.data ?? null);
          } catch { /* le webhook reste la source de vérité */ }
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

  const finaliser = async (setupIntentId?: string) => {
    try {
      if (intent?.abonnementId) {
        const r = await send<{ essai?: number; dateFin?: string }>("POST", specs.paiementFinaliser.path, {
          abonnementId: intent.abonnementId,
          ...(setupIntentId ? { setupIntentId } : {}),
        });
        setResultat(r.data ?? null);
      }
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
    () => (intent?.clientSecret ? { clientSecret: intent.clientSecret, appearance: appearance(accent), locale: "fr" } : null),
    [intent?.clientSecret, accent],
  );

  const nomForfait = intent?.plan ?? offre?.nom ?? nom ?? "Votre formule";
  const montant = intent?.montant ?? (offre ? Math.round(offre.prix * 100) : 0);
  const joursEssai = intent?.joursEssai ?? offre?.joursEssai ?? 0;
  const modeEssai = joursEssai > 0 && (!intent || intent.mode === "setup");
  const prixMensuel = intent?.prixMensuel ?? offre?.prix ?? 0;
  const montantAffiche = modeEssai ? 0 : montant;
  const avantages = offre?.inclus?.length ? offre.inclus : ["Dossiers médicaux centralisés", "Transmissions et suivi quotidien", "Support réactif"];

  return (
    <DashboardShell title="Paiement" role={role ?? undefined}>
      <div className="mx-auto max-w-6xl space-y-6 pb-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <Link to="/abonnement" className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground transition hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />Mon abonnement
          </Link>
          <span className="inline-flex items-center gap-2 text-xs font-medium text-muted-foreground">
            <ShieldCheck className="h-4 w-4 text-success" />Paiement sécurisé
          </span>
        </div>

        <Steps />

        <div className="grid gap-6 lg:grid-cols-[1fr_1.05fr] lg:gap-8">
          <section className="space-y-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">Finalisation</p>
              <h1 className="mt-2 font-display text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">Activez votre formule en quelques secondes.</h1>
              <p className="mt-2 max-w-md text-sm text-muted-foreground">Un paiement unique, un abonnement mensuel, résiliable à tout moment. Vos données restent hébergées en Europe.</p>
            </div>

            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
              <div className="bg-gradient-to-br from-primary to-primary/70 p-6 text-primary-foreground">
                <div className="flex items-center justify-between">
                  <span className="inline-flex items-center gap-2 rounded-full bg-primary-foreground/15 px-3 py-1 text-xs font-medium"><Sparkles className="h-3.5 w-3.5" />Kids'Med IA</span>
                  <span className="text-xs text-primary-foreground/80">{modeEssai ? `${joursEssai} jours d'essai` : "Sans engagement"}</span>
                </div>
                <p className="mt-5 text-sm text-primary-foreground/80">Votre formule</p>
                <p className="text-2xl font-semibold">{nomForfait}</p>
                <p className="mt-1 text-3xl font-bold">{euros(montantAffiche)}<span className="ml-1 text-sm font-normal text-primary-foreground/80">/ {periodicite === "annuel" ? "an" : "mois"}</span></p>
                {modeEssai && (
                  <p className="mt-1 text-xs text-primary-foreground/80">Puis {euros(prixMensuel * 100)} / mois après {joursEssai} jours d'essai gratuit.</p>
                )}
              </div>
              <div className="space-y-4 p-6">
                <ul className="space-y-2 text-sm text-card-foreground">
                  {avantages.map((a) => (
                    <li key={a} className="flex items-start gap-2"><Check className="mt-0.5 h-4 w-4 shrink-0 text-success" />{a}</li>
                  ))}
                </ul>
                <div className="flex items-center justify-between border-t pt-4 text-sm">
                  <span className="text-muted-foreground">Total aujourd'hui</span>
                  <span className="font-semibold">{euros(montantAffiche)}</span>
                </div>
                <div className="grid gap-2 text-xs text-muted-foreground sm:grid-cols-3">
                  <span className="inline-flex items-center gap-1.5"><Lock className="h-3.5 w-3.5 text-success" />Chiffré</span>
                  <span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5 text-success" />PCI-DSS</span>
                  <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5 text-success" />RGPD</span>
                </div>
              </div>
            </div>
          </section>

          <section>
            <div className="rounded-2xl border bg-card p-6 text-card-foreground shadow-sm sm:p-8">
              {chargement ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-muted-foreground">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <p className="text-sm">Préparation du paiement sécurisé…</p>
                </div>
              ) : erreur ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                  <XCircle className="h-9 w-9 text-destructive" />
                  <p className="text-lg font-semibold">Paiement indisponible</p>
                  <p className="max-w-sm text-sm text-muted-foreground">{erreur}</p>
                  <Button asChild variant="outline"><Link to="/abonnement">Revenir aux formules</Link></Button>
                </div>
              ) : done ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                  <span className="flex h-16 w-16 items-center justify-center rounded-full bg-success/10 text-success"><Check className="h-8 w-8" /></span>
                  <p className="text-2xl font-semibold">{resultat?.essai ? "Essai activé" : "Paiement confirmé"}</p>
                  {resultat?.essai ? (
                    <p className="max-w-sm text-sm text-muted-foreground">
                      Votre essai gratuit de <strong>{resultat.essai} jours</strong> est actif.
                      {resultat.dateFin ? ` Première facturation le ${new Date(resultat.dateFin).toLocaleDateString("fr-FR")}.` : ""}
                    </p>
                  ) : (
                    <p className="max-w-sm text-sm text-muted-foreground">Votre formule <strong>{nomForfait}</strong> est active. Merci de votre confiance.</p>
                  )}
                  <Button asChild className="mt-2"><Link to="/abonnement">Voir mon abonnement</Link></Button>
                </div>
              ) : demo ? (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                  <CreditCard className="h-9 w-9 text-primary" />
                  <p className="text-lg font-semibold">Mode démonstration</p>
                  <p className="max-w-sm text-sm text-muted-foreground">
                    {offre && offre.joursEssai > 0
                      ? `Essai de ${offre.joursEssai} jours — aucun paiement réel ne sera effectué.`
                      : "Aucun paiement réel ne sera effectué."}
                  </p>
                  <Button onClick={() => { setResultat(offre && offre.joursEssai > 0 ? { essai: offre.joursEssai } : null); setDone(true); }}>
                    {offre && offre.joursEssai > 0 ? "Démarrer l'essai (démo)" : "Simuler le paiement"}
                  </Button>
                </div>
              ) : elementsOptions && stripePromise ? (
                <>
                  <div className="mb-5">
                    <h2 className="text-lg font-semibold">{modeEssai ? "Enregistrer ma carte" : "Informations de paiement"}</h2>
                    <p className="text-sm text-muted-foreground">
                      {modeEssai
                        ? `Carte bancaire — aucun débit aujourd'hui, premier prélèvement après ${joursEssai} jours.`
                        : "Carte bancaire, SEPA ou portefeuille selon votre pays."}
                    </p>
                  </div>
                  <Elements stripe={stripePromise} options={elementsOptions}>
                    <PaymentForm montant={montant} returnUrl={returnUrl} mode={modeEssai ? "setup" : "payment"} onSuccess={finaliser} />
                  </Elements>
                </>
              ) : (
                <div className="flex min-h-72 flex-col items-center justify-center gap-3 text-center">
                  <CreditCard className="h-9 w-9 text-primary" />
                  <p className="text-lg font-semibold">Aucun moyen de paiement requis</p>
                  <p className="text-sm text-muted-foreground">Votre formule est déjà active.</p>
                  <Button asChild><Link to="/abonnement">Voir mon abonnement</Link></Button>
                </div>
              )}
            </div>
            <p className="mt-4 text-center text-xs text-muted-foreground">En validant, vous acceptez les conditions d'abonnement Kids'Med IA.</p>
          </section>
        </div>
      </div>
    </DashboardShell>
  );
}
