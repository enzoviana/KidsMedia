import { ScanQrButton } from "@/components/dash/liaison";
import { createFileRoute } from "@tanstack/react-router";
import { Baby, Users, Pill as PillIcon, NotebookPen, FileText, MessageSquare, LayoutGrid, CalendarCheck, LayoutDashboard } from "lucide-react";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Legend } from "recharts";
import { DashboardShell, type NavGroup } from "@/components/dash/shell";
import { EnfantLink } from "@/components/dash/crud";
import { DataPanel, StatCard, Pill, Empty, fullName, fmtDate, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";

export const Route = createFileRoute("/creche")({
  head: () => ({
    meta: [
      { title: "Espace Crèche — Kids'Med IA" },
      { name: "description", content: "Enfants, sections, traitements et transmissions de votre crèche." },
      { property: "og:title", content: "Espace Crèche — Kids'Med IA" },
      { property: "og:description", content: "Le tableau de bord quotidien de la crèche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Creche,
});

const nav: NavGroup[] = [
  { label: "Général", items: [
    { label: "Tableau de bord", icon: LayoutDashboard, anchor: "top" },
    { label: "Enfants", icon: Baby, anchor: "enfants" },
    { label: "Sections", icon: LayoutGrid, anchor: "sections" },
    { label: "Personnel", icon: Users, anchor: "personnel" },
  ]},
  { label: "Quotidien", items: [
    { label: "Médicaments", icon: PillIcon, anchor: "medicaments" },
    { label: "Transmissions", icon: NotebookPen, anchor: "transmissions" },
    { label: "Documents", icon: FileText, anchor: "documents" },
    { label: "Messagerie", icon: MessageSquare, anchor: "messages" },
  ]},
];

const demoEnfants = [
  { prenom: "Léa", nom: "Martin", dateNaissance: "2024-03-12", section: "Bébés", allergies: ["Arachide"] },
  { prenom: "Noah", nom: "Bernard", dateNaissance: "2023-07-02", section: "Moyens", allergies: [] },
  { prenom: "Jade", nom: "Petit", dateNaissance: "2022-11-20", section: "Grands", allergies: ["Lactose"] },
  { prenom: "Lucas", nom: "Durand", dateNaissance: "2023-01-15", section: "Moyens", allergies: [] },
  { prenom: "Emma", nom: "Leroy", dateNaissance: "2024-05-30", section: "Bébés", allergies: [] },
];
const demoSections = [
  { nom: "Bébés", capacite: 12, effectif: 10 },
  { nom: "Moyens", capacite: 16, effectif: 15 },
  { nom: "Grands", capacite: 20, effectif: 17 },
];
const demoPresences = [
  { label: "Lun", presents: 38, absents: 4 }, { label: "Mar", presents: 40, absents: 2 }, { label: "Mer", presents: 29, absents: 13 },
  { label: "Jeu", presents: 41, absents: 1 }, { label: "Ven", presents: 36, absents: 6 },
];
const demoMedic = [
  { nom: "Doliprane 2,4 %", posologie: "5 ml", heure: "10:00", enfant: { prenom: "Léa", nom: "Martin" }, administre: true },
  { nom: "Ventoline", posologie: "2 bouffées", heure: "12:30", enfant: { prenom: "Noah", nom: "Bernard" }, administre: false },
  { nom: "Amoxicilline", posologie: "4 ml", heure: "16:00", enfant: { prenom: "Jade", nom: "Petit" }, administre: false },
];
const demoTrans = [
  { type: "repas", contenu: "A bien mangé, a fini son assiette.", enfant: { prenom: "Lucas" }, createdAt: new Date().toISOString() },
  { type: "sieste", contenu: "Sieste de 13h à 14h45.", enfant: { prenom: "Emma" }, createdAt: new Date().toISOString() },
  { type: "sante", contenu: "Légère fièvre à 37,9 °C, parents prévenus.", enfant: { prenom: "Léa" }, createdAt: new Date().toISOString() },
];
const demoDocs = [
  { type: "Certificat de vaccination", statut: "en_attente", enfant: { prenom: "Noah", nom: "Bernard" } },
  { type: "Attestation d'assurance", statut: "valide", enfant: { prenom: "Jade", nom: "Petit" } },
  { type: "PAI", statut: "rejete", enfant: { prenom: "Léa", nom: "Martin" } },
];
const demoMsgs = [
  { sujet: "Absence de Lucas demain", expediteur: { prenom: "Claire", nom: "Durand" }, createdAt: new Date().toISOString(), lu: false },
  { sujet: "Ordonnance Jade", expediteur: { prenom: "Dr", nom: "Moreau" }, createdAt: new Date().toISOString(), lu: true },
];

const statusTone = (s?: string): "default" | "success" | "warning" | "danger" => (s === "valide" ? "success" : s === "rejete" ? "danger" : "warning");

function Creche() {
  return (
    <DashboardShell role="creche" title="Tableau de bord crèche" groups={nav} actions={<ScanQrButton />}>
      <div id="top" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Enfants inscrits" icon={Baby} spec={specs.enfantsEtab} demoData={demoEnfants} pick={(d) => toList(d).length} trend={{ value: "+3 ce mois" }} />
        <StatCard label="Personnel actif" icon={Users} spec={specs.personnelStats} demoData={{ actifs: 14 }} pick={(d: any) => d.actifs ?? d.total ?? d.count} />
        <StatCard label="Médicaments du jour" icon={PillIcon} spec={specs.medicToday} demoData={demoMedic} pick={(d) => toList(d).length} />
        <StatCard label="Transmissions du jour" icon={NotebookPen} spec={specs.transToday} demoData={demoTrans} pick={(d) => toList(d).length} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel title="Présences de la semaine" icon={CalendarCheck} spec={specs.presences} demoData={demoPresences} className="xl:col-span-2">
          {(d) => (
            <div className="h-72">
              <ResponsiveContainer>
                <BarChart data={toList(d)} barGap={6}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="label" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip {...tip} cursor={{ fill: "var(--accent)" }} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="presents" name="Présents" stackId="a" fill="var(--chart-1)" radius={[0, 0, 6, 6]} />
                  <Bar dataKey="absents" name="Absents" stackId="a" fill="var(--chart-3)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </DataPanel>
        <DataPanel id="sections" title="Sections" icon={LayoutGrid} spec={specs.sections} demoData={demoSections}>
          {(d) => toList(d).length === 0 ? <Empty /> : (
            <ul className="space-y-4">
              {toList(d).map((s, i) => {
                const pct = s.capacite ? Math.round(((s.effectif ?? s.nombreEnfants ?? 0) / s.capacite) * 100) : 0;
                return (
                  <li key={i}>
                    <div className="mb-1 flex justify-between text-sm"><span className="font-medium">{s.nom}</span><span className="text-muted-foreground">{s.effectif ?? s.nombreEnfants ?? 0}/{s.capacite ?? "?"}</span></div>
                    <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Math.min(pct, 100)}%` }} /></div>
                  </li>
                );
              })}
            </ul>
          )}
        </DataPanel>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="medicaments" title="Médicaments à administrer" icon={PillIcon} spec={specs.medicToday} demoData={demoMedic}>
          {(d) => toList(d).length === 0 ? <Empty text="Aucun médicament aujourd'hui" /> : (
            <ul className="divide-y">
              {toList(d).map((m, i) => (
                <li key={i} className="flex items-center justify-between gap-3 py-3 text-sm">
                  <div className="min-w-0"><p className="truncate font-medium">{m.nom ?? m.medicament}</p><p className="text-muted-foreground"><EnfantLink e={m.enfant} className="font-medium text-primary hover:underline" /> · {m.posologie ?? m.dosage}</p></div>
                  <div className="flex shrink-0 items-center gap-2"><span className="font-mono text-xs">{m.heure ?? "—"}</span><Pill tone={m.administre ? "success" : "warning"}>{m.administre ? "Fait" : "À faire"}</Pill></div>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
        <DataPanel id="transmissions" title="Cahier de liaison — aujourd'hui" icon={NotebookPen} spec={specs.transToday} demoData={demoTrans}>
          {(d) => toList(d).length === 0 ? <Empty /> : (
            <ul className="space-y-3">
              {toList(d).slice(0, 6).map((t, i) => (
                <li key={i} className="rounded-xl bg-muted/60 p-3 text-sm">
                  <div className="mb-1 flex items-center gap-2"><Pill>{t.type ?? "note"}</Pill><EnfantLink e={t.enfant} /></div>
                  <p className="text-muted-foreground">{t.contenu ?? t.message ?? t.description}</p>
                </li>
              ))}
            </ul>
          )}
        </DataPanel>
      </div>

      <DataPanel id="enfants" title="Enfants" icon={Baby} spec={specs.enfantsEtab} demoData={demoEnfants}>
        {(d) => toList(d).length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Enfant</th><th className="pb-3">Naissance</th><th className="pb-3">Section</th><th className="pb-3">Allergies</th></tr></thead>
              <tbody className="divide-y">
                {toList(d).slice(0, 10).map((e, i) => (
                  <tr key={i}>
                    <td className="py-3"><EnfantLink e={e} /></td>
                    <td className="py-3 text-muted-foreground">{fmtDate(e.dateNaissance)}</td>
                    <td className="py-3">{typeof e.section === "object" ? e.section?.nom : e.section ?? "—"}</td>
                    <td className="py-3">{(e.allergies ?? []).length ? (e.allergies as string[]).map((a) => <Pill key={a} tone="danger">{a}</Pill>) : <span className="text-muted-foreground">Aucune</span>}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </DataPanel>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel id="personnel" title="Personnel" icon={Users} spec={specs.personnel} demoData={[{ prenom: "Sophie", nom: "Roux", poste: "Auxiliaire" }, { prenom: "Karim", nom: "Ali", poste: "EJE" }, { prenom: "Inès", nom: "Blanc", poste: "Directrice" }]}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 6).map((p, i) => <li key={i} className="flex justify-between py-2.5"><span className="font-medium">{fullName(p)}</span><span className="text-muted-foreground">{p.poste ?? p.fonction ?? p.role}</span></li>)}</ul>}
        </DataPanel>
        <DataPanel id="documents" title="Documents" icon={FileText} spec={specs.docsEtab} demoData={demoDocs}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 6).map((doc, i) => <li key={i} className="flex items-center justify-between gap-2 py-2.5"><div className="min-w-0"><p className="truncate font-medium">{doc.type ?? doc.nom}</p><p className="text-muted-foreground">{fullName(doc.enfant)}</p></div><Pill tone={statusTone(doc.statut)}>{doc.statut ?? "—"}</Pill></li>)}</ul>}
        </DataPanel>
        <DataPanel id="messages" title="Messages reçus" icon={MessageSquare} spec={specs.messagesRecus} demoData={demoMsgs}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 6).map((m, i) => <li key={i} className="py-2.5"><div className="flex items-center gap-2">{!m.lu && <span className="h-2 w-2 rounded-full bg-primary" />}<p className="truncate font-medium">{m.sujet ?? m.objet ?? "Message"}</p></div><p className="text-muted-foreground">{fullName(m.expediteur)} · {fmtDate(m.createdAt)}</p></li>)}</ul>}
        </DataPanel>
      </div>
    </DashboardShell>
  );
}
