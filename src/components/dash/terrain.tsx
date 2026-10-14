import { useState } from "react";
import { toast } from "sonner";
import { CalendarX, CalendarClock, Star, Thermometer } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { send } from "@/lib/mutate";
import { ABSENCE_MOTIFS, validTemperature } from "@/lib/terrain-rules";

const ok = (r: { demo: boolean } | null, msg: string) => r && toast.success(`${msg}${r.demo ? " (démo)" : ""}`);
const err = (x: unknown) => { toast.error((x as Error).message); return null; };

export function AbsenceButton({ enfantId, prenom, size = "sm" }: { enfantId: string; prenom?: string; size?: "sm" | "default" }) {
  const [open, setOpen] = useState(false);
  const today = new Date().toISOString().slice(0, 10);
  const [date, setDate] = useState(today);
  const [fin, setFin] = useState("");
  const [motif, setMotif] = useState<string>(ABSENCE_MOTIFS[0]);
  async function submit() {
    const r = await send("POST", "/presences/absence", { enfantId, date, dateFin: fin || undefined, motif }).catch(err);
    if (r) { ok(r, "Absence signalée à la crèche"); setOpen(false); }
  }
  return (
    <>
      <Button size={size} variant="outline" onClick={() => setOpen(true)}><CalendarX className="mr-1 h-4 w-4" />Signaler une absence</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Absence{prenom ? ` de ${prenom}` : ""}</DialogTitle></DialogHeader>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <label>Du<Input type="date" value={date} onChange={(e) => setDate(e.target.value)} /></label>
            <label>Au (facultatif)<Input type="date" value={fin} min={date} onChange={(e) => setFin(e.target.value)} /></label>
          </div>
          <div className="flex flex-wrap gap-2">{ABSENCE_MOTIFS.map((m) => <Button key={m} size="sm" variant={m === motif ? "default" : "outline"} onClick={() => setMotif(m)}>{m}</Button>)}</div>
          <Button onClick={submit}>Prévenir la crèche</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function PresenceToggle({ enfantId, present: initial = true }: { enfantId: string; present?: boolean }) {
  const [present, setPresent] = useState(initial);
  async function set(p: boolean) {
    const r = await send("POST", p ? "/presences" : "/presences/absence", p ? { enfantId, present: true } : { enfantId, motif: "Pointage crèche" }).catch(err);
    if (r) { setPresent(p); ok(r, p ? "Présent" : "Absent"); }
  }
  return (
    <div className="inline-flex overflow-hidden rounded-full border text-xs" onClick={(e) => e.stopPropagation()}>
      <button className={`px-2.5 py-1 font-semibold ${present ? "bg-success text-success-foreground" : ""}`} onClick={() => set(true)}>Présent</button>
      <button className={`px-2.5 py-1 font-semibold ${!present ? "bg-destructive text-destructive-foreground" : ""}`} onClick={() => set(false)}>Absent</button>
    </div>
  );
}

export function TemperatureButton({ enfantId, onAdded }: { enfantId: string; onAdded?: () => void }) {
  const [open, setOpen] = useState(false);
  const [v, setV] = useState("");
  async function submit() {
    const n = Number(v.replace(",", "."));
    if (!validTemperature(n)) { toast.error("Température entre 34 et 43 °C"); return; }
    const r = await send("POST", `/enfants/${enfantId}/temperatures`, { temperature: n }).catch(err);
    if (r) { ok(r, `${n.toFixed(1)} °C enregistrée`); setOpen(false); setV(""); onAdded?.(); }
  }
  return (
    <>
      <Button size="sm" variant="outline" onClick={() => setOpen(true)}><Thermometer className="mr-1 h-4 w-4" />Noter une température</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm">
          <DialogHeader><DialogTitle>Nouvelle mesure</DialogTitle></DialogHeader>
          <Input inputMode="decimal" placeholder="Ex : 38,2" value={v} onChange={(e) => setV(e.target.value)} />
          <Button onClick={submit}>Enregistrer</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function AvisRsaiButton({ rsaiId }: { rsaiId: string }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState(5);
  const [txt, setTxt] = useState("");
  async function submit() {
    const r = await send("POST", `/rsai/${rsaiId}/avis`, { note, commentaire: txt }).catch(err);
    if (r) { ok(r, "Avis enregistré"); setOpen(false); }
  }
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><Star className="mr-1 h-4 w-4" />Donner un avis</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Votre avis sur cette RSAI</DialogTitle></DialogHeader>
          <div className="flex gap-1">{[1, 2, 3, 4, 5].map((n) => <button key={n} aria-label={`${n} étoiles`} onClick={() => setNote(n)}><Star className={`h-7 w-7 ${n <= note ? "fill-warning text-warning" : "text-muted-foreground"}`} /></button>)}</div>
          <Textarea placeholder="Commentaire (facultatif)" value={txt} onChange={(e) => setTxt(e.target.value)} />
          <Button onClick={submit}>Publier</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}

export function RdvMedecinButton({ medecinId }: { medecinId: string }) {
  const [open, setOpen] = useState(false);
  const [date, setDate] = useState("");
  const [motif, setMotif] = useState("");
  async function submit() {
    if (!date) { toast.error("Choisissez une date"); return; }
    const r = await send("POST", "/rendez-vous", { medecinId, date: new Date(date).toISOString(), motif }).catch(err);
    if (r) { ok(r, "Demande de rendez-vous envoyée"); setOpen(false); }
  }
  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}><CalendarClock className="mr-1 h-4 w-4" />Demander un rendez-vous</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Demande de rendez-vous</DialogTitle></DialogHeader>
          <Input type="datetime-local" value={date} onChange={(e) => setDate(e.target.value)} />
          <Textarea placeholder="Motif" value={motif} onChange={(e) => setMotif(e.target.value)} />
          <Button onClick={submit}>Envoyer</Button>
        </DialogContent>
      </Dialog>
    </>
  );
}
