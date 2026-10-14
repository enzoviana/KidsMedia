import { useState } from "react";
import { Upload, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getSession, roleToKey, toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
import { localId, updateCoordination, writeSpec } from "@/lib/coordination";
import { useQueryClient } from "@tanstack/react-query";
import { docsInscription, demoEnfants } from "@/lib/demo-enfants";
import { fullName } from "./widgets";

/** Bouton + fenêtre « Déposer un document » (upload direct, multipart). */
export function UploadDocButton({ enfantId, defaultType, onUploaded, label = "Déposer un document", size }: {
  enfantId?: string; defaultType?: string; onUploaded?: (doc: any) => void; label?: string; size?: "sm" | "default";
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const role = roleToKey(getSession()?.user.role) ?? "parent";
  const spec = ["creche", "rsai"].includes(role) ? specs.uploadDirect : specs.depotMedical;
  const childrenR = useApiOrDemo<unknown>(role === "parent" ? specs.parentEnfants : ["creche", "rsai"].includes(role) ? specs.enfantsEtab : specs.enfants, demoEnfants);
  const children = toList(childrenR.data);
  const qc = useQueryClient();
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    if (enfantId) fd.set("enfant", enfantId);
    const file = fd.get("fichier");
    if (!(file instanceof File) || !file.size) { toast.error("Sélectionnez un fichier."); return; }
    if (file.size > 10 * 1024 * 1024) { toast.error("Le fichier dépasse 10 Mo."); return; }
    if (!/\.(pdf|jpe?g|png)$/i.test(file.name)) { toast.error("Format accepté : PDF, JPG ou PNG."); return; }
    setBusy(true);
    try {
      const r = await writeSpec(spec, fd);
      const selectedId = String(fd.get("enfant") ?? "");
      const response = r.data instanceof FormData ? {} : r.data;
      const doc = { _id: response?._id ?? localId(), type: fd.get("type"), nom: file.name, enfant: children.find((c) => c._id === selectedId) ?? { _id: selectedId }, statut: "en_attente", dateValidite: fd.get("dateValidite"), createdAt: new Date().toISOString(), ...response };
      updateCoordination("documents", (rows) => [doc, ...rows]);
      onUploaded?.(doc);
      qc.invalidateQueries({ queryKey: ["api", specs.enfantDocs.id] });
      qc.invalidateQueries({ queryKey: ["api", specs.docsEtab.id] });
      toast.success(r.demo ? "Document déposé (mode démo)" : "Document déposé, en attente de validation");
      setOpen(false);
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <>
      <Button size={size} onClick={() => setOpen(true)}><Upload className="mr-1 h-4 w-4" />{label}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Déposer un document</DialogTitle>
            <DialogDescription>PDF, JPG ou PNG — 10 Mo max.{spec.status !== "ok" || getSession()?.demo ? " Dépôt en démo, non conservé après rechargement." : ""}</DialogDescription>
          </DialogHeader>
          <form onSubmit={submit} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="fichier">Fichier *</Label><Input id="fichier" name="fichier" type="file" accept=".pdf,.jpg,.jpeg,.png" required /></div>
            <div className="space-y-1.5"><Label htmlFor="type">Type *</Label>
              <select id="type" name="type" defaultValue={defaultType ?? ""} required className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">—</option>{[...docsInscription, "Ordonnance", "Autre"].map((d) => <option key={d}>{d}</option>)}
              </select></div>
            {!enfantId && <div className="space-y-1.5"><Label htmlFor="enfant">Enfant</Label>
              <select id="enfant" name="enfant" required={["medecin", "parent"].includes(role)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">{["medecin", "parent"].includes(role) ? "Sélectionner un enfant" : "Document de l'établissement"}</option>{children.map((e) => <option key={e._id} value={e._id}>{fullName(e)}</option>)}
              </select></div>}
            <div className="space-y-1.5"><Label htmlFor="dateValidite">Valide jusqu'au</Label><Input id="dateValidite" name="dateValidite" type="date" /></div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}Déposer</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
