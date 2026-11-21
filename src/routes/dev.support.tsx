import { createFileRoute } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { ListPage, type Col } from "@/components/dash/list-page";
import { type Crud } from "@/components/dash/crud";
import { TicketDetailDialog, TicketPriorityPill, TicketStatusPill, type Ticket } from "@/components/dash/tickets";
import { fullName, fmtDate } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/support")({
  head: () => ({
    meta: [
      { title: "Support — Kids'Med IA" },
      { name: "description", content: "Tickets de support technique." },
      { property: "og:title", content: "Support — Kids'Med IA" },
      { property: "og:description", content: "Tickets de support technique." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: Ticket[] = [
  {
    _id: "demo-t1", numero: "TCK-0042", titre: "Impossible d'uploader un PDF", priorite: "haute", statut: "ouvert",
    categorie: "bug", page: "/documents", device: "Chrome macOS", createdAt: new Date().toISOString(),
    description: "L'ajout d'un document PDF reste bloqué à 0 % et aucune erreur ne s'affiche.",
    auteur: { prenom: "Claire", nom: "Martin", email: "claire@exemple.fr", role: "parent" },
    messages: [{ id: "m1", message: "Le problème arrive aussi avec un fichier de 200 Ko.", auteurNom: "Claire Martin", auteurRole: "parent", createdAt: new Date().toISOString() }],
  },
  {
    _id: "demo-t2", numero: "TCK-0041", titre: "Notification en double", priorite: "normale", statut: "en_cours",
    categorie: "bug", page: "/notifications", device: "iPhone · Safari", createdAt: "2026-10-05",
    description: "Chaque transmission génère deux notifications identiques.",
    auteur: { prenom: "Inès", nom: "Moreau", email: "ines@exemple.fr", role: "rsai" },
    messages: [{ id: "m2", message: "Merci, nous vérifions le service d'envoi.", auteurNom: "Équipe technique", auteurRole: "developpeur", createdAt: "2026-10-06" }],
  },
  {
    _id: "demo-t3", numero: "TCK-0040", titre: "Export CSV des transmissions", priorite: "basse", statut: "resolu",
    categorie: "suggestion", page: "/transmissions", device: "Chrome Windows", createdAt: "2026-09-30",
    description: "Pouvoir exporter l'historique des transmissions au format CSV.",
    auteur: { prenom: "Paul", nom: "Bernard", email: "paul@exemple.fr", role: "medecin" },
    messages: [{ id: "m3", message: "L'export est disponible dans le menu Transmissions.", auteurNom: "Équipe technique", auteurRole: "developpeur", createdAt: "2026-10-01" }],
  },
];

const cols: Col[] = [
  {
    label: "Ticket",
    render: (r) => (
      <div className="min-w-0">
        <p className="truncate font-medium">{r.titre}</p>
        <p className="font-mono text-xs text-muted-foreground">{r.numero ?? "—"}</p>
      </div>
    ),
  },
  { label: "Auteur", render: (r) => <span className="text-sm">{r.auteur ? fullName(r.auteur) : "—"}</span> },
  { label: "Priorité", render: (r) => <TicketPriorityPill priorite={r.priorite} /> },
  { label: "Statut", render: (r) => <TicketStatusPill statut={r.statut} /> },
  {
    label: "Réponses",
    render: (r) => {
      const n = r.reponses ?? r.messages?.length ?? 0;
      return <span className={n ? "font-medium" : "text-muted-foreground"}>{n}</span>;
    },
  },
  { label: "Créé", render: (r) => fmtDate(r.createdAt) },
];

const crud: Crud = {
  entity: "un ticket",
  base: "/developer/support/tickets",
  noEdit: true,
  noDelete: true,
  fields: [
    { name: "titre", label: "Titre", type: "text", required: true },
    { name: "categorie", label: "Type", type: "select", required: true, options: ["bug", "question", "suggestion"] },
    { name: "priorite", label: "Priorité", type: "select", required: true, options: ["basse", "normale", "haute", "urgente"] },
    { name: "description", label: "Description", type: "textarea", required: true },
  ],
};

function Page() {
  const qc = useQueryClient();
  return (
    <ListPage
      crud={crud}
      title="Support"
      spec={specs.devTickets}
      demo={demo}
      cols={cols}
      icon={LifeBuoy}
      realOnly
      renderView={(row, close) => (
        <TicketDetailDialog
          ticket={row as Ticket | null}
          open={!!row}
          onOpenChange={(o) => { if (!o) close(); }}
          isDev
          onUpdated={() => qc.invalidateQueries({ queryKey: ["api", specs.devTickets.id] })}
        />
      )}
    />
  );
}
