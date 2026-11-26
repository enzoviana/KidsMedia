import { createFileRoute } from "@tanstack/react-router";
import { Mail } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import type { Crud } from "@/components/dash/crud";
import { Pill, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/admin/contacts")({
  head: () => ({
    meta: [
      { title: "Messages du site — Kids'Med IA" },
      {
        name: "description",
        content: "Demandes de démonstration et messages reçus depuis le site vitrine.",
      },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  {
    _id: "c1",
    nom: "Claire Martin",
    email: "claire@exemple.fr",
    etablissement: "Crèche Les Petits Loups",
    role: "creche",
    sujet: "demo",
    message: "Bonjour, nous souhaitons une démonstration pour 3 sections et 45 enfants.",
    statut: "nouveau",
    createdAt: "2026-11-26",
  },
  {
    _id: "c2",
    nom: "Nadia Roux",
    email: "nadia@exemple.fr",
    etablissement: "RSAI indépendante",
    role: "rsai",
    sujet: "tarifs",
    message: "Quel est le tarif pour une RSAI qui intervient dans 4 crèches ?",
    statut: "traite",
    createdAt: "2026-11-25",
  },
];

const sujetLabel: Record<string, string> = {
  demo: "Démonstration",
  tarifs: "Tarifs",
  fonctionnalites: "Fonctionnalités",
  rgpd: "RGPD",
  partenariat: "Partenariat",
  support: "Support",
  autre: "Autre",
};

const cols: Col[] = [
  {
    label: "Date",
    render: (r) => <span className="text-muted-foreground">{fmtDate(r.createdAt)}</span>,
  },
  {
    label: "Contact",
    render: (r) => (
      <div>
        <p className="font-medium">{r.nom}</p>
        <a href={`mailto:${r.email}`} className="text-xs text-brand-blue hover:underline">
          {r.email}
        </a>
      </div>
    ),
  },
  {
    label: "Structure",
    render: (r) => (
      <span>
        {r.etablissement ?? "—"}
        <span className="block text-xs text-muted-foreground">{r.role ?? "—"}</span>
      </span>
    ),
  },
  { label: "Sujet", render: (r) => <Pill>{sujetLabel[r.sujet] ?? r.sujet ?? "—"}</Pill> },
  {
    label: "Message",
    render: (r) => (
      <span className="line-clamp-2 block max-w-md text-sm text-muted-foreground">{r.message}</span>
    ),
  },
  {
    label: "Statut",
    render: (r) => (
      <Pill
        tone={r.statut === "nouveau" ? "warning" : r.statut === "traite" ? "success" : "default"}
      >
        {r.statut ?? "—"}
      </Pill>
    ),
  },
];

const crud: Crud = {
  entity: "un message",
  base: "/contact/messages",
  noCreate: true,
  fields: [
    { name: "statut", label: "Statut", type: "select", options: ["nouveau", "traite", "archive"] },
  ],
};

function Page() {
  return (
    <ListPage
      crud={crud}
      title="Messages du site"
      spec={specs.contactMessages}
      demo={demo}
      cols={cols}
      icon={Mail}
    />
  );
}
