import { createFileRoute, Link } from "@tanstack/react-router";
import { Cpu, Gauge, Bug, LifeBuoy, Database, Route as RouteIcon, Server, LayoutDashboard, MemoryStick } from "lucide-react";
import { Line, LineChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Legend } from "recharts";
import { DashboardShell, type NavGroup } from "@/components/dash/shell";
import { DataPanel, StatCard, Pill, fmtDate, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/dev/")({
  head: () => ({
    meta: [
      { title: "Console développeur — Kids'Med IA" },
      { name: "description", content: "Métriques, santé des services, erreurs, tickets et base de données." },
      { property: "og:title", content: "Console développeur — Kids'Med IA" },
      { property: "og:description", content: "La console technique de Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Dev,
});

const nav: NavGroup[] = [
  { label: "Monitoring", items: [
    { label: "Vue d'ensemble", icon: LayoutDashboard, anchor: "top" },
    { label: "Services", icon: Server, anchor: "services" },
    { label: "Erreurs", icon: Bug, anchor: "erreurs" },
  ]},
  { label: "Outils", items: [
    { label: "Tickets", icon: LifeBuoy, anchor: "tickets" },
    { label: "Base de données", icon: Database, anchor: "db" },
    { label: "Endpoints", icon: RouteIcon, anchor: "endpoints" },
  ]},
];

const demoMetrics = {
  requestsPerMinute: 342, avgResponseTime: 128, errorRate: 0.4, cpu: 37, memory: 61, uptime: 99.98,
  history: ["10:00", "10:10", "10:20", "10:30", "10:40", "10:50", "11:00", "11:10"].map((time, i) => ({ time, requests: [280, 310, 295, 360, 342, 401, 377, 342][i], latency: [110, 125, 118, 160, 131, 190, 140, 128][i] })),
};
const demoHealth = { services: [
  { name: "API Express", status: "up", latency: 42 }, { name: "MongoDB", status: "up", latency: 8 },
  { name: "Stockage S3", status: "degraded", latency: 420 }, { name: "Envoi SMS (Twilio)", status: "down", latency: 0 }, { name: "Moteur IA", status: "up", latency: 860 },
] };
const demoErrors = [
  { message: "TypeError: Cannot read properties of undefined (reading 'etablissementId')", endpoint: "GET /api/enfants", level: "error", count: 23, lastSeen: new Date().toISOString() },
  { message: "Timeout MongoDB 10000ms", endpoint: "GET /api/logs", level: "warning", count: 4, lastSeen: new Date().toISOString() },
  { message: "JWT expired", endpoint: "POST /api/auth/refresh", level: "warning", count: 61, lastSeen: new Date().toISOString() },
];
const demoTickets = [
  { titre: "Upload PDF impossible depuis iOS", priorite: "haute", statut: "en_cours", createdAt: "2026-10-07" },
  { titre: "Mot de passe oublié — email non reçu", priorite: "urgente", statut: "ouvert", createdAt: "2026-10-08" },
  { titre: "Ajout export CSV transmissions", priorite: "normale", statut: "resolu", createdAt: "2026-10-01" },
];
const demoDb = { totalSizeMB: 412, collections: [
  { name: "enfants", count: 1840, sizeMB: 38 }, { name: "transmissions", count: 52310, sizeMB: 196 }, { name: "logs", count: 120400, sizeMB: 142 }, { name: "documents", count: 6210, sizeMB: 22 }, { name: "users", count: 912, sizeMB: 4 },
] };
const demoEndpoints = [
  { method: "GET", path: "/api/enfants", calls24h: 12840, avgMs: 96 }, { method: "POST", path: "/api/auth/login", calls24h: 3120, avgMs: 210 },
  { method: "GET", path: "/api/transmissions/today/:id", calls24h: 8740, avgMs: 74 }, { method: "POST", path: "/api/diagnostics", calls24h: 410, avgMs: 1860 },
];
const st = (s?: string): "default" | "success" | "warning" | "danger" => (s === "up" ? "success" : s === "down" ? "danger" : "warning");
const prio = (p?: string): "default" | "success" | "warning" | "danger" => (p === "urgente" ? "danger" : p === "haute" ? "warning" : "default");

function Dev() {
  return (
    <DashboardShell role="dev" title="Console développeur" groups={nav} actions={<div className="flex flex-wrap gap-2"><Button variant="outline" asChild><Link to="/dev/rgpd"><Database className="h-4 w-4" />Registre RGPD</Link></Button><Button asChild><Link to="/dev/performance"><Gauge className="h-4 w-4" />Performance</Link></Button></div>}>
      <div id="top" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Requêtes / min" icon={Gauge} spec={specs.devMetrics} demoData={demoMetrics} pick={(d) => d.requestsPerMinute} trend={{ value: "+8 %" }} />
        <StatCard label="Latence moyenne" icon={Cpu} spec={specs.devMetrics} demoData={demoMetrics} pick={(d) => `${d.avgResponseTime} ms`} />
        <StatCard label="Taux d'erreur" icon={Bug} spec={specs.devMetrics} demoData={demoMetrics} pick={(d) => `${d.errorRate} %`} trend={{ value: "+0,1", up: false }} />
        <StatCard label="Mémoire" icon={MemoryStick} spec={specs.devMetrics} demoData={demoMetrics} pick={(d) => `${d.memory} %`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel title="Trafic & latence" icon={Gauge} spec={specs.devMetrics} demoData={demoMetrics} className="xl:col-span-2" actions={<Button size="sm" variant="ghost" asChild><Link to="/dev/performance">Détails</Link></Button>}>
          {(d) => (
            <div className="h-72">
              <ResponsiveContainer>
                <LineChart data={d.history ?? []}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 11 }} />
                  <Tooltip {...tip} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Line type="monotone" dataKey="requests" name="Requêtes" stroke="var(--chart-1)" strokeWidth={3} dot={false} />
                  <Line type="monotone" dataKey="latency" name="Latence (ms)" stroke="var(--chart-2)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </DataPanel>
        <DataPanel id="services" title="Services" icon={Server} spec={specs.devHealth} demoData={demoHealth}>
          {(d) => <ul className="divide-y text-sm">{(d.services ?? []).map((s, i) => <li key={i} className="flex flex-wrap items-center justify-between gap-2 py-3"><span className="flex items-center gap-2"><span className={`h-2 w-2 shrink-0 rounded-full ${s.status === "up" ? "bg-success" : s.status === "down" ? "bg-destructive" : "bg-warning"}`} />{s.name}</span><span className="flex items-center gap-2 text-xs text-muted-foreground">{s.latency} ms <Pill tone={st(s.status)}>{s.status === "up" ? "Actif" : s.status === "down" ? "Indisponible" : "Dégradé"}</Pill></span></li>)}</ul>}
        </DataPanel>
      </div>

      <DataPanel id="erreurs" title="Erreurs récentes" icon={Bug} spec={specs.devErrors} demoData={demoErrors} actions={<Button size="sm" variant="ghost" asChild><Link to="/dev/erreurs">Toutes les erreurs</Link></Button>}>
        {(d) => <ul className="divide-y text-sm">{toList(d).map((e, i) => <li key={i} className="flex items-start justify-between gap-3 py-3"><div className="min-w-0"><p className="truncate">{e.message}</p><p className="text-xs text-muted-foreground">{e.endpoint} · vu {fmtDate(e.lastSeen)}</p></div><div className="flex shrink-0 items-center gap-2"><span className="text-xs text-muted-foreground">×{e.count}</span><Pill tone={e.level === "error" ? "danger" : "warning"}>{e.level}</Pill></div></li>)}</ul>}
      </DataPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="tickets" title="Tickets de support" icon={LifeBuoy} spec={specs.devTickets} demoData={demoTickets} actions={<Button size="sm" variant="ghost" asChild><Link to="/dev/support">Voir tout</Link></Button>}>
          {(d) => <ul className="divide-y text-sm">{toList(d).map((t, i) => <li key={i} className="flex items-center justify-between gap-2 py-2.5"><div className="min-w-0"><p className="truncate">{t.titre}</p><p className="text-xs text-muted-foreground">{t.statut} · {fmtDate(t.createdAt)}</p></div><Pill tone={prio(t.priorite)}>{t.priorite}</Pill></li>)}</ul>}
        </DataPanel>
        <DataPanel id="db" title="Base de données" icon={Database} spec={specs.devDb} demoData={demoDb}>
          {(d) => {
            const max = Math.max(...(d.collections ?? []).map((c) => c.sizeMB), 1);
            return <div><p className="mb-3 text-sm text-muted-foreground">Taille totale : <span className="text-foreground">{d.totalSizeMB} Mo</span></p><ul className="space-y-3 text-sm">{(d.collections ?? []).map((c, i) => <li key={i}><div className="mb-1 flex justify-between"><span>{c.name}</span><span className="text-xs text-muted-foreground">{c.count.toLocaleString("fr-FR")} docs · {c.sizeMB} Mo</span></div><div className="h-1.5 rounded-full bg-muted"><div className="h-1.5 rounded-full bg-primary" style={{ width: `${(c.sizeMB / max) * 100}%` }} /></div></li>)}</ul></div>;
          }}
        </DataPanel>
      </div>

      <DataPanel id="endpoints" title="Endpoints" icon={RouteIcon} spec={specs.devEndpoints} demoData={demoEndpoints}>
        {(d) => (
          <div className="overflow-x-auto"><table className="w-full text-sm"><thead className="text-left text-xs uppercase text-muted-foreground"><tr><th className="pb-3">Méthode</th><th className="pb-3">Route</th><th className="pb-3 text-right">Appels 24 h</th><th className="pb-3 text-right">Moy.</th></tr></thead>
            <tbody className="divide-y">{toList(d).map((e, i) => <tr key={i}><td className="py-2.5"><Pill>{e.method}</Pill></td><td className="py-2.5">{e.path}</td><td className="py-2.5 text-right">{e.calls24h?.toLocaleString("fr-FR")}</td><td className="py-2.5 text-right">{e.avgMs} ms</td></tr>)}</tbody></table></div>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
