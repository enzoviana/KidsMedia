import { createFileRoute } from "@tanstack/react-router";
import { Network } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { EnfantLink, type Crud } from "@/components/dash/crud";
import { Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { demoEnfants } from "@/lib/demo-enfants";

export const Route = createFileRoute("/admin/liaisons")({
  head: () => ({
    meta: [
      { title: "Liaisons enfants — Kids'Med IA" },
      { name: "description", content: "Vue admin des liaisons entre enfants, parents, médecins et crèches." },
      { property: "og:title", content: "Liaisons enfants — Kids'Med IA" },
      { property: "og:description", content: "Lier ou révoquer les accès aux dossiers enfants." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const people = [
  { prenom: "Claire", nom: "Martin", email: "claire.martin@exemple.fr", role: "parent" },
  { prenom: "Dr Paul", nom: "Moreau", email: "p.moreau@cabinet.fr", role: "medecin" },
  { prenom: "Inès", nom: "Garcia", email: "i.garcia@rsai.fr", role: "rsai" },
  { prenom: "Les Petits", nom: "Soleils", email: "contact@petits-soleils.fr", role: "creche" },
];
const demo: any[] = demoEnfants.flatMap((e, i) => people.slice(0, 2 + (i % 3)).map((p, j) => ({
  _id: `l-${i}-${j}`, enfant: e, user: p, role: p.role, source: j % 2 ? "code" : "admin", createdAt: `2026-0${(i % 8) + 1}-1${j}`,
})));

const cols: Col[] = [
  { label: "Enfant", render: (r) => <EnfantLink e={r.enfant} /> },
  { label: "Lié à", render: (r) => <div><p className="font-medium">{fullName(r.user)}</p><p className="text-xs text-muted-foreground">{r.user?.email}</p></div> },
  { label: "Rôle", render: (r) => <Pill tone={r.role === "parent" ? "success" : r.role === "medecin" ? "warning" : "default"}>{r.role}</Pill> },
  { label: "Origine", render: (r) => (r.source === "code" ? "Code partagé" : "Admin") },
  { label: "Depuis", render: (r) => fmtDate(r.createdAt) },
];

const crud: Crud = {
  entity: "une liaison", base: "/liaisons", noEdit: true,
  fields: [
    { name: "enfant", label: "Enfant", lookup: "enfant", required: true },
    { name: "email", label: "E-mail de l'utilisateur", type: "email", required: true },
    { name: "role", label: "Rôle", type: "select", required: true, options: ["parent", "medecin", "rsai", "creche"] },
  ],
};

function Page() {
  return <ListPage crud={crud} title="Liaisons enfants" role="admin" spec={specs.liaisons} demo={demo} cols={cols} icon={Network}
    before={<p className="mb-4 text-sm text-muted-foreground">Chaque liaison donne accès au dossier de l'enfant. Liez manuellement avec « Ajouter », ou laissez la crèche partager le code de liaison.</p>} />;
}
