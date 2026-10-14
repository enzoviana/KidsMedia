import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Users, Building2, CreditCard, Tag, ScrollText, Activity, LayoutDashboard, Euro, DatabaseZap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, Legend } from "recharts";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { DashboardShell, type NavGroup } from "@/components/dash/shell";
import { DataPanel, StatCard, Pill, Empty, fullName, fmtDate, tip } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { apiFetch, getSession, toList } from "@/lib/api";
import { MigrationPanel } from "@/components/dash/migrations";

export const Route = createFileRoute("/admin/")({
  head: () => ({
    meta: [
      { title: "Administration — Kids'Med IA" },
      { name: "description", content: "Utilisateurs, établissements, abonnements, tarifs et journaux de la plateforme." },
      { property: "og:title", content: "Administration — Kids'Med IA" },
      { property: "og:description", content: "Le tableau de bord d'administration de Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Admin,
});

const nav: NavGroup[] = [
  { label: "Plateforme", items: [
    { label: "Tableau de bord", icon: LayoutDashboard, anchor: "top" },
    { label: "Utilisateurs", icon: Users, anchor: "utilisateurs" },
    { label: "Établissements", icon: Building2, anchor: "etablissements" },
  ]},
  { label: "Commercial", items: [
    { label: "Abonnements", icon: CreditCard, anchor: "abonnements" },
    { label: "Tarifs", icon: Tag, anchor: "tarifs" },
  ]},
  { label: "Système", items: [
    { label: "Journaux", icon: ScrollText, anchor: "journaux" },
    { label: "Santé API", icon: Activity, anchor: "top" },
  ]},
];

const demoUsers = [
  { _id: "1", prenom: "Inès", nom: "Blanc", email: "ines@lutins.fr", role: "creche", isActive: true },
  { _id: "2", prenom: "Paul", nom: "Moreau", email: "p.moreau@cabinet.fr", role: "medecin", isActive: true },
  { _id: "3", prenom: "Nadia", nom: "Fabre", email: "nadia@rsai.fr", role: "rsai", isActive: false },
  { _id: "4", prenom: "Claire", nom: "Durand", email: "claire@mail.fr", role: "parent", isActive: true },
];
const demoEtabs = [
  { nom: "Crèche Les Lutins", ville: "Lyon", type: "creche", capacite: 48, isActive: true },
  { nom: "Micro-crèche Soleil", ville: "Paris", type: "micro-creche", capacite: 12, isActive: true },
  { nom: "Crèche Arc-en-ciel", ville: "Nantes", type: "creche", capacite: 60, isActive: false },
];
const demoRevenus = [
  { mois: "Mai", essentiel: 1200, premium: 2400, entreprise: 900 }, { mois: "Juin", essentiel: 1350, premium: 2600, entreprise: 900 },
  { mois: "Juil", essentiel: 1400, premium: 2550, entreprise: 1800 }, { mois: "Août", essentiel: 1380, premium: 2700, entreprise: 1800 },
  { mois: "Sep", essentiel: 1600, premium: 3100, entreprise: 2700 }, { mois: "Oct", essentiel: 1720, premium: 3350, entreprise: 2700 },
];
const demoLogs = [
  { type: "auth", action: "Connexion", user: { prenom: "Inès", nom: "Blanc" }, createdAt: new Date().toISOString() },
  { type: "data", action: "Création dossier enfant", user: { prenom: "Inès", nom: "Blanc" }, createdAt: new Date().toISOString() },
  { type: "security", action: "Échec de connexion", user: { email: "inconnu@x.fr" }, createdAt: new Date().toISOString() },
];

function UserRow({ u, demo }: { u: any; demo: boolean }) {
  const qc = useQueryClient();
  const [active, setActive] = useState<boolean>(u.isActive ?? true);
  async function toggle(v: boolean) {
    setActive(v);
    if (demo || getSession()?.demo) return;
    try {
      await apiFetch(`/users/${u._id ?? u.id}/status`, { method: "PATCH", body: JSON.stringify({ isActive: v }) });
      toast.success(v ? "Compte activé" : "Compte désactivé");
      qc.invalidateQueries({ queryKey: ["api", "users"] });
    } catch (e) {
      setActive(!v);
      toast.error((e as Error).message);
    }
  }
  return (
    <tr>
      <td className="py-3"><p className="font-medium">{fullName(u)}</p><p className="text-xs text-muted-foreground">{u.email}</p></td>
      <td className="py-3"><Pill>{u.role}</Pill></td>
      <td className="py-3 text-muted-foreground">{fmtDate(u.createdAt) }</td>
      <td className="py-3 text-right"><Switch checked={active} onCheckedChange={toggle} aria-label="Activer le compte" /></td>
    </tr>
  );
}


function Admin() {
  return (
    <DashboardShell role="admin" title="Administration" groups={nav}>
      <div id="top" className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Utilisateurs" icon={Users} spec={specs.users} demoData={demoUsers} pick={(d) => toList(d).length} trend={{ value: "+12 %" }} />
        <StatCard label="Établissements" icon={Building2} spec={specs.etabs} demoData={demoEtabs} pick={(d) => toList(d).length} />
        <StatCard label="Abonnements actifs" icon={CreditCard} spec={specs.abosStats} demoData={{ actifs: 27 }} pick={(d: any) => d.actifs ?? d.total} />
        <StatCard label="État de l'API" icon={Activity} spec={specs.health} demoData={{ message: "running" }} pick={(d: any) => (d?.message || d?.status ? "En ligne" : "—")} />
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <DataPanel id="abonnements" title="Revenus mensuels par plan" icon={Euro} spec={specs.revenus} demoData={demoRevenus} className="xl:col-span-2">
          {(d) => (
            <div className="h-72">
              <ResponsiveContainer>
                <AreaChart data={toList(d)}>
                  <CartesianGrid vertical={false} stroke="var(--border)" />
                  <XAxis dataKey="mois" axisLine={false} tickLine={false} tick={{ fill: "var(--muted-foreground)", fontSize: 12 }} />
                  <Tooltip {...tip} formatter={(v: number) => `${v} €`} />
                  <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
                  <Area type="monotone" stackId="1" dataKey="essentiel" name="Essentiel" stroke="var(--chart-3)" fill="var(--chart-3)" fillOpacity={0.6} />
                  <Area type="monotone" stackId="1" dataKey="premium" name="Premium" stroke="var(--chart-2)" fill="var(--chart-2)" fillOpacity={0.6} />
                  <Area type="monotone" stackId="1" dataKey="entreprise" name="Entreprise" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.7} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          )}
        </DataPanel>
        <DataPanel id="tarifs" title="Tarifs actifs" icon={Tag} spec={specs.tarifs} demoData={[{ plan: "Essentiel", prix: 49 }, { plan: "Premium", prix: 99 }, { plan: "Entreprise", prix: 299 }]}>
          {(d) => <ul className="space-y-3">{toList(d).map((t, i) => <li key={i} className="flex items-center justify-between rounded-xl bg-muted/60 p-3 text-sm"><span className="font-medium capitalize">{t.plan ?? t.nom}</span><span className="font-display text-lg font-semibold">{t.prix ?? t.prixMensuel ?? "—"} €<span className="text-xs font-normal text-muted-foreground">/mois</span></span></li>)}</ul>}
        </DataPanel>
      </div>

      <DataPanel id="utilisateurs" title="Utilisateurs" icon={Users} spec={specs.users} demoData={demoUsers}>
        {(d) => toList(d).length === 0 ? <Empty /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="pb-3">Nom</th><th className="pb-3">Rôle</th><th className="pb-3">Créé le</th><th className="pb-3 text-right">Actif</th></tr></thead>
              <tbody className="divide-y">{toList(d).slice(0, 12).map((u, i) => <UserRow key={u._id ?? i} u={u} demo={d === demoUsers} />)}</tbody>
            </table>
          </div>
        )}
      </DataPanel>

      <div className="grid gap-6 xl:grid-cols-2">
        <DataPanel id="etablissements" title="Établissements" icon={Building2} spec={specs.etabs} demoData={demoEtabs}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 8).map((e, i) => <li key={i} className="flex items-center justify-between py-2.5"><div><p className="font-medium">{e.nom}</p><p className="text-muted-foreground">{e.ville ?? "—"} · {e.capacite ?? "?"} places</p></div><Pill tone={e.isActive === false ? "danger" : "success"}>{e.isActive === false ? "Inactif" : "Actif"}</Pill></li>)}</ul>}
        </DataPanel>
        <DataPanel id="journaux" title="Journaux récents" icon={ScrollText} spec={specs.logs} demoData={demoLogs}>
          {(d) => <ul className="divide-y text-sm">{toList(d).slice(0, 8).map((l, i) => <li key={i} className="flex items-center justify-between gap-2 py-2.5"><div className="min-w-0"><p className="truncate font-medium">{l.action ?? l.message}</p><p className="text-muted-foreground">{fullName(l.user ?? l.userId)} · {fmtDate(l.createdAt)}</p></div><Pill tone={l.type === "security" ? "danger" : "default"}>{l.type}</Pill></li>)}</ul>}
        </DataPanel>
      </div>

      <MigrationPanel />
    </DashboardShell>
  );
}
