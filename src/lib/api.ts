export const API_BASE: string = (import.meta.env["VITE_API_URL"] as string | undefined) ?? "https://backendkids.onrender.com/api";

export type RoleKey = "creche" | "rsai" | "medecin" | "admin" | "dev" | "parent";

export interface ApiUser {
  id?: string;
  _id?: string;
  email?: string;
  prenom?: string;
  nom?: string;
  role?: string;
  etablissementId?: string;
  avatarUrl?: string | undefined;
  etablissement?: string | { _id?: string; id?: string; nom?: string };
  [k: string]: unknown;
}

export interface Session {
  user: ApiUser;
  accessToken?: string | undefined;
  refreshToken?: string | undefined;
  demo?: boolean;
}

const KEY = "kidsmed_session";

export function getSession(): Session | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return null;
  }
}

export function setSession(s: Session | null) {
  if (s) localStorage.setItem(KEY, JSON.stringify(s));
  else localStorage.removeItem(KEY);
}

export function roleToKey(role?: string): RoleKey | null {
  switch ((role ?? "").toLowerCase()) {
    case "creche":
      return "creche";
    case "rsai":
      return "rsai";
    case "medecin":
      return "medecin";
    case "parent":
      return "parent";
    case "admin":
    case "superadmin":
      return "admin";
    case "developpeur":
    case "developer":
    case "dev":
      return "dev";
    default:
      return null;
  }
}

export function userParams(u: ApiUser): Record<string, string | undefined> {
  const id = u._id ?? u.id;
  const pickId = (v: any): string | undefined => (typeof v === "string" ? v : v?._id ?? v?.id);
  const a = u as any;
  const etab =
    u.etablissementId ??
    pickId(u.etablissement) ??
    pickId(a.creche) ?? a.crecheId ??
    (Array.isArray(a.etablissements) ? pickId(a.etablissements[0]) : undefined) ??
    (Array.isArray(a.etablissementIds) ? a.etablissementIds[0] : undefined);
  return { userId: id, medecinId: id, etablissementId: etab };
}

export class ApiError extends Error {
  constructor(public status: number, message: string, public motif?: string) {
    super(message);
  }
}

export const SECURITY_EVENT = "kidsmed:securite";
export const SECURITY_MOTIFS = ["hors_zone", "hors_plage", "ip_refusee", "appareil_inconnu"];
export interface SecurityBlock { motif: string; message: string; distanceM?: number | null }

/** Construit l'erreur API et signale un refus de sécurité (hors zone, hors horaires, IP) à l'interface. */
export function toApiError(status: number, j: any): ApiError {
  const motif = j?.motif ?? j?.code;
  const err = new ApiError(status, j?.message ?? j?.error ?? `Erreur ${status}`, motif);
  if (status === 403 && (j?.securite || SECURITY_MOTIFS.includes(motif)) && typeof window !== "undefined")
    window.dispatchEvent(new CustomEvent<SecurityBlock>(SECURITY_EVENT, { detail: { motif: motif ?? "securite", message: err.message, distanceM: j?.distanceM } }));
  return err;
}

async function refresh(): Promise<boolean> {
  const s = getSession();
  if (!s?.refreshToken) return false;
  try {
    const r = await fetch(`${API_BASE}/auth/refresh`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ refreshToken: s.refreshToken }),
    });
    if (!r.ok) return false;
    const a = extractAuth(await r.json());
    setSession({ ...s, accessToken: a.accessToken ?? s.accessToken, refreshToken: a.refreshToken ?? s.refreshToken });
    return true;
  } catch {
    return false;
  }
}

export async function apiFetch<T = unknown>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const s = getSession();
  const headers = new Headers(init.headers);
  if (init.body && !(init.body instanceof FormData)) headers.set("Content-Type", "application/json");
  if (s?.accessToken) headers.set("Authorization", `Bearer ${s.accessToken}`);
  const r = await fetch(`${API_BASE}${path}`, { ...init, headers });
  if (r.status === 401 && retry && (await refresh())) return apiFetch<T>(path, init, false);
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.success === false) {
    const err = toApiError(r.status, j);
    (err as any).body = j;
    throw err;
  }
  return (j?.data ?? j) as T;
}

