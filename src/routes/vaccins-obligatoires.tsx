import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Pencil, Plus, ShieldCheck, Sparkles, Syringe, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Empty, Panel, Pill } from "@/components/dash/widgets";
import { DataTable, type Col } from "@/components/dash/list-page";
import { ConfirmDialog, FormDialog, type Field } from "@/components/dash/crud";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { getSession, roleToKey, toList, userParams } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { send } from "@/lib/mutate";

export const Route = createFileRoute("/vaccins-obligatoires")({
  head: () => ({
    meta: [
      { title: "Vaccins obligatoires & recommandés — Kids'Med IA" },
      { name: "description", content: "Vaccins demandés à l'inscription : socle national et exigences propres à la crèche." },
      { property: "og:title", content: "Vaccins obligatoires & recommandés — Kids'Med IA" },
      { property: "og:description", content: "Gérer les vaccins demandés pour les enfants de la crèche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  { _id: "v1", nom: "Diphtérie-Tétanos-Polio (DTP)", niveau: "obligatoire", description: "3 doses chez le nourrisson.", ageMois: 2, dosesAttendues: 3, portee: "nationale" },
  { _id: "v2", nom: "Rougeole-Oreillons-Rubéole (ROR)", niveau: "obligatoire", description: "2 doses nécessaires.", ageMois: 12, dosesAttendues: 2, portee: "nationale" },
  { _id: "v3", nom: "Méningocoque B", niveau: "recommande", description: "Recommandé chez le nourrisson.", ageMois: 2, dosesAttendues: 3, portee: "nationale" },
  { _id: "v4", nom: "Vaccin contre la grippe", niveau: "recommande", description: "Ajout propre à la crèche.", ageMois: 6, dosesAttendues: 1, portee: "creche", etablissementId: "demo-soleil" },
];

const fields: Field[] = [
  { name: "nom", label: "Nom du vaccin", type: "text", required: true },
  { name: "niveau", label: "Niveau", type: "select", options: ["obligatoire", "recommande"], required: true },
  { name: "dosesAttendues", label: "Doses attendues", type: "number" },
  { name: "ageMois", label: "Âge conseillé (mois)", type: "number" },
  { name: "description", label: "Description / consigne", type: "textarea" },
];

const idOf = (r: any) => String(r?._id ?? r?.id ?? "");

function Page() {
  const session = getSession();
  const role = roleToKey(session?.user.role);
  const sessionEtab = String(userParams(session?.user ?? {})["etablissementId"] ?? "");
  const [selectedEtab, setSelectedEtab] = useState("");
  const etabId = selectedEtab || sessionEtab;
  const canManage = ["creche", "admin", "dev"].includes(role ?? "");
  const isDemo = !!session?.demo;

  const etabsR = useApiOrDemo<unknown>(specs.etabs, [], undefined, { fallbackToDemo: isDemo });
  const r = useApiOrDemo<unknown>(specs.vaccinsReferenceEtab, demo, etabId ? { etablissementId: etabId } : undefined, { fallbackToDemo: isDemo });
  const rows = toList(r.data).map((v) => ({ ...v, portee: v.portee ?? (v.etablissementId ? "creche" : "nationale") }));
  const globaux = rows.filter((v) => v.portee === "nationale");
  const propres = rows.filter((v) => v.portee === "creche");
  const obligatoires = rows.filter((v) => v.niveau === "obligatoire");
  const recommandes = rows.filter((v) => v.niveau === "recommande");
  const etabs = toList(etabsR.data);

  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);

  async function save(v: Record<string, any>) {
    const body = {
      nom: String(v["nom"] ?? "").trim(),
      niveau: String(v["niveau"] ?? "obligatoire"),
      dosesAttendues: v["dosesAttendues"] == null || v["dosesAttendues"] === "" ? 1 : Number(v["dosesAttendues"]),
      ageMois: v["ageMois"] == null || v["ageMois"] === "" ? null : Number(v["ageMois"]),
      description: String(v["description"] ?? "").trim() || null,
    };
    if (!body.nom) { toast.error("Le nom du vaccin est requis."); throw new Error("nom manquant"); }
    try {
      if (editing) await send("PUT", `/vaccins-reference/${idOf(editing)}`, body);
      else {
        if (!etabId) { toast.error("Sélectionnez d'abord une crèche."); throw new Error("etablissement manquant"); }
        await send("POST", "/vaccins-reference", { ...body, ...(role === "creche" ? {} : { etablissementId: etabId }) });
      }
      qc.invalidateQueries({ queryKey: ["api", specs.vaccinsReferenceEtab.id] });
      qc.invalidateQueries({ queryKey: ["api", specs.vaccinsReferenceAdmin.id] });
      toast.success(editing ? "Vaccin modifié" : "Vaccin ajouté à cette crèche");
      setEditing(null);
    } catch (err) { toast.error((err as Error).message); throw err; }
  }

  async function remove() {
    if (!deleting) return;
    try {
      await send("DELETE", `/vaccins-reference/${idOf(deleting)}`);
      qc.invalidateQueries({ queryKey: ["api", specs.vaccinsReferenceEtab.id] });
      toast.success("Vaccin retiré de cette crèche");
      setDeleting(null);
    } catch (err) { toast.error((err as Error).message); }
  }

  const cols: Col[] = [
    { label: "Vaccin", render: (v) => <span className="flex items-center gap-2 font-medium">{v.niveau === "obligatoire" ? <ShieldCheck className="h-4 w-4 text-success" /> : <Sparkles className="h-4 w-4 text-warning" />}{v.nom}</span> },
    { label: "Niveau", render: (v) => <Pill tone={v.niveau === "obligatoire" ? "danger" : "warning"}>{v.niveau === "obligatoire" ? "Obligatoire" : "Recommandé"}</Pill> },
    { label: "Doses", render: (v) => v.dosesAttendues ?? 1 },
    { label: "Âge conseillé", render: (v) => (v.ageMois != null ? `${v.ageMois} mois` : "—") },
    { label: "Périmètre", render: (v) => <Pill tone={v.portee === "creche" ? "success" : "default"}>{v.portee === "creche" ? "Cette crèche" : "National"}</Pill> },
    { label: "Description", render: (v) => <span className="text-muted-foreground">{v.description ?? "—"}</span> },
    {
      label: "Actions", className: "px-3 py-2 text-right whitespace-nowrap",
      render: (v) => v.portee === "creche" && canManage ? (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="Modifier" aria-label={`Modifier ${v.nom}`} onClick={() => setEditing(v)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" title="Supprimer" aria-label={`Supprimer ${v.nom}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(v)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ) : <span className="text-xs text-muted-foreground">Socle national</span>,
    },
  ];

  return (
    <DashboardShell title="Vaccins obligatoires & recommandés" actions={canManage ? <Button onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Ajouter un vaccin</Button> : undefined}>
      {!etabId && (
        <Panel title="Choisir une crèche" icon={Syringe} className="mb-4">
          {etabs.length ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label htmlFor="etab-vaccins" className="text-muted-foreground">Crèche :</label>
              <select id="etab-vaccins" value={selectedEtab} onChange={(e) => setSelectedEtab(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="">Sélectionner</option>
                {etabs.map((e: any) => <option key={idOf(e)} value={idOf(e)}>{e.nom}</option>)}
              </select>
            </div>
          ) : <Empty text="Aucune crèche accessible. Vérifiez votre rattachement." />}
        </Panel>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Obligatoires</p><p className="font-display text-2xl font-semibold">{obligatoires.length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Recommandés</p><p className="font-display text-2xl font-semibold">{recommandes.length}</p></div>
        <div className="rounded-2xl border bg-card p-4 shadow-sm"><p className="text-xs text-muted-foreground">Ajouts de la crèche</p><p className="font-display text-2xl font-semibold">{propres.length}</p></div>
      </div>

      <Panel title={`Vaccins demandés à l'inscription (${rows.length})`} icon={Syringe} spec={specs.vaccinsReferenceEtab} demo={r.demo} reason={r.reason}
        actions={<span className="hidden text-xs text-muted-foreground sm:inline">Le socle national ({globaux.length}) est partagé ; vos ajouts ne concernent que votre crèche.</span>}>
        {rows.length ? <DataTable rows={rows} cols={cols} /> : <Empty text="Aucun vaccin de référence. Ajoutez un vaccin obligatoire ou recommandé." />}
      </Panel>

      <FormDialog
        open={adding || !!editing}
        onOpenChange={(o) => { if (!o) { setAdding(false); setEditing(null); } }}
        title={editing ? "Modifier le vaccin" : "Ajouter un vaccin à cette crèche"}
        description="Ce vaccin sera demandé pour chaque enfant de la crèche. Il n'affecte aucune autre structure."
        fields={fields}
        initial={editing}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={save}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Retirer « ${deleting?.nom ?? "ce vaccin"} » ?`}
        description="Il ne sera plus demandé à l'inscription pour cette crèche. Le socle national n'est pas modifié."
        onConfirm={remove}
      />
    </DashboardShell>
  );
}
