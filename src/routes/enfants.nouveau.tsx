import { useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowLeft, ShieldCheck, Sparkles, Syringe } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, Pill } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiFetch, getSession, roleToKey, toList, userParams } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";

export const Route = createFileRoute("/enfants/nouveau")({
  head: () => ({
    meta: [
      { title: "Ajouter un enfant — Kids'Med IA" },
      { name: "description", content: "Inscrire un nouvel enfant dans la crèche." },
      { property: "og:title", content: "Ajouter un enfant — Kids'Med IA" },
      { property: "og:description", content: "Formulaire d'inscription d'un enfant." },
      { property: "og:type", content: "website" },
    ],
  }),
  component: NouvelEnfant,
});

function NouvelEnfant() {
  const navigate = useNavigate();
  const [busy, setBusy] = useState(false);
  const role = roleToKey(getSession()?.user.role);
  // Seuls les profils globaux (admin / dev) doivent choisir la crèche : une crèche
  // est automatiquement rattachée à son établissement et un parent n'en a pas.
  const choisirEtablissement = role === "admin" || role === "dev";
  const [etabChoisi, setEtabChoisi] = useState("");
  const etabsR = useApiOrDemo<unknown>(specs.etabs, [], undefined, { fallbackToDemo: false });
  const etablissements = toList(etabsR.data);
  const sessionEtab = String(userParams(getSession()?.user ?? {})["etablissementId"] ?? "");
  const etabId = choisirEtablissement ? etabChoisi : sessionEtab;
  // Vaccins demandés par la crèche pour l'inscription : socle national + ajouts locaux.
  const vaccinsR = useApiOrDemo<unknown>(specs.vaccinsReferenceEtab, [], etabId ? { etablissementId: etabId } : undefined, { fallbackToDemo: false });
  const vaccins = toList(vaccinsR.data);
  const obligatoires = vaccins.filter((v: any) => v.niveau === "obligatoire");
  const recommandes = vaccins.filter((v: any) => v.niveau === "recommande");

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const s = getSession();
    if (!s || s.demo) { toast.info("Mode démo : l'enfant n'est pas enregistré."); return; }
    const etablissementId = choisirEtablissement ? String(f.get("etablissementId") ?? "") : userParams(s.user)["etablissementId"];
    if (choisirEtablissement && !etablissementId) { toast.error("Sélectionnez l'établissement de l'enfant."); return; }
    setBusy(true);
    try {
      await apiFetch("/enfants", { method: "POST", body: JSON.stringify({
        prenom: f.get("prenom"), nom: f.get("nom"), dateNaissance: f.get("dateNaissance"), sexe: f.get("sexe"),
        allergies: String(f.get("allergies") ?? "").split(",").map((x) => x.trim()).filter(Boolean),
        etablissementId: etablissementId || undefined,
      }) });
      toast.success("Enfant ajouté");
      navigate({ to: "/enfants" });
    } catch (err) { toast.error((err as Error).message); } finally { setBusy(false); }
  }

  return (
    <DashboardShell title="Ajouter un enfant" actions={<Button variant="outline" asChild><Link to="/enfants"><ArrowLeft className="mr-1 h-4 w-4" />Retour</Link></Button>}>
      <Panel title="Informations" className="max-w-2xl">
        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          {choisirEtablissement && (
            <div className="space-y-1.5 sm:col-span-2">
              <Label htmlFor="etablissementId">Crèche / établissement</Label>
              <select id="etablissementId" name="etablissementId" required value={etabChoisi} onChange={(e) => setEtabChoisi(e.target.value)} className="flex h-9 w-full rounded-md border bg-background px-3 text-sm">
                <option value="">— Sélectionner —</option>
                {etablissements.map((e: any) => <option key={e._id ?? e.id} value={e._id ?? e.id}>{e.nom}</option>)}
              </select>
              {!etablissements.length && (
                <p className="text-xs text-muted-foreground">
                  {etabsR.reason ?? "Aucun établissement disponible."}
                </p>
              )}
            </div>
          )}
          <div className="space-y-1.5"><Label htmlFor="prenom">Prénom</Label><Input id="prenom" name="prenom" required maxLength={60} /></div>
          <div className="space-y-1.5"><Label htmlFor="nom">Nom</Label><Input id="nom" name="nom" required maxLength={60} /></div>
          <div className="space-y-1.5"><Label htmlFor="dateNaissance">Date de naissance</Label><Input id="dateNaissance" name="dateNaissance" type="date" required /></div>
          <div className="space-y-1.5"><Label htmlFor="sexe">Sexe (F / M)</Label><Input id="sexe" name="sexe" maxLength={1} /></div>
          <div className="space-y-1.5 sm:col-span-2"><Label htmlFor="allergies">Allergies (séparées par des virgules)</Label><Input id="allergies" name="allergies" maxLength={300} /></div>
          <div className="sm:col-span-2"><Button type="submit" disabled={busy}>{busy ? "Enregistrement…" : "Enregistrer"}</Button></div>
        </form>
      </Panel>

      <Panel
        title="Vaccins demandés à l'inscription"
        icon={Syringe}
        className="mt-4 max-w-2xl"
        spec={specs.vaccinsReferenceEtab}
        demo={vaccinsR.demo}
        reason={vaccinsR.reason}
      >
        {!etabId ? (
          <p className="text-sm text-muted-foreground">Sélectionnez une crèche pour afficher les vaccins exigés.</p>
        ) : !vaccins.length ? (
          <p className="text-sm text-muted-foreground">Aucun vaccin de référence n'est encore configuré pour cette crèche.</p>
        ) : (
          <div className="space-y-4 text-sm">
            <p className="text-muted-foreground">
              Le carnet de vaccination sera vérifié à l'inscription. Les éléments marqués « obligatoire » sont exigés ;
              les « recommandés » sont demandés sans bloquer l'inscription.
            </p>
            <div>
              <p className="mb-2 flex items-center gap-2 font-medium"><ShieldCheck className="h-4 w-4 text-success" />Obligatoires ({obligatoires.length})</p>
              <ul className="flex flex-wrap gap-2">
                {obligatoires.map((v: any) => <li key={v._id ?? v.nom}><Pill tone="danger">{v.nom}</Pill></li>)}
                {!obligatoires.length && <li className="text-muted-foreground">Aucun</li>}
              </ul>
            </div>
            <div>
              <p className="mb-2 flex items-center gap-2 font-medium"><Sparkles className="h-4 w-4 text-warning" />Recommandés ({recommandes.length})</p>
              <ul className="flex flex-wrap gap-2">
                {recommandes.map((v: any) => <li key={v._id ?? v.nom}><Pill tone="warning">{v.nom}</Pill></li>)}
                {!recommandes.length && <li className="text-muted-foreground">Aucun</li>}
              </ul>
            </div>
          </div>
        )}
      </Panel>
    </DashboardShell>
  );
}
