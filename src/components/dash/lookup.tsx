import { useMemo, useState } from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { getSession, roleToKey, toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
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
export function LookupField({ kind, name, id, required, defaultValue, placeholder }: {
  kind: LookupKind; name: string; id?: string; required?: boolean | undefined; defaultValue?: string | undefined; placeholder?: string | undefined;
}) {
  const options = useLookupOptions(kind);
  const [value, setValue] = useState(defaultValue ?? "");
  const [query, setQuery] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const selected = options.find((o) => o.id === value);
  const text = query ?? selected?.label ?? "";
  const list = options.filter((o) => !query || norm(`${o.label} ${o.hint ?? ""}`).includes(norm(query))).slice(0, 50);
  const ph = placeholder ?? { enfant: "Tapez le nom de l'enfant…", etablissement: "Tapez le nom de la crèche…", rsai: "Tapez le nom de la RSAI…", medecin: "Tapez le nom du médecin…", user: "Tapez le nom du destinataire…" }[kind];

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
    </div>
  );
}
