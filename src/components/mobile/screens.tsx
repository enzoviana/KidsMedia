import type React from "react";
import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity, AlertTriangle, ArrowRight, Asterisk, Bell, BellRing, Calendar, Camera, CheckCircle2, ChevronRight, ClipboardList, Droplet, Flame, FolderOpen, Info,
  Lock, MapPin, Package, Phone, Pill as PillIcon, Plus, QrCode, Send, Shirt, ShieldCheck, ShoppingCart, Smile, Sparkles, Star, TrendingUp, UserPlus, Users,
} from "lucide-react";
import { getSession, toList, userParams } from "@/lib/api";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { qrDataUrl } from "@/lib/qr";
import { askNotificationPermission } from "@/lib/live-notify";
import { analyseDemo } from "@/lib/demo-medical";
import { ago, mAvis, mDiagnostics, mEnfants, mMemos, mNotifs, mRegistres, mRsai, mTraitements, SYMPTOMES } from "@/lib/mobile-demo";
import { Avatar, Chip, Empty, Glass, IconTile, inputCls, Pill, PrimaryBtn, SectionTitle, Sheet, SmallBtn, Stars, Status, type Tone } from "./ui";
import { ChildHero, Stat } from "./dossier";
import { ABSENCE_MOTIFS } from "@/lib/terrain-rules";
import { QrScanner } from "@/components/dash/qr-scanner";

const name = (e: any) => [e?.prenom, e?.nom].filter(Boolean).join(" ") || "—";
const etabId = () => userParams(getSession()?.user ?? ({} as any))["etablissementId"];
const SYM_ID: Record<string, string> = { "Fièvre": "fievre", Toux: "toux", "Respiration sifflante": "sifflement", "Nez qui coule": "nez", "Éruption cutanée": "eruption", Vomissements: "vomissements", "Diarrhée": "diarrhee", Fatigue: "fatigue", "Mal de gorge": "gorge", "Mal d'oreille": "oreille" };

function useEnfants(role: string) {
  const r = useApiOrDemo<any>(role === "parent" ? specs.parentEnfants : specs.enfantsEtab, role === "parent" ? [mEnfants[0]] : mEnfants);
  const list = toList(r.data);
  return { list: list.length ? list : r.demo ? mEnfants : [], demo: r.demo };
}
const idOf = (e: any) => String(e.id ?? e._id);

/* ======================= PARENT ======================= */
export function ParentHome({ open, go }: { open: (id: string) => void; go: (t: string) => void }) {
  const { list } = useEnfants("parent");
  const e = list[0];
  const d = useApiOrDemo<any>(specs.diagEnfants, mDiagnostics);
  const n = useApiOrDemo<any>(specs.notifs, mNotifs);
  const last = toList(d.data)[0];
  const notifs = toList(n.data).filter((x: any) => !x.lu).slice(0, 2);
  const [qr, setQr] = useState(false);
  const [abs, setAbs] = useState(false);
  const [decl, setDecl] = useState(false);
  const declBtn = <SmallBtn onClick={() => setDecl(true)}><Plus className="h-4 w-4" />Déclarer un enfant</SmallBtn>;
  if (!e) return <div className="space-y-2.5 px-4 pt-4"><Empty>Aucun enfant rattaché. Déclarez votre enfant ou demandez le code de liaison à la crèche.</Empty>{declBtn}{decl && <DeclarerSheet onClose={() => setDecl(false)} />}</div>;
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <button className="block w-full text-left" onClick={() => open(idOf(e))}><ChildHero e={e} extra={<span className="rounded-full bg-shade/35 px-3 py-1.5 backdrop-blur">{e.etablissement?.nom ?? ""}</span>} /></button>
      <div className="grid grid-cols-3 gap-2">
        <Quick icon={QrCode} tone="blue" label="Carte QR" onClick={() => setQr(true)} /><Quick icon={Activity} tone="pink" label="Diagnostic IA" onClick={() => go("diagnostic")} /><Quick icon={Calendar} tone="green" label="Absence" onClick={() => setAbs(true)} />
      </div>
      <div className="grid grid-cols-3 gap-2"><Stat icon={Activity} v={`${e.poids ?? "—"} kg`} l="Poids" tone="blue" /><Stat icon={TrendingUp} v={`${e.taille ?? "—"} cm`} l="Taille" tone="green" /><Stat icon={AlertTriangle} v={String((e.allergies ?? []).length)} l="Allergies" tone="pink" /></div>
      {last && <Glass><div className="flex items-center gap-2"><IconTile icon={Sparkles} tone="pink" /><p className="flex-1 font-bold">Dernier diagnostic IA</p><b className="font-display text-xl text-mobile-pink">{last.confiance ?? "—"}%</b></div>
        <p className="mt-3 font-display text-lg font-bold">{last.resultat ?? last.diagnostic}</p><p className="text-muted-foreground">{(last.symptomes ?? []).join(" · ")}</p>
        <button onClick={() => go("diagnostic")} className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-full border font-semibold text-mobile-blue">Nouveau diagnostic <ArrowRight className="h-5 w-5" /></button></Glass>}
      <Glass><div className="flex items-center gap-2"><IconTile icon={Bell} tone="blue" /><p className="flex-1 font-bold">Notifications</p>{notifs.length > 0 && <span className="grid h-7 w-7 place-items-center rounded-full bg-mobile-pink text-[13px] font-bold text-on-vivid">{notifs.length}</span>}</div>
        {notifs.length === 0 ? <p className="mt-3 text-muted-foreground">Tout est lu.</p> : notifs.map((x: any, i: number) => <div key={x.id ?? i} className="mt-4 flex gap-2"><span className={`mt-2 h-2.5 w-2.5 shrink-0 rounded-full ${i % 2 ? "bg-mobile-pink" : "bg-mobile-blue"}`} /><div><p className="font-semibold">{x.titre}</p><p className="text-muted-foreground">{x.message}</p></div></div>)}
        <button onClick={() => go("alertes")} className="mt-4 flex h-9 w-full items-center justify-center gap-2 rounded-full border font-semibold text-mobile-blue">Voir tout <ArrowRight className="h-5 w-5" /></button></Glass>
      <Glass><div className="flex items-center gap-2"><IconTile icon={Info} tone="warn" /><p className="font-bold">Mémos de la crèche</p></div>
        {mMemos.filter((m) => m.enfant === e.prenom).map((m) => <p key={m.id} className="mt-3">{m.texte}</p>)}</Glass>
      {qr && <QrSheet e={e} onClose={() => setQr(false)} />}
      {abs && <AbsenceSheet e={e} onClose={() => setAbs(false)} />}
      <div className="flex justify-center">{declBtn}</div>
      {decl && <DeclarerSheet onClose={() => setDecl(false)} />}
    </div>
  );
}
function Quick({ icon: I, label, tone, onClick }: { icon: typeof Star; label: string; tone: Tone; onClick: () => void }) {
  return <Glass onClick={onClick} className="!p-3 text-center"><span className="mx-auto block w-fit"><IconTile icon={I} tone={tone} /></span><p className="mt-3 text-[13px] font-semibold">{label}</p></Glass>;
}
function MobilePresence({ id }: { id: string }) {
  const [p, setP] = useState(true);
  async function set(v: boolean, ev: React.MouseEvent) {
    ev.stopPropagation();
    const r = await send("POST", v ? "/presences" : "/presences/absence", v ? { enfantId: id, present: true } : { enfantId: id, motif: "Pointage crèche" }).catch((x) => { toast.error((x as Error).message); return null; });
    if (r) setP(v);
  }
  return <span className="inline-flex overflow-hidden rounded-full border text-[11px] font-semibold"><span role="button" onClick={(ev) => set(true, ev)} className={`px-2 py-0.5 ${p ? "bg-mobile-blue text-on-vivid" : ""}`}>Présent</span><span role="button" onClick={(ev) => set(false, ev)} className={`px-2 py-0.5 ${!p ? "bg-mobile-pink text-on-vivid" : ""}`}>Absent</span></span>;
}
function AbsenceSheet({ e, onClose }: { e: any; onClose: () => void }) {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [motif, setMotif] = useState<string>(ABSENCE_MOTIFS[0]);
  async function go() {
    const r = await send("POST", "/presences/absence", { enfantId: idOf(e), date, motif }).catch((x) => { toast.error((x as Error).message); return null; });
    if (r) { toast.success(`Crèche prévenue${r.demo ? " (démo)" : ""}`); onClose(); }
  }
  return <Sheet title={`${e.prenom} ne viendra pas`} sub="La crèche est prévenue immédiatement" onClose={onClose}>
    <input type="date" className={inputCls} value={date} onChange={(x) => setDate(x.target.value)} />
    <div className="my-3 flex flex-wrap gap-2">{ABSENCE_MOTIFS.map((m) => <Chip key={m} on={m === motif} onClick={() => setMotif(m)}>{m}</Chip>)}</div>
    <PrimaryBtn onClick={go}>Signaler l'absence</PrimaryBtn></Sheet>;
}
function QrSheet({ e, onClose }: { e: any; onClose: () => void }) {
  const [src, setSrc] = useState("");
  useEffect(() => { try { setSrc(qrDataUrl(`${window.location.origin}/app?enfant=${idOf(e)}&urgence=${e.codeLiaison ?? ""}`, 420)); } catch { setSrc(""); } }, [e]);
  return <Sheet title="Carte QR médicale" sub={`À présenter aux secours pour ${e.prenom}`} onClose={onClose}>{src && <img src={src} alt={`QR code médical de ${e.prenom}`} className="mx-auto w-full max-w-xs rounded-2xl bg-background p-3" />}<p className="mt-4 text-center text-[13px] text-muted-foreground">Allergies, PAI et contacts accessibles en un scan.</p></Sheet>;
}

