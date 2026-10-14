import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowLeft, Baby, Pill as PillIcon, ScrollText, BrainCircuit, NotebookPen, FileText, QrCode, Printer } from "lucide-react";
import { DashboardShell } from "@/components/dash/shell";
import { EnfantPhoto } from "@/components/dash/enfant-photo";
import { DataPanel, Pill, Empty, fullName, fmtDate } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";
import { useState } from "react";
import { Link2, CheckCircle2, Circle } from "lucide-react";
import { demoEnfant, docsInscription } from "@/lib/demo-enfants";
import { LiaisonPanel } from "@/components/dash/liaison";
import { UploadDocButton } from "@/components/dash/upload";
import { useApiOrDemo } from "@/lib/use-api";
import { Panel } from "@/components/dash/widgets";
import { VaccinPanel, ConsentPanel, AccesHistorique, AccessGuard, SignalerButton } from "@/components/dash/medical";
import { DocumentAlerts, MedicalExchanges } from "@/components/dash/coordination";
import { useCoordination } from "@/lib/coordination";

export const Route = createFileRoute("/enfants/$enfantId")({
  head: () => ({
    meta: [
      { title: "Dossier enfant — Kids'Med IA" },
      { name: "description", content: "Fiche, santé, traitements, transmissions et documents de l'enfant." },
      { property: "og:title", content: "Dossier enfant — Kids'Med IA" },
      { property: "og:description", content: "Le dossier complet d'un enfant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: EnfantPage,
});

const _old = { prenom: "Léa", nom: "Martin", dateNaissance: "2024-03-12", sexe: "F", section: "Bébés", groupeSanguin: "A+", allergies: ["Arachide"], antecedents: ["Bronchiolite (2025)"], pai: true, parents: [{ prenom: "Claire", nom: "Martin", tel: "06 11 22 33 44", email: "claire.martin@exemple.fr" }], codeLiaison: "LEA-4821" };
const demoMedic = [{ nom: "Doliprane 2,4 %", posologie: "5 ml si fièvre", actif: true }];
const demoOrdo = [{ medicaments: [{ nom: "Doliprane" }], dateDebut: "2026-09-01", dateFin: "2027-03-01", medecin: { prenom: "Dr", nom: "Moreau" } }];
const demoDiag = [{ symptomes: ["fièvre", "toux"], resultat: "Rhinopharyngite probable", confiance: 0.82, createdAt: "2026-10-03" }];
const demoTrans = [{ type: "repas", contenu: "A bien mangé.", createdAt: new Date().toISOString() }, { type: "sante", contenu: "37,9 °C, parents prévenus.", createdAt: new Date().toISOString() }];
const demoDocs = [{ type: "PAI", statut: "valide" }, { type: "Carnet de vaccination", statut: "en_attente" }];

function Row({ k, v }: { k: string; v: React.ReactNode }) {
  return <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0"><span className="text-muted-foreground">{k}</span><span className="text-right font-medium">{v}</span></div>;
}

function EnfantPage() {
  const { enfantId } = Route.useParams();
  const v = { enfantId };
  const demoE = demoEnfant(enfantId);
  const liensR = useApiOrDemo<unknown>(specs.liensEnfant, [
    ...(demoE.parents ?? []).map((p: any) => ({ _id: `p-${p.prenom}`, user: { ...p }, role: "parent" })),
    { _id: "m-1", user: { prenom: "Dr Paul", nom: "Moreau", email: "p.moreau@cabinet.fr" }, role: "medecin" },
    { _id: "c-1", user: { prenom: "Crèche", nom: "Les Petits Soleils", email: "contact@petits-soleils.fr" }, role: "creche" },
  ], v);
  const enfantR = useApiOrDemo<any>(specs.enfant, demoE, v);
  const enf = (enfantR.data as any) ?? demoE;
  const docsR = useApiOrDemo<unknown>(specs.enfantDocs, demoDocs, v);
  const [extraDocs, setExtraDocs] = useState<any[]>([]);
  const store = useCoordination();
  const allDocs = [...store.documents.filter((d) => d.enfant?._id === enfantId), ...extraDocs, ...toList(docsR.data)].filter((d, i, a) => !d._id || a.findIndex((x) => x._id === d._id) === i);
  const has = (t: string) => allDocs.some((d) => String(d.type ?? d.nom).toLowerCase().includes(t.toLowerCase().split(" ")[0] ?? t.toLowerCase()));
  return (
    <DashboardShell title="Dossier enfant" actions={<div className="flex flex-wrap gap-2 print:hidden"><Button variant="outline" onClick={() => window.print()}><Printer className="mr-1 h-4 w-4" />Exporter le dossier en PDF</Button><SignalerButton enfantId={enfantId} /><UploadDocButton enfantId={enfantId} onUploaded={(d) => setExtraDocs((x) => [d, ...x])} /><Button variant="outline" asChild><Link to="/enfants"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button></div>}>
      <AccessGuard enfantId={enfantId}>
      <EnfantPhoto enfantId={enfantId} photoUrl={enf.photoUrl} nom={[enf.prenom, enf.nom].filter(Boolean).join(" ")} />
      <DocumentAlerts enfantId={enfantId} />
      <div className="grid gap-4 lg:grid-cols-3">
        <DataPanel title="Identité" icon={Baby} spec={specs.enfant} demoData={demoE} vars={v} className="lg:col-span-1">
          {(e: any) => (
            <div>
              <p className="mb-3 font-display text-2xl font-semibold">{fullName(e)}</p>
              <Row k="Naissance" v={fmtDate(e.dateNaissance)} />
              <Row k="Section" v={typeof e.section === "object" ? e.section?.nom : e.section ?? "—"} />
              <Row k="Groupe sanguin" v={e.groupeSanguin ?? "—"} />
              <Row k="Allergies" v={(e.allergies ?? []).length ? <Pill tone="danger">{e.allergies.join(", ")}</Pill> : "Aucune"} />
              <Row k="PAI" v={e.pai ? <Pill tone="warning">Oui</Pill> : "Non"} />
              <Row k="Antécédents" v={(e.antecedents ?? []).join(", ") || "—"} />
              <p className="mb-1 mt-4 text-xs uppercase tracking-wider text-muted-foreground">Parents</p>
              {(e.parents ?? []).map((p: any, i: number) => <p key={i} className="text-sm">{fullName(p)} · <span className="text-muted-foreground">{p.tel ?? p.email}</span></p>)}
            </div>
          )}
        </DataPanel>
        <div className="grid gap-4 lg:col-span-2 md:grid-cols-2">
          <DataPanel title="Traitements" icon={PillIcon} spec={specs.enfantMedic} demoData={demoMedic} vars={v}>
            {(d) => toList(d).length ? toList(d).map((m, i) => <Row key={i} k={m.nom} v={m.posologie ?? "—"} />) : <Empty />}
          </DataPanel>
          <DataPanel title="Ordonnances" icon={ScrollText} spec={specs.enfantOrdo} demoData={demoOrdo} vars={v}>
            {(d) => [...store.documents.filter((x) => x.enfant?._id === enfantId && x.type === "Ordonnance"), ...toList(d)].map((o, i) => <Row key={i} k={o.nom ?? (o.medicaments ?? []).map((m: any) => m.nom ?? m).join(", ")} v={`→ ${fmtDate(o.dateFin ?? o.dateValidite)}`} />)}
          </DataPanel>
          <DataPanel title="Diagnostics IA" icon={BrainCircuit} spec={specs.enfantDiag} demoData={demoDiag} vars={v}>
            {(d) => toList(d).length ? toList(d).map((x, i) => <Row key={i} k={`${fmtDate(x.createdAt)} · ${(x.symptomes ?? []).join(", ")}`} v={x.resultat} />) : <Empty />}
          </DataPanel>
          <DataPanel title="Transmissions" icon={NotebookPen} spec={specs.enfantTrans} demoData={demoTrans} vars={v}>
            {(d) => toList(d).length ? toList(d).map((t, i) => <Row key={i} k={t.type} v={t.contenu ?? t.message} />) : <Empty />}
          </DataPanel>
          <Panel title="Documents" icon={FileText} spec={specs.enfantDocs} demo={docsR.demo} reason={docsR.reason}>
            {allDocs.length ? allDocs.map((x, i) => <Row key={i} k={x.type ?? x.nom} v={<Pill tone={x.statut === "valide" ? "success" : x.statut === "rejete" ? "danger" : "warning"}>{String(x.statut ?? "en_attente").replace("_", " ")}</Pill>} />) : <Empty />}
          </Panel>
          <Panel title="Dossier d'inscription" icon={QrCode} spec={specs.docsOblig} demo={docsR.demo} reason={docsR.reason}>
            <ul className="space-y-2 text-sm">
              {docsInscription.map((d) => (
                <li key={d} className="flex items-center justify-between gap-2">
                  <span className="flex items-center gap-2">{has(d) ? <CheckCircle2 className="h-4 w-4 text-success" /> : <Circle className="h-4 w-4 text-muted-foreground" />}{d}</span>
                  {!has(d) && <UploadDocButton size="sm" label="Ajouter" enfantId={enfantId} defaultType={d} onUploaded={(doc) => setExtraDocs((x) => [doc, ...x])} />}
                </li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
      <div className="mt-4">
        <Panel title="Liaison & accès — crèche, parents, médecins" icon={Link2} spec={specs.liensEnfant} demo={liensR.demo} reason={liensR.reason}>
          <LiaisonPanel enfantId={enfantId} code={demoE.codeLiaison} prenom={demoE.prenom} liens={toList(liensR.data)} />
        </Panel>
      </div>
      <div className="mt-4"><VaccinPanel enfantId={enfantId} /></div>
      <MedicalExchanges enfantId={enfantId} />
      <div className="mt-4 grid gap-4 lg:grid-cols-2">
        <ConsentPanel enfantId={enfantId} />
        <AccesHistorique enfantId={enfantId} />
      </div>
      </AccessGuard>
    </DashboardShell>
  );
}
