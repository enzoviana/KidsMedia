import { createFileRoute } from "@tanstack/react-router";
import { ClipboardCheck } from "lucide-react";
import { ListPage, type Col } from "@/components/dash/list-page";
import { type Crud } from "@/components/dash/crud";
import { Pill } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { getSession, roleToKey } from "@/lib/api";

export const Route = createFileRoute("/documents-obligatoires")({
  head: () => ({
    meta: [
      { title: "Documents obligatoires — Kids'Med IA" },
      { name: "description", content: "Documents exigés par l'établissement." },
      { property: "og:title", content: "Documents obligatoires — Kids'Med IA" },
      { property: "og:description", content: "Documents exigés par l'établissement." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [
  { _id: "doc-oblig-1", type: "Carnet de vaccination", description: "Vaccins obligatoires à jour", validiteMois: 12 },
  { _id: "doc-oblig-2", type: "Attestation d'assurance", description: "Responsabilité civile", validiteMois: 12 },
  { _id: "doc-oblig-3", type: "Autorisation de sortie", description: "Sorties extérieures", validiteMois: null },
];
const cols: Col[] = [
  { label: "Document", render: (r) => <span className="font-medium">{r.type ?? r.nom ?? "—"}</span> },
  { label: "Description", render: (r) => r.description ?? "—" },
  { label: "Validité", render: (r) => (r.validiteMois ? <Pill tone="warning">{r.validiteMois} mois</Pill> : "—") },
];

function Page() {
  const role = roleToKey(getSession()?.user.role);
  const canManage = role === "creche" || role === "admin" || role === "dev";
  const crud: Crud = {
    entity: "un document obligatoire",
    base: "/documents-obligatoires",
    extra: { etablissementId: ":etablissementId" },
    noCreate: !canManage,
    noEdit: !canManage,
    noDelete: !canManage,
    fields: [
      { name: "type", label: "Document obligatoire", type: "text", required: true },
      { name: "description", label: "Description", type: "textarea" },
      { name: "validiteMois", label: "Validité (mois)", type: "number" },
    ],
  };
  return (
    <ListPage
      crud={crud}
      title="Documents obligatoires"
      spec={specs.docsOblig}
      demo={demo}
      cols={cols}
      icon={ClipboardCheck}
      before={<p className="text-sm text-muted-foreground">Ces documents sont exigés pour chaque enfant de la crèche. Les familles les déposent depuis « Documents ».</p>}
    />
  );
}
