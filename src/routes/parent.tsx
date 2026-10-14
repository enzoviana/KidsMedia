import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { qrDataUrl } from "@/lib/qr";
import { Baby, QrCode, NotebookPen, BellRing, Sparkles, Maximize2, Syringe, ScrollText } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Pill, Empty, fullName, fmtDate } from "@/components/dash/widgets";
import { DeclarerEnfantButton, LierCodeButton } from "@/components/dash/liaison";
import { AbsenceButton, TemperatureButton } from "@/components/dash/terrain";
import { RgpdButton } from "@/components/dash/medical";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";
import { demoEnfants, enfantIdOf } from "@/lib/demo-enfants";

export const Route = createFileRoute("/parent")({
  head: () => ({
    meta: [
      { title: "Espace parent — Kids'Med IA" },
      { name: "description", content: "La journée de votre enfant à la crèche, son carnet de santé, son QR code d'urgence et les alertes." },
      { property: "og:title", content: "Espace parent — Kids'Med IA" },
      { property: "og:description", content: "Suivez la santé et la journée de votre enfant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demoMine = demoEnfants.slice(0, 2).map((e, i) => ({ ...e, etablissement: { nom: "Les Petits Soleils" }, aujourdhui: i === 0 ? { present: true, humeur: "Joyeuse", repas: "A tout mangé", sieste: "13h05 – 14h40" } : { present: false } }));
const demoTrans = [
  { enfant: { prenom: "Léa" }, type: "repas", contenu: "Purée de carottes, compote : tout mangé.", createdAt: new Date().toISOString() },
  { enfant: { prenom: "Léa" }, type: "sieste", contenu: "Sieste de 1h35, calme.", createdAt: new Date().toISOString() },
  { enfant: { prenom: "Léa" }, type: "sante", contenu: "Température 37,6 °C à 15h, à surveiller.", createdAt: new Date().toISOString() },
];
const demoAlertes = [{ enfant: { prenom: "Léa" }, niveau: "moyen", message: "Analyse IA : rhinopharyngite probable (78 %). Consultation conseillée sous 24 h.", createdAt: new Date().toISOString() }];

function QrButton({ e }: { e: any }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  useEffect(() => {
    if (open) { try { setQr(qrDataUrl(`${window.location.origin}/enfants/${enfantIdOf(e)}?urgence=${e.codeLiaison ?? ""}`, 420)); } catch { setQr(""); } }
  }, [open, e]);
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><QrCode className="mr-1 h-4 w-4" />QR code d'urgence</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md text-center">
          <DialogHeader><DialogTitle>QR code médical — {fullName(e)}</DialogTitle></DialogHeader>
          {qr && <img src={qr} alt={`QR code médical de ${e.prenom}`} className="mx-auto w-full max-w-xs rounded-xl bg-background p-2" />}
          <p className="text-sm">Groupe sanguin <strong>{e.groupeSanguin ?? "—"}</strong> · Allergies <strong>{(e.allergies ?? []).join(", ") || "aucune"}</strong></p>
          <p className="text-xs text-muted-foreground">À présenter au médecin ou aux urgences : le scan ouvre le dossier médical.</p>
          <Button variant="outline" onClick={() => document.documentElement.requestFullscreen?.()}><Maximize2 className="mr-1 h-4 w-4" />Plein écran</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

function Page() {
  return (
    <DashboardShell role="parent" title="Bonjour" actions={<div className="flex flex-wrap gap-2"><DeclarerEnfantButton /><LierCodeButton /><RgpdButton /></div>}>
      <DataPanel title="Mes enfants" icon={Baby} spec={specs.parentEnfants} demoData={demoMine}>
        {(d) => (
          <div className="grid gap-4 md:grid-cols-2">
            {toList(d).map((e) => {
              const id = enfantIdOf(e) ?? "";
              const a = e.aujourdhui ?? {};
              return (
                <div key={id} className="rounded-2xl border bg-accent/40 p-4">
                  <div className="mb-3 flex items-start justify-between gap-2">
                    <div>
                      <p className="font-display text-xl font-semibold">{fullName(e)}</p>
                      <p className="text-xs text-muted-foreground">{e.etablissement?.nom} · né(e) le {fmtDate(e.dateNaissance)}</p>
                    </div>
                    <Pill tone={a.present ? "success" : "default"}>{a.present ? "À la crèche" : "Absent(e)"}</Pill>
                  </div>
                  {a.present && <div className="mb-3 grid grid-cols-3 gap-2 text-xs"><div><p className="text-muted-foreground">Humeur</p><p className="font-medium">{a.humeur}</p></div><div><p className="text-muted-foreground">Repas</p><p className="font-medium">{a.repas}</p></div><div><p className="text-muted-foreground">Sieste</p><p className="font-medium">{a.sieste}</p></div></div>}
                  <div className="flex flex-wrap gap-2">
                    <QrButton e={e} />
                    <AbsenceButton enfantId={id} prenom={e.prenom} />
                    <TemperatureButton enfantId={id} />
                    <Button size="sm" variant="outline" asChild><Link to="/enfants/$enfantId" params={{ enfantId: id }}><Syringe className="mr-1 h-4 w-4" />Carnet de santé</Link></Button>
                    <Button size="sm" variant="outline" asChild><Link to="/analyse-ia" search={{ enfant: id }}><Sparkles className="mr-1 h-4 w-4" />Symptôme</Link></Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </DataPanel>
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <DataPanel title="Alertes santé" icon={BellRing} spec={specs.parentAlertes} demoData={demoAlertes}>
          {(d) => toList(d).length ? (
            <ul className="space-y-2 text-sm">{toList(d).map((x, i) => <li key={i} className="flex gap-2"><Pill tone={x.niveau === "eleve" ? "danger" : x.niveau === "moyen" ? "warning" : "default"}>{x.enfant?.prenom}</Pill><span>{x.message}</span></li>)}</ul>
          ) : <Empty text="Aucune alerte" />}
        </DataPanel>
        <DataPanel title="Journée à la crèche" icon={NotebookPen} spec={specs.parentTrans} demoData={demoTrans}>
          {(d) => toList(d).length ? (
            <ul className="space-y-2 text-sm">{toList(d).map((t, i) => <li key={i} className="border-b pb-2 last:border-0"><span className="mr-2 text-xs uppercase text-muted-foreground">{t.enfant?.prenom} · {t.type}</span>{t.contenu}</li>)}</ul>
          ) : <Empty text="Pas encore de transmission aujourd'hui" />}
        </DataPanel>
      </div>
      <div className="mt-4">
        <Button variant="outline" asChild><Link to="/ordonnances"><ScrollText className="mr-1 h-4 w-4" />Ordonnances</Link></Button>
      </div>
    </DashboardShell>
  );
}
