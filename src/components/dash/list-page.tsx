import { useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { Search, Plus, Eye, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { DashboardShell } from "./shell";
import { Panel, Empty } from "./widgets";
import { FormDialog, ViewDialog, ConfirmDialog, type Crud } from "./crud";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { RouteSpec } from "@/lib/specs";
import type { RoleKey } from "@/lib/api";
import { toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { send, fillPath } from "@/lib/mutate";
import { enfantIdOf } from "@/lib/demo-enfants";

export interface Col { label: string; render: (row: any) => ReactNode; className?: string }

export function DataTable({ rows, cols, onOpenRow }: { rows: any[]; cols: Col[]; onOpenRow?: ((row: any) => void) | undefined }) {
  if (!rows.length) return <Empty />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b text-left text-xs uppercase tracking-wider text-muted-foreground">
            {cols.map((c) => <th key={c.label} className="px-3 py-2 font-medium">{c.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {rows.map((r, i) => (
            <tr key={r._id ?? r.id ?? i} className={`border-b last:border-0 hover:bg-accent/40 ${onOpenRow ? "cursor-pointer" : ""}`} onClick={onOpenRow ? (event) => {
              const target = event.target;
              if (target instanceof Element && target.closest("a, button, input, select, textarea, [role='button']")) return;
              onOpenRow(r);
            } : undefined}>
              {cols.map((c) => <td key={c.label} className={c.className ?? "px-3 py-3"}>{c.render(r)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const rid = (r: any) => String(r?._id ?? r?.id ?? "");

/** Page liste générique : charge la spec (API ou démo), recherche, tableau et boutons Ajouter/Voir/Modifier/Supprimer. */
export function ListPage({ title, role, spec, demo, cols, icon, actions, vars, before, crud, additionalRows = [], onOpenRow }: {
  title: string; role?: RoleKey | undefined; spec: RouteSpec; demo: any[]; cols: Col[]; icon?: LucideIcon | undefined; actions?: ReactNode;
  vars?: Record<string, string | undefined> | undefined; before?: ReactNode; crud?: Crud | undefined; additionalRows?: any[];
  onOpenRow?: ((row: any) => void) | undefined;
}) {
  const r = useApiOrDemo<unknown>(spec, demo, vars);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [q, setQ] = useState("");
  const [local, setLocal] = useState<any[] | null>(null);
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [viewing, setViewing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const base = [...additionalRows, ...(local ?? toList(r.data))].filter((row, index, all) => !row._id || all.findIndex((x) => x._id === row._id) === index);
  const rows = base.filter((x) => !q || JSON.stringify(x).toLowerCase().includes(q.toLowerCase()));

  const done = (msg: string, demoMode: boolean) => {
    toast.success(demoMode ? `${msg} (mode démo)` : msg);
    if (!demoMode) qc.invalidateQueries({ queryKey: ["api", spec.id] });
  };
  const fail = (e: unknown) => { toast.error((e as Error).message); throw e; };

  async function create(v: Record<string, any>) {
    if (!crud) return;
    const extra = Object.fromEntries(Object.entries(crud.extra ?? {}).map(([k, val]) => [k, fillPath(val)]));
    try {
      const res = await send<any>("POST", crud.base, { ...extra, ...v });
      setLocal([{ _id: `local-${Date.now()}`, ...v, ...(res.data && typeof res.data === "object" ? res.data : {}) }, ...base]);
      done(`${cap(crud.entity)} ajouté(e)`, res.demo);
    } catch (e) { fail(e); }
  }
  async function update(v: Record<string, any>) {
    if (!crud || !editing) return;
    try {
      const res = await send("PUT", `${crud.base}/${rid(editing)}`, v);
      setLocal(base.map((x) => (rid(x) === rid(editing) ? { ...x, ...v } : x)));
      done("Modifications enregistrées", res.demo);
    } catch (e) { fail(e); }
  }
  async function remove() {
    if (!crud || !deleting) return;
    try {
      const res = await send("DELETE", `${crud.base}/${rid(deleting)}`);
      setLocal(base.filter((x) => rid(x) !== rid(deleting)));
      done("Élément supprimé", res.demo);
    } catch (e) { toast.error((e as Error).message); }
  }

  const allCols: Col[] = crud ? [...cols, {
    label: "Actions", className: "px-3 py-2 text-right whitespace-nowrap", render: (row) => (
      <div className="flex justify-end gap-1">
        {crud.view === "enfant" && enfantIdOf(row) ? (
          <Button size="icon" variant="ghost" title="Voir le dossier" aria-label={`Voir le dossier de ${[row.prenom, row.nom].filter(Boolean).join(" ")}`} asChild><Link to="/enfants/$enfantId" params={{ enfantId: enfantIdOf(row) ?? "" }}><Eye className="h-4 w-4" /></Link></Button>
        ) : crud.view === "etablissement" && rid(row) ? (
          <Button size="icon" variant="ghost" title="Voir" asChild><Link to="/etablissements/$etablissementId" params={{ etablissementId: rid(row) }}><Eye className="h-4 w-4" /></Link></Button>
        ) : (
          <Button size="icon" variant="ghost" title="Voir" onClick={() => setViewing(row)}><Eye className="h-4 w-4" /></Button>
        )}
        {!crud.noEdit && <Button size="icon" variant="ghost" title="Modifier" onClick={() => setEditing(row)}><Pencil className="h-4 w-4" /></Button>}
        {!crud.noDelete && <Button size="icon" variant="ghost" title="Supprimer" className="text-destructive hover:text-destructive" onClick={() => setDeleting(row)}><Trash2 className="h-4 w-4" /></Button>}
      </div>
    ),
  }] : cols;

  return (
    <DashboardShell role={role} title={title} actions={<div className="flex gap-2">{actions}{crud && !crud.noCreate && <Button onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Ajouter</Button>}</div>}>
      {before}
      <Panel title={`${rows.length} résultat${rows.length > 1 ? "s" : ""}`} icon={icon} spec={spec} demo={r.demo} reason={r.reason}
        actions={
          <div className="relative w-56">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filtrer…" className="pl-8" />
          </div>
        }>
        <DataTable rows={rows} cols={allCols} onOpenRow={onOpenRow ?? (crud?.view === "enfant" ? (row) => {
          const enfantId = enfantIdOf(row);
          if (enfantId) navigate({ to: "/enfants/$enfantId", params: { enfantId } });
        } : undefined)} />
      </Panel>
      {crud && (
        <>
          <FormDialog open={adding} onOpenChange={setAdding} title={`Ajouter ${crud.entity}`} fields={crud.fields} submitLabel="Ajouter" onSubmit={create} />
          <FormDialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)} title={`Modifier ${crud.entity}`} fields={crud.fields} initial={editing} onSubmit={update} />
          <ViewDialog row={viewing} onOpenChange={(o) => !o && setViewing(null)} title={`Détail — ${crud.entity}`} />
          <ConfirmDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)} title={`Supprimer ${crud.entity} ?`} description="Cette action est définitive." onConfirm={remove} />
        </>
      )}
    </DashboardShell>
  );
}

const cap = (s: string) => s.replace(/^(un|une|le|la)\s+/i, "").replace(/^./, (c) => c.toUpperCase());
