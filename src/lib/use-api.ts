import { useQuery } from "@tanstack/react-query";
import { ApiError, apiFetch, ensureEtablissement, getSession, userParams } from "./api";
import { classify, explain, fullUrl, setDiag, type Diagnostic } from "./diagnostic";
import type { RouteSpec } from "./specs";

export interface ApiResult<T> {
  data: T;
  demo: boolean;
  reason?: string;
}

/** vars : paramètres de chemin supplémentaires (ex. { enfantId }) — prioritaires sur ceux de l'utilisateur. */
export function useApiOrDemo<T>(spec: RouteSpec, demo: T, vars?: Record<string, string | undefined>, opts?: { refetchInterval?: number }) {
  const q = useQuery<ApiResult<T>>({
    queryKey: ["api", spec.id, vars ?? null],
    staleTime: 60_000,
    refetchInterval: opts?.refetchInterval ?? false,
    retry: false,
    queryFn: async () => {
      const at = new Date().toLocaleTimeString("fr-FR");
      const fail = (d: Omit<Diagnostic, "at">, reason: string): ApiResult<T> => {
        setDiag(spec.id, { ...d, at });
        return { data: demo, demo: true, reason };
      };
      if (spec.path.includes(":etablissementId") && !vars?.["etablissementId"]) await ensureEtablissement();
      const s = getSession();
      if (!s || s.demo) return fail({ kind: "demo-session", method: spec.method, url: fullUrl(spec.path), message: "Session démo" }, "Mode démo");
      if (/\s/.test(spec.path)) return fail({ kind: "text", method: spec.method, url: spec.path, message: "Non appelable" }, "Exigence décrite en texte (pas une URL appelable) : à vérifier côté serveur");
      const p = { ...userParams(s.user), ...(vars ?? {}) };
      let missing: string | null = null;
      const path = spec.path.replace(/:(\w+)/g, (_, k) => {
        const v = p[k];
        if (!v) missing = k;
        return v ?? `:${k}`;
      });
      if (missing) return fail({ kind: "param", method: spec.method, url: fullUrl(path), message: `Paramètre « ${missing} » absent` }, missing === "etablissementId" ? "Paramètre « etablissementId » absent : ni /auth/me ni /etablissements n\u2019indiquent l\u2019établissement de ce compte" : `Paramètre « ${missing} » absent`);
      try {
        const data = await apiFetch<T>(path);
        setDiag(spec.id, null);
        return { data, demo: false };
      } catch (e) {
        const msg = (e as Error).message;
        const status = e instanceof ApiError ? e.status : undefined;
        const kind = classify(status, msg);
        return fail({ kind, method: spec.method, url: fullUrl(path), status, message: msg, body: (e as any).body }, `${explain[kind].title} — ${spec.method} ${path} : ${msg}`);
      }
    },
  });
  return q.data ?? { data: demo, demo: false, reason: undefined, loading: true };
}
