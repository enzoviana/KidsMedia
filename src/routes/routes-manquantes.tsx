import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { ArrowLeft, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { missingSpecs } from "@/lib/specs";
import { SpecDetail, specToText } from "@/components/dash/demo";
import { getSession, roleToKey, type RoleKey } from "@/lib/api";
import { roleHome, roleLabels } from "@/components/dash/shell";

export const Route = createFileRoute("/routes-manquantes")({
  head: () => ({
    meta: [
      { title: "Routes API manquantes — Kids'Med IA" },
      { name: "description", content: "Liste des routes à créer côté serveur pour remplacer les données de démonstration." },
      { property: "og:title", content: "Routes API manquantes — Kids'Med IA" },
      { property: "og:description", content: "Toutes les routes à développer, avec le format de données attendu." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const order: RoleKey[] = ["creche", "rsai", "medecin", "admin", "dev", "parent"];

function Page() {
  const [back, setBack] = useState<RoleKey | null>(null);
  useEffect(() => {
    const s = getSession();
    setBack(s ? (s.demo ? roleToKey(s.user.role) : roleToKey(s.user.role)) : null);
  }, []);
  const all = missingSpecs();
  const copyAll = () => {
    navigator.clipboard.writeText(all.map(specToText).join("\n\n"));
    toast.success(`${all.length} routes copiées`);
  };
  return (
    <div data-theme={back ?? "admin"} className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-4xl space-y-8 p-6 md:p-10">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <Link to={back ? roleHome[back] : "/connexion"} className="mb-2 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" /> Retour</Link>
            <h1 className="font-display text-3xl font-semibold">Routes API manquantes</h1>
            <p className="text-sm text-muted-foreground">{all.length} routes à créer ou compléter pour remplacer les données de démonstration.</p>
          </div>
          <Button onClick={copyAll}><Copy className="h-4 w-4" /> Tout copier</Button>
        </div>
        {all.length === 0 && (
          <div className="rounded-2xl border bg-card p-8 text-center text-card-foreground shadow-sm">
            <p className="font-display text-xl font-semibold">Toutes les routes sont connectées</p>
            <p className="mt-2 text-sm text-muted-foreground">L'app appelle maintenant votre serveur partout. Si un bloc affiche encore « Démo », cliquez sur son badge pour voir l'erreur renvoyée.</p>
          </div>
        )}
        {order.map((r) => {
          const list = all.filter((s) => s.roles.includes(r));
          if (!list.length) return null;
          return (
            <section key={r} className="space-y-3">
              <h2 className="font-display text-xl font-semibold">{roleLabels[r]} <span className="text-sm font-normal text-muted-foreground">({list.length})</span></h2>
              {list.map((s) => (
                <div key={s.id} className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm"><SpecDetail spec={s} /></div>
              ))}
            </section>
          );
        })}
      </div>
    </div>
  );
}
