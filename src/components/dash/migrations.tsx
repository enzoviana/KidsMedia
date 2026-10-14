import { useState } from "react";
import { DatabaseZap, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { DataPanel } from "@/components/dash/widgets";
import { specs } from "@/lib/specs";
import { apiFetch, getSession } from "@/lib/api";

interface Step { label: string; status: "idle" | "run" | "ok" | "ko"; detail?: string | undefined }

export function MigrationPanel() {
  const [steps, setSteps] = useState<Step[]>([
    { label: "Vérifier les migrations en attente", status: "idle" },
    { label: "Appliquer les migrations", status: "idle" },
    { label: "Créer un ticket de test", status: "idle" },
  ]);
  const [running, setRunning] = useState(false);
  const setStep = (i: number, s: Partial<Step>) => setSteps((p) => p.map((x, j) => (j === i ? { ...x, ...s } : x)));

  async function run() {
    if (getSession()?.demo) { toast.error("Connectez-vous avec un vrai compte pour lancer les migrations."); return; }
    setRunning(true);
    setSteps((p) => p.map((x) => ({ ...x, status: "idle", detail: undefined })));
    try {
      setStep(0, { status: "run" });
      const pending: any = await apiFetch("/developer/database/migrations/pending");
      const has = pending?.hasPendingMigrations ?? pending?.data?.hasPendingMigrations;
      setStep(0, { status: "ok", detail: has ? "Migrations en attente détectées" : "Aucune migration en attente" });

      if (has) {
        setStep(1, { status: "run" });
        const m: any = await apiFetch("/developer/database/migrate", { method: "POST" });
        setStep(1, { status: "ok", detail: m?.message ?? m?.data?.message ?? "Migrations appliquées" });
      } else {
        setStep(1, { status: "ok", detail: "Rien à appliquer" });
      }

      setStep(2, { status: "run" });
      const t: any = await apiFetch("/developer/support/tickets", {
        method: "POST",
        body: JSON.stringify({ titre: "Test ticket", description: "Vérification système de tickets", categorie: "question", priorite: "normale" }),
      });
      const numero = t?.data?.numero ?? t?.numero;
      setStep(2, { status: "ok", detail: numero ? `Ticket ${numero} créé` : "Ticket de test créé" });
      toast.success("Procédure terminée avec succès");
    } catch (e) {
      const i = steps.findIndex((s) => s.status === "run");
      setStep(i < 0 ? 0 : i, { status: "ko", detail: (e as Error).message });
      toast.error((e as Error).message);
    } finally {
      setRunning(false);
    }
  }

  return (
    <DataPanel id="migrations" title="Migrations base de données" icon={DatabaseZap} spec={specs.devMigrations} demoData={{ hasPendingMigrations: true, output: "20261009115435_add_ticket_support" }}>
      {() => (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Lance la procédure Render complète sans Postman : vérification des migrations en attente, application, puis création d'un ticket de test.
          </p>
          <ul className="space-y-2">
            {steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 rounded-xl bg-muted/60 p-3 text-sm">
                {s.status === "run" ? <Loader2 className="size-4 animate-spin text-primary" />
                  : s.status === "ok" ? <CheckCircle2 className="size-4 text-emerald-500" />
                  : s.status === "ko" ? <XCircle className="size-4 text-destructive" />
                  : <span className="flex size-4 items-center justify-center rounded-full border text-[10px]">{i + 1}</span>}
                <div className="min-w-0">
                  <p className="font-medium">{s.label}</p>
                  {s.detail && <p className="truncate text-xs text-muted-foreground">{s.detail}</p>}
                </div>
              </li>
            ))}
          </ul>
          <Button onClick={run} disabled={running} className="w-full sm:w-auto">
            {running ? <Loader2 className="size-4 animate-spin" /> : <DatabaseZap className="size-4" />}
            {running ? "Exécution en cours…" : "Lancer la procédure de migration"}
          </Button>
        </div>
      )}
    </DataPanel>
  );
}
