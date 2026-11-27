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
  type?: "text" | "date" | "number" | "email" | "tel" | "select" | "textarea" | "checkbox" | "address" | "days";
  options?: string[];
  /** Sélecteur par nom (envoie l'identifiant) */
  lookup?: LookupKind;
  /** Affiche un bouton « Ajouter » pour créer l'élément référencé (ex. une crèche). */
  quickCreate?: boolean;
  required?: boolean;
  /** Champ proposé uniquement en modification (ex. description d'une crèche). */
  editOnly?: boolean;
}

export interface Crud {
  /** ex. « une section » */
  entity: string;
  /** chemin REST de base, ex. /sections */
  base: string;
  fields: Field[];
  /** corps additionnel à la création (ex. { etablissement: ":etablissementId" }) */
  extra?: Record<string, string>;
  /** Callback après création (ex. afficher le statut d'envoi de l'e-mail). */
  afterCreate?: (res: any, values: Record<string, any>) => void;
  view?: "enfant" | "etablissement" | "document";
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

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

function parseJours(value: unknown): number[] {
  if (Array.isArray(value)) return value.map(Number).filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
  return String(value ?? "")
    .split(/[,\s]+/)
    .map(Number)
    .filter((n) => Number.isInteger(n) && n >= 1 && n <= 7);
}

/** Cases à cocher lundi → dimanche. La valeur envoyée est « 1,2,3,4,5 ». */
function DaysField({ name, required, defaultValue }: { name: string; required?: boolean | undefined; defaultValue?: string | undefined }) {
  const [days, setDays] = useState<number[]>(() => parseJours(defaultValue));
  const toggle = (day: number) => setDays((d) => (d.includes(day) ? d.filter((x) => x !== day) : [...d, day].sort((a, b) => a - b)));
  return (
    <div>
      <input type="hidden" name={name} value={days.join(",")} />
      <div className="flex flex-wrap gap-1">
        {JOURS.map((label, index) => {
          const day = index + 1;
          const active = days.includes(day);
          return (
            <button key={day} type="button" aria-pressed={active} onClick={() => toggle(day)}
              className={`rounded-md border px-2.5 py-1 text-xs font-medium transition ${active ? "border-primary bg-primary text-primary-foreground" : "bg-background"}`}>
              {label}
            </button>
          );
        })}
      </div>
      {required && days.length === 0 && <p className="mt-1 text-xs text-destructive">Sélectionnez au moins un jour.</p>}
    </div>
  );
}

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
                      <LookupField kind={f.lookup} id={f.name} name={f.name} required={f.required} quickCreate={f.quickCreate} defaultValue={dv} />
                    ) : f.type === "address" ? (
                      <AddressField id={f.name} required={f.required} defaultValue={dv} />
                    ) : f.type === "days" ? (
                      <DaysField name={f.name} required={f.required} defaultValue={dv} />
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

/** Champs internes jamais utiles à l'utilisateur dans une fiche de détail. */
const HIDDEN_DETAIL_KEYS = new Set(["__v", "password", "_id", "id"]);

const DETAIL_LABELS: Record<string, string> = {
  nom: "Nom", prenom: "Prénom", email: "E-mail", tel: "Téléphone", telephone: "Téléphone",
  role: "Rôle", statut: "Statut", type: "Type", titre: "Titre", sujet: "Sujet", message: "Message", contenu: "Contenu",
  description: "Description", commentaire: "Commentaire", note: "Note", niveau: "Niveau", motif: "Motif",
  createdAt: "Créé le", updatedAt: "Mis à jour le", date: "Date", dateNaissance: "Naissance",
  dateDebut: "Début", dateFin: "Fin", dateValidite: "Valide jusqu'au", validiteMois: "Validité (mois)",
  enfant: "Enfant", etablissement: "Crèche", user: "Utilisateur", medecin: "Médecin", expediteur: "Expéditeur",
  destinataire: "Destinataire", medicaments: "Médicaments", posologie: "Posologie", frequence: "Fréquence",
  specialite: "Spécialité", rpps: "N° RPPS", adresse: "Adresse", ville: "Ville", codePostal: "Code postal",
  capacite: "Capacité", section: "Section", groupeSanguin: "Groupe sanguin", allergies: "Allergies",
  antecedents: "Antécédents", pai: "PAI", actif: "Actif", lu: "Lu", priorite: "Priorité", categorie: "Catégorie",
  action: "Action", adresse_ip: "Adresse IP", device: "Appareil", url: "Document", lien: "Document", fichier: "Fichier",
  symptomes: "Symptômes", resultat: "Résultat", confiance: "Confiance", source: "Origine", isActive: "Compte actif",
};

const ETATS: Record<string, string> = {
  en_attente: "En attente", valide: "Validé", rejete: "Rejeté", manquant: "Manquant", expire: "Expiré",
  expiration_proche: "Expire bientôt", traite: "Traité", archive: "Archivé", nouveau: "Nouveau",
  hors_plage: "Hors plage horaire", hors_zone: "Hors zone", actif: "Actif", inactif: "Inactif",
};

function labelOf(key: string) {
  return DETAIL_LABELS[key] ?? key.replace(/([a-z0-9])([A-Z])/g, "$1 $2").replace(/[_-]+/g, " ").replace(/^./, (c) => c.toUpperCase());
}

const isLink = (value: string) => /^(https?:\/\/|\/|data:|blob:)/i.test(value);
const isDateKey = (key: string) => /date|createdat|updatedat|naissance/i.test(key);

function dateText(value: string) {
  const d = new Date(value);
  if (isNaN(+d)) return value;
  const jour = d.toLocaleDateString("fr-FR", { day: "2-digit", month: "long", year: "numeric" });
  return /T\d{2}:\d{2}/.test(value) ? `${jour} à ${d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}` : jour;
}

function DocLink({ url }: { url: string }) {
  if (!isLink(url)) return <>{url}</>;
  return <a href={url} target="_blank" rel="noopener noreferrer" className="font-medium text-primary underline underline-offset-2">Ouvrir</a>;
}

function DetailValue({ field, value }: { field: string; value: any }) {
  if (value === null || value === undefined || value === "") return <span className="text-muted-foreground">—</span>;
  if (typeof value === "boolean") return <>{value ? "Oui" : "Non"}</>;
  if (typeof value === "number") return <>{value}</>;
  if (Array.isArray(value)) {
    if (!value.length) return <span className="text-muted-foreground">—</span>;
    return <>{value.map((item, i) => (
      <span key={i}>
        {typeof item === "object" && item !== null
          ? (item.prenom || item.nom ? fullName(item) : String(item.nom ?? item.name ?? ""))
          : String(ETATS[String(item)] ?? item)}
        {i < value.length - 1 ? ", " : ""}
      </span>
    ))}</>;
  }
  if (typeof value === "object") {
    const url = value.url ?? value.lien;
    if (typeof url === "string" && url) return <DocLink url={url} />;
    return <>{fullName(value)}</>;
  }
  const text = String(value);
  if (isLink(text)) return <DocLink url={text} />;
  if (isDateKey(field) || /^\d{4}-\d{2}-\d{2}/.test(text)) return <>{dateText(text)}</>;
  return <>{ETATS[text] ?? text}</>;
}

export function ViewDialog({ row, onOpenChange, title, hiddenKeys = [] }: { row: any; onOpenChange: (o: boolean) => void; title: string; hiddenKeys?: string[] }) {
  const hidden = new Set([...HIDDEN_DETAIL_KEYS, ...hiddenKeys]);
  const entries = row
    ? Object.entries(row).filter(([k, v]) => !hidden.has(k) && v !== undefined && v !== null && v !== "")
    : [];
  const documentUrl = typeof row?.url === "string" && row.url ? row.url : typeof row?.lien === "string" && row.lien ? row.lien : "";
  const enfantId = enfantIdOf(row?.enfant);
  return (
    <Dialog open={!!row} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader><DialogTitle>{title}</DialogTitle></DialogHeader>
        {entries.length === 0
          ? <p className="py-4 text-center text-sm text-muted-foreground">Aucune information à afficher.</p>
          : <dl className="divide-y text-sm">
            {entries.map(([k, v]) => (
              <div key={k} className="flex justify-between gap-4 py-2">
                <dt className="text-muted-foreground">{labelOf(k)}</dt>
                <dd className="max-w-[60%] break-words text-right font-medium"><DetailValue field={k} value={v} /></dd>
              </div>
            ))}
          </dl>}
        {(documentUrl || enfantId) && (
          <DialogFooter className="flex-wrap gap-2">
            {documentUrl && <Button variant="outline" asChild><a href={documentUrl} target="_blank" rel="noopener noreferrer">Ouvrir le document</a></Button>}
            {enfantId && <Button asChild><Link to="/enfants/$enfantId" params={{ enfantId }}>Ouvrir le dossier</Link></Button>}
          </DialogFooter>
        )}
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
