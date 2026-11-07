import { useMemo, useState } from "react";
import { Check, ChevronsUpDown, Loader2, Plus } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { getSession, roleToKey, toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { demoEnfants } from "@/lib/demo-enfants";
import { etabChoices, rsaChoices } from "@/lib/coordination";

export type LookupKind = "enfant" | "etablissement" | "rsai" | "medecin" | "user";

export interface LookupOption { id: string; label: string; hint?: string | undefined }

const idOf = (o: any) => String(o?._id ?? o?.id ?? "");
const nameOf = (o: any) => [o?.prenom, o?.nom].filter(Boolean).join(" ") || o?.nomComplet || o?.name || o?.email || idOf(o);

const demoMedecins = [{ _id: "m1", prenom: "Dr Paul", nom: "Moreau", specialite: "Pédiatre" }, { _id: "m2", prenom: "Dr Sarah", nom: "Lambert", specialite: "Généraliste" }];
const demoUsers = [{ id: "u1", prenom: "Claire", nom: "Durand", role: "parent" }, { id: "m1", prenom: "Dr Paul", nom: "Moreau", role: "medecin" }, { id: "r1", prenom: "Nadia", nom: "Roux", role: "rsai" }];

/** Charge la liste nommée correspondant au type demandé (enfants, crèches, RSAI, médecins, comptes). */
export function useLookupOptions(kind: LookupKind): LookupOption[] {
  const role = roleToKey(getSession()?.user.role);
  const spec = kind === "enfant"
    ? (role === "parent" ? specs.parentEnfants : role === "creche" || role === "rsai" ? specs.enfantsEtab : specs.enfants)
    : kind === "etablissement" ? specs.etabs : kind === "rsai" ? specs.rsais : kind === "user" ? specs.messageDestinataires : specs.medecins;
  const demo = kind === "enfant" ? demoEnfants : kind === "etablissement" ? etabChoices : kind === "rsai" ? rsaChoices : kind === "user" ? demoUsers : demoMedecins;
  const r = useApiOrDemo<unknown>(spec, demo);
  return useMemo(() => toList(r.data).map((o: any) => ({
    id: idOf(o),
    label: nameOf(o),
    hint: kind === "enfant" ? (o.section?.nom ?? o.section ?? undefined) : kind === "etablissement" ? (o.ville ?? o.adresse?.ville) : kind === "medecin" ? o.specialite : kind === "user" ? o.role : undefined,
  })).filter((o) => o.id), [r.data, kind]);
}

const norm = (s: string) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** Champ texte filtrable : on tape un nom, on choisit, l'identifiant est envoyé dans un champ caché. */
export function LookupField({ kind, name, id, required, defaultValue, placeholder, quickCreate }: {
  kind: LookupKind; name: string; id?: string; required?: boolean | undefined; defaultValue?: string | undefined; placeholder?: string | undefined; quickCreate?: boolean | undefined;
}) {
  const baseOptions = useLookupOptions(kind);
  const qc = useQueryClient();
  const [extraOptions, setExtraOptions] = useState<LookupOption[]>([]);
  const [value, setValue] = useState(defaultValue ?? "");
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const [newOpen, setNewOpen] = useState(false);
  const [newBusy, setNewBusy] = useState(false);
  const [newEtab, setNewEtab] = useState({ nom: "", adresse: "", codePostal: "", ville: "", capacite: "" });
  const options = useMemo(() => {
    const known = new Set(extraOptions.map((o) => o.id));
    return [...extraOptions, ...baseOptions.filter((o) => !known.has(o.id))];
  }, [baseOptions, extraOptions]);
  const selected = options.find((o) => o.id === value);
  const text = query ?? selected?.label ?? "";
  const list = options.filter((o) => !query || norm(`${o.label} ${o.hint ?? ""}`).includes(norm(query))).slice(0, 50);
  const ph = placeholder ?? { enfant: "Tapez le nom de l'enfant…", etablissement: "Tapez le nom de la crèche…", rsai: "Tapez le nom de la RSAI…", medecin: "Tapez le nom du médecin…", user: "Tapez le nom du destinataire…" }[kind];

  async function createEtablissement() {
    const nom = newEtab.nom.trim();
    if (!nom) {
      toast.error("Le nom de la crèche est obligatoire.");
      return;
    }
    setNewBusy(true);
    try {
      const res = await send<any>("POST", specs.etabs.path, {
        nom,
        adresse: newEtab.adresse.trim() || undefined,
        codePostal: newEtab.codePostal.trim() || undefined,
        ville: newEtab.ville.trim() || undefined,
        capacite: newEtab.capacite ? Number(newEtab.capacite) : undefined,
      });
      const data = res.data && typeof res.data === "object" ? res.data : {};
      const newId = String(data.id ?? data._id ?? `local-etab-${Date.now()}`);
      const option: LookupOption = { id: newId, label: nom, hint: newEtab.ville.trim() || undefined };
      setExtraOptions((prev) => [option, ...prev.filter((o) => o.id !== newId)]);
      setValue(newId);
      setQuery(null);
      setNewOpen(false);
      setNewEtab({ nom: "", adresse: "", codePostal: "", ville: "", capacite: "" });
      qc.invalidateQueries({ queryKey: ["api", specs.etabs.id] });
      toast.success(res.demo ? "Crèche ajoutée (démo)" : "Crèche ajoutée et sélectionnée");
    } catch (err) {
      toast.error("Création de la crèche impossible", { description: (err as Error).message });
    } finally {
      setNewBusy(false);
    }
  }

  return (
    <div className="relative">
      <input type="hidden" name={name} value={value} />
      <div className="relative">
        <Input id={id} value={text} placeholder={ph} autoComplete="off" required={required && !value}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => { setOpen(false); setQuery(null); }, 150)}
          onChange={(e) => { setQuery(e.target.value); setOpen(true); if (!e.target.value) setValue(""); }}
          onKeyDown={(e) => { if (e.key === "Enter" && open && list[0]) { e.preventDefault(); setValue(list[0].id); setQuery(null); setOpen(false); } }} />
        <ChevronsUpDown className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      </div>
      {open && (
        <ul className="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md">
          {list.length === 0 ? <li className="px-2 py-1.5 text-muted-foreground">Aucun résultat</li> : list.map((o) => (
            <li key={o.id}>
              <button type="button" className="flex w-full items-center gap-2 rounded px-2 py-1.5 text-left hover:bg-accent hover:text-accent-foreground"
                onMouseDown={(e) => { e.preventDefault(); setValue(o.id); setQuery(null); setOpen(false); }}>
                <Check className={`h-4 w-4 ${o.id === value ? "opacity-100" : "opacity-0"}`} />
                <span className="flex-1">{o.label}</span>
                {o.hint && <span className="text-xs text-muted-foreground">{o.hint}</span>}
              </button>
            </li>
          ))}
        </ul>
      )}
      {quickCreate && kind === "etablissement" && (
        <div className="mt-2" onKeyDown={(e) => { if (e.key === "Enter") e.preventDefault(); }}>
          {!newOpen ? (
            <Button type="button" size="sm" variant="outline" onClick={() => setNewOpen(true)}>
              <Plus className="mr-1 h-4 w-4" />Ajouter une crèche
            </Button>
          ) : (
            <div className="space-y-2 rounded-md border bg-muted/30 p-3">
              <p className="text-sm font-medium">Nouvelle crèche</p>
              <Input placeholder="Nom de la crèche *" value={newEtab.nom} onChange={(e) => setNewEtab({ ...newEtab, nom: e.target.value })} />
              <Input placeholder="Adresse" value={newEtab.adresse} onChange={(e) => setNewEtab({ ...newEtab, adresse: e.target.value })} />
              <div className="grid grid-cols-2 gap-2">
                <Input placeholder="Code postal" value={newEtab.codePostal} onChange={(e) => setNewEtab({ ...newEtab, codePostal: e.target.value })} />
                <Input placeholder="Ville" value={newEtab.ville} onChange={(e) => setNewEtab({ ...newEtab, ville: e.target.value })} />
              </div>
              <Input type="number" min={0} placeholder="Capacité" value={newEtab.capacite} onChange={(e) => setNewEtab({ ...newEtab, capacite: e.target.value })} />
              <div className="flex gap-2">
                <Button type="button" size="sm" onClick={createEtablissement} disabled={newBusy}>
                  {newBusy && <Loader2 className="mr-1 h-4 w-4 animate-spin" />}Créer et sélectionner
                </Button>
                <Button type="button" size="sm" variant="ghost" onClick={() => setNewOpen(false)}>Annuler</Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
