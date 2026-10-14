import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { UserRound, KeyRound, Download, Camera, ShieldCheck } from "lucide-react";
import { SecuritySettings } from "@/components/auth/security-settings";
import { UserAvatar, useSessionUser, patchSessionUser } from "@/components/dash/beta";
import { send } from "@/lib/mutate";
import { RgpdButton } from "@/components/dash/medical";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { DataPanel, Panel, fullName } from "@/components/dash/widgets";
import { DemoBadge } from "@/components/dash/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { specs } from "@/lib/specs";
import { apiFetch, getSession } from "@/lib/api";

export const Route = createFileRoute("/profil")({
  head: () => ({
    meta: [
      { title: "Mon profil — Kids'Med IA" },
      { name: "description", content: "Informations du compte, mot de passe et données personnelles." },
      { property: "og:title", content: "Mon profil — Kids'Med IA" },
      { property: "og:description", content: "Gérer mon compte Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Profil,
});

const demo = { prenom: "Inès", nom: "Moreau", email: "ines@soleils.fr", tel: "06 12 34 56 78", role: "creche" };

function PhotoPanel() {
  const user = useSessionUser();
  const [busy, setBusy] = useState(false);
  async function onFile(f: File | undefined) {
    if (!f) return;
    if (!f.type.startsWith("image/")) { toast.error("Choisissez une image."); return; }
    if (f.size > 2 * 1024 * 1024) { toast.error("Image trop lourde (2 Mo maximum)."); return; }
    setBusy(true);
    try {
      const fd = new FormData(); fd.append("photo", f);
      let url: string | undefined;
      if (specs.avatar.status === "ok" && !getSession()?.demo) url = (await send<{ avatarUrl: string }>("POST", specs.avatar.path, fd)).data.avatarUrl;
      else url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(f); });
      patchSessionUser({ avatarUrl: url });
      toast.success("Photo de profil mise à jour");
    } catch (e) { toast.error((e as Error).message); } finally { setBusy(false); }
  }
  return (
    <Panel title="Photo de profil" icon={Camera} actions={<DemoBadge spec={specs.avatar} reason="Route manquante : photo gardée sur cet appareil" />}>
      <div className="flex items-center gap-4">
        <UserAvatar user={user} className="h-20 w-20 text-2xl" />
        <div className="flex flex-col gap-2">
          <Button asChild variant="outline" disabled={busy}><label className="cursor-pointer">Changer la photo<input type="file" accept="image/*" className="hidden" onChange={(e) => onFile(e.target.files?.[0])} /></label></Button>
          {user?.avatarUrl ? <Button variant="ghost" size="sm" onClick={() => patchSessionUser({ avatarUrl: undefined })}>Retirer</Button> : null}
          <p className="text-xs text-muted-foreground">JPG ou PNG, 2 Mo maximum.</p>
        </div>
      </div>
    </Panel>
  );
}

function InfoForm({ u }: { u: any }) {
  const qc = useQueryClient();
  const [busy, setBusy] = useState(false);
  async function save(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const body = { prenom: String(f.get("prenom") ?? ""), nom: String(f.get("nom") ?? ""), telephone: String(f.get("telephone") ?? "") };
    setBusy(true);
    try {
      const res = await send("PUT", specs.profileUpdate.path, body);
      patchSessionUser({ prenom: body.prenom, nom: body.nom } as any);
      if (!res.demo) qc.invalidateQueries({ queryKey: ["api", specs.profile.id] });
      toast.success(res.demo ? "Coordonnées mises à jour (démo)" : "Coordonnées enregistrées");
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={save} className="space-y-3 text-sm">
      <p className="font-display text-2xl font-semibold">{fullName(u)}</p>
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-1.5"><Label htmlFor="prenom">Prénom</Label><Input id="prenom" name="prenom" defaultValue={u.prenom ?? ""} required /></div>
        <div className="space-y-1.5"><Label htmlFor="nom">Nom</Label><Input id="nom" name="nom" defaultValue={u.nom ?? ""} required /></div>
      </div>
      <div className="space-y-1.5"><Label htmlFor="telephone">Téléphone</Label><Input id="telephone" name="telephone" type="tel" defaultValue={u.telephone ?? u.tel ?? ""} /></div>
      <p><span className="text-muted-foreground">E-mail :</span> {u.email ?? "—"} · <span className="text-muted-foreground">Rôle :</span> {u.role ?? "—"}</p>
      <Button type="submit" disabled={busy}>Enregistrer</Button>
    </form>
  );
}

function Profil() {
  const [busy, setBusy] = useState(false);
  async function changePwd(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    if (getSession()?.demo) { toast.info("Mode démo : mot de passe non modifié."); return; }
    setBusy(true);
    try {
      await apiFetch("/auth/change-password", { method: "POST", body: JSON.stringify({ currentPassword: f.get("current"), newPassword: f.get("next") }) });
      toast.success("Mot de passe modifié");
      e.currentTarget.reset();
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <DashboardShell title="Paramètres du compte">
      <div className="grid gap-4 lg:grid-cols-2">
        <PhotoPanel />
        <Panel title="Sécurité de connexion" icon={ShieldCheck}><SecuritySettings /></Panel>
        <DataPanel title="Mes informations" icon={UserRound} spec={specs.profile} demoData={demo}>
          {(u: any) => <InfoForm u={u} />}
        </DataPanel>
        <Panel title="Changer le mot de passe" icon={KeyRound}>
          <form onSubmit={changePwd} className="space-y-3">
            <div className="space-y-1.5"><Label htmlFor="current">Mot de passe actuel</Label><Input id="current" name="current" type="password" required /></div>
            <div className="space-y-1.5"><Label htmlFor="next">Nouveau mot de passe</Label><Input id="next" name="next" type="password" required minLength={8} /></div>
            <Button type="submit" disabled={busy}>Modifier</Button>
          </form>
        </Panel>
        <Panel title="Mes données (RGPD)" icon={Download} actions={<DemoBadge spec={specs.exportData} reason="Route « À venir » dans la documentation" />}>
          <p className="mb-3 text-sm text-muted-foreground">Demandez l'accès, la rectification, l'effacement ou l'anonymisation de vos données.</p>
          <RgpdButton />
        </Panel>
      </div>
    </DashboardShell>
  );
}
