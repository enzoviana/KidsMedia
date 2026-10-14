import { createFileRoute } from "@tanstack/react-router";
import { Gauge, Activity, Cpu, Timer, AlertTriangle } from "lucide-react";
import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/dev/performance")({
  head: () => ({
    meta: [
      { title: "Performance — Console développeur — Kids'Med IA" },
      { name: "description", content: "Requêtes, temps de réponse, erreurs, CPU et mémoire de la plateforme." },
      { property: "og:title", content: "Performance — Kids'Med IA" },
      { property: "og:description", content: "Suivi des performances de la plateforme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const history = Array.from({ length: 24 }, (_, i) => ({ time: `${String(i).padStart(2, "0")}:00`, requests: Math.round(120 + 90 * Math.sin(i / 3) + (i > 8 && i < 19 ? 160 : 0)), latency: Math.round(140 + 60 * Math.cos(i / 4)) }));
const demo = { requestsPerMinute: 312, avgResponseTime: 164, errorRate: 0.7, cpu: 38, memory: 61, uptime: 99.96, history };
const services = { services: [{ name: "API Node", status: "up", latency: 42 }, { name: "MongoDB", status: "up", latency: 8 }, { name: "SMS (MFA)", status: "degraded", latency: 920 }, { name: "Stockage documents", status: "up", latency: 65 }, { name: "Moteur IA", status: "up", latency: 1240 }] };

function Kpi({ icon: I, label, value }: { icon: typeof Gauge; label: string; value: string }) {
  return <div className="rounded-2xl border bg-card p-4"><p className="flex items-center gap-1.5 text-xs text-muted-foreground"><I className="h-3.5 w-3.5" />{label}</p><p className="mt-1 font-display text-2xl font-semibold">{value}</p></div>;
}

function Page() {
  return (
    <DashboardShell role="dev" title="Performance">
      <DataPanel title="Vue d'ensemble (24 h)" icon={Gauge} spec={specs.devMetrics} demoData={demo}>
        {(m: any) => (
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-6">
              <Kpi icon={Activity} label="Requêtes / min" value={String(m.requestsPerMinute)} />
              <Kpi icon={Timer} label="Temps moyen" value={`${m.avgResponseTime} ms`} />
              <Kpi icon={AlertTriangle} label="Taux d'erreur" value={`${m.errorRate} %`} />
              <Kpi icon={Cpu} label="CPU" value={`${m.cpu} %`} />
              <Kpi icon={Cpu} label="Mémoire" value={`${m.memory} %`} />
              <Kpi icon={Gauge} label="Disponibilité" value={`${m.uptime} %`} />
            </div>
            <div className="grid gap-4 lg:grid-cols-2">
              <div className="h-64"><p className="mb-2 text-sm font-medium">Requêtes par heure</p>
                <ResponsiveContainer><AreaChart data={m.history}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="time" fontSize={11} /><YAxis fontSize={11} /><Tooltip {...tip} /><Area dataKey="requests" name="Requêtes" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} /></AreaChart></ResponsiveContainer>
              </div>
              <div className="h-64"><p className="mb-2 text-sm font-medium">Temps de réponse (ms)</p>
                <ResponsiveContainer><LineChart data={m.history}><CartesianGrid strokeDasharray="3 3" stroke="var(--border)" /><XAxis dataKey="time" fontSize={11} /><YAxis fontSize={11} /><Tooltip {...tip} /><Line dataKey="latency" name="Latence" stroke="var(--chart-2)" dot={false} /></LineChart></ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </DataPanel>
      <DataPanel title="Services" icon={Activity} spec={specs.devHealth} demoData={services}>
        {(d: any) => (
          <ul className="divide-y text-sm">{(d.services ?? []).map((s: any) => <li key={s.name} className="flex items-center justify-between py-2"><span>{s.name}</span><span className="flex items-center gap-3"><span className="text-muted-foreground">{s.latency} ms</span><Pill tone={s.status === "up" ? "success" : s.status === "degraded" ? "warning" : "danger"}>{s.status}</Pill></span></li>)}</ul>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
