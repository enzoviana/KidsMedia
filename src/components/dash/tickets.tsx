import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  AlertTriangle,
  CheckCircle2,
  ClipboardList,
  Clock,
  Loader2,
  Lock,
  MessageSquare,
  Monitor,
  Send,
  Tag,
  UserRound,
} from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Pill, fmtDate } from "./widgets";
import { send } from "@/lib/mutate";

export interface TicketMessage {
  id?: string;
  _id?: string;
  message: string;
  auteurNom?: string | null;
  auteurRole?: string | null;
  interne?: boolean;
  createdAt: string;
}

export interface Ticket {
  id?: string;
  _id?: string;
  numero?: string;
  titre: string;
  description: string;
  priorite: string;
  statut: string;
  categorie?: string;
  page?: string | null;
  device?: string | null;
  createdAt: string;
  auteur?: { prenom?: string; nom?: string; email?: string; role?: string } | null;
  messages?: TicketMessage[];
  reponses?: number;
}

const ticketId = (t: Ticket) => String(t.id ?? t._id ?? "");

const STATUTS: Record<string, { label: string; tone: "default" | "success" | "warning" | "danger" }> = {
  ouvert: { label: "Ouvert", tone: "warning" },
  en_cours: { label: "En cours", tone: "default" },
  resolu: { label: "Résolu", tone: "success" },
  ferme: { label: "Fermé", tone: "default" },
};

const PRIORITES: Record<string, { label: string; tone: "default" | "success" | "warning" | "danger" }> = {
  basse: { label: "Basse", tone: "default" },
  normale: { label: "Normale", tone: "default" },
  haute: { label: "Haute", tone: "danger" },
  urgente: { label: "Urgente", tone: "danger" },
};

const CATEGORIES: Record<string, string> = { bug: "Anomalie", question: "Question", suggestion: "Suggestion" };

const ROLES_DEV = ["developpeur", "developer", "dev", "superadmin"];

export function TicketStatusPill({ statut }: { statut: string }) {
  const s = STATUTS[statut] ?? { label: statut, tone: "default" as const };
  return <Pill tone={s.tone}>{s.label}</Pill>;
}

export function TicketPriorityPill({ priorite }: { priorite: string }) {
  const p = PRIORITES[priorite] ?? { label: priorite, tone: "default" as const };
  return <Pill tone={p.tone}>{p.label}</Pill>;
}

