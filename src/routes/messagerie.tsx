import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Inbox, Send, PenSquare, Reply, Baby } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Empty, Pill, fullName, fmtDate } from "@/components/dash/widgets";
import { EnfantLink, FormDialog, type Field } from "@/components/dash/crud";
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
  { _id: "msg-demo-1", sujet: "Absence de Lucas demain", contenu: "Bonjour, Lucas sera absent demain pour un rendez-vous.", expediteur: { _id: "u1", prenom: "Claire", nom: "Durand" }, enfant: { _id: "demo-lucas", prenom: "Lucas", nom: "Durand" }, enfantId: "demo-lucas", createdAt: new Date().toISOString(), lu: false },
  { _id: "msg-demo-2", sujet: "Ordonnance Jade", contenu: "Voici l'ordonnance mise à jour pour Jade.", expediteur: { _id: "m1", prenom: "Dr", nom: "Moreau" }, enfant: { _id: "demo-jade", prenom: "Jade", nom: "Petit" }, enfantId: "demo-jade", createdAt: "2026-10-06", lu: true },
];
const demoEnvoyes = [{ _id: "msg-demo-3", sujet: "Réunion PAI", contenu: "Réunion jeudi 14h.", destinataire: { _id: "r1", prenom: "Nadia", nom: "Roux" }, enfant: { _id: "demo-lucas", prenom: "Lucas", nom: "Durand" }, enfantId: "demo-lucas", createdAt: "2026-10-05" }];

const idOf = (m: any) => String(m?._id ?? m?.id ?? "");

