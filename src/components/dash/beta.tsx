import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LifeBuoy, MessageSquare } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "./crud";
import { MesTickets, type Ticket } from "./tickets";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { apiFetch, getSession, setSession, toList, type ApiUser } from "@/lib/api";
import { deviceName } from "@/lib/demo-medical";

const DEMO_MES_TICKETS: Ticket[] = [{
  _id: "demo-mien-1", numero: "TCK-0104", titre: "Signalement d'exemple", statut: "en_cours", priorite: "normale",
  categorie: "bug", createdAt: new Date().toISOString(), description: "Exemple de ticket ouvert en mode démonstration.",
  messages: [{ id: "dm1", message: "Merci, nous regardons cela.", auteurNom: "Équipe technique", auteurRole: "developpeur", createdAt: new Date().toISOString() }],
}];

export const SESSION_EVENT = "kidsmed-session";

/** Met à jour l'utilisateur de la session et prévient l'en-tête. */
export function patchSessionUser(patch: Partial<ApiUser>) {
  const s = getSession();
  if (!s) return;
  setSession({ ...s, user: { ...s.user, ...patch } });
  window.dispatchEvent(new Event(SESSION_EVENT));
}

/** Une seule lecture de /auth/me par chargement de page, partagée entre les composants. */
let mePromise: Promise<ApiUser | null> | null = null;

export function useSessionUser() {
  const [u, setU] = useState<ApiUser | null>(null);
  useEffect(() => {
    const read = () => setU(getSession()?.user ?? null);
    read();
    window.addEventListener(SESSION_EVENT, read);
    // Les URL d'avatar sont re-signées côté serveur : on rafraîchit la session
    // locale une fois pour réparer les anciennes signatures devenues invalides.
    const s = getSession();
    if (s && !s.demo) {
      mePromise ??= apiFetch<ApiUser>("/auth/me").then((d: any) => (d?.user ?? d) as ApiUser).catch(() => null);
      void mePromise.then((me) => {
        if (!me) return;
        const cur = getSession();
        if (!cur) return;
        if ((me as any).avatarUrl && (me as any).avatarUrl !== cur.user.avatarUrl) {
          patchSessionUser({ avatarUrl: (me as any).avatarUrl });
        }
      });
    }
    return () => window.removeEventListener(SESSION_EVENT, read);
  }, []);
  return u;
}

export function UserAvatar({ user, className = "h-9 w-9" }: { user: ApiUser | null; className?: string }) {
  const url = (user?.avatarUrl as string | undefined) ?? undefined;
  const [failed, setFailed] = useState(false);
  useEffect(() => { setFailed(false); }, [url]);
  const letter = (user?.prenom || user?.nom || user?.email || "U")[0]?.toUpperCase();
  return url && !failed
    ? <img src={url} alt="Photo de profil" onError={() => setFailed(true)} className={`${className} shrink-0 rounded-full object-cover`} />
    : <span className={`${className} grid shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground`}>{letter}</span>;
}

export function TicketButton() {
  const [open, setOpen] = useState(false);
  const [listOpen, setListOpen] = useState(false);
  const [mine, setMine] = useState<Ticket[]>([]);
  const page = useRouterState({ select: (s) => s.location.pathname });

  useEffect(() => {
    if (!listOpen) return;
    const s = getSession();
    if (!s || s.demo) { setMine(DEMO_MES_TICKETS); return; }
    apiFetch<unknown>("/developer/support/tickets/mine")
      .then((d) => setMine(toList(d) as Ticket[]))
      .catch((e) => toast.error((e as Error).message));
  }, [listOpen, open]);

  return (
    <>
      <Button variant="ghost" size="sm" onClick={() => setListOpen(true)} className="gap-1" title="Mes tickets">
        <MessageSquare className="h-4 w-4" /><span className="hidden xl:inline">Mes tickets</span>
      </Button>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <LifeBuoy className="h-4 w-4" /><span className="hidden lg:inline">Signaler un problème</span>
        <span className="rounded bg-warning/30 px-1 text-[10px] font-bold">BÊTA</span>
      </Button>
      <FormDialog open={open} onOpenChange={setOpen} title="Signaler un problème au développeur"
        description={`La page (${page}), votre rôle et votre appareil sont joints automatiquement.`}
        submitLabel="Envoyer le ticket"
        fields={[
          { name: "titre", label: "Titre", type: "text", required: true },
          { name: "categorie", label: "Type", type: "select", options: ["bug", "question", "suggestion"], required: true },
          { name: "priorite", label: "Urgence", type: "select", options: ["basse", "normale", "haute", "urgente"], required: true },
          { name: "description", label: "Que s'est-il passé ?", type: "textarea", required: true },
        ]}
        onSubmit={async (v) => {
          const res = await send<{ numero?: string }>("POST", specs.ticketCreate.path, { ...v, page, device: deviceName(), role: getSession()?.user.role });
          toast.success(`Ticket ${res.data?.numero ?? "TCK-" + Math.floor(1000 + Math.random() * 9000)} envoyé${res.demo ? " (démo)" : ""}`, {
            description: "Suivez la réponse dans « Mes tickets ».",
          });
        }} />
      <MesTickets tickets={mine} open={listOpen} onOpenChange={setListOpen} />
    </>
  );
}
