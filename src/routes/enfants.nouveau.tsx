import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, getSession, userParams } from "@/lib/api";

export const Route = createFileRoute("/enfants/nouveau")({
  head: () => ({
    meta: [
      { title: "Ajouter un enfant — Kids'Med IA" },
      { name: "description", content: "Inscrire un nouvel enfant dans la crèche." },
      { property: "og:title", content: "Ajouter un enfant — Kids'Med IA" },
      { property: "og:description", content: "Formulaire d'inscription d'un enfant." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: NouvelEnfant,
});

function NouvelEnfant() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = getSession();
    if (!s || s.demo) { toast.info("Mode démo : l'enfant n'est pas enregistré."); return; }
    setBusy(true);
    try {
      await apiFetch("/enfants", { method: "POST", body: JSON.stringify({
        prenom: f.get("prenom"), nom: f.get("nom"), dateNaissance: f.get("dateNaissance"), sexe: f.get("sexe"),
        allergies: String(f.get("allergies") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
        etablissementId: userParams(s.user)["etablissementId"],
      }) });
      toast.success("Enfant ajouté");
      navigate({ to: "/enfants" });
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }
  return (
    <DashboardShell title="Ajouter un enfant" actions={<Button variant="outline" asChild><Link to="/enfants"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <Panel title="Informations" className="max-w-2xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-1.5"><Label htmlFor="prenom">Prénom</Label><Input id="prenom" name="prenom" required maxLength={60} /></div>
          <div className="space-y-1.5"><Label htmlFor="nom">Nom</Label><Input id="nom" name="nom" required maxLength={60} /></div>
          <div className="space-y-1.5"><Label htmlFor="dateNaissance">Date de naissance</Label><Input id="dateNaissance" name="dateNaissance" type="date" required /></div>
          <div className="space-y-1.5"><Label htmlFor="sexe">Sexe (F / M)</Label><Input id="sexe" name="sexe" maxLength={1} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="allergies">Allergies (séparées par des virgules)</Label><Input id="allergies" name="allergies" maxLength={300} /></div>
          <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button></div>
        </form>
      </Panel>
    </DashboardShell>
  );
}
