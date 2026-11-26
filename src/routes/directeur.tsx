import { createFileRoute, Link } from "@tanstack/react-router";
import { Baby, Building2, CreditCard, Users, Network, ArrowRight } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { Empty, Panel, Pill, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";

export const Route = createFileRoute("/directeur")({
  head: () => ({
    meta: [
      { title: "Direction territoriale — Kids'Med IA" },
      { name: "description", content: "Supervision consolidée de toutes les crèches de votre groupe territorial." },
      { property: "og:title", content: "Direction territoriale — Kids'Med IA" },
      { property: "og:description", content: "Vos crèches, vos équipes, vos enfants et l'abonnement du groupe." },
      { name: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function Box({ label, value, hint }: { label: string; value: React.ReactNode; hint?: string }) {
  return <div className="rounded-2xl border bg-card p-5 shadow-sm"><p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p><p className="mt-2 font-display text-3xl font-semibold">{value}</p>{hint && <p className="mt-1 text-xs text-muted-foreground">{hint}</p>}</div>;
}

function Page() {
  const r = useApiOrDemo<any>(specs.groupeMe, {});
  const g = r.data ?? {};
  const stats = g.stats ?? {};
  const creches = toList(g.etablissements);
  return (
    <DashboardShell title={g.nom ? `Direction — ${g.nom}` : "Direction territoriale"} actions={<Pill tone={g.abonnement?.statut === "actif" ? "success" : "warning"}>{g.abonnement?.plan ?? "Abonnement du groupe"}</Pill>}>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Box label="Crèches du groupe" value={g.nbEtablissements ?? creches.length} hint={g.description ?? undefined} />
        <Box label="Enfants inscrits" value={stats.enfants ?? "—"} hint={`${stats.enfantsRecents ?? 0} nouveaux sur 30 jours`} />
        <Box label="Professionnels" value={stats.personnels ?? "—"} hint="Personnel rattaché aux crèches" />
        <Box label="Abonnement" value={g.abonnement?.plan ?? "—"} hint={g.abonnement ? `${g.abonnement.statut ?? ""} · ${g.abonnement.prixMensuel ?? 0} €/mois` : "Aucun abonnement de groupe"} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <Panel title="Mes crèches" icon={Building2} spec={specs.groupeMe} demo={r.demo} reason={r.reason} className="xl:col-span-2">
          {creches.length === 0 ? <Empty text="Aucune crèche n'est rattachée à ce groupe pour le moment." /> : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Crèche</th><th className="pb-3">Ville</th><th className="pb-3">Capacité</th><th className="pb-3" /></tr></thead>
                <tbody className="divide-y">
                  {creches.map((e: any) => (
                    <tr key={e.id ?? e._id}>
                      <td className="py-3"><Link to="/etablissements/$etablissementId" params={{ etablissementId: String(e.id ?? e._id) }} className="font-medium text-primary hover:underline">{e.nom ?? "—"}</Link></td>
                      <td className="py-3 text-muted-foreground">{e.ville ?? "—"}</td>
                      <td className="py-3">{e.capacite ?? "—"}</td>
                      <td className="py-3 text-right"><Link to="/etablissements/$etablissementId" params={{ etablissementId: String(e.id ?? e._id) }} className="inline-flex items-center gap-1 text-primary">Ouvrir <ArrowRight className="h-3.5 w-3.5" /></Link></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Panel>

        <div className="space-y-4">
          <Panel title="Abonnement du groupe" icon={CreditCard} spec={specs.groupeMe} demo={r.demo} reason={r.reason}>
            {g.abonnement ? (
              <div className="space-y-3 text-sm">
                <p className="font-display text-2xl font-semibold">{g.abonnement.plan}</p>
                <p className="text-muted-foreground">{g.abonnement.prixMensuel ?? 0} € / mois · échéance {fmtDate(g.abonnement.dateFin)}</p>
                <Pill tone={g.abonnement.statut === "actif" ? "success" : "warning"}>{g.abonnement.statut ?? "—"}</Pill>
                <p className="text-xs text-muted-foreground">L'abonnement du groupe couvre toutes les crèches rattachées : aucune crèche ne souscrit d'abonnement individuel.</p>
                <Link to="/abonnement" className="inline-flex items-center gap-1 text-primary">Gérer l'abonnement <ArrowRight className="h-3.5 w-3.5" /></Link>
              </div>
            ) : <Empty text="Aucun abonnement de groupe. L'administrateur peut l'attribuer depuis Abonnements." />}
          </Panel>
          <Panel title="Directeurs du groupe" icon={Network} spec={specs.groupeMe} demo={r.demo} reason={r.reason}>
            {toList(g.directeurs).length === 0 ? <Empty text="Aucun directeur rattaché." /> : (
              <ul className="divide-y text-sm">{toList(g.directeurs).map((d: any) => <li key={d.id ?? d._id} className="py-2.5"><p className="font-medium">{[d.prenom, d.nom].filter(Boolean).join(" ")}</p><p className="text-xs text-muted-foreground">{d.email}</p></li>)}</ul>
            )}
          </Panel>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <Link to="/enfants" className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary"><Baby className="h-6 w-6 text-primary" /><div><p className="font-medium">Enfants du groupe</p><p className="text-sm text-muted-foreground">Consulter les dossiers accessibles</p></div></Link>
        <Link to="/rsai-annuaire" className="flex items-center gap-3 rounded-2xl border bg-card p-5 shadow-sm transition hover:border-primary"><Users className="h-6 w-6 text-primary" /><div><p className="font-medium">RSAI</p><p className="text-sm text-muted-foreground">Annuaire, référentes et affectations</p></div></Link>
      </div>
    </DashboardShell>
  );
}
