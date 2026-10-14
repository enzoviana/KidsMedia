import { createFileRoute } from "@tanstack/react-router";
import { CreditCard, Receipt, CalendarClock } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { specs } from "@/lib/specs";
import { getSession, roleToKey } from "@/lib/api";
import { useHydrated } from "@/lib/use-hydrated";
import { useState } from "react";
import { StripeCheckout } from "@/components/dash/stripe";
import { useApiOrDemo } from "@/lib/use-api";
import { toList } from "@/lib/api";
import { forfaitsPourRole, demoTarifs } from "@/lib/forfaits";


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
  const [choix, setChoix] = useState<string | null>(null);
  const [actuel, setActuel] = useState<string | null>(null);
  const tarifs = useApiOrDemo<unknown>(specs.tarifsAll, demoTarifs);
  const offres = forfaitsPourRole(toList(tarifs.data), k);
  return (
    <DashboardShell title="Mon abonnement">
      <DataPanel title="Formule" icon={CreditCard} spec={spec} demoData={demo}>
        {(a: any) => {
          const q = a.quota ?? {};
          const pct = q.enfantsMax ? Math.round(((q.enfantsInscrits ?? 0) / q.enfantsMax) * 100) : 0;
          return (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="font-display text-3xl font-semibold capitalize">{actuel ?? a.plan ?? a.tarif?.nom ?? "—"}</p>
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
                <Button variant="outline" onClick={() => toast.info("Démo : ouverture du portail client Stripe (carte, factures).")}>Gérer ma carte et mes factures</Button>
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
          {offres.map((p) => (
            <div key={p.id} className={`rounded-2xl border bg-card p-5 ${p.id === actuel ? "ring-2 ring-primary" : ""}`}>
              <p className="font-display text-xl font-semibold">{p.nom}</p>
              <p className="mb-3 text-2xl font-bold">{p.prix} €<span className="text-sm font-normal text-muted-foreground"> / mois</span></p>
              <ul className="mb-4 space-y-1 text-sm text-muted-foreground">{p.inclus.map((x) => <li key={x}>✓ {x}</li>)}</ul>
              {p.id === actuel ? <Pill tone="success">Formule actuelle</Pill> : <Button className="w-full" onClick={() => setChoix(p.id)}>Choisir {p.nom}</Button>}
            </div>
          ))}
        </div>
      </div>
      <StripeCheckout plan={choix} catalog={offres} onClose={() => setChoix(null)} onPaid={(id) => setActuel(id)} />
    </DashboardShell>
  );
}