function List({ rows, who, onRead, onReply }: {
  rows: any[];
  who: "expediteur" | "destinataire";
  onRead?: (m: any) => Promise<boolean | void>;
  onReply?: (m: any) => void;
}) {
  const [openId, setOpenId] = useState<string | null>(null);
  const [localRead, setLocalRead] = useState<Set<string>>(new Set());
  if (!rows.length) return <Empty />;

  async function toggle(m: any, key: string) {
    const willOpen = openId !== key;
    setOpenId(willOpen ? key : null);
    if (!willOpen) return;
    if (who === "expediteur" && m.lu === false && !localRead.has(key)) {
      setLocalRead((prev) => new Set(prev).add(key));
      const ok = await onRead?.(m);
      if (ok === false) {
        setLocalRead((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    }
  }

  return (
    <ul className="divide-y">
      {rows.map((m, i) => {
        const key = idOf(m) || `i-${i}`;
        const unread = who === "expediteur" && m.lu === false && !localRead.has(key);
        const isOpen = openId === key;
        const enfant = m.enfant ?? (m.enfantId ? { _id: m.enfantId } : null);
        return (
          <li key={key} className="py-3">
            <button type="button" className="w-full text-left" onClick={() => void toggle(m, key)} aria-expanded={isOpen}>
              <div className="flex items-center justify-between gap-2 text-sm">
                <span className={unread ? "font-semibold" : "font-medium"}>{m.sujet ?? "(sans objet)"}</span>
                <span className="text-xs text-muted-foreground">{fmtDate(m.createdAt)}</span>
              </div>
              <p className="text-xs text-muted-foreground">{fullName(m[who])} {unread && <Pill tone="warning">Non lu</Pill>}</p>
              {enfant && <p className="mt-1 flex items-center gap-1 text-xs text-muted-foreground"><Baby className="h-3 w-3" />Enfant concerné : {fullName(enfant)}</p>}
            </button>
            {isOpen && (
              <div className="mt-2 rounded-lg bg-muted p-3 text-sm">
                <p className="whitespace-pre-wrap">{m.contenu ?? m.message}</p>
                {enfant && <p className="mt-2 text-xs text-muted-foreground">Enfant concerné : <EnfantLink e={enfant} /></p>}
                {onReply && who === "expediteur" && (
                  <div className="mt-3 flex justify-end">
                    <Button size="sm" onClick={() => onReply(m)}><Reply className="mr-1 h-4 w-4" />Répondre</Button>
                  </div>
                )}
              </div>
            )}
          </li>
        );
      })}
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
  const [compose, setCompose] = useState(false);
  const [replyTo, setReplyTo] = useState<any>(null);
  const qc = useQueryClient();
  // Rafraîchit la boîte de réception toutes les 30 s
  useApiOrDemo(specs.messagesRecus, demoRecus, undefined, { refetchInterval: 30_000 });

  async function markRead(m: any) {
    const id = idOf(m);
    if (!id || m.lu !== false) return true;
    try {
      await send("PATCH", `/messages/${id}/lu`, {});
      qc.invalidateQueries({ queryKey: ["api", specs.messagesRecus.id] });
      return true;
    } catch (e) {
      toast.error("Impossible de marquer le message comme lu", { description: (e as Error).message });
      return false;
    }
  }

  function newMessage() {
    setReplyTo(null);
    setCompose(true);
  }

  function reply(m: any) {
    setReplyTo(m);
    setCompose(true);
  }

  const initial = replyTo ? {
    destinataireId: replyTo.expediteur?.id ?? replyTo.expediteur?._id ?? replyTo.expediteurId ?? "",
    sujet: /^re\s*:/i.test(replyTo.sujet ?? "") ? replyTo.sujet : `Re: ${replyTo.sujet ?? ""}`,
    enfantId: replyTo.enfant?.id ?? replyTo.enfant?._id ?? replyTo.enfantId ?? "",
  } : undefined;

  return (
    <DashboardShell title="Messagerie" actions={
      <div className="flex flex-wrap gap-2">
        <Button onClick={newMessage}><PenSquare className="mr-1 h-4 w-4" />Nouveau message</Button>
        <Button variant={tab === "recus" ? "default" : "outline"} onClick={() => setTab("recus")}><Inbox className="mr-1 h-4 w-4" />Reçus</Button>
        <Button variant={tab === "envoyes" ? "default" : "outline"} onClick={() => setTab("envoyes")}><Send className="mr-1 h-4 w-4" />Envoyés</Button>
      </div>
    }>
      {tab === "recus" ? (
        <DataPanel title="Messages reçus" icon={Inbox} spec={specs.messagesRecus} demoData={demoRecus}>
          {(d) => <List rows={toList(d)} who="expediteur" onRead={markRead} onReply={reply} />}
        </DataPanel>
      ) : (
        <DataPanel title="Messages envoyés" icon={Send} spec={specs.messagesEnvoyes} demoData={demoEnvoyes}>
          {(d) => <List rows={toList(d)} who="destinataire" />}
        </DataPanel>
      )}
      <FormDialog
        open={compose}
        onOpenChange={(o) => { setCompose(o); if (!o) setReplyTo(null); }}
        title={replyTo ? "Répondre au message" : "Nouveau message"}
        fields={fields}
        initial={initial}
        submitLabel={replyTo ? "Envoyer la réponse" : "Envoyer"}
        onSubmit={async (v) => {
          if (!v.destinataireId) { toast.error("Choisissez un destinataire dans la liste."); throw new Error("Destinataire manquant"); }
          try {
            const res = await send("POST", specs.messageEnvoyer.path, { destinataireId: v.destinataireId, sujet: v.sujet, contenu: v.contenu, enfantId: v.enfantId || undefined });
            qc.invalidateQueries({ queryKey: ["api", specs.messagesEnvoyes.id] });
            qc.invalidateQueries({ queryKey: ["api", specs.messagesRecus.id] });
            toast.success(res.demo
              ? (replyTo ? "Réponse envoyée (démo)" : "Message envoyé (démo)")
              : (replyTo ? "Réponse envoyée" : "Message envoyé"));
            setReplyTo(null);
            setTab("envoyes");
          } catch (e) { toast.error(`Envoi refusé : ${(e as Error).message}`); throw e; }
        }}
      />
    </DashboardShell>
  );
}
