import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, Send, PenSquare } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Empty, Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { FormDialog, type Field } from "@/components/dash/crud";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { toList } from "@/lib/api";
import { send } from "@/lib/mutate";
import { useApiOrDemo } from "@/lib/use-api";

export const Route = createFileRoute("/messagerie")({
  head: () => ({
    meta: [
      { title: "Messagerie — Kids'Med IA" },
      { name: "description", content: "Messages sécurisés entre crèches, familles, RSAI et médecins." },
      { property: "og:title", content: "Messagerie — Kids'Med IA" },
      { property: "og:description", content: "Messagerie sécurisée santé." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Messagerie,
});

const demoRecus = [
  { sujet: "Absence de Lucas demain", contenu: "Bonjour, Lucas sera absent demain pour un rendez-vous.", expediteur: { prenom: "Claire", nom: "Durand" }, createdAt: new Date().toISOString(), lu: false },
  { sujet: "Ordonnance Jade", contenu: "Voici l'ordonnance mise à jour pour Jade.", expediteur: { prenom: "Dr", nom: "Moreau" }, createdAt: "2026-10-06", lu: true },
];
const demoEnvoyes = [{ sujet: "Réunion PAI", contenu: "Réunion jeudi 14h.", destinataire: { prenom: "Nadia", nom: "Roux" }, createdAt: "2026-10-05" }];

function List({ rows, who }: { rows: any[]; who: "expediteur" | "destinataire" }) {
  const [open, setOpen] = useState<number | null>(null);
  if (!rows.length) return <Empty />;
  return (
    <ul className="divide-y">
      {rows.map((m, i) => (
        <li key={m._id ?? i}>
          <button className="w-full py-3 text-left" onClick={() => setOpen(open === i ? null : i)}>
            <div className="flex items-center justify-between gap-2 text-sm">
              <span className={m.lu === false ? "font-semibold" : "font-medium"}>{m.sujet ?? "(sans objet)"}</span>
              <span className="text-xs text-muted-foreground">{fmtDate(m.createdAt)}</span>
            </div>
            <p className="text-xs text-muted-foreground">{fullName(m[who])} {m.lu === false && <Pill tone="warning">Non lu</Pill>}</p>
            {open === i && <p className="mt-2 rounded-lg bg-muted p-3 text-sm">{m.contenu ?? m.message}</p>}
          </button>
        </li>
      ))}
    </ul>
  );
}

const fields: Field[] = [
  { name: "destinataireId", label: "Destinataire", lookup: "user", required: true },
  { name: "sujet", label: "Objet", required: true },
  { name: "enfantId", label: "Enfant concerné (facultatif)", lookup: "enfant" },
  { name: "contenu", label: "Message", type: "textarea", required: true },
];

function Messagerie() {
  const [tab, setTab] = useState<"recus" | "envoyes">("recus");
  const [open, setOpen] = useState(false);
  const qc = useQueryClient();
  // Rafraîchit la boîte de réception toutes les 30 s
  useApiOrDemo(specs.messagesRecus, demoRecus, undefined, { refetchInterval: 30_000 });
  return (
    <DashboardShell title="Messagerie" actions={
      <div className="flex flex-wrap gap-2">
        <Button onClick={() => setOpen(true)}><PenSquare className="mr-1 h-4 w-4" />Nouveau message</Button>
        <Button variant={tab === "recus" ? "default" : "outline"} onClick={() => setTab("recus")}><Inbox className="mr-1 h-4 w-4" />Reçus</Button>
        <Button variant={tab === "envoyes" ? "default" : "outline"} onClick={() => setTab("envoyes")}><Send className="mr-1 h-4 w-4" />Envoyés</Button>
      </div>
    }>
      {tab === "recus" ? (
        <DataPanel title="Messages reçus" icon={Inbox} spec={specs.messagesRecus} demoData={demoRecus}>{(d) => <List rows={toList(d)} who="expediteur" />}</DataPanel>
      ) : (
        <DataPanel title="Messages envoyés" icon={Send} spec={specs.messagesEnvoyes} demoData={demoEnvoyes}>{(d) => <List rows={toList(d)} who="destinataire" />}</DataPanel>
      )}
      <FormDialog open={open} onOpenChange={setOpen} title="Nouveau message" fields={fields} submitLabel="Envoyer" onSubmit={async (v) => {
        if (!v.destinataireId) { toast.error("Choisissez un destinataire dans la liste."); throw new Error("Destinataire manquant"); }
        try {
          const res = await send("POST", specs.messageEnvoyer.path, { destinataireId: v.destinataireId, sujet: v.sujet, contenu: v.contenu, enfantId: v.enfantId || undefined });
          qc.invalidateQueries({ queryKey: ["api", specs.messagesEnvoyes.id] });
          toast.success(res.demo ? "Message envoyé (démo)" : "Message envoyé");
          setTab("envoyes");
        } catch (e) { toast.error(`Envoi refusé : ${(e as Error).message}`); throw e; }
      }} />
    </DashboardShell>
  );
}
