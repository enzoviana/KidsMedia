import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Info } from "lucide-react";
import { cn } from "@/lib/utils";
import type { RouteSpec } from "@/lib/specs";
import { useApiOrDemo } from "@/lib/use-api";
import { DemoBadge } from "./demo";

export function Panel({ title, icon: Icon, spec, demo, reason, actions, children, className, id }: {
  title: string; icon?: LucideIcon | undefined; spec?: RouteSpec; demo?: boolean; reason?: string | undefined; actions?: ReactNode; children: ReactNode; className?: string; id?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-24 rounded-2xl border bg-card p-5 text-card-foreground shadow-sm", className)}>
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          {Icon && <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />}
          <h3 className="truncate font-medium">{title}</h3>
          {demo && spec && <DemoBadge spec={spec} reason={reason} />}
        </div>
        {actions}
      </header>
      {children}
    </section>
  );
}

/** Panel qui charge lui-même ses données (API ou démo). */
export function DataPanel<T>({ spec, demoData, children, vars, ...rest }: {
  spec: RouteSpec; demoData: T; vars?: Record<string, string | undefined>; title: string; icon?: LucideIcon; actions?: ReactNode; className?: string; id?: string; children: (d: T) => ReactNode;
}) {
  const r = useApiOrDemo<T>(spec, demoData, vars);
  return <Panel spec={spec} demo={r.demo} reason={r.reason} {...rest}>{children(r.data)}</Panel>;
}

export function StatCard<T>({ label, icon: Icon, spec, demoData, pick, trend }: {
  label: string; icon: LucideIcon; spec: RouteSpec; demoData: T; pick: (d: T) => ReactNode; trend?: { value: string; up?: boolean };
}) {
  const r = useApiOrDemo<T>(spec, demoData);
  let value: ReactNode = "—";
  try { value = pick(r.data) ?? "—"; } catch { /* format inattendu */ }
  return (
    <div className="rounded-2xl border bg-card p-5 text-card-foreground shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm">
          <span className="grid h-8 w-8 place-items-center rounded-lg bg-accent text-accent-foreground"><Icon className="h-4 w-4" /></span>
          <span>{label}</span>
        </div>
        {r.demo ? <DemoBadge spec={spec} reason={r.reason} /> : <Info className="h-4 w-4 text-muted-foreground" />}
      </div>
      <div className="mt-4 flex items-baseline gap-3">
        <span className="font-display text-3xl font-semibold tracking-tight">{value}</span>
        {trend && (
          <span className={cn("rounded-md px-1.5 py-0.5 text-xs font-medium", trend.up === false ? "bg-destructive/10 text-destructive" : "bg-success/15 text-success")}>
            {trend.value}
          </span>
        )}
      </div>
    </div>
  );
}

export function Pill({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" | "danger" }) {
  const t = { default: "bg-accent text-accent-foreground", success: "bg-success/15 text-success", warning: "bg-warning/20 text-foreground", danger: "bg-destructive/10 text-destructive" }[tone];
  return <span className={cn("inline-flex rounded-md px-2 py-0.5 text-xs font-medium", t)}>{children}</span>;
}

export function Empty({ text = "Aucune donnée" }: { text?: string }) {
  return <p className="py-6 text-center text-sm text-muted-foreground">{text}</p>;
}

export function fullName(o: any) {
  if (!o) return "—";
  if (typeof o === "string") return o;
  return [o.prenom, o.nom].filter(Boolean).join(" ") || o.email || o.name || "—";
}

export function fmtDate(d?: string) {
  if (!d) return "—";
  const x = new Date(d);
  return isNaN(+x) ? d : x.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export const tip = { contentStyle: { background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, color: "var(--popover-foreground)", fontSize: 12 } };
