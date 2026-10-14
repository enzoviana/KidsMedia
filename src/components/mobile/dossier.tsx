import { useState } from "react";
import { toast } from "sonner";
import { AlertCircle, Baby, BadgeCheck, CalendarDays, CheckCircle2, ClipboardList, Droplet, Globe, HeartPulse, Lock, MessageSquare, Moon, Plus, Ruler, ShieldAlert, Thermometer, User, Utensils, Weight } from "lucide-react";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { ago, canEdit, canSeeInternal, feverColor, mEnfants, type Section } from "@/lib/mobile-demo";
import { Avatar, Chip, Empty, FeverChart, Glass, Header, IconTile, inputCls, Pill, PrimaryBtn, Sheet, SmallBtn, Status, TONES } from "./ui";

const SECTIONS: { key: Section; label: string; icon: typeof User }[] = [
  { key: "apercu", label: "Aperçu", icon: User }, { key: "quotidien", label: "Quotidien", icon: ClipboardList }, { key: "fievre", label: "Fièvre", icon: Thermometer },
  { key: "notes", label: "Notes", icon: MessageSquare }, { key: "pai", label: "PAI & Soins", icon: ShieldAlert }, { key: "sorties", label: "Sorties", icon: BadgeCheck },
];

/** Dossier enfant mobile : 6 sections, droits d'édition selon le rôle. */
export function Dossier({ id, role, onBack }: { id: string; role: string; onBack: () => void }) {
  const fallback = mEnfants.find((e) => e.id === id) ?? mEnfants[0];
  const r = useApiOrDemo<any>(specs.enfant, fallback, { enfantId: id });
  const base = (r.data && !Array.isArray(r.data) ? (r.data as any).data ?? r.data : fallback) as any;
  const [local, setLocal] = useState<any>({});
  const e = { ...fallback, ...base, ...local };
  const [sec, setSec] = useState<Section>("apercu");
  const patch = (k: string, v: any) => setLocal((l: any) => ({ ...l, [k]: v }));

  return (
    <div className="pb-16 text-[13px]">
      <Header title="Dossier enfant" sub={`${e.prenom} ${e.nom}`} onBack={onBack} />
      <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto px-3 pb-1">
        {SECTIONS.map((s) => <Chip key={s.key} on={sec === s.key} onClick={() => setSec(s.key)}><s.icon className="h-3.5 w-3.5" />{s.label}</Chip>)}
      </div>
      <div className="mt-3 space-y-2 px-3">
        {sec === "apercu" && <Apercu e={e} />}
        {sec === "quotidien" && <Quotidien e={e} edit={canEdit("quotidien", role)} add={(l) => patch("logs", [l, ...(e.logs ?? [])])} />}
        {sec === "fievre" && <Fievre e={e} edit={canEdit("fievre", role)} add={(t) => patch("temperatures", [...(e.temperatures ?? []), t])} />}
        {sec === "notes" && <Notes e={e} role={role} add={(n) => patch("notes", [n, ...(e.notes ?? [])])} />}
        {sec === "pai" && <Pai e={e} sign={canEdit("pai", role)} onSign={(aid) => patch("autorisations", (e.autorisations ?? []).map((a: any) => (a.id === aid ? { ...a, signe: true } : a)))} />}
        {sec === "sorties" && <Sorties e={e} edit={canEdit("sorties", role)} add={(p) => patch("sorties", [...(e.sorties ?? []), p])} />}
      </div>
    </div>
  );
}

export function ChildHero({ e, extra }: { e: any; extra?: React.ReactNode }) {
  const src = e.photoUrl ?? (e.id === "lucas" || e.id === "noah" ? undefined : null);
  return (
    <div className="relative overflow-hidden rounded-2xl bg-[image:var(--gradient-mobile)] text-on-vivid shadow-[var(--glass-shadow)]">
      {src !== null ? <Avatar e={e} className="absolute inset-0 h-full w-full !rounded-none" /> : null}
      <div className="absolute inset-0 bg-gradient-to-t from-shade/85 via-shade/10 to-transparent" />
      <div className="relative flex min-h-40 flex-col justify-between p-3">
        <div className="flex gap-2"><span className="rounded-full bg-shade/35 backdrop-blur"><Status s={e.statut} /></span>{e.pai && <span className="inline-flex items-center gap-1.5 rounded-full bg-mobile-pink px-2 py-0.5 text-[11px] font-bold text-on-vivid"><AlertCircle className="h-3 w-3" />PAI ACTIF</span>}</div>
        <div><p className="font-display text-lg font-bold leading-tight">{e.prenom} {e.nom}</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5 text-[11px] font-semibold">
            <span className="flex items-center gap-1 rounded-full bg-shade/35 px-2 py-0.5 backdrop-blur"><CalendarDays className="h-3 w-3" />{e.age ?? "—"}</span>
            <span className="flex items-center gap-1 rounded-full bg-shade/35 px-2 py-0.5 backdrop-blur"><Droplet className="h-3 w-3" />{e.groupeSanguin ?? "—"}</span>
            {extra}
          </div></div>
      </div>
    </div>
  );
}

