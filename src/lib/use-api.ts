import { useQuery } from "@tanstack/react-query";
import { ApiError, apiFetch, ensureEtablissement, getSession, userParams } from "./api";
import { classify, explain, fullUrl, setDiag, type Diagnostic } from "./diagnostic";
import type { RouteSpec } from "./specs";

export interface ApiResult<T> {
  data: T;
  demo: boolean;
  reason?: string;
  loading?: boolean;
}

/** Forme vide respectant la structure attendue : tableaux vides, objets sans valeurs. */
function emptyLike<T>(demo: T): T {
  if (Array.isArray(demo)) return [] as unknown as T;
  if (demo && typeof demo === "object") {
    const vide: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(demo as Record<string, unknown>)) vide[k] = emptyLike(v);
    return vide as T;
  }
  return null as unknown as T;
}

/**
 * Charge une route API. Pour toute session réelle (hors mode démo), aucune donnée
 * fictive n'est injectée : en cas d'erreur, l'interface reçoit une valeur vide et
 * affiche son état « aucune donnée », jamais un faux dossier.
 * vars : paramètres de chemin supplémentaires (ex. { enfantId }) — prioritaires sur ceux de l'utilisateur.
 */
export function useApiOrDemo<T>(spec: RouteSpec, demo: T, vars?: Record<string, string | undefined>, opts?: { refetchInterval?: number; fallbackToDemo?: boolean }) {
  const q = useQuery<ApiResult<T>>({
    queryKey: ["api", spec.id, vars ?? null],
    staleTime: 10_000,
    refetchOnMount: "always",
    refetchInterval: opts?.refetchInterval ?? false,
    retry: false,
    queryFn: async () => {
      const at = new Date().toLocaleTimeString("fr-FR");
      const first = getSession();
      const realOnly = !!first && !first.demo;
      const allowDemo = !realOnly && opts?.fallbackToDemo !== false;
      const fail = (d: Omit<Diagnostic, "at">, reason: string): ApiResult<T> => {
        setDiag(spec.id, { ...d, at });
        if (allowDemo) return { data: demo, demo: true, reason };
        return { data: emptyLike(demo), demo: false, reason };
      };
      // La session peut être complétée par /auth/me et /etablissements : il faut la
      // relire AVANT de construire le chemin, sinon le premier chargement part avec
      // un etablissementId manquant et affiche la démo jusqu'au rafraîchissement.
      if (spec.path.includes(":etablissementId") && !vars?.["etablissementId"]) await ensureEtablissement();
      const s = getSession();
      if (!s || s.demo) return fail({ kind: "demo-session", method: spec.method, url: fullUrl(spec.path), message: s ? "Session démo" : "Session absente" }, s ? "Mode démo" : "Session absente");
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
  const session = getSession();
  const allowDemo = !!session?.demo && opts?.fallbackToDemo !== false;
  const initial = allowDemo ? demo : emptyLike(demo);
  return q.data ?? { data: initial, demo: false, reason: undefined, loading: true };
}