export function ParentDiagnostic() {
  const { list } = useEnfants("parent");
  const [enfant, setEnfant] = useState<string>("");
  const [sym, setSym] = useState<string[]>([]);
  const [temp, setTemp] = useState("");
  const [note, setNote] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [res, setRes] = useState<ReturnType<typeof analyseDemo> | null>(null);
  const [busy, setBusy] = useState(false);
  const e = list.find((x) => idOf(x) === enfant) ?? list[0];
  const toggle = (s: string) => setSym((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]));
  async function run() {
    if (!sym.length) { toast.error("Sélectionnez au moins un symptôme."); return; }
    setBusy(true);
    const ids = sym.map((s) => SYM_ID[s] ?? s);
    try {
      const fd = new FormData(); fd.append("enfantId", e ? idOf(e) : ""); fd.append("symptomes", JSON.stringify(ids)); if (temp) fd.append("temperature", temp); fd.append("commentaire", note); if (photo) fd.append("photo", photo);
      const r = await send("POST", specs.iaAnalyse.path, fd as any).catch(() => ({ demo: true, data: null }));
      const data = (r as any).data?.data ?? (r as any).data;
      setRes(data?.diagnostic_suggere ? data : analyseDemo(ids, temp ? Number(temp) : undefined, undefined, !!photo));
    } finally { setBusy(false); }
  }
  return (
    <div className="space-y-2.5 px-4 pb-6 pt-4">
      {list.length > 1 && <div className="flex flex-wrap gap-2">{list.map((x) => <Chip key={idOf(x)} on={idOf(x) === idOf(e)} onClick={() => setEnfant(idOf(x))}>{x.prenom}</Chip>)}</div>}
      <Glass><p className="text-[15px] font-bold">Symptômes observés</p><p className="text-muted-foreground">Sélectionnez tous les symptômes constatés</p>
        <div className="mt-4 flex flex-wrap gap-2">{SYMPTOMES.map((s) => <Chip key={s} on={sym.includes(s)} onClick={() => toggle(s)}>{s}</Chip>)}</div></Glass>
      <Glass><p className="text-[15px] font-bold">Température (optionnel)</p><input type="number" step="0.1" placeholder="Ex : 38,2" className={`${inputCls} mt-3`} value={temp} onChange={(x) => setTemp(x.target.value)} /></Glass>
      <Glass><p className="text-[15px] font-bold">Photo (optionnel)</p><p className="text-muted-foreground">Éruption cutanée, gorge… pour affiner l'analyse</p>
        <label className="mt-4 flex h-32 cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl border-2 border-dashed text-muted-foreground"><Camera className="h-7 w-7 text-mobile-blue" />{photo ? photo.name : "Ajouter une photo"}<input type="file" accept="image/*" capture="environment" className="hidden" onChange={(x) => setPhoto(x.target.files?.[0] ?? null)} /></label></Glass>
      <Glass><p className="text-[15px] font-bold">Note complémentaire</p><textarea className={`${inputCls} mt-3 min-h-24 resize-none`} placeholder="Ex : fièvre depuis hier soir, refuse de manger…" value={note} onChange={(x) => setNote(x.target.value)} /></Glass>
      <PrimaryBtn tone="pink" disabled={busy} onClick={run}><Sparkles className="h-5 w-5" />{busy ? "Analyse…" : "Lancer le diagnostic IA"}</PrimaryBtn>
      {res && <Sheet title={res.diagnostic_suggere} sub={`Confiance ${Math.round(res.niveau_confiance)} %`} onClose={() => setRes(null)}>
        <Pill tone={res.niveau_risque === "eleve" ? "pink" : res.niveau_risque === "moyen" ? "warn" : "green"} dot>Risque {res.niveau_risque}</Pill>
        <ul className="mt-4 space-y-2">{res.conseils.map((c) => <li key={c} className="flex gap-2"><CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-mobile-blue" />{c}</li>)}</ul>
        {res.niveau_risque === "eleve" && <a href="tel:15" className="mt-5 flex h-10 items-center justify-center gap-2 rounded-full bg-mobile-pink text-[15px] font-bold text-on-vivid"><Phone className="h-5 w-5" />Appeler le 15</a>}
        <p className="mt-4 text-xs text-muted-foreground">Aide à l'orientation, ne remplace pas l'avis d'un médecin.</p>
      </Sheet>}
    </div>
  );
}

export function ParentHistory({ open }: { open: (id: string) => void }) {
  const { list } = useEnfants("parent");
  const e = list[0];
  const d = useApiOrDemo<any>(specs.diagEnfants, mDiagnostics);
  const diags = toList(d.data);
  return (
    <div className="space-y-2.5 px-4 pt-4">
      {e && <Glass onClick={() => open(idOf(e))} className="flex items-center gap-2.5"><Avatar e={e} /><div className="flex-1"><p className="font-bold">Dossier complet de {e.prenom}</p><p className="text-[13px] text-muted-foreground">6 sections : aperçu, fièvre, PAI…</p></div><ChevronRight className="h-5 w-5 text-muted-foreground" /></Glass>}
      <Glass><div className="flex items-center gap-2"><IconTile icon={AlertTriangle} tone="pink" /><p className="font-bold">Allergies</p></div>
        {(e?.allergies ?? []).length === 0 ? <p className="mt-3 text-muted-foreground">Aucune.</p> : e.allergies.map((a: any, i: number) => <div key={i} className="mt-3 flex items-center justify-between"><span>{a.nom ?? a}</span><Pill tone="pink">{a.reaction ?? "—"}</Pill></div>)}</Glass>
      <Glass><div className="flex items-center gap-2"><IconTile icon={ShieldCheck} tone="green" /><p className="font-bold">Vaccinations</p></div>
        {(e?.vaccins ?? []).map((v: any, i: number) => <div key={i} className="mt-3 flex items-center justify-between"><span>{v.nom ?? v}</span><Pill tone={v.statut === "rappel" ? "warn" : "green"}>{v.statut === "rappel" ? "Rappel" : "À jour"}</Pill></div>)}</Glass>
      <SectionTitle>Historique des diagnostics</SectionTitle>
      {diags.length === 0 ? <Empty>Aucun diagnostic.</Empty> : diags.map((x: any, i: number) => (
        <Glass key={x.id ?? i}><div className="flex items-center justify-between"><p className="font-bold">{x.resultat ?? x.diagnostic}</p><b className="text-mobile-pink">{x.confiance}%</b></div><p className="text-[13px] text-muted-foreground">{(x.symptomes ?? []).join(" · ")} · {x.at ? ago(x.at) : ""}</p>{x.conseil && <p className="mt-2">{x.conseil}</p>}</Glass>
      ))}
    </div>
  );
}

const NOTIF_ICON: Record<string, [typeof Star, Tone]> = { vaccin: [Calendar, "warn"], symptome: [AlertTriangle, "pink"], message: [Info, "blue"] };
export function Alertes() {
  const n = useApiOrDemo<any>(specs.notifs, mNotifs);
  const [read, setRead] = useState<string[]>([]);
  const list = toList(n.data);
  return (
    <div className="space-y-2 px-4 pt-4">
      <NotifOptIn />
      {list.length > 0 && <button onClick={async () => { await send("PATCH", specs.notifsToutLire.path, {}).catch(() => null); setRead(list.map((x: any) => String(x.id ?? x._id))); }} className="ml-auto block text-[13px] font-semibold text-mobile-blue">Tout marquer comme lu</button>}
      {list.length === 0 ? <Empty>Aucune alerte.</Empty> : list.map((x: any, i: number) => {
        const [I, tone] = NOTIF_ICON[x.type] ?? [Bell, "blue" as Tone];
        const unread = !x.lu && !read.includes(String(x.id ?? x._id));
        return <Glass key={x.id ?? i} className="flex gap-2.5"><IconTile icon={I} tone={tone} /><div className="min-w-0 flex-1"><p className="flex items-center gap-2 font-bold">{x.titre ?? "Notification"}{unread && <span className="h-2.5 w-2.5 rounded-full bg-mobile-pink" />}</p><p>{x.message ?? x.contenu}</p><p className="mt-1 text-[13px] text-muted-foreground">{x.at || x.createdAt ? ago(x.at ?? x.createdAt) : ""}</p></div></Glass>;
      })}
    </div>
  );
}
export function NotifOptIn() {
  const [perm, setPerm] = useState("granted");
  useEffect(() => { setPerm("Notification" in window ? Notification.permission : "unsupported"); }, []);
  if (perm === "granted") return null;
  return <Glass className="flex items-center gap-2.5"><IconTile icon={BellRing} tone="blue" /><div className="flex-1"><p className="font-semibold">Alertes en temps réel</p><p className="text-[13px] text-muted-foreground">{perm === "denied" ? "Autorisez-les dans les réglages du téléphone." : perm === "unsupported" ? "Installez l'application pour les recevoir." : "Urgences et messages instantanés."}</p></div>{perm === "default" && <button onClick={async () => setPerm(await askNotificationPermission())} className="rounded-full bg-mobile-blue px-3 py-2 text-[13px] font-semibold text-on-vivid">Activer</button>}</Glass>;
}

/* ======================= CRÈCHE ======================= */
export function CrecheHome({ open }: { open: (id: string) => void }) {
  const { list, demo } = useEnfants("creche");
  const [signal, setSignal] = useState<any>(null);
  const [add, setAdd] = useState(false);
  const [scan, setScan] = useState(false);
  const sick = list.filter((e) => e.statut === "symptomes").length;
  const ok = list.filter((e) => !e.statut || e.statut === "sain").length;
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-4 pb-1">
        <Kpi icon={Users} tone="blue" n={list.length} l="Présents" /><Kpi icon={Smile} tone="green" n={ok} l="En forme" /><Kpi icon={Activity} tone="pink" n={sick} l="Symptômes" />
      </div>
      <ScanBtn onClick={() => setScan(true)} />
      {scan && <QrScanner onClose={() => setScan(false)} onChild={(id) => open(mapDemoId(id, list))} />}
      <Glass className="flex gap-2.5 !border-mobile-pink/40"><IconTile icon={Sparkles} tone="pink" /><div><p className="font-bold">Tendance IA du jour</p><p className="text-muted-foreground">Recrudescence de symptômes ORL détectée. Renforcez le lavage des mains.</p></div></Glass>
      <SectionTitle action={<SmallBtn onClick={() => setAdd(true)}><UserPlus className="h-5 w-5" />Ajouter</SmallBtn>}>Enfants présents{demo && <DemoDot />}</SectionTitle>
      {list.length === 0 ? <Empty>Aucun enfant pour le moment.</Empty> : list.map((e) => (
        <Glass key={idOf(e)} className="flex items-center gap-2.5 !p-3">
          <button onClick={() => open(idOf(e))} className="flex min-w-0 flex-1 items-center gap-2.5 text-left"><Avatar e={e} className="h-12 w-12" />
            <div className="min-w-0"><p className="flex items-center gap-2 truncate text-[15px] font-bold">{name(e)}{e.pai && <Pill tone="pink">PAI</Pill>}</p><p className="truncate text-[13px] text-muted-foreground">{[e.age, e.groupeSanguin, (e.allergies ?? []).length ? `${e.allergies.length} allergie(s)` : ""].filter(Boolean).join(" · ")}</p><div className="mt-1.5 flex items-center gap-2"><Status s={e.statut} /><MobilePresence id={idOf(e)} /></div></div></button>
          <button aria-label={`Signaler un symptôme pour ${e.prenom}`} onClick={() => setSignal(e)} className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-mobile-pink/40 bg-mobile-pink/10 text-mobile-pink"><Plus className="h-6 w-6" /></button>
        </Glass>
      ))}
      {signal && <SignalSheet e={signal} onClose={() => setSignal(null)} />}
      {add && <AddChildSheet onClose={() => setAdd(false)} />}
    </div>
  );
}
const DemoDot = () => <span className="ml-2 rounded-full bg-warning/20 px-2 py-0.5 align-middle text-[10px] font-semibold">démo</span>;
function Kpi({ icon: I, n, l, tone }: { icon: typeof Star; n: number; l: string; tone: Tone }) {
  return <div className="flex shrink-0 items-center gap-2 rounded-2xl border border-[var(--glass-border)] bg-[var(--glass)] px-3 py-2 backdrop-blur"><IconTile icon={I} tone={tone} /><b className="font-display text-xl">{n}</b><span className="text-muted-foreground">{l}</span></div>;
}
function SignalSheet({ e, onClose }: { e: any; onClose: () => void }) {
  const [sym, setSym] = useState<string[]>([]);
  const [busy, setBusy] = useState(false);
  return (
    <Sheet title="Signaler un symptôme" sub={`Pour ${name(e)}`} onClose={onClose}>
      <div className="flex flex-wrap gap-2">{SYMPTOMES.map((s) => <Chip key={s} on={sym.includes(s)} onClick={() => setSym((v) => (v.includes(s) ? v.filter((x) => x !== s) : [...v, s]))}>{s}</Chip>)}</div>
      <div className="mt-6"><PrimaryBtn tone="pink" disabled={!sym.length || busy} onClick={async () => {
        setBusy(true);
        try { const r = await send("POST", specs.alertes.path, { enfantId: idOf(e), symptome: sym.join(", "), symptomes: sym, gravite: "moyenne" }); toast.success(`Parents alertés${r.demo ? " (démo)" : ""}`); onClose(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
      }}><Send className="h-5 w-5" />Envoyer l'alerte</PrimaryBtn></div>
    </Sheet>
  );
}
function AddChildSheet({ onClose }: { onClose: () => void }) {
  const [f, setF] = useState({ prenom: "", nom: "", dateNaissance: "", groupeSanguin: "", allergies: "" });
  const qc = useQueryClient();
  return (
    <Sheet title="Ajouter un enfant" onClose={onClose}>
      <form className="space-y-2" onSubmit={async (ev) => {
        ev.preventDefault();
        try { const r = await send("POST", "/enfants", { ...f, allergies: f.allergies ? f.allergies.split(",").map((s) => s.trim()) : [], etablissementId: etabId() }); toast.success(`Enfant ajouté${r.demo ? " (démo)" : ""}`); qc.invalidateQueries({ queryKey: ["api"] }); onClose(); } catch (x) { toast.error((x as Error).message); }
      }}>
        <input required className={inputCls} placeholder="Prénom" value={f.prenom} onChange={(x) => setF({ ...f, prenom: x.target.value })} />
        <input required className={inputCls} placeholder="Nom" value={f.nom} onChange={(x) => setF({ ...f, nom: x.target.value })} />
        <label className="block text-[13px] text-muted-foreground">Date de naissance<input required type="date" className={`${inputCls} mt-1 text-foreground`} value={f.dateNaissance} onChange={(x) => setF({ ...f, dateNaissance: x.target.value })} /></label>
        <input className={inputCls} placeholder="Groupe sanguin (facultatif)" value={f.groupeSanguin} onChange={(x) => setF({ ...f, groupeSanguin: x.target.value })} />
        <input className={inputCls} placeholder="Allergies, séparées par des virgules" value={f.allergies} onChange={(x) => setF({ ...f, allergies: x.target.value })} />
        <PrimaryBtn type="submit" tone="gradient">Enregistrer</PrimaryBtn>
      </form>
    </Sheet>
  );
}

const MEMO_TYPES: { k: string; l: string; i: typeof Star }[] = [{ k: "objet", l: "Objet / Doudou", i: Package }, { k: "ravitaillement", l: "Ravitaillement", i: ShoppingCart }, { k: "vetement", l: "Vêtement", i: Shirt }];
export function CrecheQuotidien({ open }: { open: (id: string) => void }) {
  const { list } = useEnfants("creche");
  const [memos, setMemos] = useState(mMemos);
  const [adding, setAdding] = useState(false);
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <SectionTitle>Carnet de transmission</SectionTitle>
      {list.map((e) => (
        <Glass key={idOf(e)} onClick={() => open(idOf(e))} className="flex items-center gap-2.5 !p-3"><Avatar e={e} /><div className="min-w-0 flex-1"><p className="text-[15px] font-bold">{name(e)}</p><p className="text-muted-foreground">{(e.logs ?? []).length ? `${e.logs.length} transmission(s) aujourd'hui` : "Aucune transmission"}</p></div><ChevronRight className="h-5 w-5 text-muted-foreground" /></Glass>
      ))}
      <SectionTitle action={<SmallBtn onClick={() => setAdding(true)}><Plus className="h-5 w-5" />Nouveau</SmallBtn>}>Mémos & alertes</SectionTitle>
      {memos.filter((m) => !m.traite).length === 0 ? <Empty>Aucun mémo en cours.</Empty> : memos.filter((m) => !m.traite).map((m) => {
        const t = MEMO_TYPES.find((x) => x.k === m.type) ?? MEMO_TYPES[0]!;
        return <Glass key={m.id} className="flex items-center gap-2.5"><IconTile icon={t.i} tone="warn" /><div className="min-w-0 flex-1"><p className="font-bold">{m.texte}</p><p className="text-[13px] text-muted-foreground">{m.enfant} · {t.l}</p></div>
          <button onClick={async () => { const r = await send("PATCH", `/transmissions/${m.id}/traiter`, { traite: true }).catch((x) => { toast.error((x as Error).message); return null; }); if (!r) return; setMemos((v) => v.map((x) => (x.id === m.id ? { ...x, traite: true } : x))); toast.success(`Mémo traité${r.demo ? " (démo)" : ""}`); }} className="rounded-full border-2 border-mobile-blue px-3 py-2 font-semibold text-mobile-blue">Traiter</button></Glass>;
      })}
      {adding && <MemoSheet enfants={list} onClose={() => setAdding(false)} onAdd={(m) => setMemos((v) => [m, ...v])} />}
    </div>
  );
}
function MemoSheet({ enfants, onClose, onAdd }: { enfants: any[]; onClose: () => void; onAdd: (m: any) => void }) {
  const [enfant, setEnfant] = useState(enfants[0]?.prenom ?? "");
  const [type, setType] = useState("objet");
  const [txt, setTxt] = useState("");
  return (
    <Sheet title="Nouveau mémo" onClose={onClose}>
      <p className="font-bold">Enfant</p><div className="mt-2 flex flex-wrap gap-2">{enfants.map((e) => <Chip key={idOf(e)} on={enfant === e.prenom} onClick={() => setEnfant(e.prenom)}>{e.prenom}</Chip>)}</div>
      <p className="mt-4 font-bold">Type</p><div className="mt-2 flex flex-wrap gap-2">{MEMO_TYPES.map((t) => <Chip key={t.k} on={type === t.k} onClick={() => setType(t.k)}><t.i className="h-4 w-4" />{t.l}</Chip>)}</div>
      <p className="mt-4 font-bold">Message</p><input className={`${inputCls} mt-2`} placeholder="Ex : Doudou oublié, stock de couches épuisé…" value={txt} onChange={(x) => setTxt(x.target.value)} />
      <div className="mt-5"><PrimaryBtn onClick={async () => {
        if (!txt.trim()) { toast.error("Écrivez le message."); return; }
        const r = await send("POST", "/transmissions", { contenu: txt, type: "memo", categorie: type, etablissementId: etabId() }).catch((x) => { toast.error(x.message); return null; });
        if (!r) return; onAdd({ id: crypto.randomUUID(), enfant, type, texte: txt, traite: false }); toast.success(`Mémo envoyé${r.demo ? " (démo)" : ""}`); onClose();
      }}>Envoyer le mémo</PrimaryBtn></div>
    </Sheet>
  );
}

export function CrecheTraitements() {
  const r = useApiOrDemo<any>(specs.medicToday, mTraitements);
  const list = toList(r.data);
  const [done, setDone] = useState<Record<string, string[]>>({});
  return (
    <div className="space-y-2.5 px-4 pt-4">
      {list.length === 0 ? <div className="pt-10 text-center"><span className="mx-auto block w-fit"><IconTile icon={PillIcon} tone="blue" size="lg" /></span><p className="mt-4 text-muted-foreground">Aucun traitement actif.</p></div> : list.map((m: any, i: number) => {
        const id = String(m.id ?? i);
        const given = [...(m.donnees ?? []), ...(done[id] ?? [])];
        return <Glass key={id}><div className="flex items-center gap-2.5"><IconTile icon={PillIcon} tone="blue" /><div className="min-w-0 flex-1"><p className="text-[15px] font-bold">{m.nom ?? m.medicament}</p><p className="text-[13px] text-muted-foreground">{name(m.enfant)} · {m.posologie ?? m.dosage} · {m.fin ?? ""}</p></div></div>
          <div className="mt-4 flex flex-wrap gap-2">{(m.heures ?? [m.heure].filter(Boolean)).map((hh: string) => {
            const ok = given.includes(hh);
            return <button key={hh} disabled={ok} onClick={async () => { const res = await send("POST", `/medicaments/${id}/administrer`, { heure: hh }).catch(() => null); setDone((d) => ({ ...d, [id]: [...(d[id] ?? []), hh] })); toast.success(`Prise de ${hh} enregistrée${res?.demo !== false ? " (démo)" : ""}`); }} className={`flex items-center gap-1.5 rounded-full px-3 py-2 font-semibold ${ok ? "bg-brand-green/15 text-brand-green" : "border border-mobile-blue text-mobile-blue"}`}>{ok && <CheckCircle2 className="h-4 w-4" />}{hh}</button>;
          })}</div>
          {m.medecin && <p className="mt-3 text-[13px] text-muted-foreground">Prescrit par {m.medecin}</p>}</Glass>;
      })}
    </div>
  );
}

export function CrecheAssistant() {
  const d = useApiOrDemo<any>(specs.diagEnfants, mDiagnostics);
  const { list } = useEnfants("creche");
  const diags = toList(d.data);
  const counts = new Map<string, number>();
  diags.forEach((x: any) => (x.symptomes ?? []).forEach((s: any) => counts.set(String(s?.nom ?? s), (counts.get(String(s?.nom ?? s)) ?? 0) + 1)));
  const top = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <Glass className="flex items-center gap-2.5 !border-mobile-pink/40"><IconTile icon={Sparkles} tone="pink" size="lg" /><div><p className="text-base font-bold">Synthèse IA</p><p className="text-muted-foreground">Sur {list.length} enfants · mise à jour en continu</p></div></Glass>
      <Glass><p className="text-[15px] font-bold">Symptômes les plus fréquents</p>
        {top.length === 0 ? <p className="mt-2 text-muted-foreground">Aucun symptôme signalé.</p> : top.map(([s, n]) => <div key={s} className="mt-3"><div className="flex justify-between text-[13px]"><span>{s}</span><b>{n}</b></div><div className="mt-1 h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-[image:var(--gradient-mobile)]" style={{ width: `${(n / top[0]![1]) * 100}%` }} /></div></div>)}</Glass>
      <Glass className="space-y-2.5"><p className="text-[15px] font-bold">Recommandations IA</p>
        <Reco icon={TrendingUp} tone="pink">Surveillez les symptômes ORL dans les sections cette semaine.</Reco>
        <Reco icon={Droplet} tone="blue">Intensifiez l'hydratation par temps chaud.</Reco>
        <Reco icon={ShieldCheck} tone="green">Aucune allergie alimentaire déclenchée ces 30 derniers jours.</Reco></Glass>
      <Glass><p className="text-[15px] font-bold">Diagnostics IA récents</p>
        {diags.slice(0, 5).map((x: any, i: number) => <div key={x.id ?? i} className="mt-3 border-t pt-3"><p className="font-semibold">{name(x.enfant)}</p><p className="text-[13px] text-muted-foreground">{x.resultat ?? x.diagnostic} · {x.confiance}%</p></div>)}</Glass>
    </div>
  );
}
function Reco({ icon: I, tone, children }: { icon: typeof Star; tone: Tone; children: React.ReactNode }) {
  return <div className="flex items-center gap-2"><IconTile icon={I} tone={tone} /><p>{children}</p></div>;
}

