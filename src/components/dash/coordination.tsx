import { useState } from "react";
import { BellRing, MessageSquare, FileText, Star } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { getSession, roleToKey, toList } from "@/lib/api";
import { specs } from "@/lib/specs";
import { useApiOrDemo } from "@/lib/use-api";
import { canReadNote, documentEtat, demoDocuments, localId, updateCoordination, useCoordination, validRating, writeSpec } from "@/lib/coordination";
import { Panel, Pill, fullName, fmtDate, Empty } from "./widgets";
import { EnfantLink, FormDialog } from "./crud";
import { UploadDocButton } from "./upload";

export function RatingButton({ id, name, target = "rsai", average = 0, count = 0 }: { id: string; name: string; target?: "rsai" | "etablissement"; average?: number; count?: number }) {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState(0);
  const store = useCoordination();
  const role = roleToKey(getSession()?.user.role) ?? "parent";
  const local = store.avis.find((r) => r.cibleId === id && r.auteurRole === role);
  const allowed = target === "rsai" ? role === "creche" : role === "rsai";
  const spec = target === "rsai" ? specs.rsaiNoter : specs.etablissementAvis;
  return <div className="flex flex-wrap items-center gap-2">
    <span className="flex items-center gap-1 text-sm"><Star className="h-4 w-4 fill-warning text-warning" />{local?.note ?? (average || "—")} <span className="text-muted-foreground">({count + (local ? 1 : 0)})</span></span>
    {allowed && <Button size="sm" variant="outline" onClick={() => { setRating(local?.note ?? 0); setOpen(true); }}>Noter</Button>}
    <Dialog open={open} onOpenChange={setOpen}><DialogContent><DialogHeader><DialogTitle>Noter {name}</DialogTitle><DialogDescription>Avis sur votre collaboration.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={async (e) => {
        e.preventDefault(); if (!validRating(rating)) { toast.error("Choisissez une note de 1 à 5."); return; }
        const fd = new FormData(e.currentTarget);
        try {
          const res = await writeSpec(spec, { note: rating, commentaire: fd.get("commentaire") }, target === "rsai" ? { rsaiId: id } : { etablissementId: id });
          updateCoordination("avis", (rows) => [{ _id: localId(), cibleType: target, cibleId: id, cibleNom: name, auteurRole: role, auteurNom: fullName(getSession()?.user), note: rating, commentaire: fd.get("commentaire"), createdAt: new Date().toISOString() }, ...rows.filter((r) => !(r.cibleId === id && r.auteurRole === role))]);
          toast.success(res.demo ? "Avis enregistré (démo)" : "Avis enregistré"); setOpen(false);
        } catch (err) { toast.error((err as Error).message); }
      }}>
        <div className="flex gap-1" aria-label="Note">{[1, 2, 3, 4, 5].map((n) => <Button type="button" key={n} variant="ghost" size="icon" aria-label={`${n} étoile${n > 1 ? "s" : ""}`} onClick={() => setRating(n)}><Star className={`h-6 w-6 ${n <= rating ? "fill-warning text-warning" : "text-muted-foreground"}`} /></Button>)}</div>
        <Label htmlFor="commentaire">Commentaire</Label><Textarea id="commentaire" name="commentaire" defaultValue={local?.commentaire ?? ""} />
        <Button type="submit">Publier l'avis</Button>
      </form></DialogContent></Dialog>
  </div>;
}

export function DocumentAlerts({ enfantId }: { enfantId?: string }) {
  const store = useCoordination();
  const docs = [...store.documents, ...demoDocuments].filter((d) => !enfantId || d.enfant?._id === enfantId).filter((d, i, all) => all.findIndex((x) => x.type === d.type && x.enfant?._id === d.enfant?._id) === i);
  const demo = docs.filter((d) => documentEtat(d) !== "valide").map((d) => ({ ...d, motif: documentEtat(d), documentId: d._id }));
  if (!docs.some((d) => d.type === "Certificat médical d'aptitude")) demo.push({ _id: "missing-cert", type: "Certificat médical d'aptitude", enfant: { _id: enfantId ?? "demo-lea", prenom: enfantId === "demo-noah" ? "Noah" : "Léa", nom: enfantId === "demo-noah" ? "Bernard" : "Martin" }, statut: "manquant", nom: "", createdAt: "", dateValidite: "", motif: "manquant", documentId: "" });
  const r = useApiOrDemo<unknown>(specs.alertesDocuments, demo, enfantId ? { enfantId } : undefined);
  const alerts = r.demo ? demo : toList(r.data);
  const labels: Record<string, string> = { manquant: "Manquant", expire: "Expiré", expiration_proche: "Expire bientôt", rejete: "Rejeté" };
  return <Panel title="Alertes documents" icon={BellRing} spec={specs.alertesDocuments} demo={r.demo} reason={r.reason} className="mb-4">
    {!alerts.length ? <Empty text="Aucune alerte documentaire" /> : <ul className="divide-y">{alerts.map((a) => <li key={a._id} className="flex flex-wrap items-center justify-between gap-3 py-3">
      <div className="min-w-0 text-sm"><EnfantLink e={a.enfant} /><p>{a.type}</p><p className="text-xs text-muted-foreground">{a.dateValidite ? `Échéance : ${fmtDate(a.dateValidite)}` : "Pièce requise pour l'inscription"}</p></div>
      <div className="flex flex-wrap items-center gap-2"><Pill tone={a.motif === "expiration_proche" ? "warning" : "danger"}>{labels[a.motif] ?? a.motif}</Pill><UploadDocButton size="sm" label="Fournir" enfantId={a.enfant?._id} defaultType={a.type} /></div>
    </li>)}</ul>}
  </Panel>;
}

