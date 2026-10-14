import { useEffect, useRef, useState } from "react";
import { MapPin, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";

export interface AddressPick { label: string; rue: string; ville: string; codePostal: string; latitude: number; longitude: number }

/** Champ adresse unique : suggestions en direct (api-adresse.data.gouv.fr) et coordonnées GPS. */
export function AddressInput({ id, defaultValue = "", onPick, placeholder = "Tapez une adresse…" }: {
  id?: string; defaultValue?: string; onPick: (a: AddressPick | null) => void; placeholder?: string;
}) {
  const [q, setQ] = useState(defaultValue);
  const [items, setItems] = useState<AddressPick[]>([]);
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [active, setActive] = useState(0);
  const skip = useRef(true);

  useEffect(() => {
    if (skip.current) { skip.current = false; return; }
    if (q.trim().length < 3) { setItems([]); return; }
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      setBusy(true);
      try {
        const r = await fetch(`https://api-adresse.data.gouv.fr/search/?q=${encodeURIComponent(q)}&limit=8`, { signal: ctrl.signal });
        const j = await r.json();
        setItems((j.features ?? []).map((f: any) => ({
          label: f.properties.label, rue: f.properties.name, ville: f.properties.city, codePostal: f.properties.postcode,
          longitude: f.geometry.coordinates[0], latitude: f.geometry.coordinates[1],
        })));
        setActive(0); setOpen(true);
      } catch { /* annulé */ } finally { setBusy(false); }
    }, 250);
    return () => { clearTimeout(t); ctrl.abort(); };
  }, [q]);

  function choose(a: AddressPick) { skip.current = true; setQ(a.label); setOpen(false); onPick(a); }

  return (
    <div className="relative">
      <MapPin className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
      <Input id={id} value={q} autoComplete="off" placeholder={placeholder} className="pl-8"
        onChange={(e) => { setQ(e.target.value); onPick(null); }}
        onFocus={() => items.length && setOpen(true)}
        onBlur={() => setTimeout(() => setOpen(false), 150)}
        onKeyDown={(e) => {
          if (!open || !items.length) return;
          if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, items.length - 1)); }
          if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
          if (e.key === "Enter") { e.preventDefault(); const a = items[active]; if (a) choose(a); }
        }} />
      {busy && <Loader2 className="absolute right-2.5 top-2.5 h-4 w-4 animate-spin text-muted-foreground" />}
      {open && items.length > 0 && (
        <ul className="absolute z-50 mt-1 max-h-64 w-full overflow-y-auto rounded-md border bg-popover p-1 text-sm text-popover-foreground shadow-md">
          {items.map((a, i) => (
            <li key={a.label}>
              <button type="button" onMouseDown={(e) => { e.preventDefault(); choose(a); }}
                className={`flex w-full flex-col rounded px-2 py-1.5 text-left ${i === active ? "bg-accent" : "hover:bg-accent"}`}>
                <span className="font-medium">{a.rue}</span>
                <span className="text-xs text-muted-foreground">{a.codePostal} {a.ville}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

/** Version formulaire : écrit adresse, ville, codePostal, latitude, longitude dans des champs cachés. */
export function AddressField({ id, required, defaultValue }: { id: string; required?: boolean | undefined; defaultValue?: string }) {
  const [a, setA] = useState<AddressPick | null>(null);
  return (
    <>
      <AddressInput id={id} defaultValue={defaultValue ?? ""} onPick={setA} />
      <input type="hidden" name="adresse" value={a?.label ?? defaultValue ?? ""} />
      <input type="hidden" name="ville" value={a?.ville ?? ""} />
      <input type="hidden" name="codePostal" value={a?.codePostal ?? ""} />
      <input type="hidden" name="latitude" value={a?.latitude ?? ""} />
      <input type="hidden" name="longitude" value={a?.longitude ?? ""} />
      {required && <input tabIndex={-1} aria-hidden className="sr-only" required value={a || defaultValue ? "ok" : ""} onChange={() => {}} />}
      <p className="text-xs text-muted-foreground">{a ? `GPS : ${a.latitude.toFixed(5)}, ${a.longitude.toFixed(5)}` : "Choisissez une adresse dans la liste pour récupérer la position GPS."}</p>
    </>
  );
}