/* ======================= RSAI ======================= */
export function useGeo() {
  const [on, setOn] = useState(false);
  useEffect(() => { setOn(sessionStorage.getItem("kidsmed_geo") === "1"); }, []);
  function toggle() {
    if (on) { sessionStorage.removeItem("kidsmed_geo"); setOn(false); return; }
    const ok = () => { sessionStorage.setItem("kidsmed_geo", "1"); setOn(true); toast.success("Localisation vérifiée : vous êtes sur site."); };
    if (getSession()?.demo || !navigator.geolocation) return ok();
    navigator.geolocation.getCurrentPosition(async (p) => {
      const r = await send("POST", "/securite/verifier-position", { latitude: p.coords.latitude, longitude: p.coords.longitude }).catch((x) => { toast.error((x as Error).message); return null; });
      if (r) ok();
    }, () => toast.error("Autorisez la localisation pour accéder aux dossiers."), { timeout: 8000 });
  }
  return { on, toggle };
}

export function RsaiHome({ geo }: { geo: ReturnType<typeof useGeo> }) {
  const a = useApiOrDemo<any>(specs.rsaiAffectations, mRsai.missions);
  const missions = toList(a.data);
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <Glass className="flex items-center gap-2.5"><span className="grid h-12 w-12 place-items-center rounded-2xl bg-[image:var(--gradient-mobile)] font-display text-lg font-bold text-on-vivid">{mRsai.nom[0]}</span>
        <div className="flex-1"><p className="text-base font-bold">{mRsai.nom}</p><p className="text-muted-foreground">{mRsai.qualification}</p><p className="mt-1 flex items-center gap-2"><Stars n={mRsai.note} /><span className="text-[13px] text-muted-foreground">{mRsai.note} · {mRsai.nbAvis} avis</span></p></div></Glass>
      <Glass className={`flex items-center gap-2.5 ${geo.on ? "!border-brand-green/50" : "!border-mobile-pink/40"}`}>
        <IconTile icon={MapPin} tone={geo.on ? "green" : "pink"} />
        <div className="flex-1"><p className="font-bold">Géolocalisation</p><p className="text-[13px] text-muted-foreground">{geo.on ? "Sur site · dossiers déverrouillés" : "Activez-la sur site pour accéder aux enfants et registres"}</p></div>
        <button role="switch" aria-checked={geo.on} aria-label="Géolocalisation" onClick={geo.toggle} className={`relative h-8 w-10 rounded-full transition ${geo.on ? "bg-brand-green" : "bg-muted"}`}><span className={`absolute top-1 h-6 w-6 rounded-full bg-card shadow transition-all ${geo.on ? "left-7" : "left-1"}`} /></button>
      </Glass>
      <SectionTitle>Missions du jour</SectionTitle>
      {missions.map((m: any, i: number) => (
        <Glass key={m.id ?? i}><div className="flex items-center justify-between gap-2"><p className="text-[15px] font-bold">{m.creche?.nom ?? m.creche}</p><Pill tone={m.statut === "en_cours" ? "green" : "blue"} dot>{m.statut === "en_cours" ? "En cours" : "À venir"}</Pill></div>
          <p className="mt-1 flex items-center gap-2 text-muted-foreground"><MapPin className="h-4 w-4" />{m.adresse ?? m.creche?.adresse ?? ""}</p><p className="mt-1 flex items-center gap-2 font-semibold text-mobile-blue"><Calendar className="h-4 w-4" />{m.horaire ?? `${m.debut ?? ""} – ${m.fin ?? ""}`}</p></Glass>
      ))}
    </div>
  );
}
function Locked({ geo }: { geo: ReturnType<typeof useGeo> }) {
  return (
    <div className="px-4 pt-10 text-center">
      <span className="mx-auto block w-fit"><IconTile icon={Lock} tone="pink" size="lg" /></span>
      <p className="mt-5 font-display text-lg font-bold">Accès verrouillé</p>
      <p className="mt-2 text-muted-foreground">Ces données ne sont consultables que sur site, dans le périmètre de la crèche.</p>
      <div className="mt-6"><PrimaryBtn onClick={geo.toggle}><MapPin className="h-5 w-5" />Activer la localisation</PrimaryBtn></div>
    </div>
  );
}
export function RsaiEnfants({ geo, open }: { geo: ReturnType<typeof useGeo>; open: (id: string) => void }) {
  const { list } = useEnfants("rsai");
  const [scan, setScan] = useState(false);
  if (!geo.on) return <Locked geo={geo} />;
  return <div className="space-y-2 px-4 pt-4"><ScanBtn onClick={() => setScan(true)} />{scan && <QrScanner onClose={() => setScan(false)} onChild={(id) => open(mapDemoId(id, list))} />}{list.map((e) => <Glass key={idOf(e)} onClick={() => open(idOf(e))} className="flex items-center gap-2.5 !p-3"><Avatar e={e} /><div className="min-w-0 flex-1"><p className="flex items-center gap-2 font-bold">{name(e)}{e.pai && <Pill tone="pink">PAI</Pill>}</p><Status s={e.statut} /></div><ChevronRight className="h-5 w-5 text-muted-foreground" /></Glass>)}</div>;
}
export function RsaiRegistres({ geo }: { geo: ReturnType<typeof useGeo> }) {
  const [regs, setRegs] = useState(mRegistres);
  const [add, setAdd] = useState<string | null>(null);
  const [txt, setTxt] = useState("");
  if (!geo.on) return <Locked geo={geo} />;
  return (
    <div className="space-y-2.5 px-4 pt-4">
      {regs.map((r) => (
        <Glass key={r.id}><div className="flex items-center gap-2"><IconTile icon={r.type === "soins" ? ClipboardList : Flame} tone={r.type === "soins" ? "blue" : "pink"} /><p className="flex-1 text-[15px] font-bold">{r.titre}</p><button aria-label="Ajouter une entrée" onClick={() => setAdd(r.id)} className="grid h-8 w-8 place-items-center rounded-full bg-mobile-blue text-on-vivid"><Plus className="h-5 w-5" /></button></div>
          {r.entrees.map((x, i) => <div key={i} className="mt-3 border-t pt-3"><p>{x.texte}</p><p className="text-[13px] text-muted-foreground">{x.auteur} · {ago(x.at)}</p></div>)}</Glass>
      ))}
      {add && <Sheet title="Nouvelle entrée" onClose={() => setAdd(null)}>
        <textarea className={`${inputCls} min-h-28 resize-none`} placeholder="Enfant, soin ou incident, mesures prises…" value={txt} onChange={(x) => setTxt(x.target.value)} />
        <div className="mt-4"><PrimaryBtn onClick={async () => {
          if (!txt.trim()) return; const r = await send("POST", `/registres/${add}/entrees`, { texte: txt }).catch((x) => { toast.error(x.message); return null; });
          if (!r) return; setRegs((v) => v.map((g) => (g.id === add ? { ...g, entrees: [{ at: new Date().toISOString(), texte: txt, auteur: "Moi" }, ...g.entrees] } : g))); setTxt(""); setAdd(null); toast.success(`Entrée ajoutée${r.demo ? " (démo)" : ""}`);
        }}>Enregistrer</PrimaryBtn></div>
      </Sheet>}
    </div>
  );
}
export function RsaiAvis() {
  const r = useApiOrDemo<any>(specs.avisCoordination, mAvis);
  const list = toList(r.data);
  const moy = list.length ? list.reduce((s: number, a: any) => s + Number(a.note ?? 0), 0) / list.length : 0;
  return (
    <div className="space-y-2.5 px-4 pt-4">
      <Glass className="text-center"><p className="font-display text-6xl font-bold">{moy.toFixed(1)}</p><div className="mt-1 flex justify-center"><Stars n={moy} /></div><p className="mt-1 text-muted-foreground">{list.length} avis des crèches</p></Glass>
      {list.map((a: any, i: number) => <Glass key={a.id ?? i}><div className="flex items-center justify-between"><p className="font-bold">{a.auteur?.nom ?? a.auteur}</p><Stars n={a.note} /></div><p className="mt-2">{a.texte ?? a.commentaire}</p><p className="mt-1 text-[13px] text-muted-foreground">{a.at || a.createdAt ? ago(a.at ?? a.createdAt) : ""}</p></Glass>)}
    </div>
  );
}

