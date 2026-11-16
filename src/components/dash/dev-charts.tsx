import { useEffect, useMemo } from "react";
import { Area, AreaChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { cn } from "@/lib/utils";
import { chartSeries, normalizeDevMetrics, recordMetricSample } from "@/lib/dev-metrics";
import { Empty, tip } from "./widgets";

/**
 * Graphiques de la console développeur.
 *
 * `ResponsiveContainer` a besoin d'un parent à hauteur explicite : chaque graphique est
 * donc rendu dans une boîte `h-*` (avec largeur/height explicites pour recharts) et
 * affiche un message au lieu d'un cadre vide quand l'API ne fournit aucune série.
 */
function useSeries(raw: unknown) {
  const metrics = useMemo(() => normalizeDevMetrics(raw), [raw]);
  useEffect(() => {
    recordMetricSample(metrics);
  }, [metrics]);
  const points = useMemo(() => chartSeries(metrics.history), [metrics]);
  return points;
}

function ChartFrame({ points, className, message, children }: {
  points: { time: string }[];
  className?: string | undefined;
  message: string;
  children: React.ReactNode;
}) {
  if (points.length === 0) {
    return (
      <div className={cn("grid place-items-center", className)}>
        <Empty text={message} />
      </div>
    );
  }
  return <div className={cn("h-72 w-full", className)}>{children}</div>;
}

const axisTick = { fill: "var(--muted-foreground)", fontSize: 11 };
const grid = { stroke: "var(--border)" };

export function TrafficChart({ raw, className }: { raw: unknown; className?: string }) {
  const points = useSeries(raw);
  return (
    <ChartFrame points={points} className={className} message="Aucune série temporelle renvoyée par l'API pour le moment.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid vertical={false} {...grid} />
          <XAxis dataKey="time" axisLine={false} tickLine={false} tick={axisTick} interval="preserveStartEnd" />
          <Tooltip {...tip} />
          <Legend iconType="circle" wrapperStyle={{ fontSize: 12 }} />
          <Line type="monotone" dataKey="requests" name="Requêtes" stroke="var(--chart-1)" strokeWidth={3} dot={points.length < 3} connectNulls />
          <Line type="monotone" dataKey="latency" name="Latence (ms)" stroke="var(--chart-2)" strokeWidth={2} dot={false} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function RequestsChart({ raw, className }: { raw: unknown; className?: string }) {
  const points = useSeries(raw);
  return (
    <ChartFrame points={points} className={className} message="Aucune donnée de trafic pour l'instant.">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} vertical={false} />
          <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
          <Tooltip {...tip} />
          <Area type="monotone" dataKey="requests" name="Requêtes" stroke="var(--chart-1)" fill="var(--chart-1)" fillOpacity={0.2} connectNulls />
        </AreaChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}

export function LatencyChart({ raw, className }: { raw: unknown; className?: string }) {
  const points = useSeries(raw);
  return (
    <ChartFrame points={points} className={className} message="Aucune mesure de latence pour l'instant.">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={points} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" {...grid} vertical={false} />
          <XAxis dataKey="time" tick={axisTick} tickLine={false} axisLine={false} interval="preserveStartEnd" />
          <YAxis tick={axisTick} tickLine={false} axisLine={false} width={40} allowDecimals={false} />
          <Tooltip {...tip} />
          <Line type="monotone" dataKey="latency" name="Latence (ms)" stroke="var(--chart-2)" strokeWidth={2} dot={points.length < 3} connectNulls />
        </LineChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
}
