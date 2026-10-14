import { useState, type ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { enfantIdOf } from "@/lib/demo-enfants";
import { fullName } from "./widgets";
import { LookupField, type LookupKind } from "./lookup";
import { AddressField } from "./address";

export interface Field {
  name: string;
  label: string;
  type?: "text" | "date" | "number" | "email" | "tel" | "select" | "textarea" | "checkbox" | "address";
  options?: string[];
  /** Sélecteur par nom (envoie l'identifiant) */
  lookup?: LookupKind;
  required?: boolean;
}

export interface Crud {
  /** ex. « une section » */
  entity: string;
  /** chemin REST de base, ex. /sections */
  base: string;
  fields: Field[];
  /** corps additionnel à la création (ex. { etablissement: ":etablissementId" }) */
  extra?: Record<string, string>;
  view?: "enfant" | "etablissement";
  noCreate?: boolean;
  noEdit?: boolean;
  noDelete?: boolean;
}

const get = (o: any, k: string) => {
  const v = o?.[k];
  if (v && typeof v === "object" && !Array.isArray(v)) return v.nom ?? v.name ?? v._id ?? "";
  if (Array.isArray(v)) return v.map((x) => (typeof x === "object" ? x.nom ?? x.name : x)).join(", ");
  return v ?? "";
};

export function FormDialog({ open, onOpenChange, title, description, fields, initial, submitLabel = "Enregistrer", onSubmit, children }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; fields: Field[]; initial?: any;
  submitLabel?: string; onSubmit: (v: any) => Promise<void> | void; children?: ReactNode;
}) {
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const v: Record<string, any> = {};
    for (const f of fields) {
      if (f.type === "address") {
        v["adresse"] = fd.get("adresse");
        for (const k of ["ville", "codePostal"]) if (fd.get(k)) v[k] = fd.get(k);
        for (const k of ["latitude", "longitude"]) if (fd.get(k)) v[k] = Number(fd.get(k));
      }
      else if (f.type === "checkbox") v[f.name] = fd.get(f.name) === "on";
      else if (f.type === "number") v[f.name] = fd.get(f.name) === "" ? undefined : Number(fd.get(f.name));
      else v[f.name] = fd.get(f.name);
    }
    setBusy(true);
    try { await onSubmit(v); onOpenChange(false); } finally { setBusy(false); }
  }
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          {description && <DialogDescription>{description}</DialogDescription>}
        </DialogHeader>
        <form onSubmit={submit} className="space-y-3" key={open ? "o" : "c"}>
          {fields.map((f) => {
            const dv = initial ? (f.lookup ? String(initial?.[f.name]?._id ?? initial?.[f.name] ?? "") : String(get(initial, f.name))).slice(0, f.type === "date" ? 10 : undefined) : "";
            return (
              <div key={f.name} className={f.type === "checkbox" ? "flex items-center gap-2" : "space-y-1.5"}>
                {f.type === "checkbox" ? (
                  <><input id={f.name} name={f.name} type="checkbox" defaultChecked={!!initial?.[f.name]} className="h-4 w-4 accent-[var(--primary)]" /><Label htmlFor={f.name}>{f.label}</Label></>
                ) : (
                  <>
                    <Label htmlFor={f.name}>{f.label}{f.required && " *"}</Label>
                    {f.lookup ? (
                      <LookupField kind={f.lookup} id={f.name} name={f.name} required={f.required} defaultValue={dv} />
                    ) : f.type === "address" ? (
                      <AddressField id={f.name} required={f.required} defaultValue={dv} />
                    ) : f.type === "select" ? (
                      <select id={f.name} name={f.name} defaultValue={dv} required={f.required} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                        <option value="">—</option>
                        {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                      </select>
                    ) : f.type === "textarea" ? (
                      <Textarea id={f.name} name={f.name} defaultValue={dv} required={f.required} />
                    ) : (
                      <Input id={f.name} name={f.name} type={f.type ?? "text"} defaultValue={dv} required={f.required} />
                    )}
                  </>
                )}
              </div>
            );
          })}
          {children}
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Annuler</Button>
            <Button type="submit" disabled={busy}>{busy && <Loader2 className="h-4 w-4 animate-spin" />}{submitLabel}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export function ViewDialog({ row, onOpenChange, title }: { row: any; onOpenChange: (o: boolean) => void; title: string }) {
  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        <dl className="divide-y text-sm">
          {row && Object.entries(row).filter(([k]) => !["__v", "password"].includes(k)).map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 py-2">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="max-w-[60%] break-words text-right font-medium">{typeof v === "object" && v !== null ? (Array.isArray(v) ? v.map((x) => (typeof x === "object" ? fullName(x) : String(x))).join(", ") : fullName(v)) : String(v)}</dd>
            </div>
          ))}
        </dl>
      </DialogContent>
    </Dialog>
  );
}

export function ConfirmDialog({ open, onOpenChange, title, description, onConfirm, label = "Supprimer" }: {
  open: boolean; onOpenChange: (o: boolean) => void; title: string; description?: string; onConfirm: () => void; label?: string;
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description && <AlertDialogDescription>{description}</AlertDialogDescription>}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction className="bg-destructive text-destructive-foreground hover:bg-destructive/90" onClick={onConfirm}>{label}</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

/** Nom d'enfant cliquable vers son dossier. */
export function EnfantLink({ e, className }: { e: any; className?: string }) {
  const id = enfantIdOf(e);
  if (!id) return <span className={className}>{fullName(e)}</span>;
  return <Link to="/enfants/$enfantId" params={{ enfantId: id }} className={className ?? "font-medium text-primary hover:underline"}>{fullName(e)}</Link>;
}
