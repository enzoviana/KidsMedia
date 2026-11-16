/**
 * Métriques de la console développeur.
 *
 * `/developer/metrics` a longtemps renvoyé un instantané imbriqué
 * (`requests.avgResponseTimeMs`, `process.heapUsedMB`, `system.cpuLoad`…) alors que la
 * console lisait un contrat plat (`avgResponseTime`, `memory`, `history`…). Résultat :
 * « undefined ms », « undefined % » et graphiques vides.
 *
 * Ce module normalise les deux formats (plat documenté dans `specs.ts` et instantané
 * historique) pour que les pages ne dépendent plus de la forme exacte de la réponse.
 */

export interface DevMetricPoint {
  time: string;
  requests: number;
  /** `null` quand aucune requête n'a été mesurée sur la période (trou dans la courbe). */
  latency: number | null;
}

export interface DevMetrics {
  requestsPerMinute: number | null;
  avgResponseTime: number | null;
  errorRate: number | null;
  cpu: number | null;
  memory: number | null;
  uptime: number | null;
  history: DevMetricPoint[];
}

type Rec = Record<string, unknown>;

const asRecord = (v: unknown): Rec => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {});

const asNumber = (v: unknown): number | null => {
  if (typeof v === "number") return Number.isFinite(v) ? v : null;
  if (typeof v === "string" && v.trim() !== "") {
    const n = Number(v);
    return Number.isFinite(n) ? n : null;
  }
  return null;
};

const round = (v: number, digits = 0) => {
  const f = 10 ** digits;
  return Math.round(v * f) / f;
};

const clampPct = (v: number | null) => (v == null ? null : Math.min(100, Math.max(0, round(v, 1))));

/** Convertit une réponse `/developer/metrics` (nouvelle ou ancienne forme) en valeurs affichables. */
export function normalizeDevMetrics(raw: unknown): DevMetrics {
  const r = asRecord(raw);
  const requests = asRecord(r["requests"]);
  const system = asRecord(r["system"]);
  const proc = asRecord(r["process"]);

  const totalCalls = asNumber(requests["totalCalls"]);
  const calls24h = asNumber(requests["calls24h"]);
  const errors = asNumber(requests["errors"]);

  const avgResponseTime = asNumber(r["avgResponseTime"]) ?? asNumber(requests["avgResponseTimeMs"]);

  const requestsPerMinute =
    asNumber(r["requestsPerMinute"]) ?? (calls24h == null ? null : round(calls24h / (24 * 60), 1));

  const errorRate =
    asNumber(r["errorRate"]) ??
    (totalCalls != null && totalCalls > 0 && errors != null ? round((errors / totalCalls) * 100, 2) : null);

  const cpuLoad = Array.isArray(system["cpuLoad"]) ? asNumber(system["cpuLoad"][0]) : null;
  const cores = asNumber(system["cpuCount"]);
  const cpu =
    asNumber(r["cpu"]) ??
    asNumber(system["cpuUsage"]) ??
    clampPct(cpuLoad != null && cores ? (cpuLoad / cores) * 100 : null);

  const totalMem = asNumber(system["totalMemoryMB"]);
  const freeMem = asNumber(system["freeMemoryMB"]);
  const heapTotal = asNumber(proc["heapTotalMB"]);
  const heapUsed = asNumber(proc["heapUsedMB"]);
  const memory =
    asNumber(r["memory"]) ??
    clampPct(totalMem && totalMem > 0 && freeMem != null ? ((totalMem - freeMem) / totalMem) * 100 : null) ??
    clampPct(heapTotal && heapTotal > 0 && heapUsed != null ? (heapUsed / heapTotal) * 100 : null);

  const uptime = asNumber(r["uptime"]) ?? (errorRate == null ? null : round(100 - errorRate, 2));

  const history = Array.isArray(r["history"])
    ? r["history"].map((p, i): DevMetricPoint => {
        const o = asRecord(p);
        return {
          time: typeof o["time"] === "string" && o["time"] ? o["time"] : `#${i + 1}`,
          requests: asNumber(o["requests"]) ?? 0,
          latency: asNumber(o["latency"]),
        };
      })
    : [];

  return { requestsPerMinute, avgResponseTime, errorRate, cpu, memory, uptime, history };
}

/** Échantillons locaux : filet de sécurité quand le serveur ne renvoie pas encore d'historique. */
const localSamples: { at: number; requests: number; latency: number | null }[] = [];
const SAMPLE_GAP_MS = 60_000;
const SAMPLE_MAX_AGE_MS = 8 * 3600 * 1000;
const BUCKET_MS = 10 * 60 * 1000;

/** Mémorise une mesure (au plus une par minute) pour dessiner une courbe même sans historique serveur. */
export function recordMetricSample(m: DevMetrics, now = Date.now()) {
  if (typeof window === "undefined" || m.requestsPerMinute == null) return;
  const last = localSamples[localSamples.length - 1];
  if (last && now - last.at < SAMPLE_GAP_MS) {
    last.requests = m.requestsPerMinute;
    last.latency = m.avgResponseTime;
    return;
  }
  localSamples.push({ at: now, requests: m.requestsPerMinute, latency: m.avgResponseTime });
  while (localSamples.length > 1 && now - (localSamples[0]?.at ?? now) > SAMPLE_MAX_AGE_MS) localSamples.shift();
}

const hhmm = (ts: number) =>
  new Date(ts).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });

function localSeries(now = Date.now()): DevMetricPoint[] {
  const buckets = new Map<number, { requests: number[]; latency: number[] }>();
  for (const s of localSamples) {
    if (now - s.at > SAMPLE_MAX_AGE_MS) continue;
    const k = Math.floor(s.at / BUCKET_MS) * BUCKET_MS;
    const b = buckets.get(k) ?? { requests: [], latency: [] };
    b.requests.push(s.requests);
    if (s.latency != null) b.latency.push(s.latency);
    buckets.set(k, b);
  }
  return [...buckets.entries()]
    .sort((a, b) => a[0] - b[0])
    .map(([k, b]) => ({
      time: hhmm(k),
      requests: round(b.requests.reduce((s, v) => s + v, 0) / b.requests.length, 1),
      latency: b.latency.length ? Math.round(b.latency.reduce((s, v) => s + v, 0) / b.latency.length) : null,
    }));
}

/** Historique serveur s'il est exploitable, sinon série construite à partir des échantillons locaux. */
export function chartSeries(server: DevMetricPoint[], now = Date.now()): DevMetricPoint[] {
  if (server.length >= 2) return server;
  const local = localSeries(now);
  return local.length >= 2 ? local : server.length ? server : local;
}

const nf = (digits: number) => new Intl.NumberFormat("fr-FR", { maximumFractionDigits: digits });

/** Formate une métrique ; `null`/`NaN` devient « — » au lieu de « undefined ». */
export function fmtMetric(v: number | null, unit = "", digits = 0): string {
  if (v == null || !Number.isFinite(v)) return "—";
  const n = nf(digits).format(v);
  return unit ? `${n} ${unit}` : n;
}

/** Réinitialise les échantillons locaux (tests). */
export function resetMetricSamples() {
  localSamples.length = 0;
}
