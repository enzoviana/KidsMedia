import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { CreditCard, Receipt, CalendarClock, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { specs } from "@/lib/specs";
import { getSession, roleToKey } from "@/lib/api";
import { useHydrated } from "@/lib/use-hydrated";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useApiOrDemo } from "@/lib/use-api";
import { toList } from "@/lib/api";
import { forfaitsPourRole, demoTarifs } from "@/lib/forfaits";
import { send } from "@/lib/mutate";


export const Route = createFileRoute("/abonnement")({
  head: () => ({
    meta: [
      { title: "Mon abonnement — Kids'Med IA" },
      { name: "description", content: "Votre formule, vos quotas, votre échéance et vos factures." },
      { property: "og:title", content: "Mon abonnement — Kids'Med IA" },
      { property: "og:description", content: "Suivez votre abonnement Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo = {
  plan: "premium", statut: "actif", prixMensuel: 149, dateDebut: "2026-01-01", dateFin: "2027-01-01",
  quota: { enfantsMax: 60, enfantsInscrits: 42, utilisateursMax: 15, utilisateurs: 9 },
  factures: [{ _id: "f1", date: "2026-10-01", montant: 149 }, { _id: "f2", date: "2026-09-01", montant: 149 }, { _id: "f3", date: "2026-08-01", montant: 149 }],
};

function Box({ label, value }: { label: string; value: string }) {
  return <div className="rounded-xl border bg-muted/40 p-4"><p className="text-xs text-muted-foreground">{label}</p><p className="mt-1 font-display text-xl font-semibold">{value}</p></div>;
}

function Page() {
  const hydrated = useHydrated();
  const k = hydrated ? roleToKey(getSession()?.user.role) : null;
  const spec = k === "creche" || k === "rsai" ? specs.aboEtab : specs.aboMe;
  const [portalBusy, setPortalBusy] = useState(false);
  const [annulation, setAnnulation] = useState(false);
  const qc = useQueryClient();
  const navigate = useNavigate();
  const tarifs = useApiOrDemo<unknown>(specs.tarifsAll, demoTarifs);
  const offres = forfaitsPourRole(toList(tarifs.data), k);
  const abonnement = useApiOrDemo<any>(spec, demo);
  const statutActuel: string | null = abonnement.data?.statut ?? null;
  // Seul un abonnement réellement actif est présenté comme « formule actuelle ».
  // Un paiement en attente ne doit jamais verrouiller la formule.
  const planActuel: string | null = statutActuel === "actif" || statutActuel === "essai"
    ? (abonnement.data?.plan ?? abonnement.data?.tarif?.nom ?? null)
    : null;

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get("paiement");
    if (p === "ok") toast.success("Paiement confirmé — votre abonnement est actif.");
    if (p === "annule") toast.info("Paiement annulé.");
  }, []);

  async function ouvrirPortail() {
    const s = getSession();
    if (!s || s.demo) { toast.info("Portail Stripe indisponible en mode démonstration."); return; }
    setPortalBusy(true);
    try {
      const r = await send<{ url: string }>("POST", specs.stripePortal.path);
      if (r.data?.url) window.location.href = r.data.url;
      else throw new Error("Lien du portail indisponible.");
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Portail indisponible.");
    } finally { setPortalBusy(false); }
  }

  async function annulerPaiement() {
    const id = abonnement.data?.id ?? abonnement.data?._id;
    if (!id) return;
    setAnnulation(true);
    try {
      await send("POST", specs.paiementAbandonner.path, { abonnementId: id });
      toast.success("Paiement en attente annulé. Vous pouvez choisir une autre formule.");
      await qc.invalidateQueries({ queryKey: ["api", spec.id] });
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Annulation impossible.");
    } finally { setAnnulation(false); }
  }
  return (
    <DashboardShell title="Mon abonnement">
      <DataPanel title="Formule" icon={CreditCard} spec={spec} demoData={demo}>
        {(a: any) => {
          if (!a) return <p className="text-sm text-muted-foreground">Aucun abonnement actif. Choisissez une formule ci-dessous pour commencer.</p>;
          const q = a.quota ?? {};
          const pct = q.enfantsMax ? Math.round(((q.enfantsInscrits ?? 0) / q.enfantsMax) * 100) : 0;
          return (
            <div className="space-y-6">
              {a.statut === "en_attente" && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-warning/15 p-3 text-sm">
                  <span>Paiement en attente : choisissez votre formule ci-dessous pour le finaliser.</span>
                  <Button size="sm" variant="outline" disabled={annulation} onClick={annulerPaiement}>
                    {annulation && <Loader2 className="mr-1 h-3.5 w-3.5 animate-spin" />}Annuler le paiement
                  </Button>
                </div>
              )}
              {a.statut === "essai" && (
                <p className="rounded-lg bg-success/10 p-3 text-sm text-success">
                  Essai gratuit en cours{a.dateFin ? ` jusqu'au ${fmtDate(a.dateFin)}` : ""}. La facturation démarre à la fin de l'essai.
                </p>
              )}
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl font-semibold capitalize">{a.plan ?? a.tarif?.nom ?? "—"}</p>
                  <p className="text-muted-foreground">{a.prixMensuel ?? a.tarif?.prixMensuel ?? "—"} € / mois</p>
                </div>
                <Pill tone={a.statut === "actif" ? "success" : "warning"}>{a.statut}</Pill>
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <Box label="Enfants inscrits" value={`${q.enfantsInscrits ?? "—"} / ${q.enfantsMax ?? "—"}`} />
                <Box label="Utilisateurs" value={`${q.utilisateurs ?? "—"} / ${q.utilisateursMax ?? "—"}`} />
                <Box label="Renouvellement" value={fmtDate(a.dateFin)} />
              </div>
              <div><p className="mb-1 text-sm text-muted-foreground">Utilisation du quota enfants : {pct} %</p><Progress value={pct} /></div>
              <div className="flex flex-wrap gap-2">
                <Button variant="outline" disabled={portalBusy} onClick={ouvrirPortail}>{portalBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Gérer ma carte et mes factures</Button>
                <Button variant="outline" onClick={() => toast.info("Demande de résiliation envoyée.")}><CalendarClock className="mr-1 h-4 w-4" />Résilier</Button>
              </div>
              <div>
                <p className="mb-2 flex items-center gap-1.5 text-sm font-medium"><Receipt className="h-4 w-4" />Factures</p>
                <ul className="divide-y text-sm">{(a.factures ?? []).map((f: any) => <li key={f._id} className="flex justify-between py-2"><span>{fmtDate(f.date)}</span><span className="font-medium">{f.montant} €</span></li>)}</ul>
              </div>
            </div>
          );
        }}
      </DataPanel>
      <div>
        <h2 className="mb-3 font-display text-xl font-semibold">Changer de formule</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {offres.length === 0 && <p className="text-sm text-muted-foreground">Aucun forfait n'est proposé pour votre rôle pour le moment.</p>}
          {offres.map((p) => {
            const courant = planActuel === p.nom || planActuel === p.id;
            return (
              <div key={p.id} className={`rounded-2xl border bg-card p-5 ${courant ? "ring-2 ring-primary" : ""}`}>
                <p className="font-display text-xl font-semibold">{p.nom}</p>
                <p className="mb-3 text-2xl font-bold">{p.prix} €<span className="text-sm font-normal text-muted-foreground"> / mois</span></p>
                {p.joursEssai > 0 && <p className="mb-2 text-xs font-medium text-success">{p.joursEssai} jours d'essai gratuit</p>}
                <ul className="mb-4 space-y-1 text-sm text-muted-foreground">{p.inclus.map((x) => <li key={x}>✓ {x}</li>)}</ul>
                {courant
                  ? <Pill tone="success">Formule actuelle</Pill>
                  : <Button className="w-full" onClick={() => navigate({ to: "/abonnement/paiement", search: { plan: p.id, nom: p.nom, periodicite: "mensuel" } })}>Choisir {p.nom}</Button>}
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
