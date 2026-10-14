import { apiFetch, getSession, userParams } from "./api";

/** Remplace :param par vars puis paramètres de l'utilisateur. */
export function fillPath(path: string, vars: Record<string, string | undefined> = {}) {
  const s = getSession();
  const p = { ...(s ? userParams(s.user) : {}), ...vars };
  return path.replace(/:(\w+)/g, (_, k) => p[k] ?? `:${k}`);
}

/** Envoie une écriture à l'API ; en mode démo, simule le succès. */
export async function send<T = unknown>(method: "POST" | "PUT" | "PATCH" | "DELETE", path: string, body?: unknown, vars?: Record<string, string | undefined>): Promise<{ demo: boolean; data: T }> {
  const s = getSession();
  if (!s || s.demo) {
    await new Promise((r) => setTimeout(r, 250));
    return { demo: true, data: body as T };
  }
  const data = await apiFetch<T>(fillPath(path, vars), {
    method,
    body: body === undefined ? null : body instanceof FormData ? body : JSON.stringify(body),
  });
  return { demo: false, data };
}
