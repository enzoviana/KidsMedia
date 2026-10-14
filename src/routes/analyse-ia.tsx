import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Sparkles, Camera, Loader2, Phone, Stethoscope, Eye, AlertTriangle, X } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel, Pill, fullName } from "@/components/dash/widgets";
import { DemoBadge } from "@/components/dash/demo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { getSession, toList } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { demoEnfants, enfantIdOf } from "@/lib/demo-enfants";
import { analyseDemo, symptomesCatalogue, type AnalyseIA } from "@/lib/demo-medical";

export const Route = createFileRoute("/analyse-ia")({
  validateSearch: (s: Record<string, unknown>): { enfant?: string } => (typeof s["enfant"] === "string" ? { enfant: s["enfant"] as string } : {}),
  head: () => ({
    meta: [
      { title: "Signaler un symptôme — Analyse IA — Kids'Med IA" },
      { name: "description", content: "Signalez les symptômes d'un enfant, ajoutez une photo et obtenez une première analyse IA avec conseils." },
      { property: "og:title", content: "Analyse IA des symptômes — Kids'Med IA" },
      { property: "og:description", content: "Diagnostic préliminaire, niveau de confiance et orientation en cas d'urgence." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const risqueStyle = {
  eleve: { label: "Risque élevé — urgence", cls: "border-destructive bg-destructive/10 text-destructive", icon: Phone },
  moyen: { label: "Consulter un médecin sous 24 h", cls: "border-warning bg-warning/10", icon: Stethoscope },
  faible: { label: "Surveillance simple", cls: "border-success bg-success/10", icon: Eye },
} as const;

function Page() {
  const { enfant: initial } = Route.useSearch();
  const enfantsR = useApiOrDemo<unknown>(specs.enfants, demoEnfants);
  const enfants = toList(enfantsR.data);
  const [enfantId, setEnfantId] = useState(initial ?? enfantIdOf(enfants[0]) ?? "");
  const [sel, setSel] = useState<string[]>([]);
  const [temp, setTemp] = useState("");
  const [duree, setDuree] = useState("");
  const [comment, setComment] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const preview = useMemo(() => (photo ? URL.createObjectURL(photo) : null), [photo]);
  const [busy, setBusy] = useState(false);
  const [res, setRes] = useState<(AnalyseIA & { demo: boolean }) | null>(null);
  const enfant = enfants.find((e) => enfantIdOf(e) === enfantId);

  const toggle = (id: string) => setSel((s) => (s.includes(id) ? s.filter((x) => x !== id) : [...s, id]));

  async function analyser() {
    if (!enfantId) { toast.error("Choisissez un enfant."); return; }
    if (!sel.length && !photo) { toast.error("Cochez au moins un symptôme ou ajoutez une photo."); return; }
    setBusy(true);
    try {
      const t = temp ? Number(temp.replace(",", ".")) : undefined;
      const ageMois = enfant?.dateNaissance ? (Date.now() - new Date(enfant.dateNaissance).getTime()) / (30.4 * 864e5) : undefined;
      const s = getSession();
      if (specs.iaAnalyse.status === "ok" && s && !s.demo) {
        const fd = new FormData();
        fd.append("enfantId", enfantId); fd.append("symptomes", JSON.stringify(sel));
        if (t) fd.append("temperature", String(t));
        fd.append("duree", duree); fd.append("commentaire", comment);
        if (photo) fd.append("photo", photo);
        const r = await send<AnalyseIA>("POST", specs.iaAnalyse.path, fd);
        setRes({ ...(r.data as AnalyseIA), demo: false });
      } else {
        await new Promise((r) => setTimeout(r, 900));
        setRes({ ...analyseDemo(sel, t, ageMois, !!photo), demo: true });
      }
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Analyse impossible");
    } finally { setBusy(false); }
  }

  const st = res ? risqueStyle[res.niveau_risque] : null;

  return (
    <DashboardShell title="Signaler un symptôme" actions={<DemoBadge spec={specs.iaAnalyse} reason="Route manquante dans l'API" />}>
      <div className="grid gap-4 lg:grid-cols-5">
        <div className="space-y-4 lg:col-span-3">
          <Panel title="1. Enfant concerné" icon={Sparkles}>
            <select className="h-10 w-full rounded-md border bg-background px-3 text-sm" value={enfantId} onChange={(e) => setEnfantId(e.target.value)} aria-label="Enfant">
              {enfants.map((e) => <option key={enfantIdOf(e) ?? fullName(e)} value={enfantIdOf(e) ?? ""}>{fullName(e)}</option>)}
            </select>
            {enfant?.allergies?.length > 0 && <p className="mt-2 text-xs"><Pill tone="danger">Allergies : {enfant.allergies.join(", ")}</Pill></p>}
          </Panel>
          <Panel title="2. Symptômes observés">
            <div className="space-y-3">
              {symptomesCatalogue.map((c) => (
                <div key={c.cat}>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">{c.cat}</p>
                  <div className="flex flex-wrap gap-2">
                    {c.items.map((s) => (
                      <button key={s.id} type="button" onClick={() => toggle(s.id)} aria-pressed={sel.includes(s.id)}
                        className={`rounded-full border px-3 py-1 text-sm transition ${sel.includes(s.id) ? "border-primary bg-primary text-primary-foreground" : "hover:bg-accent"}`}>{s.label}</button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <div><Label htmlFor="temp">Température (°C)</Label><Input id="temp" inputMode="decimal" placeholder="38,5" value={temp} onChange={(e) => setTemp(e.target.value)} /></div>
              <div><Label htmlFor="duree">Depuis combien de temps ?</Label><Input id="duree" placeholder="ex. depuis ce matin" value={duree} onChange={(e) => setDuree(e.target.value)} /></div>
            </div>
            <div className="mt-3"><Label htmlFor="com">Contexte</Label><Textarea id="com" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Comportement, repas, prise de médicament…" /></div>
          </Panel>
          <Panel title="3. Photo (facultatif)" icon={Camera}>
            {preview ? (
              <div className="relative inline-block">
                <img src={preview} alt="Photo du symptôme" className="max-h-56 rounded-xl border" />
                <button className="absolute right-2 top-2 rounded-full bg-background p-1 shadow" onClick={() => setPhoto(null)} aria-label="Retirer la photo"><X className="h-4 w-4" /></button>
              </div>
            ) : (
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed p-8 text-sm text-muted-foreground hover:bg-accent">
                <Camera className="h-6 w-6" />Prendre ou choisir une photo (éruption, gorge, plaie…)
                <input type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => setPhoto(e.target.files?.[0] ?? null)} />
              </label>
            )}
          </Panel>
          <Button size="lg" className="w-full" onClick={analyser} disabled={busy}>{busy ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}Lancer l'analyse IA</Button>
        </div>

        <div className="lg:col-span-2">
          <Panel title="Résultat de l'analyse" icon={Sparkles} className="lg:sticky lg:top-24" spec={specs.iaAnalyse} demo={!!res?.demo} reason="Moteur de démonstration">
            {!res || !st ? (
              <p className="text-sm text-muted-foreground">Cochez les symptômes puis lancez l'analyse. Le résultat est une aide et ne remplace pas l'avis d'un médecin.</p>
            ) : (
              <div className="space-y-4">
                <div className={`flex items-center gap-3 rounded-xl border-2 p-4 ${st.cls}`}>
                  <st.icon className="h-6 w-6 shrink-0" />
                  <div><p className="font-semibold">{st.label}</p>{res.niveau_risque === "eleve" && <a href="tel:15" className="text-sm font-bold underline">Appeler le 15</a>}</div>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground">Diagnostic préliminaire</p>
                  <p className="font-display text-2xl font-semibold">{res.diagnostic_suggere}</p>
                  <div className="mt-2 flex items-center gap-2"><Progress value={res.niveau_confiance} className="h-2" /><span className="text-sm font-medium">{res.niveau_confiance} %</span></div>
                </div>
                {res.diagnostics.length > 1 && (
                  <div>
                    <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Autres possibilités</p>
                    {res.diagnostics.slice(1).map((d) => <p key={d.nom} className="flex justify-between text-sm"><span>{d.nom}</span><span className="text-muted-foreground">{d.confiance} %</span></p>)}
                  </div>
                )}
                <div>
                  <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">Conseils</p>
                  <ul className="list-disc space-y-1 pl-5 text-sm">{res.conseils.map((c) => <li key={c}>{c}</li>)}</ul>
                </div>
                <p className="flex items-start gap-2 text-xs text-muted-foreground"><AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />Enregistré dans le dossier de l'enfant. Parents et crèche sont prévenus si le risque est élevé.</p>
                {enfantId && <Button variant="outline" className="w-full" asChild><Link to="/enfants/$enfantId" params={{ enfantId }}>Ouvrir le dossier</Link></Button>}
              </div>
            )}
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
