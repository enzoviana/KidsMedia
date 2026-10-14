import { useState } from "react";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import { FlaskConical, Copy } from "lucide-react";
import type { RouteSpec } from "@/lib/specs";
import { toast } from "sonner";
import { getDiag, explain, curlOf } from "@/lib/diagnostic";

function DiagBox({ id }: { id: string }) {
  const d = getDiag(id);
  if (!d) return null;
  const e = explain[d.kind];
  return (
    <div className="mb-5 space-y-3 rounded-xl border border-warning/40 bg-warning/10 p-4 text-sm">
      <p className="font-semibold">{e.title}</p>
      <p className="text-muted-foreground">{e.text}</p>
      <p><span className="font-medium">À faire :</span> {e.fix}</p>
      <div className="space-y-1 font-mono text-xs">
        <p className="break-all"><span className="font-semibold">{d.method}</span> {d.url}</p>
        <p>Statut : {d.status ?? "aucune réponse"} · {d.at}</p>
        <p className="break-all">Message : {d.message}</p>
      </div>
      {d.body != null && <pre className="max-h-40 overflow-auto rounded-lg bg-muted p-2 font-mono text-xs">{JSON.stringify(d.body, null, 2)}</pre>}
      {d.kind !== "demo-session" && d.kind !== "text" && (
        <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(curlOf(d)); toast.success("Commande cURL copiée"); }}>
          <Copy className="h-4 w-4" /> Copier en cURL (Postman)
        </Button>
      )}
    </div>
  );
}

export function specToText(s: RouteSpec) {
  const lines = [`${s.method} /api${s.path.startsWith("/") ? s.path : "/" + s.path}`, `  ${s.description}`];
  if (s.params) lines.push(`  Paramètres : ${s.params}`);
  if (s.body) lines.push(`  Body attendu : ${JSON.stringify(s.body, null, 2).replace(/\n/g, "\n  ")}`);
  if (s.response) lines.push(`  Réponse attendue : ${JSON.stringify(s.response, null, 2).replace(/\n/g, "\n  ")}`);
  return lines.join("\n");
}

const statusLabel = { ok: "Existe — mais n'a pas répondu", soon: "À venir (dans votre doc)", missing: "À créer" };

export function SpecDetail({ spec, reason }: { spec: RouteSpec; reason?: string | undefined }) {
  return (
    <div className="space-y-4 text-sm">
      <div className="flex flex-wrap items-center gap-2">
        <span className="rounded-md bg-primary px-2 py-0.5 font-mono text-xs font-semibold text-primary-foreground">{spec.method}</span>
        <code className="break-all font-mono text-xs">/api{spec.path}</code>
      </div>
      <p className="text-muted-foreground">{spec.description}</p>
      <p><span className="font-medium">Statut :</span> {statusLabel[spec.status]}</p>
      {reason && <p><span className="font-medium">Pourquoi la démo :</span> {reason}</p>}
      {spec.params && <p><span className="font-medium">Paramètres :</span> <code className="font-mono text-xs">{spec.params}</code></p>}
      {spec.body != null && (
        <div><p className="mb-1 font-medium">Body attendu</p><pre className="overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">{JSON.stringify(spec.body, null, 2)}</pre></div>
      )}
      {spec.response != null && (
        <div><p className="mb-1 font-medium">Réponse attendue</p><pre className="overflow-auto rounded-lg bg-muted p-3 font-mono text-xs">{JSON.stringify(spec.response, null, 2)}</pre></div>
      )}
    </div>
  );
}

export function DemoBadge({ spec, reason }: { spec: RouteSpec; reason?: string | undefined }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="inline-flex items-center gap-1 rounded-full border border-warning/40 bg-warning/15 px-2 py-0.5 text-[11px] font-semibold text-foreground transition hover:bg-warning/30"
        title="Voir la route attendue"
      >
        <FlaskConical className="h-3 w-3" /> Démo
      </button>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
          <SheetHeader>
            <SheetTitle>Pourquoi le mode démo ?</SheetTitle>
            <SheetDescription>Diagnostic du dernier appel au serveur et format attendu.</SheetDescription>
          </SheetHeader>
          <div className="px-4 pb-6">
            {open && <DiagBox id={spec.id} />}
            <SpecDetail spec={spec} reason={reason} />
            <div className="mt-6 flex flex-wrap gap-2">
              <Button size="sm" variant="outline" onClick={() => { navigator.clipboard.writeText(specToText(spec)); toast.success("Copié"); }}>
                <Copy className="h-4 w-4" /> Copier
              </Button>
              <Button size="sm" asChild><Link to="/routes-manquantes">Toutes les routes manquantes</Link></Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
