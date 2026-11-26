import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import type { Crud } from "@/components/dash/crud";
import { Pill, fullName } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/admin/groupes")({
  head: () => ({
    meta: [
      { title: "Groupes territoriaux — Kids'Med IA" },
      { name: "description", content: "Regroupez les crèches supervisées par un directeur territorial et portez leur abonnement au niveau du groupe." },
      { property: "og:title", content: "Groupes territoriaux — Kids'Med IA" },
      { property: "og:description", content: "Supervision des crèches par groupe et abonnement mutualisé." },
      { name: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  { _id: "g1", nom: "Groupe Île-de-France", description: "Crèches d'Île-de-France", directeurs: [{ prenom: "Sonia", nom: "Terrier", email: "sonia@exemple.fr" }], etablissements: [{ nom: "Les Petits Bouts" }, { nom: "Tom Pouce" }], nbEtablissements: 2, abonnement: { plan: "Groupe Territorial", statut: "actif" } },
  { _id: "g2", nom: "Groupe Bourgogne", description: "Crèches de l'Yonne", directeurs: [], etablissements: [{ nom: "L'Ile aux Enfants" }], nbEtablissements: 1, abonnement: null },
];

const cols: Col[] = [
  { label: "Groupe", render: (r) => <span className="font-medium">{r.nom}</span> },
  { label: "Directeur(s)", render: (r) => (r.directeurs ?? []).map((d: any) => fullName(d)).join(", ") || "—" },
  { label: "Crèches", render: (r) => <span>{(r.etablissements ?? []).map((e: any) => e.nom ?? e).join(", ") || "—"}</span> },
  { label: "Abonnement", render: (r) => r.abonnement?.plan ? <Pill tone={r.abonnement.statut === "actif" ? "success" : "warning"}>{r.abonnement.plan}</Pill> : <span className="text-muted-foreground">Aucun</span> },
  { label: "Description", render: (r) => <span className="text-muted-foreground">{r.description ?? "—"}</span> },
];

const crud: Crud = {
  entity: "un groupe territorial",
  base: "/groupes",
  fields: [
    { name: "nom", label: "Nom du groupe", type: "text", required: true },
    { name: "description", label: "Description", type: "textarea" },
  ],
};

function Page() {
  return <ListPage crud={crud} title="Groupes territoriaux" spec={specs.groupes} demo={demo} cols={cols} icon={Network} />;
}