function Apercu({ e }: { e: any }) {
  return (
    <>
      <ChildHero e={e} extra={<span className="flex items-center gap-1 rounded-full bg-shade/35 px-2 py-0.5 backdrop-blur"><Weight className="h-3 w-3" />{e.poids ?? "—"} kg</span>} />
      <div className="grid grid-cols-3 gap-2">
        <Stat icon={Weight} v={`${e.poids ?? "—"} kg`} l="Poids" tone="blue" /><Stat icon={Ruler} v={`${e.taille ?? "—"} cm`} l="Taille" tone="green" /><Stat icon={AlertCircle} v={String((e.allergies ?? []).length)} l="Allergies" tone="pink" />
      </div>
      {e.pai && e.paiDetail && <PaiCard e={e} />}
      <Glass className="!p-3"><p className="text-[13px] font-bold">Allergies</p>
        {(e.allergies ?? []).length === 0 ? <p className="mt-2 text-muted-foreground">Aucune allergie connue.</p> : e.allergies.map((a: any, i: number) => (
          <p key={i} className="mt-2 flex items-center gap-2"><AlertCircle className="h-4 w-4 text-mobile-pink" />{a.nom ?? a}{a.reaction ? ` — ${a.reaction}` : ""}</p>))}</Glass>
      <Glass className="!p-3"><p className="text-[13px] font-bold">Vaccinations</p>
        {(e.vaccins ?? []).map((v: any, i: number) => (
          <div key={i} className="mt-2 flex items-center gap-2"><CheckCircle2 className={`h-4 w-4 ${v.statut === "rappel" ? "text-warning" : "text-brand-green"}`} /><span className="flex-1">{v.nom ?? v}</span>{v.statut === "rappel" && <Pill tone="warn">Rappel</Pill>}</div>))}</Glass>
    </>
  );
}
export function Stat({ icon: I, v, l, tone }: { icon: typeof User; v: string; l: string; tone: "blue" | "green" | "pink" }) {
  return <Glass className="!p-2 text-center"><I className={`mx-auto h-4 w-4 ${TONES[tone].split(" ")[1]}`} /><p className="mt-1 font-display text-sm font-bold">{v}</p><p className="text-[11px] text-muted-foreground">{l}</p></Glass>;
}
function PaiCard({ e }: { e: any }) {
  return (
    <div className="rounded-xl border border-mobile-pink bg-mobile-pink/10 p-2.5 text-[13px]">
      <div className="flex flex-wrap items-center gap-2"><Pill tone="pink"><AlertCircle className="h-4 w-4" />PAI ACTIF</Pill><b className="text-mobile-pink">{e.paiDetail.type}</b></div>
      <p className="mt-2 font-bold">Conduite à tenir immédiate</p><p className="mt-1">{e.paiDetail.conduite}</p>
      <p className="mt-2 text-[11px] italic text-muted-foreground">Médecin référent : {e.paiDetail.medecin}</p>
    </div>
  );
}

const LOG_ICON: Record<string, typeof User> = { repas: Utensils, sieste: Moon, change: Baby };
function Quotidien({ e, edit, add }: { e: any; edit: boolean; add: (l: any) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ type: "repas", detail: "", obs: "" });
  return (
    <>
      <div className="flex items-center justify-between"><p className="font-display text-sm font-bold">Aujourd'hui</p>{edit && <SmallBtn onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Ajouter</SmallBtn>}</div>
      {(e.logs ?? []).length === 0 ? <Empty>Aucune transmission aujourd'hui.</Empty> : e.logs.map((l: any) => {
        const I = LOG_ICON[l.type] ?? ClipboardList;
        return <Glass key={l.id} className="flex items-center gap-2 !p-2.5 text-[13px]"><IconTile icon={I} tone={l.type === "sieste" ? "blue" : l.type === "repas" ? "green" : "warn"} /><div className="min-w-0 flex-1"><p className="font-semibold">{l.detail}</p><p className="text-[13px] text-muted-foreground">{l.obs}</p></div><b className="text-mobile-blue">{l.heure}</b></Glass>;
      })}
      {open && <Sheet title="Nouvelle transmission" sub={e.prenom} onClose={() => setOpen(false)}>
        <div className="flex flex-wrap gap-2">{["repas", "sieste", "change"].map((t) => <Chip key={t} on={f.type === t} onClick={() => setF({ ...f, type: t })}>{t[0]!.toUpperCase() + t.slice(1)}</Chip>)}</div>
        <input className={`${inputCls} mt-4`} placeholder="Détail (quantité, durée…)" value={f.detail} onChange={(x) => setF({ ...f, detail: x.target.value })} />
        <input className={`${inputCls} mt-3`} placeholder="Observation" value={f.obs} onChange={(x) => setF({ ...f, obs: x.target.value })} />
        <div className="mt-5"><PrimaryBtn onClick={async () => {
          if (!f.detail.trim()) { toast.error("Indiquez le détail."); return; }
          const res = await send("POST", "/transmissions", { enfantId: e.id, type: f.type, contenu: `${f.detail} — ${f.obs}` }).catch((x) => { toast.error(x.message); return null; });
          if (!res) return;
          add({ id: crypto.randomUUID(), ...f, heure: new Date().toTimeString().slice(0, 5) }); toast.success(`Transmission ajoutée${res.demo ? " (démo)" : ""}`); setOpen(false);
        }}>Enregistrer</PrimaryBtn></div>
      </Sheet>}
    </>
  );
}

