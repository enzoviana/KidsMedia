import { useEffect, useState } from "react";
import { Camera, Loader2, Baby } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { getSession } from "@/lib/api";
import { send } from "@/lib/mutate";
import { specs } from "@/lib/specs";

const key = (id: string) => `kidsmed:photo-enfant:${id}`;

/** Photo de l'enfant affichée en tête du dossier ; envoyée au serveur, gardée sur l'appareil en démo. */
export function EnfantPhoto({ enfantId, photoUrl, nom }: { enfantId: string; photoUrl?: string | undefined; nom?: string | undefined }) {
  const [url, setUrl] = useState<string | undefined>(photoUrl);
  const [busy, setBusy] = useState(false);
  useEffect(() => { setUrl(photoUrl ?? localStorage.getItem(key(enfantId)) ?? undefined); }, [enfantId, photoUrl]);

  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!/^image\/(jpeg|png|webp)$/.test(f.type)) { toast.error("Choisissez une image JPG, PNG ou WebP."); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Image trop lourde (2 Mo maximum)."); return; }
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("photo", f);
      let next: string | undefined;
      if (!getSession()?.demo) {
        try { next = (await send<{ photoUrl: string }>("POST", specs.enfantPhoto.path, fd, { enfantId })).data?.photoUrl; }
        catch (e) { toast.error(`Le serveur a refusé la photo : ${(e as Error).message}`); }
      }
      if (!next) {
        next = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f); });
        localStorage.setItem(key(enfantId), next);
      }
      setUrl(next);
      toast.success("Photo de l'enfant mise à jour");
    } finally { setBusy(false); }
  }

  return (
    <div className="flex items-center gap-4 rounded-2xl border bg-card p-4">
      {url ? <img src={url} alt={nom ? `Photo de ${nom}` : "Photo de l'enfant"} className="h-20 w-20 rounded-2xl object-cover" />
        : <div className="grid h-20 w-20 place-items-center rounded-2xl bg-accent"><Baby className="h-8 w-8 text-muted-foreground" /></div>}
      <div className="space-y-1">
        {nom && <p className="font-display text-xl font-semibold">{nom}</p>}
        <Button asChild size="sm" variant="outline" disabled={busy}>
          <label className="cursor-pointer">{busy ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Camera className="mr-1 h-4 w-4" />}{url ? "Changer la photo" : "Ajouter une photo"}
            <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label>
        </Button>
        <p className="text-xs text-muted-foreground">JPG, PNG ou WebP, 2 Mo maximum.</p>
      </div>
    </div>
  );
}
