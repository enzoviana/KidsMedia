import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { send } from "@/lib/mutate";
import { MapPinned, Star, ClipboardList, Plus } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, Pill, Empty, fmtDate } from "@/components/dash/widgets";
import { FormDialog, type Field } from "@/components/dash/crud";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { filterAffectations, statutAffectation, STATUTS } from "@/lib/affectations-filter";
import { getSession, roleToKey, toList } from "@/lib/api";
import { specs } from "@/lib/specs";
import { useApiOrDemo } from "@/lib/use-api";
import { etabChoices, rsaChoices, localId, useCoordination, updateCoordination, writeSpec, validSchedule } from "@/lib/coordination";
import { RatingButton, DocumentAlerts } from "@/components/dash/coordination";

export const Route = createFileRoute("/coordination")({
  head: () => ({ meta: [
    { title: "Coordination RSAI & supervision — Kids'Med IA" },
    { name: "description", content: "Affectations RSAI, demandes d'intervention, avis et suivi documentaire." },
    { property: "og:title", content: "Coordination RSAI & supervision — Kids'Med IA" },
    { property: "og:description", content: "Supervision des affectations et échanges entre crèches et RSAI." },
    { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
  ] }), component: Page,
});

function Page() {
  const role = roleToKey(getSession()?.user.role) ?? "parent";
  const admin = role === "admin" || role === "dev";
  const store = useCoordination();
  const qc = useQueryClient();
  const [assign, setAssign] = useState(false);
  const [request, setRequest] = useState(false);
  const [processing, setProcessing] = useState<any>(null);
  const ar = useApiOrDemo<unknown>(specs.affectationsToutes, store.affectations);
  const rr = useApiOrDemo<unknown>(specs.demandesRsai, store.demandes);
  const vr = useApiOrDemo<unknown>(specs.avisCoordination, store.avis);
  const rs = useApiOrDemo<unknown>(specs.rsais, rsaChoices);
  const es = useApiOrDemo<unknown>(specs.etabs, etabChoices);
  const rsais = toList(rs.data).map((r) => ({ ...r, nomComplet: [r.prenom, r.nom].filter(Boolean).join(" ") }));
  const etabs = toList(es.data);
  const allAssignments = ar.demo ? store.affectations : toList(ar.data);
  const [annee, setAnnee] = useState(new Date().getFullYear());
  const [statutF, setStatutF] = useState("toutes");
  const [q, setQ] = useState("");
  const assignments = filterAffectations(allAssignments, annee, statutF, q);
  const requests = rr.demo ? store.demandes : toList(rr.data);
  const reviews = vr.demo ? store.avis : toList(vr.data);
  const days = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
  const fields: Field[] = [
    { name: "rsai", label: "RSAI", lookup: "rsai", required: true },
    { name: "etablissement", label: "Crèche", lookup: "etablissement", required: true },
    { name: "jours", label: "Jours (0 dimanche … 6 samedi)", type: "text", required: true },
    { name: "debut", label: "Début (HH:MM)", required: true }, { name: "fin", label: "Fin (HH:MM)", required: true },
    { name: "dateDebut", label: "À partir du", type: "date", required: true }, { name: "dateFin", label: "Jusqu'au", type: "date" },
  ];
  if (!["admin", "dev", "creche", "rsai"].includes(role)) return <DashboardShell title="Coordination"><Empty text="Cet espace est réservé aux crèches, RSAI et administrateurs." /></DashboardShell>;
  return <DashboardShell title={admin ? "Supervision & coordination" : "Coordination RSAI"} actions={<div className="flex flex-wrap gap-2">{admin && <Button onClick={() => { setProcessing(null); setAssign(true); }}><Plus className="mr-1 h-4 w-4" />Affecter une RSAI</Button>}{role === "creche" && <Button onClick={() => setRequest(true)}>Demander une RSAI</Button>}</div>}>
    {admin && <DocumentAlerts />}
    <div className="grid gap-4 lg:grid-cols-2">
      <Panel className="lg:col-span-2" title={`Affectations ${annee} (${assignments.length})`} icon={MapPinned} spec={specs.affectationsToutes} demo={ar.demo} reason={ar.reason}>
        <div className="mb-3 flex flex-wrap gap-2">
          <select aria-label="Année" className="h-9 rounded-md border bg-background px-2 text-sm" value={annee} onChange={(e) => setAnnee(Number(e.target.value))}>{[2025, 2026, 2027].map((y) => <option key={y}>{y}</option>)}</select>
          <select aria-label="Statut" className="h-9 rounded-md border bg-background px-2 text-sm" value={statutF} onChange={(e) => setStatutF(e.target.value)}>{STATUTS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          <Input className="h-9 flex-1 min-w-40" placeholder="Rechercher une RSAI ou une crèche…" value={q} onChange={(e) => setQ(e.target.value)} />
        </div>
        <AffectationsTable rows={assignments} role={role} admin={admin} days={days} />

      </Panel>
      {(admin || role === "creche") && <Panel title="Demandes d'intervention" icon={ClipboardList} spec={specs.demandesRsai} demo={rr.demo} reason={rr.reason}>
        {requests.length ? requests.map((d) => <div key={d._id} className="space-y-2 border-b py-4 last:border-0"><div className="flex flex-wrap justify-between gap-2"><p className="font-medium">{d.etablissement?.nom}</p><Pill tone={d.statut === "acceptee" ? "success" : d.statut === "refusee" ? "danger" : "warning"}>{d.statut.replaceAll("_", " ")}</Pill></div><p className="text-sm">{d.motif}</p><p className="text-xs text-muted-foreground">Souhaitée le {fmtDate(d.dateSouhaitee)}</p>{admin && d.statut === "en_attente" && <div className="flex gap-2"><Button size="sm" onClick={() => { setProcessing(d); setAssign(true); }}>Accepter & affecter</Button><Button size="sm" variant="outline" onClick={async () => { try { await writeSpec(specs.demandeRsaiTraiter, { statut: "refusee", motif: "Intervention indisponible" }, { demandeId: d._id }); updateCoordination("demandes", (rows) => rows.map((r) => r._id === d._id ? { ...r, statut: "refusee" } : r)); toast.success("Demande refusée (démo)"); } catch (e) { toast.error((e as Error).message); } }}>Refuser</Button></div>}</div>) : <Empty />}
      </Panel>}
      <Panel title="Avis crèches & RSAI" icon={Star} spec={specs.avisCoordination} demo={vr.demo} reason={vr.reason}>
        {reviews.map((v) => <div key={v._id} className="space-y-1 border-b py-3 last:border-0"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{v.cibleNom}</span><span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-warning text-warning" />{v.note}/5</span></div><p className="text-sm">{v.commentaire}</p><p className="text-xs text-muted-foreground">{v.auteurNom} · {v.auteurRole} · {fmtDate(v.createdAt)}</p></div>)}
      </Panel>
    </div>
    <FormDialog open={assign} onOpenChange={setAssign} title="Affecter une RSAI à une crèche" fields={fields} initial={{ jours: "1,2,3,4,5", debut: "08:00", fin: "18:00", etablissement: processing?.etablissement?._id ?? "" }} onSubmit={async (v) => {
      const jours = String(v.jours).split(",").map((j) => Number(j.trim()));
      if (!validSchedule(v.debut, v.fin, jours) || (v.dateFin && v.dateFin < v.dateDebut)) { toast.error("Vérifiez les jours, horaires et dates."); throw new Error("Horaires incohérents"); }
      const rsaiId = String(v.rsai); const etablissementId = String(v.etablissement);
      if (processing && etablissementId !== processing.etablissement._id) { toast.error("Choisissez la crèche qui a fait la demande."); throw new Error("Crèche différente de la demande"); }
      const rsai = rsais.find((r) => r._id === rsaiId); const etablissement = etabs.find((r) => r._id === etablissementId);
      try { const res = await send<any>("POST", specs.affectationCreer.path, { rsaiId, crecheId: etablissementId, etablissementId, jours, debut: v.debut, fin: v.fin, dateDebut: v.dateDebut, dateFin: v.dateFin || undefined, demandeId: processing?._id });
        const id = res.data?._id ?? localId(); updateCoordination("affectations", (rows) => [{ ...v, _id: id, rsai: { _id: rsaiId, nom: rsai?.nomComplet }, etablissement, jours, statut: "active" }, ...rows]);
        if (processing) { await writeSpec(specs.demandeRsaiTraiter, { statut: "acceptee", affectationId: id }, { demandeId: processing._id }); updateCoordination("demandes", (rows) => rows.map((r) => r._id === processing._id ? { ...r, statut: "acceptee" } : r)); }
        qc.invalidateQueries({ queryKey: ["api", specs.affectationsToutes.id] }); qc.invalidateQueries({ queryKey: ["api", specs.demandesRsai.id] }); qc.invalidateQueries({ queryKey: ["api", specs.rsaiAffectations.id] });
        toast.success(res.demo ? "Affectation créée (démo)" : "Affectation enregistrée");
      } catch (e) { toast.error(`Le serveur a refusé l'affectation : ${(e as Error).message}`); throw e; }
    }} />
    <FormDialog open={request} onOpenChange={setRequest} title="Demander une RSAI" fields={[{ name: "rsai", label: "RSAI souhaitée (facultatif)", lookup: "rsai" }, { name: "motif", label: "Besoin", type: "textarea", required: true }, { name: "dateSouhaitee", label: "Date souhaitée", type: "date", required: true }]} onSubmit={async (v) => {
      try { const res = await writeSpec(specs.demandeRsaiCreer, { motif: v.motif, dateSouhaitee: v.dateSouhaitee, rsaiId: v.rsai || undefined }); updateCoordination("demandes", (rows) => [{ ...v, _id: localId(), etablissement: etabChoices[0], statut: "en_attente" }, ...rows]); toast.success(res.demo ? "Demande transmise à l'admin (démo)" : "Demande transmise à l'admin"); } catch (e) { toast.error((e as Error).message); throw e; }
    }} />
  </DashboardShell>;
}

function AffectationsTable({ rows, role, admin, days }: { rows: any[]; role: string; admin: boolean; days: string[] }) {
  const [size, setSize] = useState(25);
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(rows.length / size));
  const p = Math.min(page, pages - 1);
  const slice = rows.slice(p * size, p * size + size);
  if (!rows.length) return <Empty />;
  const tone = (s: string) => (s === "active" ? "success" : s === "revoquee" ? "danger" : s === "en_attente" || s === "a_venir" ? "warning" : "default") as "success" | "danger" | "warning" | "default";
  return (
    <div>
      <div className="overflow-x-auto rounded-xl border">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
            <tr><th className="p-3">RSAI</th><th className="p-3">Crèche</th><th className="p-3">Jours & horaires</th><th className="p-3">Période</th><th className="p-3">Statut</th><th className="p-3 text-right">Actions</th></tr>
          </thead>
          <tbody>
            {slice.map((a) => {
              const st = statutAffectation(a);
              const nom = [a.rsai?.prenom, a.rsai?.nom].filter(Boolean).join(" ") || "—";
              return (
                <tr key={a._id} className="border-t align-top hover:bg-muted/30">
                  <td className="p-3 font-medium">{a.rsai?._id ? <Link to="/fiche-rsai/$rsaiId" params={{ rsaiId: String(a.rsai._id) }} className="hover:underline">{nom}</Link> : nom}</td>
                  <td className="p-3">{a.etablissement?.nom ?? a.creche?.nom ?? "—"}</td>
                  <td className="p-3 text-muted-foreground">{(a.jours ?? []).map((j: number) => days[j]).join(", ")}<br />{a.debut}–{a.fin}</td>
                  <td className="p-3 text-muted-foreground">{fmtDate(a.dateDebut)}{a.dateFin ? ` → ${fmtDate(a.dateFin)}` : " → sans fin"}</td>
                  <td className="p-3"><Pill tone={tone(st)}>{st.replaceAll("_", " ")}</Pill></td>
                  <td className="p-3"><div className="flex justify-end gap-2">
                    {role === "rsai" && st === "active" && <RatingButton target="etablissement" id={a.etablissement?._id} name={a.etablissement?.nom} />}
                    {admin && st === "active" && <Button variant="outline" size="sm" onClick={async () => { try { await writeSpec(specs.affectationRevoquer, undefined, { affectationId: a._id }); updateCoordination("affectations", (rs) => rs.map((r) => r._id === a._id ? { ...r, statut: "revoquee" } : r)); toast.success("Affectation révoquée"); } catch (e) { toast.error((e as Error).message); } }}>Révoquer</Button>}
                  </div></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm text-muted-foreground">
        <span>{p * size + 1}–{Math.min(rows.length, (p + 1) * size)} sur {rows.length}</span>
        <div className="flex items-center gap-2">
          <select aria-label="Lignes par page" className="h-8 rounded-md border bg-background px-2" value={size} onChange={(e) => { setSize(Number(e.target.value)); setPage(0); }}>{[10, 25, 50, 100].map((n) => <option key={n} value={n}>{n} / page</option>)}</select>
          <Button size="sm" variant="outline" disabled={p === 0} onClick={() => setPage(p - 1)}>Précédent</Button>
          <span>Page {p + 1}/{pages}</span>
          <Button size="sm" variant="outline" disabled={p >= pages - 1} onClick={() => setPage(p + 1)}>Suivant</Button>
        </div>
      </div>
    </div>
  );
}