function Fievre({ e, edit, add }: { e: any; edit: boolean; add: (t: any) => void }) {
  const pts: { t: number; at: string }[] = e.temperatures ?? [];
  const last = pts[pts.length - 1];
  const [open, setOpen] = useState(false);
  const [t, setT] = useState("37.5");
  return (
    <>
      <Glass className="!p-3 text-center"><p className="text-muted-foreground">Dernière mesure</p>
        <p className={`font-display text-4xl font-bold ${last ? TONES[feverColor(last.t)].split(" ")[1] : ""}`}>{last ? `${last.t.toFixed(1)}°` : "—"}</p>
        {last && <p className="text-[13px] text-muted-foreground">{ago(last.at)}</p>}</Glass>
      <Glass className="!p-3"><p className="mb-2 font-bold">Courbe de température</p><FeverChart points={pts} /></Glass>
      {edit && <PrimaryBtn onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Ajouter une mesure</PrimaryBtn>}
      <Glass className="!p-3"><p className="font-bold">Historique</p>
        {[...pts].reverse().map((p, i) => <div key={i} className="mt-3 flex items-center justify-between"><span className="text-muted-foreground">{new Date(p.at).toLocaleString("fr-FR", { weekday: "short", hour: "2-digit", minute: "2-digit" })}</span><Pill tone={feverColor(p.t)}>{p.t.toFixed(1)} °C</Pill></div>)}</Glass>
      {open && <Sheet title="Nouvelle mesure" sub={e.prenom} onClose={() => setOpen(false)}>
        <input type="number" step="0.1" min="34" max="43" className={`${inputCls} text-center font-display text-xl font-bold`} value={t} onChange={(x) => setT(x.target.value)} />
        <div className="mt-5"><PrimaryBtn onClick={async () => {
          const v = Number(t); if (!(v >= 34 && v <= 43)) { toast.error("Température invalide."); return; }
          const res = await send("POST", `/enfants/${e.id}/temperatures`, { temperature: v }).catch((x) => { toast.error(x.message); return null; });
          if (!res) return; add({ t: v, at: new Date().toISOString() }); toast.success(`Mesure enregistrée${res.demo ? " (démo)" : ""}`); setOpen(false);
        }}><HeartPulse className="h-4 w-4" />Enregistrer</PrimaryBtn></div>
      </Sheet>}
    </>
  );
}

function Notes({ e, role, add }: { e: any; role: string; add: (n: any) => void }) {
  const internal = canSeeInternal(role);
  const list = (e.notes ?? []).filter((n: any) => internal || !n.interne);
  const [txt, setTxt] = useState("");
  const [priv, setPriv] = useState(false);
  return (
    <>
      <Glass className="space-y-2 !p-3">
        <textarea className={`${inputCls} min-h-16 resize-none text-[13px]`} placeholder="Écrire une note…" value={txt} onChange={(x) => setTxt(x.target.value)} />
        {internal && <div className="flex gap-2"><Chip on={!priv} onClick={() => setPriv(false)}><Globe className="h-4 w-4" />Partagée</Chip><Chip on={priv} onClick={() => setPriv(true)}><Lock className="h-4 w-4" />Interne</Chip></div>}
        <PrimaryBtn onClick={async () => {
          if (!txt.trim()) return;
          const res = await send("POST", `/enfants/${e.id}/notes`, { texte: txt, interne: priv }).catch((x) => { toast.error(x.message); return null; });
          if (!res) return; add({ id: crypto.randomUUID(), texte: txt, interne: priv, auteur: "Moi", at: new Date().toISOString() }); setTxt(""); toast.success(`Note ajoutée${res.demo ? " (démo)" : ""}`);
        }}>Publier</PrimaryBtn>
      </Glass>
      {list.length === 0 ? <Empty>Aucune note.</Empty> : list.map((n: any) => (
        <Glass key={n.id}><div className="flex items-center gap-2 text-[13px]">{n.interne ? <Pill tone="warn"><Lock className="h-3.5 w-3.5" />Interne</Pill> : <Pill tone="blue"><Globe className="h-3.5 w-3.5" />Partagée</Pill>}<span className="text-muted-foreground">{n.auteur} · {ago(n.at)}</span></div><p className="mt-2">{n.texte}</p></Glass>
      ))}
    </>
  );
}

