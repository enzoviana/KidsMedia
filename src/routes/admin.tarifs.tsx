import { createFileRoute, Link } from "@tanstack/react-router";
import { Tag } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { demoTarifs } from "@/lib/forfaits";

export const Route = createFileRoute("/admin/tarifs")({
  head: () => ({
    meta: [
      { title: "Tarifs — Kids'Med IA" },
      { name: "description", content: 'Grille tarifaire des plans.' },
      { property: "og:title", content: "Tarifs — Kids'Med IA" },
      { property: "og:description", content: 'Grille tarifaire des plans.' },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const roleLabel: Record<string, string> = { creche: "Crèche", rsai: "RSAI", medecin: "Médecin", directeur: "Directeur territorial", parent: "Parent", tous: "Tous" };
const categorieLabel: Record<string, string> = { abonnement: "Abonnement", one_shot: "One-shot", promotion: "Promotion" };
const euros = (v: unknown) => (v === null || v === undefined || v === "" ? "—" : `${v} €`);
const cols: Col[] = [
  { label: "Forfait", render: (r) => <span className="font-medium">{r.nom ?? r.plan}</span> },
  { label: "Type", render: (r) => <Pill tone={r.categorie === "promotion" ? "warning" : r.categorie === "one_shot" ? "success" : "default"}>{categorieLabel[r.categorie] ?? "Abonnement"}</Pill> },
  { label: "Rôle", render: (r) => <Pill>{roleLabel[r.roleCible] ?? "Tous"}</Pill> },
  { label: "Prix", render: (r) => <span>{euros(r.prixMensuel ?? r.prix)}<span className="text-xs text-muted-foreground"> / mois</span>{r.categorie === "promotion" && r.prixPromoMensuel != null ? <span className="ml-2 rounded bg-success/15 px-1.5 py-0.5 text-xs text-success">promo {euros(r.prixPromoMensuel)}</span> : null}</span> },
  { label: "Annuel / engagement", render: (r) => <span>{euros(r.prixAnnuel)}{r.engagementMois ? ` · ${r.engagementMois} mois` : ""}{r.dureeMois ? ` · ${r.dureeMois} mois` : ""}</span> },
  { label: "Essai", render: (r) => r.joursEssai > 0 ? <Pill>{r.joursEssai} j</Pill> : "—" },
  { label: "Statut", render: (r) => <Pill tone={r.actif === false ? "danger" : "success"}>{r.actif === false ? "Désactivé" : "Actif"}</Pill> },
];

const crud: Crud = { entity: "une offre", base: "/tarifs", fields: [
  { name: "nom", label: "Nom de l'offre", type: "text", required: true },
  { name: "categorie", label: "Type d'offre", type: "select", options: ["abonnement", "one_shot", "promotion"], required: true },
  { name: "roleCible", label: "Rôle concerné", type: "select", options: ["creche", "rsai", "medecin", "directeur", "parent", "tous"], required: true },
  { name: "periodicite", label: "Périodicité", type: "select", options: ["mensuel", "annuel"] },
  { name: "engagementMois", label: "Engagement (mois, ex. 12 pour annuel)", type: "number" },
  { name: "dureeMois", label: "Durée d'une offre one-shot (mois)", type: "number" },
  { name: "prixMensuel", label: "Prix mensuel de référence (€)", type: "number", required: true },
  { name: "prixAnnuel", label: "Prix annuel (€)", type: "number" },
  { name: "prixPromoMensuel", label: "Prix promo mensuel (€)", type: "number" },
  { name: "prixPromoAnnuel", label: "Prix promo annuel (€)", type: "number" },
  { name: "dateDebutPromo", label: "Début de la promotion", type: "date" },
  { name: "dateFinPromo", label: "Fin de la promotion", type: "date" },
  { name: "description", label: "Description commerciale", type: "textarea" },
  { name: "joursEssai", label: "Jours d'essai gratuit (0 = aucun)", type: "number" },
  { name: "fonctionnalites", label: "Fonctionnalités (une par ligne)", type: "textarea" },
  { name: "actif", label: "Actif", type: "checkbox" },
] };

function Page() {
  void Link; void EnfantLink; void Pill; void fullName; void fmtDate;
  return <ListPage role="admin" crud={crud} title="Offres & forfaits" spec={specs.tarifsAll} demo={demoTarifs} cols={cols} icon={Tag} />;
}
