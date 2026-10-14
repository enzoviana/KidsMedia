import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { FileLock2, Download, ScrollText, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Panel, Pill, fmtDate } from "@/components/dash/widgets";
import { DemoBadge } from "@/components/dash/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { specs } from "@/lib/specs";
import { apiFetch, getSession, API_BASE } from "@/lib/api";
import { demoConsentements } from "@/lib/demo-medical";

export const Route = createFileRoute("/dev/rgpd")({
  head: () => ({
    meta: [
      { title: "Registre RGPD — Kids'Med IA" },
      { name: "description", content: "Registre des traitements et exports de preuves (journaux, consentements, demandes) pour un contrôle CNIL." },
      { property: "og:title", content: "Registre RGPD — Kids'Med IA" },
      { property: "og:description", content: "Sortir les documents RGPD en cas de contrôle." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo = {
  traitements: [
    { nom: "Dossiers médicaux des enfants", finalite: "Suivi de santé en crèche", baseLegale: "Consentement explicite des parents (art. 9.2.a)", duree: "Durée d'accueil + 3 ans" },
    { nom: "Comptes utilisateurs", finalite: "Authentification et MFA", baseLegale: "Exécution du contrat", duree: "Durée du compte + 1 an" },
    { nom: "Journaux de sécurité", finalite: "Traçabilité des accès", baseLegale: "Obligation légale / intérêt légitime", duree: "1 an" },
    { nom: "Analyses IA des symptômes", finalite: "Aide au diagnostic", baseLegale: "Consentement explicite", duree: "Durée d'accueil + 3 ans" },
    { nom: "Facturation", finalite: "Abonnements (Stripe)", baseLegale: "Obligation légale comptable", duree: "10 ans" },
  ],
  consentements: 184, demandes: 7, accesDossiers: 12480,
  incidents: [{ date: "2026-08-14", description: "Tentatives de connexion répétées bloquées (IP 45.12.8.2)", notifieCnil: false }],
};

const demoRows: Record<string, any[]> = {
  logs: [{ date: new Date().toISOString(), utilisateur: "Inès Garcia (rsai)", action: "consultation_dossier", enfant: "Léa Martin", adresse_ip: "82.64.1.10", device: "Samsung Galaxy S22" }],
  consentements: demoConsentements.map((c) => ({ enfant: "Léa Martin", type: c.type, accorde: c.accorde, signePar: `${c.signePar.prenom} ${c.signePar.nom}`, date: c.date })),
  demandes: [{ date: new Date().toISOString(), type: "effacement", demandeur: "Julien Bernard", statut: "recue" }],
};

function toCsv(rows: any[]) {
  if (!rows.length) return "";
  const keys = Object.keys(rows[0]);
  const esc = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;
  return [keys.join(";"), ...rows.map((r) => keys.map((k) => esc(r[k])).join(";"))].join("\n");
}

function download(name: string, content: string, type: string) {
  const a = document.createElement("a");
  a.href = URL.createObjectURL(new Blob(["\ufeff" + content], { type }));
  a.download = name; a.click(); URL.revokeObjectURL(a.href);
}

function Page() {
  const today = new Date().toISOString().slice(0, 10);
  const [du, setDu] = useState(new Date(Date.now() - 365 * 864e5).toISOString().slice(0, 10));
  const [au, setAu] = useState(today);

  async function exporter(type: "logs" | "consentements" | "demandes" | "tout", format: "csv" | "json") {
    const s = getSession();
    if (s && !s.demo && specs.rgpdExport.status === "ok") {
      window.open(`${API_BASE}/rgpd/export?type=${type}&format=${format}&du=${du}&au=${au}`, "_blank");
      return;
    }
    const data = type === "tout" ? { periode: { du, au }, registre: demo, ...demoRows } : demoRows[type]!;
    if (format === "json") download(`rgpd-${type}-${du}_${au}.json`, JSON.stringify(data, null, 2), "application/json");
    else download(`rgpd-${type}-${du}_${au}.csv`, type === "tout" ? toCsv(demo.traitements) : toCsv(data as any[]), "text/csv");
    toast.success("Export téléchargé (données de démonstration)");
    void apiFetch;
  }

  return (
    <DashboardShell title="Registre RGPD" actions={<Button onClick={() => window.print()} variant="outline"><ScrollText className="mr-1 h-4 w-4" />Imprimer / PDF</Button>}>
      <Panel title="Exports pour un contrôle" icon={Download} actions={<DemoBadge spec={specs.rgpdExport} reason="Route manquante dans l'API" />}>
        <div className="mb-4 flex flex-wrap items-end gap-3">
          <div><Label htmlFor="du">Du</Label><Input id="du" type="date" value={du} onChange={(e) => setDu(e.target.value)} /></div>
          <div><Label htmlFor="au">Au</Label><Input id="au" type="date" value={au} onChange={(e) => setAu(e.target.value)} /></div>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {([["logs", "Journaux d'accès"], ["consentements", "Consentements"], ["demandes", "Demandes RGPD"], ["tout", "Dossier complet"]] as const).map(([t, l]) => (
            <div key={t} className="rounded-xl border p-3">
              <p className="mb-2 font-medium">{l}</p>
              <div className="flex gap-2"><Button size="sm" onClick={() => exporter(t, "csv")}>CSV</Button><Button size="sm" variant="outline" onClick={() => exporter(t, "json")}>JSON</Button></div>
            </div>
          ))}
        </div>
      </Panel>
      <DataPanel title="Registre des traitements" icon={FileLock2} spec={specs.rgpdRegistre} demoData={demo}>
        {(d: any) => (
          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Consentements enregistrés</p><p className="font-display text-2xl font-semibold">{d.consentements}</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Demandes RGPD</p><p className="font-display text-2xl font-semibold">{d.demandes}</p></div>
              <div className="rounded-xl border p-3"><p className="text-xs text-muted-foreground">Accès aux dossiers tracés</p><p className="font-display text-2xl font-semibold">{d.accesDossiers}</p></div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-left text-xs uppercase tracking-wider text-muted-foreground"><tr><th className="py-2">Traitement</th><th>Finalité</th><th>Base légale</th><th>Conservation</th></tr></thead>
                <tbody>{(d.traitements ?? []).map((t: any) => <tr key={t.nom} className="border-t"><td className="py-2 font-medium">{t.nom}</td><td>{t.finalite}</td><td>{t.baseLegale}</td><td>{t.duree}</td></tr>)}</tbody>
              </table>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-1.5 text-sm font-medium"><ShieldCheck className="h-4 w-4" />Incidents de sécurité</p>
              <ul className="space-y-1 text-sm">{(d.incidents ?? []).map((i: any, k: number) => <li key={k} className="flex flex-wrap items-center justify-between gap-2"><span>{fmtDate(i.date)} — {i.description}</span><Pill tone={i.notifieCnil ? "success" : "default"}>{i.notifieCnil ? "Notifié CNIL" : "Non notifiable"}</Pill></li>)}</ul>
            </div>
          </div>
        )}
      </DataPanel>
    </DashboardShell>
  );
}
