import type { ReactNode } from "react";
import { ChevronLeft, Eye, Repeat, Star, X } from "lucide-react";
import photo from "@/assets/enfant-demo.jpg";

export const demoPhoto = photo;

export function Glass({ children, className = "", onClick }: { children: ReactNode; className?: string; onClick?: () => void }) {
  const Tag = onClick ? "button" : "div";
  return <Tag onClick={onClick} className={`block w-full ${onClick ? "text-left" : ""} rounded-[1.1rem] border border-[var(--glass-border)] bg-[var(--glass)] p-3.5 shadow-[var(--glass-shadow)] backdrop-blur-xl ${className}`}>{children}</Tag>;
}
export function RoundBtn({ children, label, onClick }: { children: ReactNode; label: string; onClick: () => void }) {
  return <button aria-label={label} title={label} onClick={onClick} className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-[var(--glass-border)] bg-[var(--glass)] shadow-sm backdrop-blur">{children}</button>;
}
export function IconTile({ icon: I, tone = "blue", size = "md" }: { icon: typeof Star; tone?: Tone; size?: "md" | "lg" }) {
  return <span className={`grid shrink-0 place-items-center rounded-2xl ${TONES[tone]} ${size === "lg" ? "h-12 w-12" : "h-9 w-9"}`}><I className={size === "lg" ? "h-7 w-7" : "h-5 w-5"} /></span>;
}
export type Tone = "blue" | "pink" | "green" | "warn" | "muted";
export const TONES: Record<Tone, string> = {
  blue: "bg-mobile-blue/15 text-mobile-blue", pink: "bg-mobile-pink/15 text-mobile-pink", green: "bg-brand-green/15 text-brand-green", warn: "bg-warning/20 text-warning", muted: "bg-muted text-muted-foreground",
};
export function Pill({ children, tone = "muted", dot }: { children: ReactNode; tone?: Tone; dot?: boolean }) {
  return <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold ${TONES[tone]}`}>{dot && <span className="h-2 w-2 rounded-full bg-current" />}{children}</span>;
}
export function Status({ s }: { s?: string }) {
  if (s === "symptomes") return <Pill tone="pink" dot>Symptôme signalé</Pill>;
  if (s === "attention") return <Pill tone="blue" dot>Surveillance</Pill>;
  return <Pill tone="green" dot>En forme</Pill>;
}
export function Chip({ on, onClick, children }: { on: boolean; onClick: () => void; children: ReactNode }) {
  return <button type="button" onClick={onClick} className={`inline-flex shrink-0 items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold transition ${on ? "border-mobile-blue bg-mobile-blue text-on-vivid" : "border-[var(--glass-border)] bg-muted/60"}`}>{children}</button>;
}
export function Avatar({ e, className = "h-10 w-10" }: { e: any; className?: string }) {
  const src = e?.photoUrl ?? (e?.id === "lucas" || e?.id === "noah" ? photo : null);
  return src ? <img src={src} alt="" className={`${className} rounded-2xl object-cover`} /> : <span className={`${className} grid place-items-center rounded-2xl bg-[image:var(--gradient-mobile)] text-base font-bold text-on-vivid`}>{(e?.prenom ?? "?")[0]}</span>;
}
export function Stars({ n }: { n: number }) {
  return <span className="inline-flex gap-0.5">{[1, 2, 3, 4, 5].map((i) => <Star key={i} className={`h-4 w-4 ${i <= Math.round(n) ? "fill-warning text-warning" : "text-muted-foreground/40"}`} />)}</span>;
}
export function Empty({ children }: { children: ReactNode }) {
  return <Glass><p className="text-center text-muted-foreground">{children}</p></Glass>;
}
export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return <div className="flex items-center justify-between gap-2"><h2 className="font-display text-base font-bold">{children}</h2>{action}</div>;
}
export function PrimaryBtn({ children, onClick, tone = "blue", disabled, type = "button" }: { children: ReactNode; onClick?: () => void; tone?: "blue" | "pink" | "gradient"; disabled?: boolean; type?: "button" | "submit" }) {
  const c = tone === "pink" ? "bg-mobile-pink shadow-[var(--mobile-glow)]" : tone === "gradient" ? "bg-[image:var(--gradient-mobile)]" : "bg-mobile-blue";
  return <button type={type} disabled={disabled} onClick={onClick} className={`flex h-9 w-full items-center justify-center gap-2 rounded-full text-sm font-bold text-on-vivid disabled:opacity-50 ${c}`}>{children}</button>;
}
export function SmallBtn({ children, onClick }: { children: ReactNode; onClick: () => void }) {
  return <button onClick={onClick} className="flex items-center gap-1.5 rounded-full bg-mobile-blue px-3 py-1.5 text-[13px] font-semibold text-on-vivid">{children}</button>;
}
export const inputCls = "w-full rounded-2xl border border-[var(--glass-border)] bg-muted/60 px-3 py-2 outline-none placeholder:text-muted-foreground";

export function Sheet({ title, sub, onClose, children }: { title: string; sub?: string; onClose: () => void; children: ReactNode }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end bg-foreground/40 backdrop-blur-[2px]" onClick={onClose}>
      <div className="mx-auto max-h-[92dvh] w-full max-w-md overflow-y-auto rounded-t-[2.5rem] bg-card p-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-card-foreground animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-5 h-1.5 w-9 rounded-full bg-muted" />
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {sub && <p className="text-muted-foreground">{sub}</p>}
        <div className="mt-4">{children}</div>
      </div>
    </div>
  );
}

export function Header({ title, sub, onBack, right }: { title: string; sub?: string; onBack?: () => void; right?: ReactNode }) {
  return (
    <header className="flex items-center gap-2 px-4 pt-4">
      {onBack && <RoundBtn label="Retour" onClick={onBack}><ChevronLeft className="h-5 w-5" /></RoundBtn>}
      <div className="min-w-0 flex-1"><h1 className="truncate font-display text-lg font-bold leading-tight tracking-tight">{title}</h1>{sub && <p className="truncate text-xs text-muted-foreground">{sub}</p>}</div>
      {right}
    </header>
  );
}

export function DemoBanner({ role, onSwitch, onQuit }: { role: string; onSwitch: () => void; onQuit: () => void }) {
  return (
    <div className="sticky top-0 z-40 flex items-center gap-2 bg-[image:var(--gradient-demo)] px-3 pb-2.5 pt-[max(0.625rem,env(safe-area-inset-top))] text-on-vivid">
      <Eye className="h-5 w-5" /><b className="flex-1 truncate">Mode Démo · {role}</b>
      <button onClick={onSwitch} className="flex items-center gap-1.5 rounded-xl bg-on-vivid/20 px-3 py-1.5 text-[13px] font-semibold"><Repeat className="h-4 w-4" />Changer</button>
      <button onClick={onQuit} className="flex items-center gap-1.5 rounded-xl bg-foreground/15 px-3 py-1.5 text-[13px] font-semibold"><X className="h-4 w-4" />Quitter</button>
    </div>
  );
}

/** Barre d'onglets flottante : icônes uniquement (libellé accessible seulement). */
export function TabBar<K extends string>({ tabs, active, onGo }: { tabs: { key: K; label: string; icon: typeof Star }[]; active: string; onGo: (k: K) => void }) {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto max-w-md px-4 pb-[max(1rem,env(safe-area-inset-bottom))]">
      <div className="flex justify-around rounded-full border border-[var(--glass-border)] bg-[var(--glass-strong)] p-2 shadow-[var(--glass-shadow)] backdrop-blur-2xl">
        {tabs.map((x) => {
          const on = active === x.key;
          return (
            <button key={x.key} aria-label={x.label} title={x.label} onClick={() => onGo(x.key)} className="relative grid h-10 w-10 place-items-center rounded-full">
              <span className={`grid h-9 w-9 place-items-center rounded-full transition ${on ? "bg-mobile-blue text-on-vivid shadow-[0_8px_20px_-6px] shadow-mobile-blue/70" : "text-muted-foreground"}`}><x.icon className="h-6 w-6" /></span>
            </button>
          );
        })}
      </div>
    </nav>
  );
}

/** Courbe de température en SVG (pas de dépendance graphique côté serveur). */
export function FeverChart({ points }: { points: { t: number; at: string }[] }) {
  if (points.length < 2) return <p className="text-muted-foreground">Pas assez de mesures pour tracer la courbe.</p>;
  const W = 320, H = 140, min = 35.5, max = 40;
  const x = (i: number) => 12 + (i * (W - 24)) / (points.length - 1);
  const y = (t: number) => H - 12 - ((Math.min(max, Math.max(min, t)) - min) / (max - min)) * (H - 24);
  const d = points.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p.t)}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
      <line x1="0" x2={W} y1={y(38)} y2={y(38)} className="stroke-mobile-pink/40" strokeDasharray="4 4" />
      <text x={W - 4} y={y(38) - 4} textAnchor="end" className="fill-mobile-pink text-[10px]">38 °C</text>
      <path d={d} fill="none" className="stroke-mobile-blue" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
      {points.map((p, i) => <circle key={i} cx={x(i)} cy={y(p.t)} r="5" className={p.t >= 38 ? "fill-mobile-pink" : "fill-brand-green"} />)}
    </svg>
  );
}