export async function login(email: string, password: string): Promise<Session> {
  const d = await apiFetch<{ user: ApiUser; accessToken: string; refreshToken: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  const s: Session = { user: d.user, accessToken: d.accessToken, refreshToken: d.refreshToken };
  setSession(s);
  return s;
}

export async function logout() {
  const s = getSession();
  if (s?.refreshToken && !s.demo) {
    apiFetch("/auth/logout", { method: "POST", body: JSON.stringify({ refreshToken: s.refreshToken }) }).catch(() => {});
  }
  setSession(null);
}

export function toList(d: unknown): any[] {
  if (Array.isArray(d)) return d;
  if (d && typeof d === "object") {
    for (const v of Object.values(d)) if (Array.isArray(v)) return v;
  }
  return [];
}

/** Connexion en 2 étapes : identifiants puis code SMS. */
export interface MfaMethods { totp: boolean; passkey: boolean; sms: boolean; email: boolean }
export type MfaChannel = "sms" | "email";
export interface PendingLogin {
  user: ApiUser; accessToken?: string | undefined; refreshToken?: string | undefined; phone?: string | undefined; mfaDemo?: boolean;
  /** Méthodes de 2e étape disponibles (renvoyées par /auth/login). */
  methodes?: MfaMethods | undefined;
  /** Canal du dernier code envoyé. */
  canal?: MfaChannel | undefined;
  /** Appareil de confiance reconnu : la session est déjà ouverte. */
  session?: Session | undefined;
}

/** Jeton « appareil de confiance » (30 jours), propre à chaque compte. Le serveur seul décide s'il est valide. */
const deviceKey = (email?: string) => `kidsmed_device_${(email ?? "").toLowerCase()}`;
export const getDeviceToken = (email?: string) => (typeof localStorage === "undefined" ? null : localStorage.getItem(deviceKey(email)));
export function setDeviceToken(email: string | undefined, token: string | null | undefined) {
  if (typeof localStorage === "undefined" || !email) return;
  if (token) localStorage.setItem(deviceKey(email), token); else localStorage.removeItem(deviceKey(email));
}

async function rawPost<T>(path: string, body: unknown, token?: string): Promise<T> {
  const r = await fetch(`${API_BASE}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: JSON.stringify(body),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.success === false) throw toApiError(r.status, j);
  return (j?.data ?? j) as T;
}

/** Extrait jetons + utilisateur quel que soit le format renvoyé par le backend. */
export function extractAuth(raw: any): { user: ApiUser; accessToken?: string | undefined; refreshToken?: string | undefined } {
  const layers = [raw, raw?.data, raw?.data?.data, raw?.tokens, raw?.data?.tokens].filter((x) => x && typeof x === "object");
  const pick = (...keys: string[]) => {
    for (const l of layers) for (const k of keys) if (typeof l[k] === "string" && l[k]) return l[k] as string;
    return undefined;
  };
  let user: ApiUser = {};
  for (const l of layers) if (l.user && typeof l.user === "object") { user = l.user; break; }
  return {
    user,
    accessToken: pick("accessToken", "token", "access_token", "jwt", "authToken"),
    refreshToken: pick("refreshToken", "refresh_token"),
  };
}

export async function loginStart(email: string, password: string): Promise<PendingLogin> {
  const r = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password, deviceToken: getDeviceToken(email) ?? undefined }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.success === false) throw toApiError(r.status, j);
  const a = extractAuth(j);
  if (!a.accessToken) throw new Error("Connexion acceptée mais aucun jeton reçu du serveur.");
  const d = j?.data ?? j;
  const phone = (a.user as any)?.telephone ?? (a.user as any)?.phone;
  if (d?.mfaRequired === false && a.refreshToken) {
    const s: Session = { user: a.user, accessToken: a.accessToken, refreshToken: a.refreshToken };
    setSession(s);
    return { ...a, phone, session: s };
  }
  const m = d?.methodes;
  return { ...a, phone, methodes: m ? { totp: !!m.totp, passkey: !!m.passkey, sms: !!m.sms, email: m.email !== false } : undefined };
}

export const MFA_DEMO_CODE = "123456";

function isMissingRoute(err: unknown) {
  return err instanceof ApiError && (err.status === 404 || /route non trouv/i.test(err.message));
}

/** Méthode par défaut : application d'authentification si activée (gratuit), sinon SMS, sinon e-mail. */
export function defaultMethod(p: PendingLogin): "totp" | "passkey" | MfaChannel {
  if (p.methodes?.totp) return "totp";
  if (p.methodes && !p.methodes.sms) return "email";
  return "sms";
}

/** Envoie le code par SMS ou e-mail. Si la route n'existe pas encore côté serveur, active le code démo. */
export async function mfaSend(p: PendingLogin, canal: MfaChannel = "sms"): Promise<PendingLogin> {
  try {
    await rawPost<any>("/auth/mfa/send-code", { userId: p.user._id ?? p.user.id, email: p.user.email, canal }, p.accessToken);
    return { ...p, canal };
  } catch (err) {
    if (isMissingRoute(err)) return { ...p, canal, mfaDemo: true };
    throw err;
  }
}

function finish(p: PendingLogin, d: any, remember: boolean): Session {
  const a = d ? extractAuth(d) : { user: {} as ApiUser };
  const s: Session = { user: a.user?.role ? a.user : p.user, accessToken: a.accessToken ?? p.accessToken, refreshToken: a.refreshToken ?? p.refreshToken };
  const token = d?.deviceToken ?? d?.data?.deviceToken;
  if (remember && token) setDeviceToken(p.user.email, token);
  setSession(s);
  return s;
}

export async function mfaVerify(p: PendingLogin, code: string, opts: { methode?: "totp" | "code"; remember?: boolean } = {}): Promise<Session> {
  let d: any = null;
  if (p.mfaDemo) {
    if (code !== MFA_DEMO_CODE) throw new Error(`Code incorrect. Le SMS n'est pas encore disponible : utilisez le code ${MFA_DEMO_CODE}.`);
  } else {
    try {
      d = await rawPost<any>("/auth/mfa/verify-code", { userId: p.user._id ?? p.user.id, email: p.user.email, code, methode: opts.methode ?? "code", rememberDevice: !!opts.remember, deviceName: deviceName() }, p.accessToken);
    } catch (err) {
      if (!isMissingRoute(err) || code !== MFA_DEMO_CODE) throw err;
    }
  }
  return finish(p, d, !!opts.remember);
}

/** Connexion par passkey (Face ID, Touch ID, empreinte, clé de sécurité). */
export async function mfaPasskey(p: PendingLogin, remember: boolean): Promise<Session> {
  const { startAuthentication } = await import("@simplewebauthn/browser");
  const options = await rawPost<any>("/auth/mfa/passkey/options", {}, p.accessToken);
  const response = await startAuthentication(options);
  const d = await rawPost<any>("/auth/mfa/passkey/verify", { response, rememberDevice: remember, deviceName: deviceName() }, p.accessToken);
  return finish(p, d, remember);
}

export function deviceName() {
  if (typeof navigator === "undefined") return "Appareil";
  const ua = navigator.userAgent;
  const os = /iPhone/.test(ua) ? "iPhone" : /iPad/.test(ua) ? "iPad" : /Android/.test(ua) ? "Android" : /Mac/.test(ua) ? "Mac" : /Windows/.test(ua) ? "Windows" : "Appareil";
  const nav = /Edg\//.test(ua) ? "Edge" : /Chrome\//.test(ua) ? "Chrome" : /Firefox\//.test(ua) ? "Firefox" : /Safari\//.test(ua) ? "Safari" : "";
  return [os, nav].filter(Boolean).join(" · ");
}

export function maskPhone(p?: string) {
  if (!p) return "votre téléphone";
  const d = p.replace(/\D/g, "");
  return `${d.startsWith("33") ? "+33 " + d.slice(2, 3) : d.slice(0, 2)} •• •• •• ${d.slice(-2)}`;
}

/** Mot de passe oublié : demande au serveur d'envoyer un lien / code de réinitialisation. */
export async function forgotPassword(email: string): Promise<string> {
  const r = await fetch(`${API_BASE}/auth/forgot-password`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  });
  const j = await r.json().catch(() => ({}));
  if (!r.ok || j?.success === false) throw toApiError(r.status, j);
  return j?.message ?? j?.data?.message ?? "Si un compte existe, un lien de réinitialisation vient d'être envoyé.";
}

let etabPromise: Promise<void> | null = null;
/** Complète l'utilisateur connecté avec son établissement (via /auth/me puis /etablissements). */
export function ensureEtablissement(): Promise<void> {
  const s = getSession();
  if (!s || s.demo || userParams(s.user)["etablissementId"]) return Promise.resolve();
  etabPromise ??= (async () => {
    let user: ApiUser = { ...s.user };
    try {
      const me: any = await apiFetch("/auth/me");
      user = { ...user, ...(me?.user ?? me) };
    } catch { /* ignore */ }
    if (!userParams(user)["etablissementId"]) {
      try {
        const list = toList(await apiFetch("/etablissements"));
        const uid = user._id ?? user.id;
        const own = list.find((e: any) =>
          [e.gestionnaire, e.responsable, e.directeur, e.owner, e.user, e.createdBy].some((x: any) => (typeof x === "string" ? x : x?._id ?? x?.id) === uid),
        ) ?? (list.length === 1 ? list[0] : undefined);
        if (own) user.etablissementId = own._id ?? own.id;
      } catch { /* ignore */ }
    }
    const cur = getSession();
    if (cur) setSession({ ...cur, user: { ...cur.user, ...user } });
  })().finally(() => { etabPromise = null; });
  return etabPromise;
}
