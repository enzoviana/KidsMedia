import { ScanQrButton } from "@/components/dash/liaison";
import { createFileRoute } from "@tanstack/react-router";
import { Stethoscope, Users, ClipboardList, Brain, CalendarClock, MessageSquare, LayoutDashboard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Legend } from "recharts";
import { DashboardShell, type NavGroup } from "@/components/dash/shell";
import { EnfantLink } from "@/components/dash/crud";
import { DataPanel, StatCard, Pill, Empty, fullName, fmtDate, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";

export const Route = createFileRoute("/medecin")({
  head: () => ({
    meta: [
      { title: "Espace Médecin — Kids'Med IA" },
      { name: "description", content: "Patients, ordonnances, consultations et diagnostics IA du médecin." },
      { property: "og:title", content: "Espace Médecin — Kids'Med IA" },
      { property: "og:description", content: "Le tableau de bord du médecin référent." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Medecin,
});

const nav: NavGroup[] = [
  { label: "Cabinet", items: [
    { label: "Tableau de bord", icon: LayoutDashboard, anchor: "top" },
    { label: "Agenda", icon: CalendarClock, anchor: "agenda" },
    { label: "Patients", icon: Users, anchor: "patients" },
  ]},
  { label: "Soins", items: [
    { label: "Ordonnances", icon: ClipboardList, anchor: "ordonnances" },
    { label: "Diagnostics IA", icon: Brain, anchor: "diagnostics" },
    { label: "Messagerie", icon: MessageSquare, anchor: "messages" },
  ]},
];

const demoStats = {
  patients: 128, consultationsMois: 46, ordonnancesMois: 31,
  parMois: [
    { mois: "Mai", consultations: 38, ordonnances: 22 }, { mois: "Juin", consultations: 41, ordonnances: 27 }, { mois: "Juil", consultations: 25, ordonnances: 14 },
    { mois: "Août", consultations: 18, ordonnances: 10 }, { mois: "Sep", consultations: 52, ordonnances: 35 }, { mois: "Oct", consultations: 46, ordonnances: 31 },
  ],
};
const demoRdv = [
  { heure: "09:00", enfant: { prenom: "Léa", nom: "Martin" }, motif: "Fièvre", etablissement: "Crèche Les Lutins" },
  { heure: "10:30", enfant: { prenom: "Noah", nom: "Bernard" }, motif: "Suivi asthme", etablissement: "Crèche Les Lutins" },
  { heure: "14:00", enfant: { prenom: "Inès", nom: "Garcia" }, motif: "Visite d'admission", etablissement: "Micro-crèche Soleil" },
];
const demoOrdo = [
  { enfant: { prenom: "Jade", nom: "Petit" }, medicaments: [{ nom: "Amoxicilline" }], dateDebut: "2026-10-05", dateFin: "2026-10-12", statut: "active" },
  { enfant: { prenom: "Noah", nom: "Bernard" }, medicaments: [{ nom: "Ventoline" }], dateDebut: "2026-09-01", dateFin: "2026-12-01", statut: "active" },
  { enfant: { prenom: "Lucas", nom: "Durand" }, medicaments: [{ nom: "Doliprane" }], dateDebut: "2026-08-10", dateFin: "2026-08-15", statut: "expiree" },
];
const demoPatients = [
  { prenom: "Léa", nom: "Martin", dateNaissance: "2024-03-12", allergies: ["Arachide"] },
  { prenom: "Noah", nom: "Bernard", dateNaissance: "2023-07-02", allergies: [] },
  { prenom: "Jade", nom: "Petit", dateNaissance: "2022-11-20", allergies: ["Lactose"] },
  { prenom: "Inès", nom: "Garcia", dateNaissance: "2024-01-08", allergies: [] },
];

function Medecin() {
  return (
    <DashboardShell role="medecin" title="Mon cabinet" groups={nav} actions={<ScanQrButton />}>
      <div id="top" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Patients" icon={Users} spec={specs.enfants} demoData={demoPatients} pick={(d) => toList(d).length} />
        <StatCard label="Consultations ce mois" icon={Stethoscope} spec={specs.medecinStats} demoData={demoStats} pick={(d) => d.consultationsMois} trend={{ value: "-12 %", up: false }} />
        <StatCard label="Ordonnances" icon={ClipboardList} spec={specs.ordoMedecin} demoData={demoOrdo} pick={(d) => toList(d).length} />
        <StatCard label="Diagnostics IA" icon={Brain} spec={specs.diagStats} demoData={{ total: 23 }} pick={(d: any) => d.total} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel title="Activité mensuelle" icon={Stethoscope} spec={specs.medecinStats} demoData={demoStats} className="xl:col-span-2">
          {(d) => (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={d.parMois ?? []} barGap={4}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="consultations" name="Consultations" fill="var(--chart-2)" radius={[6, 6, 0, 0]} />
                  <Bar dataKey="ordonnances" name="Ordonnances" fill="var(--chart-5)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DataPanel>
        <DataPanel id="agenda" title="Agenda du jour" icon={CalendarClock} spec={specs.rdv} demoData={demoRdv}>
          {(d) => <ul className="space-y-3">{toList(d).map((r, i) => <li key={i} className="flex gap-3 rounded-xl bg-muted/60 p-3 text-sm"><span className="font-mono text-xs font-semibold text-primary">{r.heure}</span><div className="min-w-0"><p className="font-medium"><EnfantLink e={r.enfant} className="font-medium text-primary hover:underline" /></p><p className="truncate text-muted-foreground">{r.motif} · {r.etablissement}</p></div></li>)}</ul>}
        </DataPanel>
      </div>

      <DataPanel id="ordonnances" title="Mes ordonnances" icon={ClipboardList} spec={specs.ordoMedecin} demoData={demoOrdo}>
        {(d) => toList(d).length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Patient</th><th className="pb-3">Médicaments</th><th className="pb-3">Période</th><th className="pb-3">Statut</th></tr></thead>
              <tbody className="divide-y">
                {toList(d).slice(0, 10).map((o, i) => (
                  <tr key={i}>
                    <td className="py-3 font-medium"><EnfantLink e={o.enfant} className="font-medium text-primary hover:underline" /></td>
                    <td className="py-3">{(o.medicaments ?? []).map((m: any) => m.nom ?? m).join(", ") || "—"}</td>
                    <td className="py-3 text-muted-foreground">{fmtDate(o.dateDebut)} → {fmtDate(o.dateFin)}</td>
                    <td className="py-3"><Pill tone={o.statut === "active" ? "success" : "default"}>{o.statut ?? "—"}</Pill></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="patients" title="Patients" icon={Users} spec={specs.enfants} demoData={demoPatients}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 8).map((p, i) => <li key={i} className="flex items-center justify-between py-2.5"><div><p><EnfantLink e={p} /></p><p className="text-muted-foreground">Né(e) le {fmtDate(p.dateNaissance)}</p></div>{(p.allergies ?? []).length > 0 && <Pill tone="danger">{p.allergies.length} allergie(s)</Pill>}</li>)}</ul>}
        </DataPanel>
        <DataPanel id="messages" title="Messages reçus" icon={MessageSquare} spec={specs.messagesRecus} demoData={[{ sujet: "Fièvre de Léa", expediteur: { prenom: "Crèche", nom: "Les Lutins" }, createdAt: new Date().toISOString(), lu: false }]}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 6).map((m, i) => <li key={i} className="py-2.5"><div className="flex items-center gap-2">{!m.lu && <span className="h-2 w-2 rounded-full bg-primary" />}<p className="font-medium">{m.sujet ?? m.objet ?? "Message"}</p></div><p className="text-muted-foreground">{fullName(m.expediteur)} · {fmtDate(m.createdAt)}</p></li>)}</ul>}
        </DataPanel>
      </div>
      <div id="diagnostics" />
    </DashboardShell>
  );
}
