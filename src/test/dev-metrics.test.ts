import { describe, expect, it } from "vitest";
import { chartSeries, fmtMetric, normalizeDevMetrics, recordMetricSample, resetMetricSamples } from "@/lib/dev-metrics";

describe("normalizeDevMetrics", () => {
  it("lit le contrat plat documenté", () => {
    const m = normalizeDevMetrics({
      requestsPerMinute: 342,
      avgResponseTime: 128,
      errorRate: 0.4,
      cpu: 37,
      memory: 61,
      uptime: 99.98,
      history: [{ time: "10:00", requests: 280, latency: 110 }],
    });
    expect(m).toMatchObject({ requestsPerMinute: 342, avgResponseTime: 128, errorRate: 0.4, cpu: 37, memory: 61, uptime: 99.98 });
    expect(m.history).toEqual([{ time: "10:00", requests: 280, latency: 110 }]);
  });

  it("déduit les métriques de l'instantané imbriqué du backend (ancienne forme)", () => {
    const m = normalizeDevMetrics({
      timestamp: "2026-11-16T10:00:00.000Z",
      uptimeSeconds: 3600,
      system: { cpuLoad: [1.5, 1, 1], cpuCount: 4, freeMemoryMB: 2000, totalMemoryMB: 8000 },
      process: { memoryRssMB: 300, heapTotalMB: 200, heapUsedMB: 150 },
      requests: { totalCalls: 1000, calls24h: 1440, errors: 10, avgResponseTimeMs: 164, activeEndpoints: 12 },
    });
    expect(m.avgResponseTime).toBe(164);
    expect(m.requestsPerMinute).toBe(1);
    expect(m.errorRate).toBe(1);
    expect(m.cpu).toBe(37.5);
    expect(m.memory).toBe(75);
    expect(m.uptime).toBe(99);
    expect(m.history).toEqual([]);
  });

  it("ne produit jamais NaN ni undefined", () => {
    expect(normalizeDevMetrics(null)).toEqual({
      requestsPerMinute: null,
      avgResponseTime: null,
      errorRate: null,
      cpu: null,
      memory: null,
      uptime: null,
      history: [],
    });
    expect(normalizeDevMetrics([]).history).toEqual([]);
    expect(normalizeDevMetrics({ avgResponseTime: "inconnu" }).avgResponseTime).toBeNull();
  });

  it("accepte des nombres sérialisés en chaînes", () => {
    const m = normalizeDevMetrics({ requestsPerMinute: "12.5", avgResponseTime: "42", history: [{ time: "11:00", requests: "3", latency: "18" }] });
    expect(m.requestsPerMinute).toBe(12.5);
    expect(m.avgResponseTime).toBe(42);
    expect(m.history[0]).toEqual({ time: "11:00", requests: 3, latency: 18 });
  });
});

describe("fmtMetric", () => {
  it("affiche un tiret au lieu de undefined", () => {
    expect(fmtMetric(null, "ms")).toBe("—");
    expect(fmtMetric(Number.NaN, "%")).toBe("—");
  });
  it("formate en français", () => {
    const squeezable = (s: string) => s.replace(/\s/g, " ");
    expect(fmtMetric(128, "ms")).toBe("128 ms");
    expect(squeezable(fmtMetric(1234, "", 1))).toBe("1 234");
    expect(squeezable(fmtMetric(61.25, "%", 1))).toBe("61,3 %");
  });
});

describe("chartSeries", () => {
  it("privilégie l'historique serveur quand il est exploitable", () => {
    const server = [{ time: "10:00", requests: 1, latency: 10 }, { time: "11:00", requests: 2, latency: 20 }];
    expect(chartSeries(server)).toEqual(server);
  });

  it("retombe sur les échantillons locaux sinon", () => {
    resetMetricSamples();
    const now = Date.UTC(2026, 10, 16, 10, 0, 0);
    recordMetricSample(normalizeDevMetrics({ requestsPerMinute: 10, avgResponseTime: 100 }), now - 20 * 60_000);
    recordMetricSample(normalizeDevMetrics({ requestsPerMinute: 20, avgResponseTime: 200 }), now - 11 * 60_000);
    recordMetricSample(normalizeDevMetrics({ requestsPerMinute: 30, avgResponseTime: 300 }), now);
    const points = chartSeries([], now);
    expect(points.length).toBe(2);
    expect(points[0]?.requests).toBe(15);
    expect(points.at(-1)?.requests).toBe(30);
    resetMetricSamples();
  });
});
