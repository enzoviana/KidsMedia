import { createFileRoute } from "@tanstack/react-router";
import { Database } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis } from "recharts";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, tip } from "@/components/dash/widgets";
import { DataTable } from "@/components/dash/list-page";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/base-de-donnees")({
  head: () => ({
    meta: [
      { title: "Base de données — Kids'Med IA" },
      { name: "description", content: "Collections, volumes et taille de la base." },
      { property: "og:title", content: "Base de données — Kids'Med IA" },
      { property: "og:description", content: "Console base de données développeur." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Db,
});

const demo = { totalSizeMB: 412, collections: [
  { name: "users", count: 1840, sizeMB: 12 }, { name: "enfants", count: 3210, sizeMB: 38 }, { name: "transmissions", count: 48200, sizeMB: 160 },
  { name: "documents", count: 9100, sizeMB: 140 }, { name: "logs", count: 120400, sizeMB: 62 },
]};

function Db() {
  return (
    <DashboardShell role="dev" title="Base de données">
      <DataPanel title="Collections" icon={Database} spec={specs.devDb} demoData={demo}>
        {(d: any) => (
          <div className="space-y-6">
            <p className="text-sm text-muted-foreground">Taille totale : <span className="font-semibold text-foreground">{d.totalSizeMB ?? "—"} Mo</span></p>
            <div className="h-56">
              <ResponsiveContainer><BarChart data={d.collections ?? []}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="name" fontSize={12} /><Tooltip {...tip} /><Bar dataKey="sizeMB" name="Mo" fill="var(--primary)" radius={6} /></BarChart></ResponsiveContainer>
            </div>
            <DataTable rows={d.collections ?? []} cols={[{ label: "Collection", render: (r) => <code>{r.name}</code> }, { label: "Documents", render: (r) => r.count }, { label: "Taille", render: (r) => `${r.sizeMB} Mo` }]} />
          </div>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
