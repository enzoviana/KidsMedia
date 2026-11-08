import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { AlertTriangle, ClipboardCheck, Eye, Pencil, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Empty, Panel, Pill, fullName } from "@/components/dash/widgets";
import { DataTable, type Col } from "@/components/dash/list-page";
import { ConfirmDialog, EnfantLink, FormDialog, type Field } from "@/components/dash/crud";
import { UploadDocButton } from "@/components/dash/upload";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { getSession, roleToKey, toList, userParams } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { send } from "@/lib/mutate";
import { documentEtat, demoDocuments } from "@/lib/coordination";
import { demoEnfants, docsInscription } from "@/lib/demo-enfants";

export const Route = createFileRoute("/documents-obligatoires")({
  head: () => ({
    meta: [
      { title: "Documents obligatoires — Kids'Med IA" },
      { name: "description", content: "Dossier d'inscription des enfants et documents exigés par la crèche." },
      { property: "og:title", content: "Documents obligatoires — Kids'Med IA" },
      { property: "og:description", content: "Dossier d'inscription des enfants et documents exigés par la crèche." },
      { property: "og:type", content: "website" },
      { property: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demoOblig = docsInscription.map((type, i) => ({
  _id: `demo-oblig-${i}`,
  type,
  description: i === 0 ? "Aptitude à la vie en collectivité" : "Pièce du dossier d'inscription",
  validiteMois: type.startsWith("Autorisation") ? null : 12,
}));

const idOf = (o: any) => String(o?._id ?? o?.id ?? "");
const norm = (s: any) => String(s ?? "").trim().toLowerCase();
const docChildId = (d: any) => String(d?.enfantId ?? d?.enfant?._id ?? d?.enfant?.id ?? "");

type DocState = { key: "manquant" | "rejete" | "expire" | "expiration_proche" | "valide"; label: string; tone: "danger" | "warning" | "success" };

function stateOf(doc: any): DocState {
  if (!doc) return { key: "manquant", label: "Manquant", tone: "danger" };
  if (doc.statut === "rejete") return { key: "rejete", label: "Rejeté", tone: "danger" };
  if (doc.dateValidite) {
    const end = new Date(`${String(doc.dateValidite).slice(0, 10)}T23:59:59`).getTime();
    if (Number.isFinite(end)) {
      if (end < Date.now()) return { key: "expire", label: "Expiré", tone: "danger" };
      if (end - Date.now() <= 30 * 864e5) return { key: "expiration_proche", label: "Expire bientôt", tone: "warning" };
    }
  }
  return { key: "valide", label: "Valide", tone: "success" };
}

const requiredFields: Field[] = [
  { name: "type", label: "Document obligatoire", type: "text", required: true },
  { name: "description", label: "Description", type: "textarea" },
  { name: "validiteMois", label: "Validité (mois)", type: "number" },
];

function Page() {
  const session = getSession();
  const role = roleToKey(session?.user.role);
  const sessionEtab = String(userParams(session?.user ?? {})["etablissementId"] ?? "");
  const [selectedEtab, setSelectedEtab] = useState("");
  const etabId = selectedEtab || sessionEtab;
  const canManage = ["creche", "admin", "dev"].includes(role ?? "");
  const isDemo = !!session?.demo;

  const etabsR = useApiOrDemo<unknown>(specs.etabs, [], undefined, { fallbackToDemo: isDemo });
  const childrenR = useApiOrDemo<unknown>(specs.enfants, demoEnfants, undefined, { fallbackToDemo: isDemo });
  const docsSpec = ["creche", "rsai"].includes(role ?? "") ? specs.docsEtab : specs.documentsAccessibles;
  const docsR = useApiOrDemo<unknown>(docsSpec, demoDocuments, docsSpec === specs.docsEtab && etabId ? { etablissementId: etabId } : undefined, { fallbackToDemo: isDemo });
  const obligR = useApiOrDemo<unknown>(specs.docsOblig, demoOblig, etabId ? { etablissementId: etabId } : undefined, { fallbackToDemo: isDemo });

  const qc = useQueryClient();
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [deleting, setDeleting] = useState<any>(null);
  const [localRequired, setLocalRequired] = useState<any[] | null>(null);

  const children = toList(childrenR.data);
  const docs = toList(docsR.data);
  const required = localRequired ?? toList(obligR.data);
  const requiredTypes = [...new Set(required.map((r) => String(r.type ?? "").trim()).filter(Boolean))];
  const defaultUploadTypes = requiredTypes.length ? requiredTypes : ["Autre"];
  const etabs = toList(etabsR.data);

  const rows = children.map((child) => {
    const cid = idOf(child);
    const childDocs = docs.filter((d) => docChildId(d) === cid);
    const types = [...requiredTypes];
    if (child.pai && !types.some((t) => /^pai/i.test(t))) types.push("PAI");
    const states = types.map((type) => {
      const doc = childDocs
        .filter((d) => norm(d.type) === norm(type))
        .sort((a, b) => +new Date(b.createdAt ?? 0) - +new Date(a.createdAt ?? 0))[0];
      return { type, doc, ...stateOf(doc) };
    });
    const alerts = states.filter((s) => s.key !== "valide");
    return {
      ...child,
      _id: cid,
      childDocs,
      requiredStates: states,
      alerts,
      alertCount: alerts.length,
      okCount: states.length - alerts.length,
      total: states.length,
    };
  }).sort((a, b) => b.alertCount - a.alertCount || fullName(a).localeCompare(fullName(b), "fr"));

  const childCols: Col[] = [
    {
      label: "Enfant",
      render: (r) => (
        <div className="flex items-center gap-2">
          {r.alertCount > 0 && (
            <span title={`${r.alertCount} document(s) à traiter`} className="inline-flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
              {r.alertCount}
            </span>
          )}
          <EnfantLink e={r} />
        </div>
      ),
    },
    {
      label: "Dossier d'inscription",
      render: (r) => r.total === 0
        ? <Pill tone="warning">Aucun document exigé</Pill>
        : r.alertCount
          ? <Pill tone="danger">À compléter · {r.okCount}/{r.total}</Pill>
          : <Pill tone="success">À jour · {r.okCount}/{r.total}</Pill>,
    },
    {
      label: "Alertes",
      render: (r) => r.alerts.length ? (
        <div className="flex flex-wrap gap-1">
          {r.alerts.slice(0, 4).map((a: any) => (
            <Pill key={a.type} tone={a.tone}>{a.type} · {a.label}</Pill>
          ))}
          {r.alerts.length > 4 && <Pill>+{r.alerts.length - 4}</Pill>}
        </div>
      ) : <span className="text-sm text-muted-foreground">À jour</span>,
    },
    {
      label: "Documents déposés",
      render: (r) => r.childDocs.length ? (
        <div className="flex max-w-xs flex-wrap gap-1">
          {r.childDocs.map((d: any, i: number) => {
            const st = stateOf(d);
            return (
              <span key={idOf(d) || `${d.type}-${i}`} className="inline-flex items-center gap-1 rounded-md border bg-background px-1.5 py-0.5 text-xs">
                <span>{d.type ?? d.nom}</span>
                <Pill tone={st.tone}>{documentEtat(d) === "valide" ? "valide" : st.label}</Pill>
                {d.url && <a href={d.url} target="_blank" rel="noopener noreferrer" className="text-primary" title="Ouvrir le document" aria-label={`Ouvrir ${d.type ?? "le document"}`}><Eye className="h-3 w-3" /></a>}
              </span>
            );
          })}
        </div>
      ) : <span className="text-sm text-muted-foreground">Aucun</span>,
    },
    {
      label: "Action",
      render: (r) => (
        <UploadDocButton
          size="sm"
          label="Téléverser"
          enfantId={r._id}
          types={r.requiredStates.length ? r.requiredStates.map((s: any) => s.type) : defaultUploadTypes}
          onUploaded={() => qc.invalidateQueries({ queryKey: ["api"] })}
        />
      ),
    },
  ];

  const requiredCols: Col[] = [
    { label: "Document obligatoire", render: (r) => <span className="font-medium">{r.type}</span> },
    { label: "Description", render: (r) => r.description ?? "—" },
    { label: "Validité", render: (r) => (r.validiteMois ? <Pill tone="warning">{r.validiteMois} mois</Pill> : "—") },
    {
      label: "Actions",
      className: "px-3 py-2 text-right whitespace-nowrap",
      render: (r) => canManage ? (
        <div className="flex justify-end gap-1">
          <Button size="icon" variant="ghost" title="Modifier" aria-label={`Modifier ${r.type}`} onClick={() => setEditing(r)}><Pencil className="h-4 w-4" /></Button>
          <Button size="icon" variant="ghost" title="Supprimer" aria-label={`Supprimer ${r.type}`} className="text-destructive hover:text-destructive" onClick={() => setDeleting(r)}><Trash2 className="h-4 w-4" /></Button>
        </div>
      ) : null,
    },
  ];

  async function saveRequired(v: Record<string, any>) {
    const body = {
      type: String(v["type"] ?? "").trim(),
      description: String(v["description"] ?? "").trim() || null,
      validiteMois: v["validiteMois"] == null || v["validiteMois"] === "" ? null : Number(v["validiteMois"]),
    };
    if (!body.type) { toast.error("Le nom du document obligatoire est requis."); throw new Error("type manquant"); }
    try {
      if (editing) await send("PUT", `/documents-obligatoires/${idOf(editing)}`, body);
      else {
        if (!etabId) { toast.error("Sélectionnez d'abord une crèche."); throw new Error("etablissement manquant"); }
        await send("POST", "/documents-obligatoires", { ...body, etablissementId: etabId });
      }
      const saved = { ...body, _id: editing ? idOf(editing) : `local-${Date.now()}` };
      setLocalRequired(editing ? required.map((r) => (idOf(r) === idOf(editing) ? { ...r, ...saved } : r)) : [...required, saved]);
      qc.invalidateQueries({ queryKey: ["api", specs.docsOblig.id] });
      toast.success(editing ? "Document obligatoire modifié" : "Document obligatoire ajouté");
      setEditing(null);
    } catch (err) {
      toast.error((err as Error).message);
      throw err;
    }
  }

  async function removeRequired() {
    if (!deleting) return;
    try {
      await send("DELETE", `/documents-obligatoires/${idOf(deleting)}`);
      setLocalRequired(required.filter((r) => idOf(r) !== idOf(deleting)));
      qc.invalidateQueries({ queryKey: ["api", specs.docsOblig.id] });
      toast.success("Document obligatoire supprimé");
      setDeleting(null);
    } catch (err) {
      toast.error((err as Error).message);
    }
  }

  return (
    <DashboardShell
      title="Documents obligatoires"
      actions={canManage ? <Button onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Ajouter un document exigé</Button> : undefined}
    >
      {!etabId && (
        <Panel title="Choisir une crèche" icon={ClipboardCheck} className="mb-4">
          {etabs.length ? (
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <label htmlFor="etab-select" className="text-muted-foreground">Crèche :</label>
              <select id="etab-select" value={selectedEtab} onChange={(e) => setSelectedEtab(e.target.value)} className="h-9 rounded-md border bg-background px-3 text-sm">
                <option value="">Sélectionner</option>
                {etabs.map((e: any) => <option key={idOf(e)} value={idOf(e)}>{e.nom}</option>)}
              </select>
            </div>
          ) : (
            <Empty text={role === "creche" ? "Aucune crèche n'est rattachée à votre compte. Contactez l'administrateur." : "Aucune crèche accessible. Vérifiez vos affectations."} />
          )}
        </Panel>
      )}

      <Panel
        title={`Dossier d'inscription par enfant (${rows.length})`}
        icon={ClipboardCheck}
        spec={specs.enfants}
        demo={childrenR.demo}
        reason={childrenR.reason}
        actions={<span className="hidden items-center gap-1 text-xs text-muted-foreground sm:flex"><AlertTriangle className="h-3.5 w-3.5" />Les enfants en alerte sont affichés en premier</span>}
      >
        <DataTable rows={rows} cols={childCols} />
      </Panel>

      <Panel
        className="mt-4"
        title={`Documents exigés par la crèche (${required.length})`}
        icon={ClipboardCheck}
        spec={specs.docsOblig}
        demo={obligR.demo}
        reason={obligR.reason}
        actions={canManage ? <Button size="sm" variant="outline" onClick={() => setAdding(true)}><Plus className="mr-1 h-4 w-4" />Ajouter</Button> : undefined}
      >
        {required.length ? <DataTable rows={required} cols={requiredCols} /> : <Empty text="Aucun document obligatoire. Les téléversements proposeront uniquement « Autre »." />}
      </Panel>

      <FormDialog
        open={adding || !!editing}
        onOpenChange={(o) => { if (!o) { setAdding(false); setEditing(null); } }}
        title={editing ? "Modifier le document obligatoire" : "Ajouter un document obligatoire"}
        description="Ce document sera demandé pour chaque enfant et proposé lors du téléversement."
        fields={requiredFields}
        initial={editing}
        submitLabel={editing ? "Enregistrer" : "Ajouter"}
        onSubmit={saveRequired}
      />
      <ConfirmDialog
        open={!!deleting}
        onOpenChange={(o) => !o && setDeleting(null)}
        title={`Supprimer « ${deleting?.type ?? "ce document"} » ?`}
        description="Il ne sera plus demandé pour les enfants. Les fichiers déjà déposés restent dans les dossiers."
        onConfirm={removeRequired}
      />
    </DashboardShell>
  );
}