export function MedicalExchanges({ enfantId }: { enfantId: string }) {
  const store = useCoordination();
  const role = roleToKey(getSession()?.user.role) ?? "parent";
  const [noteOpen, setNoteOpen] = useState(false);
  const [exchange, setExchange] = useState<"demande" | "envoi" | null>(null);
  const [reply, setReply] = useState<string | undefined>();
  const [filter, setFilter] = useState("toutes");
  const qc = useQueryClient();
  const vars = { enfantId };
  const nr = useApiOrDemo<unknown>(specs.notesMedicales, store.notes.filter((n) => n.enfantId === enfantId), vars);
  const er = useApiOrDemo<unknown>(specs.echangesDocuments, store.echanges.filter((n) => n.enfantId === enfantId), vars);
  const dr = useApiOrDemo<unknown>(specs.enfantDocs, demoDocuments.filter((d) => d.enfant._id === enfantId), vars);
  const notes = (nr.demo ? store.notes.filter((n) => n.enfantId === enfantId) : toList(nr.data)).filter((n) => canReadNote(role, n.visibilite) && (filter === "toutes" || n.visibilite === filter));
  const exchanges = (er.demo ? store.echanges.filter((n) => n.enfantId === enfantId) : toList(er.data)).filter((n) => ["admin", "dev", "rsai"].includes(role) || n.destinataire === role || n.expediteurRole === role);
  const docs = [...store.documents.filter((d) => d.enfant?._id === enfantId), ...toList(dr.data)];
  const canWrite = role === "medecin" || role === "creche";
  const canExchange = ["medecin", "creche", "parent"].includes(role);
  return <div className="mt-4 grid gap-4 lg:grid-cols-2">
    <Panel title="Notes de la crèche & du médecin" icon={MessageSquare} spec={specs.notesMedicales} demo={nr.demo} reason={nr.reason}>
      <div className="mb-4 flex flex-wrap justify-between gap-2"><select aria-label="Visibilité des notes" value={filter} onChange={(e) => setFilter(e.target.value)} className="rounded-md border bg-background p-2 text-sm"><option value="toutes">Toutes les notes</option><option value="publique">Publiques</option>{role !== "parent" && <option value="medicale">Médicales</option>}</select>{canWrite && <Button size="sm" onClick={() => setNoteOpen(true)}>Ajouter une note</Button>}</div>
      {notes.length ? <ul className="divide-y">{notes.map((n) => <li key={n._id} className="space-y-2 py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{n.auteurNom}</span><Pill tone={n.visibilite === "medicale" ? "warning" : "default"}>{n.visibilite === "medicale" ? "Médicale" : "Publique"}</Pill></div><p className="break-words">{n.contenu}</p><p className="text-xs text-muted-foreground">{fmtDate(n.createdAt)}</p></li>)}</ul> : <Empty />}
      <FormDialog open={noteOpen} onOpenChange={setNoteOpen} title={role === "medecin" ? "Envoyer une note à la crèche" : "Ajouter une note"} fields={[{ name: "visibilite", label: "Visibilité", type: "select", options: ["publique", "medicale"], required: true }, { name: "contenu", label: "Note", type: "textarea", required: true }]} onSubmit={async (v) => {
        try { const res = await writeSpec(specs.noteMedicaleCreer, { ...v, destinataire: role === "medecin" ? "creche" : "medecin" }, vars);
          updateCoordination("notes", (rows) => [{ ...v, _id: localId(), enfantId, auteurRole: role, auteurNom: fullName(getSession()?.user), createdAt: new Date().toISOString() }, ...rows]);
          qc.invalidateQueries({ queryKey: ["api", specs.notesMedicales.id] }); toast.success(res.demo ? "Note envoyée (démo)" : "Note envoyée");
        } catch (err) { toast.error((err as Error).message); throw err; }
      }} />
    </Panel>
    <Panel title="Demandes & envois de documents" icon={FileText} spec={specs.echangesDocuments} demo={er.demo} reason={er.reason}>
      {canExchange && <div className="mb-4 flex flex-wrap gap-2"><Button size="sm" variant="outline" onClick={() => { setReply(undefined); setExchange("demande"); }}>Demander un document</Button><Button size="sm" onClick={() => { setReply(undefined); setExchange("envoi"); }}>Envoyer un document</Button></div>}
      {exchanges.length ? <ul className="divide-y">{exchanges.map((n) => <li key={n._id} className="space-y-1 py-3 text-sm"><div className="flex flex-wrap justify-between gap-2"><span className="font-medium">{n.action === "demande" ? "Demande" : "Envoi"} · {n.type}</span><Pill>{n.statut.replaceAll("_", " ")}</Pill></div><p className="text-xs text-muted-foreground">{n.expediteurRole} → {n.destinataire}{n.echeance ? ` · avant le ${fmtDate(n.echeance)}` : ""}</p><p className="break-words">{n.message}</p>{n.action === "demande" && n.statut === "en_attente" && n.destinataire === role && <Button size="sm" variant="outline" onClick={() => { setReply(n._id); setExchange("envoi"); }}>Répondre</Button>}</li>)}</ul> : <Empty />}
      <Dialog open={exchange !== null} onOpenChange={(o) => { if (!o) setExchange(null); }}><DialogContent><DialogHeader><DialogTitle>{exchange === "demande" ? "Demander un document" : "Envoyer un document"}</DialogTitle><DialogDescription>Échange lié au dossier de cet enfant.</DialogDescription></DialogHeader>
        <form className="space-y-3" onSubmit={async (e) => {
          e.preventDefault(); const fd = new FormData(e.currentTarget); const action = exchange; if (!action) return;
          const doc = docs.find((d) => d._id === fd.get("documentId")); if (action === "envoi" && !doc) { toast.error("Déposez puis sélectionnez un document."); return; }
          const body = { action, destinataire: fd.get("destinataire"), type: action === "envoi" ? doc?.type : fd.get("type"), documentId: doc?._id, message: fd.get("message"), echeance: fd.get("echeance"), demandeId: reply };
          try { const res = await writeSpec(specs.echangeDocumentCreer, body, vars); updateCoordination("echanges", (rows) => [{ ...body, _id: localId(), enfantId, expediteurRole: role, statut: action === "demande" ? "en_attente" : "envoye", createdAt: new Date().toISOString() }, ...rows.map((r) => r._id === reply ? { ...r, statut: "recu" } : r)]); toast.success(res.demo ? "Échange envoyé (démo)" : "Échange envoyé"); setExchange(null); } catch (err) { toast.error((err as Error).message); }
        }}>
          <Label htmlFor="destinataire">Destinataire</Label><select id="destinataire" name="destinataire" required className="w-full rounded-md border bg-background p-2 text-sm">{(reply ? ["medecin"] : role === "medecin" ? ["creche", "parent"] : ["medecin", ...(role === "creche" ? ["parent"] : ["creche"])]).map((r) => <option key={r} value={r}>{r === "creche" ? "Crèche liée" : r === "parent" ? "Parents liés" : "Médecin lié"}</option>)}</select>
          {exchange === "envoi" ? <><Label htmlFor="documentId">Document à envoyer</Label><select id="documentId" name="documentId" required className="w-full rounded-md border bg-background p-2 text-sm"><option value="">Sélectionner</option>{docs.map((d) => <option key={d._id} value={d._id}>{d.nom ?? d.type}</option>)}</select><UploadDocButton enfantId={enfantId} label="Téléverser un fichier" /></> : <><Label htmlFor="typeDemande">Document demandé</Label><Input id="typeDemande" name="type" required /><Label htmlFor="echeance">Échéance</Label><Input id="echeance" name="echeance" type="date" /></>}
          <Label htmlFor="message">Message</Label><Textarea id="message" name="message" /><Button type="submit">Envoyer</Button>
        </form>
      </DialogContent></Dialog>
    </Panel>
  </div>;
}