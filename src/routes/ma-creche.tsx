import { useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { Building2, Camera, ClipboardCheck, FileText, Loader2, Save, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, Empty } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { specs } from "@/lib/specs";
import { getSession, roleToKey, userParams } from "@/lib/api";
import { send } from "@/lib/mutate";
import { useApiOrDemo } from "@/lib/use-api";

export const Route = createFileRoute("/ma-creche")({
  head: () => ({
    meta: [
      { title: "Ma crèche — Kids'Med IA" },
      { name: "description", content: "Gérer les informations, horaires, photo et documents obligatoires de la crèche." },
      { property: "og:title", content: "Ma crèche — Kids'Med IA" },
      { property: "og:description", content: "Fiche et documents de la crèche." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo = {
  id: "demo-soleil",
  nom: "Les Petits Soleils",
  description: "Crèche associative au cœur du 11e arrondissement. Accueil bienveillant, projets nature et éveil musical.",
  horairesOuverture: "Lundi – Vendredi : 07:30 – 18:30",
  photoUrl: null as string | null,
  adresse: "12 rue des Lilas",
  codePostal: "75011",
  ville: "Paris",
  telephone: "01 42 00 00 00",
  email: "contact@soleils.fr",
  capacite: 42,
};

function Page() {
  const session = getSession();
  const role = roleToKey(session?.user.role);
  const etablissementId = String(userParams(session?.user ?? {})["etablissementId"] ?? (session?.user as any)?.etablissementId ?? "");
  const isDemo = !!session?.demo;
  const qc = useQueryClient();
  const r = useApiOrDemo<any>(specs.etab, demo, etablissementId ? { etablissementId } : undefined, { fallbackToDemo: isDemo });
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  if (!["creche", "admin", "dev"].includes(role ?? "")) {
    return <DashboardShell title="Ma crèche"><Panel title="Accès réservé"><Empty text="Cet espace est réservé aux comptes crèche." /></Panel></DashboardShell>;
  }
  if (!etablissementId) {
    return <DashboardShell title="Ma crèche"><Panel title="Aucune crèche rattachée"><Empty text="Votre compte n'est rattaché à aucune crèche. Contactez l'administrateur pour effectuer le rattachement." /></Panel></DashboardShell>;
  }
  if (r.loading) {
    return <DashboardShell title="Ma crèche"><Panel title="Chargement"><p className="flex items-center gap-2 py-6 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" />Chargement de la fiche…</p></Panel></DashboardShell>;
  }
  const e = r.data && !Array.isArray(r.data) ? r.data : null;
  if (!e) {
    return <DashboardShell title="Ma crèche"><Panel title="Fiche indisponible" spec={specs.etab} demo={r.demo} reason={r.reason}><Empty text="Impossible de charger les informations de la crèche. Vérifiez votre connexion puis réessayez." /></Panel></DashboardShell>;
  }

  const photo = preview ?? e.photoUrl ?? null;

  async function saveInfos(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const f = new FormData(event.currentTarget);
    const body = {
      nom: String(f.get("nom") ?? "").trim(),
      description: String(f.get("description") ?? "").trim(),
      horairesOuverture: String(f.get("horairesOuverture") ?? "").trim(),
      adresse: String(f.get("adresse") ?? "").trim(),
      codePostal: String(f.get("codePostal") ?? "").trim(),
      ville: String(f.get("ville") ?? "").trim(),
      telephone: String(f.get("telephone") ?? "").trim(),
      email: String(f.get("email") ?? "").trim(),
      capacite: f.get("capacite") ? Number(f.get("capacite")) : undefined,
    };
    if (!body.nom) { toast.error("Le nom de la crèche est obligatoire."); return; }
    setBusy(true);
    try {
      const res = await send("PUT", specs.etab.path, body, { etablissementId });
      toast.success(res.demo ? "Informations enregistrées (démo)" : "Informations de la crèche enregistrées");
      if (!res.demo) qc.invalidateQueries({ queryKey: ["api", specs.etab.id] });
    } catch (err) {
      toast.error("Enregistrement impossible", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function uploadPhoto(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error("Format accepté : JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("La photo ne doit pas dépasser 2 Mo."); return; }
    setBusy(true);
    try {
      let url: string;
      if (isDemo) {
        url = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => resolve(String(reader.result));
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });
      } else {
        const fd = new FormData();
        fd.append("photo", file);
        const res = await send<{ photoUrl: string }>("POST", specs.etabPhoto.path, fd, { etablissementId });
        url = res.data.photoUrl;
      }
      setPreview(url);
      qc.invalidateQueries({ queryKey: ["api", specs.etab.id] });
      toast.success("Photo de la crèche mise à jour");
    } catch (err) {
      toast.error("Photo refusée", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  async function removePhoto() {
    setBusy(true);
    try {
      if (!isDemo) await send("DELETE", specs.etabPhotoDelete.path, undefined, { etablissementId });
      setPreview(null);
      qc.invalidateQueries({ queryKey: ["api", specs.etab.id] });
      toast.success("Photo retirée");
    } catch (err) {
      toast.error("Retrait impossible", { description: (err as Error).message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <DashboardShell
      title="Ma crèche"
      actions={<div className="flex flex-wrap gap-2">
        <Button variant="outline" asChild><Link to="/documents-obligatoires"><ClipboardCheck className="mr-1 h-4 w-4" />Documents obligatoires</Link></Button>
        <Button variant="outline" asChild><Link to="/documents"><FileText className="mr-1 h-4 w-4" />Documents déposés</Link></Button>
      </div>}
    >
      <div className="grid gap-4 lg:grid-cols-3">
        <Panel className="lg:col-span-2" title="Informations de la crèche" icon={Building2} spec={specs.etab} demo={r.demo} reason={r.reason}>
          <form key={e.updatedAt ?? e.id} onSubmit={saveInfos} className="space-y-4 text-sm">
            <div className="space-y-1.5"><Label htmlFor="nom">Nom de la crèche *</Label><Input id="nom" name="nom" defaultValue={e.nom ?? ""} required /></div>
            <div className="space-y-1.5"><Label htmlFor="description">Description</Label><Textarea id="description" name="description" defaultValue={e.description ?? ""} placeholder="Présentation de la crèche, projet pédagogique…" /></div>
            <div className="space-y-1.5"><Label htmlFor="horairesOuverture">Horaires d'ouverture</Label><Input id="horairesOuverture" name="horairesOuverture" defaultValue={e.horairesOuverture ?? ""} placeholder="Lundi – Vendredi : 07:30 – 18:30" /></div>
            <div className="grid gap-3 sm:grid-cols-3">
              <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="adresse">Adresse</Label><Input id="adresse" name="adresse" defaultValue={e.adresse ?? ""} /></div>
              <div className="space-y-1.5"><Label htmlFor="codePostal">Code postal</Label><Input id="codePostal" name="codePostal" defaultValue={e.codePostal ?? ""} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="ville">Ville</Label><Input id="ville" name="ville" defaultValue={e.ville ?? ""} /></div>
              <div className="space-y-1.5"><Label htmlFor="capacite">Capacité d'accueil</Label><Input id="capacite" name="capacite" type="number" min={0} defaultValue={e.capacite ?? ""} /></div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div className="space-y-1.5"><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" name="telephone" type="tel" defaultValue={e.telephone ?? ""} /></div>
              <div className="space-y-1.5"><Label htmlFor="email">E-mail</Label><Input id="email" name="email" type="email" defaultValue={e.email ?? ""} /></div>
            </div>
            <p className="text-xs text-muted-foreground">L'adresse sert au géorepérage de la crèche. Les horaires d'ouverture sont affichés aux familles et aux professionnels.</p>
            <Button type="submit" disabled={busy}><Save className="mr-1 h-4 w-4" />Enregistrer les informations</Button>
          </form>
        </Panel>

        <Panel title="Photo de la crèche" icon={Camera} spec={specs.etab} demo={r.demo} reason={r.reason}>
          <div className="space-y-3">
            <div className="grid aspect-video place-items-center overflow-hidden rounded-xl border bg-muted">
              {photo ? <img src={photo} alt={`Photo de ${e.nom ?? "la crèche"}`} className="h-full w-full object-cover" /> : <Building2 className="h-12 w-12 text-muted-foreground" />}
            </div>
            <Button asChild variant="outline" disabled={busy}>
              <label className="w-full cursor-pointer"><Camera className="mr-1 h-4 w-4" />Choisir une photo<input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={(ev) => void uploadPhoto(ev.target.files?.[0])} /></label>
            </Button>
            {photo && <Button variant="ghost" className="w-full text-destructive" onClick={removePhoto} disabled={busy}><Trash2 className="mr-1 h-4 w-4" />Retirer la photo</Button>}
            <p className="text-xs text-muted-foreground">JPG, PNG ou WebP — 2 Mo maximum. Photo optionnelle.</p>
          </div>
        </Panel>
      </div>
    </DashboardShell>
  );
}
