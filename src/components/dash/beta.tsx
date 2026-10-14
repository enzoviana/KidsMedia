import { useEffect, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { LifeBuoy } from "lucide-react";
import { toast } from "sonner";
import { FormDialog } from "./crud";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { getSession, setSession, type ApiUser } from "@/lib/api";
import { deviceName } from "@/lib/demo-medical";

export const SESSION_EVENT = "kidsmed-session";

/** Met à jour l'utilisateur de la session et prévient l'en-tête. */
export function patchSessionUser(patch: Partial<ApiUser>) {
  const s = getSession();
  if (!s) return;
  setSession({ ...s, user: { ...s.user, ...patch } });
  window.dispatchEvent(new Event(SESSION_EVENT));
}

export function useSessionUser() {
  const [u, setU] = useState<ApiUser | null>(null);
  useEffect(() => {
    const read = () => setU(getSession()?.user ?? null);
    read();
    window.addEventListener(SESSION_EVENT, read);
    return () => window.removeEventListener(SESSION_EVENT, read);
  }, []);
  return u;
}

export function UserAvatar({ user, className = "h-9 w-9" }: { user: ApiUser | null; className?: string }) {
  const url = (user?.avatarUrl as string | undefined) ?? undefined;
  const letter = (user?.prenom ?? user?.email ?? "U")[0]?.toUpperCase();
  return url
    ? <img src={url} alt="Photo de profil" className={`${className} shrink-0 rounded-full object-cover`} />
    : <span className={`${className} grid shrink-0 place-items-center rounded-full bg-accent text-sm font-semibold text-accent-foreground`}>{letter}</span>;
}

export function TicketButton() {
  const [open, setOpen] = useState(false);
  const page = useRouterState({ select: (s) => s.location.pathname });
  return (
    <>
      <Button variant="outline" size="sm" onClick={() => setOpen(true)} className="gap-1">
        <LifeBuoy className="h-4 w-4" /><span className="hidden md:inline">Signaler un problème</span>
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
          toast.success(`Ticket ${res.data?.numero ?? "TCK-" + Math.floor(1000 + Math.random() * 9000)} envoyé${res.demo ? " (démo)" : ""}`);
        }} />
    </>
  );
}
