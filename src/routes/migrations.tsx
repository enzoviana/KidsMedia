import { createFileRoute } from "@tanstack/react-router";
import { DashboardShell } from "@/components/dash/shell";
import { MigrationPanel } from "@/components/dash/migrations";

export const Route = createFileRoute("/migrations")({
  head: () => ({ meta: [
    { title: "Migrations base de données — Kids'Med IA" },
    { name: "description", content: "Lancer la procédure de migration de la base de données en un clic." },
    { property: "og:title", content: "Migrations base de données — Kids'Med IA" },
    { property: "og:description", content: "Vérifier et appliquer les migrations, puis créer un ticket de test." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ]}),
  component: () => (
    <DashboardShell title="Migrations base de données">
      <MigrationPanel />
    </DashboardShell>
  ),
});