function Pai({ e, sign, onSign }: { e: any; sign: boolean; onSign: (id: string) => void }) {
  return (
    <>
      {e.pai && e.paiDetail ? <PaiCard e={e} /> : <Empty>Aucun PAI actif.</Empty>}
      <Glass className="!p-3"><p className="text-[13px] font-bold">Autorisations médicales</p>
        {(e.autorisations ?? []).length === 0 ? <p className="mt-2 text-muted-foreground">Aucune autorisation.</p> : e.autorisations.map((a: any) => (
          <div key={a.id} className="mt-2.5 flex items-center gap-2">
            <div className="min-w-0 flex-1"><p className="font-semibold">{a.medicament}</p><p className="text-[13px] text-muted-foreground">{a.condition}</p></div>
            {a.signe ? <Pill tone="green"><CheckCircle2 className="h-4 w-4" />Autorisé</Pill> : sign ? (
              <button onClick={async () => { const res = await send("POST", `/enfants/${e.id}/autorisations/${a.id}/signer`, {}).catch((x) => { toast.error(x.message); return null; }); if (res) { onSign(a.id); toast.success(`Autorisation signée${res.demo ? " (démo)" : ""}`); } }} className="rounded-full bg-mobile-pink px-2.5 py-1 text-[11px] font-bold text-on-vivid">Signer</button>
            ) : <Pill tone="warn">Non signé</Pill>}
          </div>))}</Glass>
    </>
  );
}

function Sorties({ e, edit, add }: { e: any; edit: boolean; add: (p: any) => void }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ nom: "", relation: "", piece: "" });
  return (
    <>
      <div className="flex items-center justify-between"><p className="font-display text-sm font-bold">Personnes autorisées</p>{edit && <SmallBtn onClick={() => setOpen(true)}><Plus className="h-4 w-4" />Ajouter</SmallBtn>}</div>
      {(e.sorties ?? []).length === 0 ? <Empty>Aucune personne autorisée.</Empty> : e.sorties.map((p: any) => (
        <Glass key={p.id} className="flex items-center gap-2 !p-2.5 text-[13px]">
          <span className="grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-[image:var(--gradient-mobile)] text-[13px] font-bold text-on-vivid">{p.nom[0]}</span>
          <div className="min-w-0 flex-1"><p className="flex items-center gap-1.5 font-semibold">{p.nom}{p.verifie && <BadgeCheck className="h-4 w-4 text-mobile-blue" />}</p><p className="text-[13px] text-muted-foreground">{p.relation} · {p.piece}</p></div>
        </Glass>))}
      {open && <Sheet title="Personne autorisée" sub={e.prenom} onClose={() => setOpen(false)}>
        <div className="space-y-2">
          <input className={inputCls} placeholder="Nom complet" value={f.nom} onChange={(x) => setF({ ...f, nom: x.target.value })} />
          <input className={inputCls} placeholder="Relation (grand-parent, nounou…)" value={f.relation} onChange={(x) => setF({ ...f, relation: x.target.value })} />
          <input className={inputCls} placeholder="N° de pièce d'identité" value={f.piece} onChange={(x) => setF({ ...f, piece: x.target.value })} />
          <PrimaryBtn onClick={async () => {
            if (!f.nom.trim() || !f.piece.trim()) { toast.error("Nom et pièce d'identité requis."); return; }
            const res = await send("POST", `/enfants/${e.id}/sorties`, f).catch((x) => { toast.error(x.message); return null; });
            if (!res) return; add({ id: crypto.randomUUID(), nom: f.nom, relation: f.relation, piece: `••••${f.piece.slice(-4)}`, verifie: false }); toast.success(`Personne ajoutée${res.demo ? " (démo)" : ""}`); setOpen(false);
          }}>Enregistrer</PrimaryBtn>
        </div>
      </Sheet>}
    </>
  );
}
