import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Building2, HeartPulse, MapPin, Star, UserRound } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { AvisRsaiButton } from "@/components/dash/terrain";
import { UserAvatar } from "@/components/dash/beta";
import { getSession } from "@/lib/api";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/fiche-rsai/$rsaiId")({
  head: () => ({
    meta: [
      { title: "Fiche RSAI — Kids'Med IA" },
      { name: "description", content: "Coordonnées, secteur, mission et avis d'une RSAI." },
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
  _id: "r1", prenom: "Nadia", nom: "Roux", email: "n.roux@exemple.fr", telephone: "06 00 00 00 03",
  qualification: "Infirmière puéricultrice", avatarUrl: null, adresse: "45 rue Oberkampf", codePostal: "75011", ville: "Paris",
  region: "Île-de-France", secteur: "Paris Est", presentation: "Accompagnement des équipes de crèche et des familles sur l'inclusion et les PAI.",
  experienceAnnees: 5, langues: ["Français"], disponibilites: "Mardi au samedi, 9 h – 17 h",
  noteMoyenne: 4.6, nbAvis: 3, missionsTerminees: 4, missionsTermineesAvecCreche: 1, peutNoter: true, dejaNote: 4,
  affectations: [
    { creche: { nom: "Les Petits Soleils", ville: "Paris", region: "Île-de-France", adresse: "10 rue de Rivoli" }, dateDebut: "2025-01-06", dateFin: "2025-06-30", statut: "terminee", terminee: true, jours: [1, 3], debut: "08:30", fin: "12:30" },
    { creche: { nom: "La Lune Bleue", ville: "Paris", region: "Île-de-France", adresse: "22 rue Oberkampf" }, dateDebut: "2026-03-01", dateFin: "2026-07-31", statut: "terminee", terminee: true, jours: [5], debut: "09:00", fin: "17:00" },
  ],
  avis: [
    { note: 5, commentaire: "Très réactive et pédagogue.", auteurNom: "Les Petits Soleils", auteur: { nom: "Les Petits Soleils" }, createdAt: "2026-09-12" },
    { note: 4, commentaire: "Bon suivi des PAI.", auteurNom: "La Lune Bleue", auteur: { nom: "La Lune Bleue" }, createdAt: "2026-06-02" },
  ],
};

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function Page() {
  const { rsaiId } = Route.useParams();
  const v = { rsaiId };
  const role = getSession()?.user?.role;
  const estCreche = role === "creche" || !!getSession()?.demo;
  return (
    <DashboardShell title="Fiche RSAI" actions={<Button variant="outline" asChild><Link to="/rsai-annuaire"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <DataPanel title="Profil" icon={HeartPulse} spec={specs.rsaiDetail} demoData={demo} vars={v}>
        {(r: any) => (
          <div className="grid gap-6 lg:grid-cols-3">
            <div className="lg:col-span-2">
              <div className="mb-4 flex items-center gap-4">
                <UserAvatar user={r} className="h-16 w-16" />
                <div>
                  <p className="font-display text-2xl font-semibold">{fullName(r)}</p>
                  <p className="text-sm text-muted-foreground">{r.qualification ?? "Référente Santé et Accueil Inclusif"}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                    <span className="inline-flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{[r.ville, r.region, r.secteur].filter(Boolean).join(" · ") || "Localisation non renseignée"}</span>
                    {r.distanceKm != null && <Pill tone={Number(r.distanceKm) <= 10 ? "success" : "default"}>à {Number(r.distanceKm) < 1 ? `${Math.round(Number(r.distanceKm) * 1000)} m` : `${Number(r.distanceKm).toFixed(1)} km`}</Pill>}
                  </p>
                </div>
              </div>
              {r.presentation && <p className="mb-4 rounded-xl bg-accent/40 p-3 text-sm">{r.presentation}</p>}
              <Row k="Qualification" v={r.qualification ?? "—"} />
              <Row k="E-mail" v={r.email ?? "—"} />
              <Row k="Téléphone" v={r.telephone ?? r.tel ?? "—"} />
              <Row k="Adresse" v={[r.adresse, r.codePostal, r.ville].filter(Boolean).join(" ") || "—"} />
              <Row k="Région / secteur" v={[r.region, r.secteur].filter(Boolean).join(" · ") || "—"} />
              <Row k="Expérience" v={r.experienceAnnees != null ? `${r.experienceAnnees} an${Number(r.experienceAnnees) > 1 ? "s" : ""}` : "—"} />
              <Row k="Langues" v={(r.langues ?? []).join(", ") || "—"} />
              <Row k="Disponibilités" v={r.disponibilites ?? "—"} />
              <Row k="Référente de secteur" v={r.referente ? <span className="inline-flex items-center gap-1 text-warning"><Star className="h-4 w-4 fill-warning" />Oui</span> : "Non"} />
            </div>
            <div className="space-y-3">
              <div className="rounded-xl bg-accent/50 p-4">
                <p className="text-xs text-muted-foreground">Note moyenne</p>
                <p className="flex items-center gap-2 font-display text-3xl font-semibold"><Star className="h-6 w-6 fill-warning text-warning" />{r.noteMoyenne ? Number(r.noteMoyenne).toFixed(1) : "—"}</p>
                <p className="text-xs text-muted-foreground">{r.nbAvis ?? (r.avis ?? []).length} avis</p>
                <div className="mt-3 border-t pt-3 text-sm"><span className="text-muted-foreground">Missions terminées</span><p className="font-semibold">{r.missionsTerminees ?? 0}</p></div>
                {r.missionsTermineesAvecCreche > 0 && <p className="mt-1 text-xs text-success">{r.missionsTermineesAvecCreche} avec votre crèche</p>}
              </div>
              {estCreche && (
                <div className="rounded-xl border p-3">
                  {r.peutNoter ? (
                    <>
                      <p className="mb-2 text-xs text-muted-foreground">{r.dejaNote ? `Vous avez déjà noté cette RSAI (${r.dejaNote}/5). Vous pouvez modifier votre avis.` : "Une mission terminée avec votre crèche vous autorise à publier un avis."}</p>
                      <AvisRsaiButton rsaiId={rsaiId} />
                    </>
                  ) : (
                    <>
                      <p className="mb-2 text-xs text-muted-foreground">L'avis sera disponible après une mission effectuée et terminée avec votre crèche.</p>
                      <AvisRsaiButton rsaiId={rsaiId} canRate={false} />
                    </>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </DataPanel>
      <div className="grid gap-4 lg:grid-cols-2">
        <DataPanel title="Missions & crèches" icon={Building2} spec={specs.rsaiDetail} demoData={demo} vars={v}>
          {(r: any) => (r.affectations ?? []).length ? (
            <ul className="divide-y text-sm">{r.affectations.map((a: any, i: number) => (
              <li key={a.id ?? i} className="py-3">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium">{a.creche?.nom ?? a.etablissement?.nom ?? "—"}</span>
                  <span className="flex gap-1"><Pill tone={a.terminee ? "success" : a.statut === "active" ? "warning" : "default"}>{a.terminee ? "Mission terminée" : a.statut === "active" ? "En cours" : a.statut ?? "—"}</Pill></span>
                </div>
                <p className="text-xs text-muted-foreground">{[a.creche?.ville, a.creche?.region].filter(Boolean).join(" · ")}</p>
                <p className="text-xs text-muted-foreground">{fmtDate(a.dateDebut)} → {fmtDate(a.dateFin)} · {(a.jours ?? []).map((j: number) => JOURS[j]).join(", ")} {a.debut ?? ""}–{a.fin ?? ""}</p>
              </li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucune mission.</p>}
        </DataPanel>
        <DataPanel title="Avis des crèches" icon={Star} spec={specs.rsaiDetail} demoData={demo} vars={v}>
          {(r: any) => (r.avis ?? []).length ? (
            <ul className="divide-y text-sm">{r.avis.map((a: any, i: number) => (
              <li key={a.id ?? i} className="py-3"><p className="font-medium">{"★".repeat(a.note ?? 0)} <span className="text-muted-foreground">— {a.auteur?.nom ?? a.auteurNom ?? fullName(a.auteur)}</span></p><p className="text-muted-foreground">{a.commentaire}</p><p className="text-xs text-muted-foreground">{fmtDate(a.createdAt)}</p></li>
            ))}</ul>
          ) : <p className="text-sm text-muted-foreground">Aucun avis. Les avis ne sont possibles qu'après une mission terminée.</p>}
        </DataPanel>
      </div>
      <p className="flex items-center gap-2 text-xs text-muted-foreground"><UserRound className="h-3.5 w-3.5" />Fiche consultable par l'administration, les crèches et les médecins. Les coordonnées personnelles ne sont jamais publiques.</p>
    </DashboardShell>
  );
}
