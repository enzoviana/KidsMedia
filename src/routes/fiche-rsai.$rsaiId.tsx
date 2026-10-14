import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, HeartPulse, Building2, Star } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { AvisRsaiButton } from "@/components/dash/terrain";
import { getSession } from "@/lib/api";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/fiche-rsai/$rsaiId")({
  head: () => ({
    meta: [
      { title: "Fiche RSAI — Kids'Med IA" },
      { name: "description", content: "Coordonnées, affectations, horaires et avis d'une RSAI." },
      { property: "og:title", content: "Fiche RSAI — Kids'Med IA" },
      { property: "og:description", content: "Détail complet d'une RSAI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const JOURS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const demo = {
  prenom: "Nadia", nom: "Roux", email: "n.roux@exemple.fr", telephone: "06 00 00 00 03", qualification: "Infirmière puéricultrice", noteMoyenne: 4.6, nbAvis: 3,
  affectations: [
    { creche: { nom: "Les Petits Soleils" }, dateDebut: "2026-01-05", dateFin: "2026-12-18", statut: "active", jours: [1, 3], debut: "08:30", fin: "12:30" },
    { creche: { nom: "La Lune Bleue" }, dateDebut: "2026-03-01", dateFin: "2026-07-31", statut: "terminee", jours: [5], debut: "09:00", fin: "17:00" },
  ],
  avis: [{ note: 5, commentaire: "Très réactive et pédagogue.", auteur: { nom: "Les Petits Soleils" }, createdAt: "2026-09-12" }, { note: 4, commentaire: "Bon suivi des PAI.", auteur: { nom: "La Lune Bleue" }, createdAt: "2026-06-02" }],
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function Page() {
  const { rsaiId } = Route.useParams();
  const v = { rsaiId };
  return (
    <DashboardShell title="Fiche RSAI" actions={<Button variant="outline" asChild><Link to="/rsai-annuaire"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <DataPanel title="Profil" icon={HeartPulse} spec={specs.rsaiDetail} demoData={demo} vars={v}>
        {(r: any) => (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <p className="mb-3 font-display text-2xl font-semibold">{fullName(r)}</p>
              <Row k="Qualification" v={r.qualification ?? "—"} />
              <Row k="E-mail" v={r.email ?? "—"} />
              <Row k="Téléphone" v={r.telephone ?? r.tel ?? "—"} />
            </div>
            <div className="rounded-xl bg-accent/50 p-4">
              <p className="text-xs text-muted-foreground">Note moyenne</p>
              <p className="flex items-center gap-2 font-display text-3xl font-semibold"><Star className="h-6 w-6 fill-warning text-warning" />{r.noteMoyenne ? Number(r.noteMoyenne).toFixed(1) : "—"}</p>
              <p className="text-xs text-muted-foreground">{r.nbAvis ?? (r.avis ?? []).length} avis</p>
              {(getSession()?.user?.role === "creche" || getSession()?.demo) && <div className="mt-3"><AvisRsaiButton rsaiId={rsaiId} /></div>}
            </div>
          </div>
        )}
      </DataPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <DataPanel title="Crèches affectées" icon={Building2} spec={specs.rsaiDetail} demoData={demo} vars={v}>
          {(r: any) => (r.affectations ?? []).length ? (
            <ul className="divide-y text-sm">{r.affectations.map((a: any, i: number) => (
              <li key={i} className="py-3">
                <div className="flex items-center justify-between"><span className="font-medium">{a.creche?.nom ?? a.etablissement?.nom ?? "—"}</span><Pill tone={a.statut === "active" ? "success" : "default"}>{a.statut ?? "—"}</Pill></div>
                <p className="text-xs text-muted-foreground">{fmtDate(a.dateDebut)} → {fmtDate(a.dateFin)} · {(a.jours ?? []).map((j: number) => JOURS[j]).join(", ")} {a.debut ?? ""}–{a.fin ?? ""}</p>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucune affectation.</p>}
        </DataPanel>
        <DataPanel title="Avis des crèches" icon={Star} spec={specs.rsaiDetail} demoData={demo} vars={v}>
          {(r: any) => (r.avis ?? []).length ? (
            <ul className="divide-y text-sm">{r.avis.map((a: any, i: number) => (
              <li key={i} className="py-3"><p className="font-medium">{"★".repeat(a.note ?? 0)} <span className="text-muted-foreground">— {a.auteur?.nom ?? fullName(a.auteur)}</span></p><p className="text-muted-foreground">{a.commentaire}</p><p className="text-xs text-muted-foreground">{fmtDate(a.createdAt)}</p></li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucun avis.</p>}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
