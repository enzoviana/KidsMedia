import { ShieldAlert, MapPin, Clock, Wifi, RotateCcw, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { SecurityBlock } from "@/lib/api";

const textes: Record<string, { titre: string; icon: typeof MapPin; explication: string }> = {
  hors_zone: { titre: "Vous n'êtes pas sur place", icon: MapPin, explication: "Votre position est en dehors du périmètre de sécurité de la crèche." },
  hors_plage: { titre: "Hors de vos horaires", icon: Clock, explication: "L'accès n'est autorisé que pendant vos horaires de travail." },
  ip_refusee: { titre: "Réseau non autorisé", icon: Wifi, explication: "Vous vous connectez depuis un réseau qui n'est pas autorisé par la crèche." },
};

/** Écran plein qui indique clairement qu'une connexion a été refusée pour raison de sécurité. */
export function SecurityBlockedScreen({ block, onRetry, onLogout }: { block: SecurityBlock; onRetry?: () => void; onLogout?: () => void }) {
  const t = textes[block.motif] ?? { titre: "Accès refusé", icon: ShieldAlert, explication: block.message };
  return (
    <div role="alert" className="fixed inset-0 z-[100] flex items-center justify-center bg-background/95 p-4 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border-2 border-destructive/40 bg-card p-8 text-center shadow-lg">
        <div className="mx-auto mb-4 grid h-16 w-16 place-items-center rounded-full bg-destructive/10"><ShieldAlert className="h-8 w-8 text-destructive" /></div>
        <p className="text-xs font-semibold uppercase tracking-wider text-destructive">Connexion refusée par sécurité</p>
        <h2 className="mt-2 flex items-center justify-center gap-2 font-display text-2xl font-semibold"><t.icon className="h-5 w-5" />{t.titre}</h2>
        <p className="mt-3 text-sm">{t.explication}</p>
        {block.distanceM != null && <p className="mt-1 text-sm text-muted-foreground">Distance mesurée : {block.distanceM} m.</p>}
        {block.message && block.message !== t.explication && <p className="mt-1 text-sm text-muted-foreground">{block.message}</p>}
        <p className="mt-4 text-xs text-muted-foreground">Cette tentative a été enregistrée et l'administrateur a été prévenu.</p>
        <div className="mt-6 flex flex-wrap justify-center gap-2">
          {onRetry && <Button onClick={onRetry}><RotateCcw className="mr-1 h-4 w-4" />Réessayer</Button>}
          {onLogout && <Button variant="outline" onClick={onLogout}><LogOut className="mr-1 h-4 w-4" />Se déconnecter</Button>}
        </div>
      </div>
    </div>
  );
}
