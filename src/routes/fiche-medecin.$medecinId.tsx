import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Stethoscope, Baby, FileText } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { RdvMedecinButton } from "@/components/dash/terrain";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/fiche-medecin/$medecinId")({
  head: () => ({
    meta: [
      { title: "Fiche médecin — Kids'Med IA" },
      { name: "description", content: "RPPS, spécialité, enfants suivis et ordonnances d'un médecin." },
      { property: "og:title", content: "Fiche médecin — Kids'Med IA" },
      { property: "og:description", content: "Détail complet d'un médecin." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo = {
  prenom: "Claire", nom: "Moreau", specialite: "Pédiatre", rpps: "10101234567", email: "c.moreau@exemple.fr", telephone: "04 72 00 00 01", adresseCabinet: "8 place Bellecour, 69002 Lyon",
  enfantsSuivis: [{ _id: "e1", prenom: "Léa", nom: "Martin", pai: true }, { _id: "e2", prenom: "Noah", nom: "Petit", pai: false }],
  ordonnancesRecentes: [{ _id: "o1", enfant: { prenom: "Léa" }, date: "2026-09-28", statut: "active" }, { _id: "o2", enfant: { prenom: "Noah" }, date: "2026-08-14", statut: "expiree" }],
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function Page() {
  const { medecinId } = Route.useParams();
  const v = { medecinId };
  return (
    <DashboardShell title="Fiche médecin" actions={<Button variant="outline" asChild><Link to="/medecins"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <DataPanel title="Profil" icon={Stethoscope} spec={specs.medecinDetail} demoData={demo} vars={v}>
        {(m: any) => (
          <div>
            <p className="mb-3 font-display text-2xl font-semibold">Dr {fullName(m)}</p>
            <Row k="Spécialité" v={m.specialite ?? "—"} />
            <Row k="N° RPPS" v={m.rpps ?? "—"} />
            <Row k="Cabinet" v={m.adresseCabinet ?? "—"} />
            <Row k="E-mail" v={m.email ?? "—"} />
            <Row k="Téléphone" v={m.telephone ?? m.tel ?? "—"} />
            <div className="mt-3"><RdvMedecinButton medecinId={medecinId} /></div>
          </div>
        )}
      </DataPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <DataPanel title="Enfants suivis" icon={Baby} spec={specs.medecinDetail} demoData={demo} vars={v}>
          {(m: any) => (m.enfantsSuivis ?? []).length ? (
            <ul className="divide-y text-sm">{m.enfantsSuivis.map((e: any) => (
              <li key={e._id} className="flex items-center justify-between py-2">
                <Link to="/enfants/$enfantId" params={{ enfantId: String(e._id) }} className="font-medium text-primary hover:underline">{fullName(e)}</Link>
                {e.pai && <Pill tone="warning">PAI</Pill>}
              </li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucun enfant suivi.</p>}
        </DataPanel>
        <DataPanel title="Ordonnances récentes" icon={FileText} spec={specs.medecinDetail} demoData={demo} vars={v}>
          {(m: any) => (m.ordonnancesRecentes ?? []).length ? (
            <ul className="divide-y text-sm">{m.ordonnancesRecentes.map((o: any) => (
              <li key={o._id} className="flex items-center justify-between py-2"><span>{fullName(o.enfant)} · {fmtDate(o.date)}</span><Pill tone={o.statut === "active" ? "success" : "default"}>{o.statut}</Pill></li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucune ordonnance.</p>}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
