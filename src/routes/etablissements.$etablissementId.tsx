import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, BarChart3 } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { SecuriteEtab } from "@/components/dash/securite-etab";

export const Route = createFileRoute("/etablissements/$etablissementId")({
  head: () => ({
    meta: [
      { title: "Fiche crèche — Kids'Med IA" },
      { name: "description", content: "Détail d'une crèche : coordonnées, capacité et statistiques." },
      { property: "og:title", content: "Fiche crèche — Kids'Med IA" },
      { property: "og:description", content: "Détail d'une crèche partenaire." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EtabPage,
});

const demoEtab = { nom: "Crèche Les Petits Soleils", adresse: "12 rue des Lilas, 69003 Lyon", tel: "04 72 00 00 00", email: "contact@soleils.fr", capacite: 48, agrement: "PMI-69-2021-118", actif: true };
const demoStats = { enfants: 42, personnel: 14, sections: 3, tauxOccupation: 87 };

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function EtabPage() {
  const { etablissementId } = Route.useParams();
  const v = { etablissementId };
  return (
    <DashboardShell title="Fiche crèche" actions={<Button variant="outline" asChild><Link to="/etablissements"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <div className="grid gap-4 lg:grid-cols-2">
        <DataPanel title="Informations" icon={Building2} spec={specs.etab} demoData={demoEtab} vars={v}>
          {(e: any) => (
            <div>
              <p className="mb-3 font-display text-2xl font-semibold">{e.nom}</p>
              <Row k="Adresse" v={typeof e.adresse === "object" ? [e.adresse?.rue, e.adresse?.ville].filter(Boolean).join(", ") : e.adresse ?? "—"} />
              <Row k="Téléphone" v={e.tel ?? e.telephone ?? "—"} />
              <Row k="Email" v={e.email ?? "—"} />
              <Row k="Capacité" v={e.capacite ?? "—"} />
              <Row k="Agrément" v={e.agrement ?? "—"} />
              <Row k="Statut" v={<Pill tone={e.actif === false ? "danger" : "success"}>{e.actif === false ? "Inactif" : "Actif"}</Pill>} />
            </div>
          )}
        </DataPanel>
        <DataPanel title="Statistiques" icon={BarChart3} spec={specs.etabStats} demoData={demoStats} vars={v}>
          {(s: any) => (
            <div className="grid grid-cols-2 gap-3">
              {[["Enfants", s.enfants], ["Personnel", s.personnel], ["Sections", s.sections], ["Occupation", s.tauxOccupation != null ? `${s.tauxOccupation} %` : "—"]].map(([k, val]) => (
                <div key={String(k)} className="rounded-xl bg-accent/50 p-4"><p className="text-xs text-muted-foreground">{k}</p><p className="font-display text-2xl font-semibold">{val ?? "—"}</p></div>
              ))}
            </div>
          )}
        </DataPanel>
      </div>
      <SecuriteEtab etablissementId={etablissementId} />
    </DashboardShell>
  );
}
