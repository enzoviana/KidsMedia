import { createFileRoute } from "@tanstack/react-router";
import { Syringe, ShieldCheck, Sparkles } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { Pill } from "@/components/dash/widgets";
import { type Crud } from "@/components/dash/crud";
import { specs } from "@/lib/specs";
import { getSession, roleToKey } from "@/lib/api";

export const Route = createFileRoute("/admin/vaccins")({
  head: () => ({
    meta: [
      { title: "Vaccins obligatoires & recommandés — Kids'Med IA" },
      { name: "description", content: "Référentiel vaccinal national demandé à l'inscription des enfants." },
      { property: "og:title", content: "Vaccins obligatoires & recommandés — Kids'Med IA" },
      { property: "og:description", content: "Gérer le socle vaccinal national et les ajouts des crèches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  { _id: "v1", nom: "Diphtérie-Tétanos-Polio (DTP)", niveau: "obligatoire", description: "3 doses chez le nourrisson.", ageMois: 2, dosesAttendues: 3, portee: "nationale" },
  { _id: "v2", nom: "Rougeole-Oreillons-Rubéole (ROR)", niveau: "obligatoire", description: "2 doses nécessaires.", ageMois: 12, dosesAttendues: 2, portee: "nationale" },
  { _id: "v3", nom: "Méningocoque B", niveau: "recommande", description: "Recommandé chez le nourrisson.", ageMois: 2, dosesAttendues: 3, portee: "nationale" },
  { _id: "v4", nom: "Grippe (saisonnière)", niveau: "recommande", description: "Recommandé chaque automne.", ageMois: 6, dosesAttendues: 1, portee: "nationale" },
];

const cols: Col[] = [
  { label: "Vaccin", render: (r) => <span className="flex items-center gap-2 font-medium">{r.niveau === "obligatoire" ? <ShieldCheck className="h-4 w-4 text-success" /> : <Sparkles className="h-4 w-4 text-warning" />}{r.nom}</span> },
  { label: "Niveau", render: (r) => <Pill tone={r.niveau === "obligatoire" ? "danger" : "warning"}>{r.niveau === "obligatoire" ? "Obligatoire" : "Recommandé"}</Pill> },
  { label: "Doses", render: (r) => r.dosesAttendues ?? 1 },
  { label: "Âge conseillé", render: (r) => (r.ageMois != null ? `${r.ageMois} mois` : "—") },
  { label: "Périmètre", render: (r) => <Pill>{r.portee === "creche" ? "Crèche" : "National"}</Pill> },
  { label: "Description", render: (r) => <span className="text-muted-foreground">{r.description ?? "—"}</span> },
];

const crud: Crud = {
  entity: "un vaccin de référence",
  base: "/vaccins-reference",
  fields: [
    { name: "nom", label: "Nom du vaccin", type: "text", required: true },
    { name: "niveau", label: "Niveau", type: "select", options: ["obligatoire", "recommande"], required: true },
    { name: "dosesAttendues", label: "Doses attendues", type: "number" },
    { name: "ageMois", label: "Âge conseillé (mois)", type: "number" },
    { name: "description", label: "Description / consigne", type: "textarea" },
  ],
};

function Page() {
  const role = roleToKey(getSession()?.user.role);
  return (
    <ListPage
      role="admin"
      crud={role === "admin" || role === "dev" ? crud : undefined}
      title="Vaccins obligatoires & recommandés"
      spec={specs.vaccinsReferenceAdmin}
      demo={demo}
      cols={cols}
      icon={Syringe}
      before={
        <div className="rounded-2xl border bg-card p-4 text-sm text-card-foreground shadow-sm">
          <p className="font-medium">Socle national partagé par toutes les crèches</p>
          <p className="mt-1 text-muted-foreground">
            Ces vaccins seront demandés pour chaque enfant à l'inscription. Une crèche peut ajouter ses propres exigences
            (obligatoires ou recommandées) : elles ne s'appliquent qu'à ses enfants et n'écrasent jamais le socle national.
          </p>
        </div>
      }
    />
  );
}