/* ======================= SOS ======================= */
const MOTIFS = ["Laryngite aiguë", "Réaction allergique", "Chute", "Convulsion", "Détresse respiratoire"];
export function SosSheet({ onClose, role = "creche" }: { onClose: () => void; role?: string }) {
  const { list } = useEnfants(role);
  const [kid, setKid] = useState("");
  const e = list.find((x) => idOf(x) === kid) ?? (list.length === 1 ? list[0] : undefined);
  const allergies: any[] = e?.allergies ?? [];
  const parentTel = e?.parents?.[0]?.telephone ?? e?.contactUrgence?.telephone ?? e?.telephoneParent;
  const [motif, setMotif] = useState("");
  const [busy, setBusy] = useState(false);
  const Call = ({ n, l, i: I }: { n: string; l: string; i: typeof Phone }) => <a href={`tel:${n}`} className="flex flex-col items-center gap-1 rounded-3xl bg-foreground py-2.5 text-background"><I className="h-6 w-6" /><b className="text-xl">{n}</b><span className="text-[13px] opacity-70">{l}</span></a>;
  return (
    <Sheet title="Urgence immédiate" sub="Déclenchement en 1 clic" onClose={onClose}>
      <p className="font-bold">Enfant concerné</p>
      <select value={e ? idOf(e) : ""} onChange={(x) => setKid(x.target.value)} className={`${inputCls} mt-2`}>
        <option value="">— Choisir l'enfant —</option>
        {list.map((x) => <option key={idOf(x)} value={idOf(x)}>{name(x)}</option>)}
      </select>
      {e && <div className="mt-2 space-y-1.5 rounded-2xl border-2 border-mobile-pink/50 bg-mobile-pink/10 p-3 text-[14px]">
        <p className="flex items-center gap-1.5 font-bold text-mobile-pink"><AlertTriangle className="h-4 w-4" />Allergies : {allergies.length ? allergies.map((a) => typeof a === "string" ? a : `${a.nom}${a.reaction ? ` (${a.reaction})` : ""}`).join(", ") : "aucune connue"}</p>
        {e.pai ? <p><b>PAI {e.paiDetail?.type ? `· ${e.paiDetail.type}` : ""}</b> — {e.paiDetail?.conduite ?? "Consultez le PAI dans le dossier."}</p> : <p className="text-muted-foreground">Pas de PAI actif.</p>}
        {e.groupeSanguin && <p>Groupe sanguin : <b>{e.groupeSanguin}</b></p>}
        {parentTel && <a href={`tel:${parentTel}`} className="inline-flex items-center gap-1 font-semibold text-mobile-blue"><Phone className="h-4 w-4" />Appeler les parents</a>}
      </div>}
      <p className="mt-4 font-bold">Motif de l'urgence</p>
      <input value={motif} onChange={(x) => setMotif(x.target.value)} placeholder="Ex : réaction allergique, chute…" className={`${inputCls} mt-2`} />
      <div className="mt-3 flex flex-wrap gap-2">{MOTIFS.map((m) => <Chip key={m} on={motif === m} onClick={() => setMotif(m)}>{m}</Chip>)}</div>
      <p className="mt-5 font-bold">Appel rapide des secours</p>
      <div className="mt-2 grid grid-cols-3 gap-2"><Call n="15" l="SAMU" i={Asterisk} /><Call n="18" l="Pompiers" i={Flame} /><Call n="112" l="Urgences" i={Phone} /></div>
      <div className="mt-5"><PrimaryBtn tone="pink" disabled={busy} onClick={async () => {
        if (!e) { toast.error("Choisissez l'enfant concerné."); return; }
        if (!motif.trim()) { toast.error("Indiquez le motif de l'urgence."); return; }
        setBusy(true);
        let pos: { latitude?: number; longitude?: number } = {};
        try { pos = await new Promise((ok) => navigator.geolocation.getCurrentPosition((p) => ok({ latitude: p.coords.latitude, longitude: p.coords.longitude }), () => ok({}), { timeout: 4000 })); } catch { /* sans position */ }
        try { const r = await send("POST", specs.alertes.path, { motif, symptome: motif, enfantId: idOf(e), enfant: idOf(e), urgence: true, niveau: "critique", ...pos }); toast.success(`Alerte envoyée aux parents${r.demo ? " (démo)" : ""}`); onClose(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
      }}><Bell className="h-5 w-5" />{busy ? "Envoi…" : "Envoyer l'alerte aux parents"}</PrimaryBtn></div>
    </Sheet>
  );
}

/* ======================= QR & DÉCLARATION ======================= */
function ScanBtn({ onClick }: { onClick: () => void }) {
  return <button onClick={onClick} className="flex h-10 w-full items-center justify-center gap-2 rounded-full bg-mobile-blue text-[15px] font-bold text-on-vivid"><QrCode className="h-5 w-5" />Scanner le QR code d'un enfant</button>;
}
/** En démo, un code « luc-… » ouvre l'enfant dont le prénom commence pareil. */
function mapDemoId(id: string, list: any[]) {
  if (!id.startsWith("demo-")) return id;
  const p = id.slice(5);
  const hit = list.find((x) => String(x.prenom ?? "").toLowerCase().startsWith(p)) ?? list[0];
  return hit ? idOf(hit) : id;
}
function DeclarerSheet({ onClose }: { onClose: () => void }) {
  const qc = useQueryClient();
  const [f, setF] = useState({ prenom: "", nom: "", dateNaissance: "", allergies: "" });
  const [busy, setBusy] = useState(false);
  return (
    <Sheet title="Déclarer un enfant" sub="Création du dossier santé" onClose={onClose}>
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2"><input className={inputCls} placeholder="Prénom" value={f.prenom} onChange={(x) => setF({ ...f, prenom: x.target.value })} /><input className={inputCls} placeholder="Nom" value={f.nom} onChange={(x) => setF({ ...f, nom: x.target.value })} /></div>
        <label className="block text-[13px] text-muted-foreground">Date de naissance<input type="date" className={`${inputCls} mt-1`} value={f.dateNaissance} onChange={(x) => setF({ ...f, dateNaissance: x.target.value })} /></label>
        <input className={inputCls} placeholder="Allergies (séparées par des virgules)" value={f.allergies} onChange={(x) => setF({ ...f, allergies: x.target.value })} />
        <PrimaryBtn disabled={busy} onClick={async () => {
          if (!f.prenom.trim() || !f.nom.trim() || !f.dateNaissance) { toast.error("Prénom, nom et date de naissance requis."); return; }
          setBusy(true);
          try {
            const r = await send("POST", "/enfants", { ...f, allergies: f.allergies.split(",").map((a) => a.trim()).filter(Boolean) });
            toast.success(`Dossier créé${r.demo ? " (démo)" : ""}`); await qc.invalidateQueries(); onClose();
          } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
        }}><Plus className="h-5 w-5" />{busy ? "Création…" : "Créer le dossier"}</PrimaryBtn>
      </div>
    </Sheet>
  );
}