const dateHeure = (v?: string) => {
  if (!v) return "—";
  const d = new Date(v);
  if (Number.isNaN(+d)) return v;
  return d.toLocaleString("fr-FR", { day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit" });
};

const nomAuteur = (t: Ticket) => {
  const a = t.auteur;
  if (!a) return "Auteur inconnu";
  return [a.prenom, a.nom].filter(Boolean).join(" ") || a.email || "Auteur inconnu";
};

/**
 * Détail d'un ticket : informations lisibles, fil de discussion et réponse.
 * Remplace l'ancienne modale qui affichait les champs bruts de la base.
 */
export function TicketDetailDialog({ ticket, open, onOpenChange, isDev = false, onUpdated }: {
  ticket: Ticket | null;
  open: boolean;
  onOpenChange: (o: boolean) => void;
  isDev?: boolean;
  onUpdated?: (t: Ticket) => void;
}) {
  const [current, setCurrent] = useState<Ticket | null>(ticket);
  const [message, setMessage] = useState("");
  const [interne, setInterne] = useState(false);
  const [busy, setBusy] = useState(false);
  const [maj, setMaj] = useState(false);
  const threadRef = useRef<HTMLDivElement>(null);

  useEffect(() => { setCurrent(ticket); setMessage(""); setInterne(false); }, [ticket]);
  useEffect(() => {
    if (open) threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight, behavior: "smooth" });
  }, [open, current?.messages?.length]);

  if (!current) return null;
  const c: Ticket = current;
  const id = ticketId(c);
  const messages = c.messages ?? [];

  async function envoyer() {
    const texte = message.trim();
    if (!texte) { toast.error("Écrivez un message avant d'envoyer."); return; }
    setBusy(true);
    try {
      const res = await send<{ message: TicketMessage; ticket: Ticket }>("POST", `/developer/support/tickets/${id}/messages`, { message: texte, interne });
      if (res.demo) {
        const nouveau: TicketMessage = {
          id: `local-${Date.now()}`, message: texte, interne,
          auteurNom: isDev ? "Équipe technique" : nomAuteur(c),
          auteurRole: isDev ? "developpeur" : (c.auteur?.role ?? null),
          createdAt: new Date().toISOString(),
        };
        const majTicket: Ticket = { ...c, messages: [...messages, nouveau] };
        setCurrent(majTicket);
        onUpdated?.(majTicket);
      } else {
        const data = res.data;
        const majTicket: Ticket = {
          ...c,
          statut: data?.ticket?.statut ?? c.statut,
          messages: [...messages, data.message],
        };
        setCurrent(majTicket);
        onUpdated?.(majTicket);
      }
      setMessage("");
      toast.success(interne ? "Note interne ajoutée" : "Réponse envoyée");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setBusy(false); }
  }

  async function changer(champ: "statut" | "priorite", valeur: string) {
    if (!valeur || valeur === c[champ]) return;
    setMaj(true);
    try {
      const res = await send<Ticket>("PATCH", `/developer/support/tickets/${id}`, { [champ]: valeur });
      const majTicket: Ticket = { ...c, [champ]: res.demo ? valeur : (res.data as Ticket)[champ] ?? valeur };
      setCurrent(majTicket);
      onUpdated?.(majTicket);
      toast.success(champ === "statut" ? "Statut mis à jour" : "Priorité mise à jour");
    } catch (e) {
      toast.error((e as Error).message);
    } finally { setMaj(false); }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-3xl flex-col gap-0 overflow-hidden p-0">
        <DialogHeader className="space-y-2 border-b bg-muted/40 px-5 py-4 text-left">
          <div className="flex flex-wrap items-center gap-2 pr-8">
            <span className="rounded-md bg-background px-2 py-0.5 font-mono text-xs font-semibold text-muted-foreground">{current.numero ?? "Ticket"}</span>
            <TicketStatusPill statut={current.statut} />
            <TicketPriorityPill priorite={current.priorite} />
            {current.categorie && <Pill>{CATEGORIES[current.categorie] ?? current.categorie}</Pill>}
          </div>
          <DialogTitle className="text-left font-display text-xl leading-snug">{current.titre}</DialogTitle>
          <DialogDescription className="text-left text-xs">
            Ouvert le {dateHeure(current.createdAt)} par <span className="font-medium text-foreground">{nomAuteur(current)}</span>
            {current.auteur?.role ? ` (${current.auteur.role})` : ""}
          </DialogDescription>
        </DialogHeader>

        <div ref={threadRef} className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <section className="rounded-xl border bg-card p-4">
            <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <ClipboardList className="h-3.5 w-3.5" />Description du problème
            </p>
            <p className="whitespace-pre-wrap text-sm leading-relaxed">{current.description}</p>
            {(current.page || current.device) && (
              <div className="mt-3 flex flex-wrap gap-3 border-t pt-3 text-xs text-muted-foreground">
                {current.page && <span className="flex items-center gap-1"><Tag className="h-3.5 w-3.5" />{current.page}</span>}
                {current.device && <span className="flex items-center gap-1"><Monitor className="h-3.5 w-3.5" />{current.device}</span>}
              </div>
            )}
          </section>

          <section className="space-y-3">
            <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MessageSquare className="h-3.5 w-3.5" />Conversation ({messages.length})
            </p>
            {!messages.length && (
              <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
                Aucune réponse pour l'instant. {isDev ? "Répondez au dessous pour informer l'auteur." : "L'équipe technique vous répondra ici."}
              </p>
            )}
            {messages.map((m, i) => {
              const support = ROLES_DEV.includes(String(m.auteurRole ?? ""));
              return (
                <article key={m.id ?? m._id ?? i} className={`flex ${support ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-2xl border px-4 py-3 text-sm ${m.interne ? "border-warning/50 bg-warning/10" : support ? "border-primary/30 bg-primary/5" : "bg-card"}`}>
                    <p className="mb-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
                      <UserRound className="h-3.5 w-3.5" />
                      <span className="font-semibold text-foreground">{m.auteurNom || (support ? "Équipe technique" : "Auteur")}</span>
                      {support && <Pill tone="success">Support</Pill>}
                      {m.interne && <span className="flex items-center gap-1 font-medium text-foreground"><Lock className="h-3 w-3" />Note interne</span>}
                      <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{dateHeure(m.createdAt)}</span>
                    </p>
                    <p className="whitespace-pre-wrap leading-relaxed">{m.message}</p>
                  </div>
                </article>
              );
            })}
          </section>
        </div>

        <footer className="space-y-3 border-t bg-card px-5 py-4">
          {isDev && (
            <div className="flex flex-wrap items-end gap-3">
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Statut
                <select value={current.statut} disabled={maj} onChange={(e) => changer("statut", e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">
                  {Object.entries(STATUTS).map(([v, s]) => <option key={v} value={v}>{s.label}</option>)}
                </select>
              </label>
              <label className="grid gap-1 text-xs font-medium text-muted-foreground">
                Priorité
                <select value={current.priorite} disabled={maj} onChange={(e) => changer("priorite", e.target.value)} className="h-9 rounded-md border bg-background px-2 text-sm text-foreground">
                  {Object.entries(PRIORITES).map(([v, p]) => <option key={v} value={v}>{p.label}</option>)}
                </select>
              </label>
              {current.statut !== "resolu" && (
                <Button size="sm" variant="outline" disabled={maj} onClick={() => changer("statut", "resolu")}>
                  <CheckCircle2 className="mr-1 h-4 w-4" />Marquer résolu
                </Button>
              )}
              <label className="ml-auto flex items-center gap-2 text-xs text-muted-foreground">
                <input type="checkbox" checked={interne} onChange={(e) => setInterne(e.target.checked)} className="h-4 w-4 accent-[var(--primary)]" />
                Note interne (visible par l'équipe seulement)
              </label>
            </div>
          )}
          <div className="flex items-end gap-2">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={isDev ? "Répondre à l'auteur du ticket…" : "Ajouter une précision ou répondre à l'équipe…"}
              className="min-h-[72px] resize-none"
              maxLength={5000}
              onKeyDown={(e) => { if ((e.metaKey || e.ctrlKey) && e.key === "Enter") { e.preventDefault(); void envoyer(); } }}
            />
            <Button onClick={() => void envoyer()} disabled={busy || !message.trim()} className="h-[72px] px-4">
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              <span className="sr-only">Envoyer</span>
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">Ctrl / ⌘ + Entrée pour envoyer. L'auteur est notifié à chaque réponse.</p>
        </footer>
      </DialogContent>
    </Dialog>
  );
}

/** Liste des tickets de l'utilisateur connecté, avec accès à la conversation. */
export function MesTickets({ tickets, open, onOpenChange }: { tickets: Ticket[]; open: boolean; onOpenChange: (o: boolean) => void }) {
  const [selection, setSelection] = useState<Ticket | null>(null);
  const [liste, setListe] = useState<Ticket[]>(tickets);
  useEffect(() => { setListe(tickets); }, [tickets]);

  return (
    <>
      <Dialog open={open && !selection} onOpenChange={onOpenChange}>
        <DialogContent className="max-h-[85vh] max-w-lg overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Mes tickets</DialogTitle>
            <DialogDescription>Suivez les réponses de l'équipe technique.</DialogDescription>
          </DialogHeader>
          {!liste.length && (
            <p className="rounded-xl border border-dashed p-4 text-center text-sm text-muted-foreground">
              Vous n'avez ouvert aucun ticket. Utilisez « Signaler un problème » pour nous écrire.
            </p>
          )}
          <ul className="space-y-2">
            {liste.map((t) => (
              <li key={ticketId(t) || t.titre}>
                <button type="button" onClick={() => setSelection(t)} className="w-full rounded-xl border bg-card p-3 text-left transition hover:bg-accent/40">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-mono text-xs text-muted-foreground">{t.numero ?? "Ticket"}</span>
                    <TicketStatusPill statut={t.statut} />
                  </div>
                  <p className="mt-1 font-medium">{t.titre}</p>
                  <p className="mt-1 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>{fmtDate(t.createdAt)}</span>
                    <span className="flex items-center gap-1"><MessageSquare className="h-3 w-3" />{t.reponses ?? t.messages?.length ?? 0}</span>
                    {t.statut === "resolu" && <span className="flex items-center gap-1 text-success"><CheckCircle2 className="h-3 w-3" />Résolu</span>}
                  </p>
                </button>
              </li>
            ))}
          </ul>
          {liste.some((t) => t.statut === "ouvert") && <p className="flex items-center gap-1 text-xs text-muted-foreground"><AlertTriangle className="h-3.5 w-3.5" />Un ticket ouvert attend une réponse de notre équipe.</p>}
        </DialogContent>
      </Dialog>
      <TicketDetailDialog
        ticket={selection}
        open={!!selection}
        isDev={false}
        onOpenChange={(o) => { if (!o) setSelection(null); }}
        onUpdated={(maj) => setListe((x) => x.map((t) => (ticketId(t) === ticketId(maj) ? { ...t, ...maj } : t)))}
      />
    </>
  );
}
