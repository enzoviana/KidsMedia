import { ScanQrButton } from "@/components/dash/liaison";
import { createFileRoute } from "@tanstack/react-router";
import { HeartPulse, Syringe, AlertTriangle, Pill as PillIcon, Brain, FileCheck, ClipboardList, LayoutDashboard, Baby } from "lucide-react";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Legend, PieChart, Pie, Cell } from "recharts";
import { DashboardShell, type NavGroup } from "@/components/dash/shell";
import { EnfantLink } from "@/components/dash/crud";
import { DataPanel, StatCard, Pill, Empty, fullName, fmtDate, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";

export const Route = createFileRoute("/rsai")({
  head: () => ({
    meta: [
      { title: "Espace RSAI — Kids'Med IA" },
      { name: "description", content: "Suivi santé de l'établissement : traitements, diagnostics IA, alertes et documents obligatoires." },
      { property: "og:title", content: "Espace RSAI — Kids'Med IA" },
      { property: "og:description", content: "Le tableau de bord santé du référent RSAI." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Rsai,
});

const nav: NavGroup[] = [
  { label: "Santé", items: [
    { label: "Vue d'ensemble", icon: LayoutDashboard, anchor: "top" },
    { label: "Alertes", icon: AlertTriangle, anchor: "alertes" },
    { label: "Traitements", icon: PillIcon, anchor: "traitements" },
    { label: "Diagnostics IA", icon: Brain, anchor: "diagnostics" },
  ]},
  { label: "Conformité", items: [
    { label: "Ordonnances", icon: ClipboardList, anchor: "ordonnances" },
    { label: "Docs obligatoires", icon: FileCheck, anchor: "documents" },
  ]},
];

const demoSante = {
  vaccinsAJour: 92, allergiques: 7, pai: 3, traitementsEnCours: 5,
  evolution: [
    { mois: "Avr", consultations: 18, alertes: 4 }, { mois: "Mai", consultations: 22, alertes: 6 }, { mois: "Juin", consultations: 15, alertes: 3 },
    { mois: "Juil", consultations: 9, alertes: 1 }, { mois: "Sep", consultations: 26, alertes: 8 }, { mois: "Oct", consultations: 21, alertes: 5 },
  ],
};
const demoDiag = { total: 48, parGravite: [{ name: "Faible", value: 30 }, { name: "Moyenne", value: 14 }, { name: "Élevée", value: 4 }] };
const demoAlertes = [
  { enfant: { prenom: "Léa", nom: "Martin" }, symptome: "Fièvre 38,6 °C", gravite: "elevee", createdAt: new Date().toISOString() },
  { enfant: { prenom: "Noah", nom: "Bernard" }, symptome: "Toux persistante", gravite: "moyenne", createdAt: new Date().toISOString() },
  { enfant: { prenom: "Emma", nom: "Leroy" }, symptome: "Éruption cutanée", gravite: "faible", createdAt: new Date().toISOString() },
];
const demoMedic = [
  { nom: "Ventoline", enfant: { prenom: "Noah", nom: "Bernard" }, heure: "12:30", administre: false },
  { nom: "Amoxicilline", enfant: { prenom: "Jade", nom: "Petit" }, heure: "16:00", administre: false },
  { nom: "Doliprane", enfant: { prenom: "Léa", nom: "Martin" }, heure: "10:00", administre: true },
];
const demoOblig = [
  { nom: "Certificat de vaccination", obligatoire: true, taux: 92 },
  { nom: "Attestation d'assurance", obligatoire: true, taux: 100 },
  { nom: "Autorisation de sortie", obligatoire: true, taux: 76 },
  { nom: "PAI", obligatoire: false, taux: 60 },
];
const grav = (g?: string): "default" | "success" | "warning" | "danger" => (g === "elevee" ? "danger" : g === "moyenne" ? "warning" : "default");

function Rsai() {
  return (
    <DashboardShell role="rsai" title="Suivi santé de l'établissement" groups={nav} actions={<ScanQrButton />}>
      <div id="top" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Vaccins à jour" icon={Syringe} spec={specs.sante} demoData={demoSante} pick={(d) => `${d.vaccinsAJour} %`} trend={{ value: "+4 %" }} />
        <StatCard label="Enfants suivis" icon={Baby} spec={specs.enfantsEtab} demoData={new Array(42).fill({})} pick={(d) => toList(d).length} />
        <StatCard label="Traitements en cours" icon={PillIcon} spec={specs.medicStats} demoData={{ actifs: 5 }} pick={(d: any) => d.actifs ?? d.total} />
        <StatCard label="Diagnostics IA" icon={Brain} spec={specs.diagStats} demoData={demoDiag} pick={(d: any) => d.total} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel title="Consultations & alertes" icon={HeartPulse} spec={specs.sante} demoData={demoSante} className="xl:col-span-2">
          {(d) => (
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={d.evolution ?? []}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.5} /><stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} /></linearGradient>
                  </defs>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip {...tip} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" dataKey="consultations" name="Consultations" stroke="var(--chart-2)" fill="url(#g1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="alertes" name="Alertes" stroke="var(--brand-pink)" fill="transparent" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </DataPanel>
        <DataPanel id="diagnostics" title="Diagnostics IA par gravité" icon={Brain} spec={specs.diagStats} demoData={demoDiag}>
          {(d: any) => {
            const data = d.parGravite ?? [];
            return data.length === 0 ? <Empty /> : (
              <div className="h-64">
                <ResponsiveContainer>
                  <PieChart>
                    <Pie data={data} dataKey="value" nameKey="name" innerRadius={55} outerRadius={85} paddingAngle={3}>
                      {data.map((_: unknown, i: number) => <Cell key={i} fill={`var(--chart-${i + 1})`} />)}
                    </Pie>
                    <Tooltip {...tip} /><Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            );
          }}
        </DataPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="alertes" title="Alertes symptômes" icon={AlertTriangle} spec={specs.alertes} demoData={demoAlertes}>
          {(d) => <ul className="divide-y text-sm">{toList(d).map((a, i) => <li key={i} className="flex items-center justify-between gap-2 py-3"><div><p className="font-medium"><EnfantLink e={a.enfant} className="font-medium text-primary hover:underline" /></p><p className="text-muted-foreground">{a.symptome} · {fmtDate(a.createdAt)}</p></div><Pill tone={grav(a.gravite)}>{a.gravite}</Pill></li>)}</ul>}
        </DataPanel>
        <DataPanel id="traitements" title="Traitements du jour" icon={PillIcon} spec={specs.medicToday} demoData={demoMedic}>
          {(d) => toList(d).length === 0 ? <Empty /> : <ul className="divide-y text-sm">{toList(d).map((m, i) => <li key={i} className="flex items-center justify-between py-3"><div><p className="font-medium">{m.nom ?? m.medicament}</p><p className="text-muted-foreground"><EnfantLink e={m.enfant} className="font-medium text-primary hover:underline" /></p></div><div className="flex items-center gap-2"><span className="font-mono text-xs">{m.heure ?? "—"}</span><Pill tone={m.administre ? "success" : "warning"}>{m.administre ? "Fait" : "À faire"}</Pill></div></li>)}</ul>}
        </DataPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="documents" title="Documents obligatoires" icon={FileCheck} spec={specs.docsOblig} demoData={demoOblig}>
          {(d) => <ul className="space-y-4">{toList(d).map((o, i) => <li key={i}><div className="mb-1 flex justify-between text-sm"><span className="font-medium">{o.nom}</span><span className="text-muted-foreground">{o.taux != null ? `${o.taux} %` : o.obligatoire ? "Obligatoire" : "Facultatif"}</span></div>{o.taux != null && <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${o.taux}%` }} /></div>}</li>)}</ul>}
        </DataPanel>
        <DataPanel id="ordonnances" title="Ordonnances" icon={ClipboardList} spec={specs.ordoStats} demoData={{ total: 34, actives: 9, expirees: 25 }}>
          {(d: any) => (
            <div className="grid grid-cols-3 gap-3 text-center">
              {[["Total", d.total], ["Actives", d.actives], ["Expirées", d.expirees]].map(([l, v]) => (
                <div key={l as string} className="rounded-xl bg-muted/60 p-4"><p className="font-display text-2xl font-semibold">{(v as number) ?? "—"}</p><p className="text-xs text-muted-foreground">{l}</p></div>
              ))}
            </div>
          )}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
