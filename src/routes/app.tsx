import { createFileRoute } from "@tanstack/react-router";
import { useCallback, useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Activity, ArrowRight, Baby, Bell, Building2, ChevronRight, ClipboardList, Eye, EyeOff, FileText, HeartPulse, HelpCircle, Home, Info, KeyRound, Lock,
  LogOut, Mail, Monitor, Moon, Phone, Pill, ShieldCheck, Sparkles, Star, Stethoscope, Sun, UserCircle, UserPlus, AlertTriangle, Users, Camera,
} from "lucide-react";
import logo from "@/assets/logo.png.asset.json";
import { getSession, loginStart, logout, mfaSend, roleToKey, setSession, type PendingLogin, type Session } from "@/lib/api";
import { MfaSwitcher, mfaHint, mfaNeedsSend, useMfa } from "@/components/auth/mfa";
import { SecuritySettings } from "@/components/auth/security-settings";
import { send } from "@/lib/mutate";
import { specs } from "@/lib/specs";
import { patchSessionUser } from "@/components/dash/beta";
import { useLiveNotifications } from "@/lib/live-notify";
import { isStandalone } from "@/components/pwa/install";
import { DemoBanner, Glass, Header, IconTile, inputCls, PrimaryBtn, RoundBtn, Sheet, TabBar } from "@/components/mobile/ui";
import { Dossier } from "@/components/mobile/dossier";
import {
  Alertes, CrecheAssistant, CrecheHome, CrecheQuotidien, CrecheTraitements, NotifOptIn, ParentDiagnostic, ParentHistory, ParentHome, RsaiAvis, RsaiEnfants,
  RsaiHome, RsaiRegistres, SosSheet, useGeo,
} from "@/components/mobile/screens";

type Search = { tab?: string; enfant?: string; page?: string };
export const Route = createFileRoute("/app")({
  validateSearch: (s: Record<string, unknown>): Search => {
    const o: Search = {};
    for (const k of ["tab", "enfant", "page"] as const) if (typeof s[k] === "string" && s[k]) o[k] = s[k] as string;
    return o;
  },
  head: () => ({
    meta: [
      { title: "Kids'Med IA — Application mobile" },
      { name: "description", content: "Suivi santé des enfants en temps réel, alertes SOS et assistant IA, dans votre poche." },
      { property: "og:title", content: "Kids'Med IA — Application mobile" },
      { property: "og:description", content: "Suivi santé en temps réel, SOS en 1 clic et assistant IA pour les crèches." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: MobileApp,
});

/* ---------- Thème : la classe .dark est posée sur <html> pour que fenêtres et fond suivent ---------- */
type Mode = "auto" | "clair" | "sombre";
function useMode() {
  const [mode, setMode] = useState<Mode>("auto");
  const [dark, setDark] = useState(false);
  useEffect(() => { setMode((localStorage.getItem("kidsmed_mode") as Mode) || "auto"); }, []);
  useEffect(() => {
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const apply = () => {
      const d = mode === "sombre" || (mode === "auto" && mq.matches);
      setDark(d);
      document.documentElement.classList.toggle("dark", d);
      document.querySelector('meta[name="theme-color"]')?.setAttribute("content", d ? "#15131f" : "#0095ff");
    };
    apply();
    mq.addEventListener("change", apply);
    return () => { mq.removeEventListener("change", apply); document.documentElement.classList.remove("dark"); };
  }, [mode]);
  return { mode, dark, setMode: (m: Mode) => { localStorage.setItem("kidsmed_mode", m); setMode(m); } };
}
type Theme = ReturnType<typeof useMode>;

type MRole = "parent" | "creche" | "rsai";
const toMobileRole = (r: string | null): MRole | null => (r === "parent" || r === "creche" || r === "rsai" ? r : r === "medecin" ? "creche" : null);
const ROLE_LABEL: Record<MRole, string> = { parent: "Parent", creche: "Crèche", rsai: "RSAI" };

function MobileApp() {
  const [session, setS] = useState<Session | null | undefined>(undefined);
  const theme = useMode();
  useEffect(() => { setS(getSession()); }, []);
  return (
    <div className="min-h-dvh bg-[image:var(--mobile-bg)] bg-fixed font-sans text-foreground">
      <div className="mx-auto min-h-dvh max-w-md">
        {session === undefined ? null : session && toMobileRole(roleToKey(session.user.role)) ? <Main session={session} theme={theme} onLogout={() => setS(null)} /> : <Public onDone={setS} />}
      </div>
    </div>
  );
}

/* ---------- Pages publiques : connexion, inscription, mot de passe, sélection démo ---------- */
function Public({ onDone }: { onDone: (s: Session) => void }) {
  const { page } = Route.useSearch();
  const navigate = Route.useNavigate();
  const to = (p?: string) => navigate({ search: p ? { page: p } : {} });
  function demo(role: MRole) {
    const s: Session = { demo: true, user: { prenom: role === "parent" ? "Claire" : role === "rsai" ? "Inès" : "Les Petits Lutins", nom: role === "parent" ? "Martin" : "", role, email: "demo@kidsmed.ia" } as any };
    setSession(s); navigate({ search: {} }); onDone(s);
  }
  if (page === "demo") return <DemoSelector onPick={demo} onBack={() => to()} />;
  if (page === "register") return <Register onBack={() => to()} />;
  if (page === "forgot") return <Forgot onBack={() => to()} onCode={() => to("reset")} />;
  if (page === "reset") return <Reset onBack={() => to()} />;
  return <Login onDone={onDone} to={to} />;
}

function Brand() {
  return (
    <>
      <div className="mx-auto grid h-28 w-28 place-items-center rounded-[1.25rem] bg-card shadow-[0_20px_50px_-15px] shadow-mobile-blue/40"><img src={logo.url} alt="Kids'Med IA" className="h-20 w-20 object-contain" /></div>
      <p className="mt-5 text-center text-muted-foreground">Bienvenue sur</p>
      <h1 className="text-center font-display text-3xl font-bold tracking-tight"><span className="text-mobile-blue">Kids'Med</span> <span className="text-mobile-pink">IA</span></h1>
    </>
  );
}
const field = "flex h-12 items-center gap-2.5 rounded-3xl border border-[var(--glass-border)] bg-[var(--glass)] px-4 backdrop-blur";
const pubWrap = "flex min-h-dvh flex-col justify-center px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]";

function Login({ onDone, to }: { onDone: (s: Session) => void; to: (p?: string) => void }) {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const [show, setShow] = useState(false);
  const [pending, setPending] = useState<PendingLogin | null>(null);
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const mfa = useMfa(pending, setPending);
  async function submit(e: React.FormEvent) {
    e.preventDefault(); setErr(null); setBusy(true);
    try {
      if (!pending) {
        const p = await loginStart(email, pwd);
        if (!toMobileRole(roleToKey(p.user.role))) { setSession(null); throw new Error("Ce compte (admin ou développeur) n'a pas d'espace dans l'application mobile."); }
        if (p.session) { onDone(p.session); return; }
        mfa.reset();
        setPending(mfaNeedsSend(p) ? await mfaSend(p, p.methodes && !p.methodes.sms ? "email" : "sms") : p);
      } else if (mfa.methode === "passkey") onDone(await mfa.passkey());
      else onDone(await mfa.verify(code));
    } catch (x) { setErr((x as Error).message); } finally { setBusy(false); }
  }
  return (
    <form onSubmit={submit} className={pubWrap}>
      <Brand />
      <p className="mt-3 text-center text-muted-foreground">La plateforme santé & diagnostic IA sécurisée pour les crèches.</p>
      <div className="mt-8 space-y-2">
        {!pending ? (<>
          <label className={field}><Mail className="h-5 w-5 text-mobile-blue" /><input required type="email" autoComplete="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" /></label>
          <label className={field}><Lock className="h-5 w-5 text-mobile-blue" /><input required type={show ? "text" : "password"} autoComplete="current-password" placeholder="Mot de passe" value={pwd} onChange={(e) => setPwd(e.target.value)} className="flex-1 bg-transparent text-[15px] outline-none placeholder:text-muted-foreground" />
            <button type="button" aria-label="Afficher le mot de passe" onClick={() => setShow(!show)} className="text-muted-foreground">{show ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}</button></label>
        </>) : (<>
          <p className="text-center text-[13px] text-muted-foreground">{mfaHint(pending, mfa.methode)}</p>
          <MfaSwitcher pending={pending} mfa={mfa} compact />
          {mfa.methode !== "passkey" && <label className={field}><ShieldCheck className="h-5 w-5 text-mobile-blue" /><input autoFocus inputMode="numeric" maxLength={6} autoComplete="one-time-code" placeholder="Code à 6 chiffres" value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))} className="flex-1 bg-transparent text-[15px] tracking-[0.4em] outline-none placeholder:tracking-normal placeholder:text-muted-foreground" /></label>}
        </>)}
        {err && <p className="rounded-2xl bg-destructive/10 px-3 py-2 text-[13px] text-destructive">{err}</p>}
        <PrimaryBtn type="submit" tone="gradient" disabled={busy || (!!pending && mfa.methode !== "passkey" && code.length < 6)}>{busy ? "Connexion…" : pending ? (mfa.methode === "passkey" ? "Utiliser Face ID / Touch ID" : "Valider le code") : "Se connecter"} <ArrowRight className="h-5 w-5" /></PrimaryBtn>
        {!pending && <button type="button" onClick={() => to("demo")} className="flex h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-mobile-blue font-bold text-mobile-blue"><Sparkles className="h-5 w-5" />Explorer en mode démo</button>}
      </div>
      {pending ? <button type="button" onClick={() => { setPending(null); setCode(""); }} className="mt-6 text-center font-semibold text-mobile-blue">Changer de compte</button>
        : <button type="button" onClick={() => to("forgot")} className="mt-6 text-center font-semibold text-mobile-blue">Mot de passe oublié ?</button>}
      <p className="mt-4 text-center text-muted-foreground">Pas encore de compte ? <button type="button" onClick={() => to("register")} className="font-semibold text-mobile-blue">S'inscrire</button></p>
      <p className="mt-6 flex items-center justify-center gap-2 text-[13px] text-muted-foreground"><Lock className="h-3.5 w-3.5" />Données chiffrées · Conforme RGPD santé</p>
    </form>
  );
}

function DemoSelector({ onPick, onBack }: { onPick: (r: MRole) => void; onBack: () => void }) {
  const cards: { r: MRole; icon: typeof Home; tone: "blue" | "pink" | "green"; t: string; d: string }[] = [
    { r: "parent", icon: Users, tone: "pink", t: "Parent", d: "Santé de Lucas, diagnostic IA, alertes" },
    { r: "creche", icon: Building2, tone: "blue", t: "Crèche", d: "3 enfants, transmissions, traitements, IA" },
    { r: "rsai", icon: Stethoscope, tone: "green", t: "RSAI", d: "Missions, enfants sur site, registres, avis" },
  ];
  return (
    <div className="pb-10">
      <Header title="Mode démo" sub="Choisissez un rôle à explorer" onBack={onBack} />
      <div className="mt-6 space-y-2.5 px-4">
        {cards.map((c) => <Glass key={c.r} onClick={() => onPick(c.r)} className="flex items-center gap-2.5"><IconTile icon={c.icon} tone={c.tone} size="lg" /><div className="flex-1"><p className="font-display text-lg font-bold">{c.t}</p><p className="text-muted-foreground">{c.d}</p></div><ChevronRight className="h-5 w-5 text-muted-foreground" /></Glass>)}
        <p className="pt-2 text-center text-[13px] text-muted-foreground">Données fictives, rien n'est enregistré.</p>
      </div>
    </div>
  );
}

function Register({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ prenom: "", nom: "", email: "", telephone: "", password: "", code: "" });
  const [ok, setOk] = useState(false);
  const [busy, setBusy] = useState(false);
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF({ ...f, [k]: e.target.value });
  return (
    <div className="pb-10">
      <Header title="Inscription" sub="Réservée aux parents" onBack={onBack} />
      {ok ? <div className="mt-8 px-4"><Glass className="text-center"><ShieldCheck className="mx-auto h-8 w-8 text-brand-green" /><p className="mt-3 text-base font-bold">Compte créé</p><p className="text-muted-foreground">Connectez-vous avec votre e-mail et votre mot de passe.</p><div className="mt-4"><PrimaryBtn onClick={onBack}>Se connecter</PrimaryBtn></div></Glass></div> : (
        <form className="mt-6 space-y-2 px-4" onSubmit={async (e) => {
          e.preventDefault(); if (f.password.length < 8) { toast.error("Le mot de passe doit faire au moins 8 caractères."); return; }
          setBusy(true);
          try { await send("POST", "/auth/register", { ...f, role: "parent", codeLiaison: f.code || undefined }); setOk(true); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
        }}>
          <div className="grid grid-cols-2 gap-2"><input required className={inputCls} placeholder="Prénom" value={f.prenom} onChange={set("prenom")} /><input required className={inputCls} placeholder="Nom" value={f.nom} onChange={set("nom")} /></div>
          <input required type="email" className={inputCls} placeholder="Email" value={f.email} onChange={set("email")} />
          <input required type="tel" className={inputCls} placeholder="Téléphone (pour le code SMS)" value={f.telephone} onChange={set("telephone")} />
          <input required type="password" className={inputCls} placeholder="Mot de passe (8 caractères min.)" value={f.password} onChange={set("password")} />
          <input className={inputCls} placeholder="Code de liaison de la crèche (facultatif)" value={f.code} onChange={set("code")} />
          <PrimaryBtn type="submit" tone="gradient" disabled={busy}><UserPlus className="h-5 w-5" />{busy ? "Création…" : "Créer mon compte"}</PrimaryBtn>
          <p className="text-center text-xs text-muted-foreground">En vous inscrivant, vous acceptez le traitement de vos données de santé conformément au RGPD.</p>
        </form>)}
    </div>
  );
}

function Forgot({ onBack, onCode }: { onBack: () => void; onCode: () => void }) {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  return (
    <div className="pb-10">
      <Header title="Mot de passe oublié" onBack={onBack} />
      <form className="mt-6 space-y-2.5 px-4" onSubmit={async (e) => {
        e.preventDefault(); setBusy(true);
        try { await send("POST", "/auth/forgot-password", { email }); localStorage.setItem("kidsmed_reset_email", email); toast.success("Si ce compte existe, un code vous a été envoyé."); onCode(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
      }}>
        <p className="text-muted-foreground">Saisissez votre e-mail : vous recevrez un code à 6 chiffres pour choisir un nouveau mot de passe.</p>
        <input required type="email" className={inputCls} placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} />
        <PrimaryBtn type="submit" tone="gradient" disabled={busy}>{busy ? "Envoi…" : "Recevoir le code"}</PrimaryBtn>
      </form>
    </div>
  );
}

function Reset({ onBack }: { onBack: () => void }) {
  const [f, setF] = useState({ email: "", code: "", password: "" });
  const [busy, setBusy] = useState(false);
  useEffect(() => { setF((v) => ({ ...v, email: localStorage.getItem("kidsmed_reset_email") ?? "" })); }, []);
  return (
    <div className="pb-10">
      <Header title="Nouveau mot de passe" onBack={onBack} />
      <form className="mt-6 space-y-2 px-4" onSubmit={async (e) => {
        e.preventDefault(); if (f.password.length < 8) { toast.error("8 caractères minimum."); return; }
        setBusy(true);
        try { await send("POST", "/auth/reset-password", { email: f.email, code: f.code, password: f.password }); toast.success("Mot de passe modifié. Connectez-vous."); onBack(); } catch (x) { toast.error((x as Error).message); } finally { setBusy(false); }
      }}>
        <input required type="email" className={inputCls} placeholder="Email" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} />
        <input required inputMode="numeric" maxLength={6} className={`${inputCls} tracking-[0.4em] placeholder:tracking-normal`} placeholder="Code à 6 chiffres" value={f.code} onChange={(e) => setF({ ...f, code: e.target.value.replace(/\D/g, "") })} />
        <input required type="password" className={inputCls} placeholder="Nouveau mot de passe" value={f.password} onChange={(e) => setF({ ...f, password: e.target.value })} />
        <PrimaryBtn type="submit" tone="gradient" disabled={busy}><KeyRound className="h-5 w-5" />{busy ? "Enregistrement…" : "Valider"}</PrimaryBtn>
      </form>
    </div>
  );
}

/* ---------- Espace connecté ---------- */
const TABS: Record<MRole, { key: string; label: string; icon: typeof Home; title: string; sub: string }[]> = {
  parent: [
    { key: "accueil", label: "Accueil", icon: Home, title: "Bonjour", sub: "Suivi santé en temps réel" },
    { key: "diagnostic", label: "Diagnostic", icon: HeartPulse, title: "Diagnostic IA", sub: "Signalez les symptômes observés" },
    { key: "dossier", label: "Dossier", icon: FileText, title: "Dossier médical", sub: "Historique complet" },
    { key: "alertes", label: "Alertes", icon: Bell, title: "Alertes", sub: "Notifications de la crèche" },
  ],
  creche: [
    { key: "accueil", label: "Accueil", icon: Home, title: "Ma crèche", sub: "Suivi santé en temps réel" },
    { key: "quotidien", label: "Quotidien", icon: ClipboardList, title: "Quotidien", sub: "Carnet & mémos de transmission" },
    { key: "traitements", label: "Traitements", icon: Pill, title: "Traitements", sub: "Suivi & administration" },
    { key: "ia", label: "Assistant IA", icon: Sparkles, title: "Assistant IA", sub: "Tendances santé par classe" },
  ],
  rsai: [
    { key: "accueil", label: "Accueil", icon: Home, title: "Mes missions", sub: "Planning & géolocalisation" },
    { key: "enfants", label: "Enfants", icon: Baby, title: "Enfants", sub: "Accessible sur site uniquement" },
    { key: "registres", label: "Registres", icon: Activity, title: "Registres", sub: "Soins et incidents" },
    { key: "avis", label: "Avis", icon: Star, title: "Avis", sub: "Évaluations des crèches" },
  ],
};

function Main({ session, theme, onLogout }: { session: Session; theme: Theme; onLogout: () => void }) {
  const role = toMobileRole(roleToKey(session.user.role))!;
  const { tab: t, enfant } = Route.useSearch();
  const navigate = Route.useNavigate();
  const tabs = TABS[role];
  const cur = tabs.find((x) => x.key === t) ?? (t === "profil" ? null : tabs[0]!);
  const go = (k: string) => navigate({ search: k === "accueil" ? {} : { tab: k } });
  const open = (id: string) => navigate({ search: { ...(t ? { tab: t } : {}), enfant: id } });
  const [sos, setSos] = useState(false);
  const geo = useGeo();
  const qc = useQueryClient();
  const onNew = useCallback((n: any) => { toast(n.titre ?? n.title ?? "Nouvelle notification", { description: n.message ?? n.contenu }); qc.invalidateQueries({ queryKey: ["api"] }); }, [qc]);
  useLiveNotifications(onNew);
  useEffect(() => { window.scrollTo(0, 0); }, [t, enfant]);

  async function out() { await qc.cancelQueries(); qc.clear(); await logout(); navigate({ search: {} }); onLogout(); }
  async function switchDemo() { await qc.cancelQueries(); qc.clear(); setSession(null); navigate({ search: { page: "demo" } }); onLogout(); }

  const banner = session.demo ? <DemoBanner role={ROLE_LABEL[role]} onSwitch={switchDemo} onQuit={out} /> : <div className="h-[env(safe-area-inset-top)]" />;
  if (enfant) return <>{banner}<Dossier id={enfant} role={role} onBack={() => navigate({ search: t ? { tab: t } : {} })} /></>;
  if (!cur) return <>{banner}<Profil session={session} role={role} theme={theme} onBack={() => go("accueil")} onLogout={out} /></>;

  const name = (session.user as any).etablissement?.nom ?? (role === "creche" ? [session.user.prenom, session.user.nom].filter(Boolean).join(" ") : null);
  const title = cur.key === "accueil" && role === "parent" ? `Bonjour ${session.user.prenom ?? ""}` : cur.key === "accueil" && role === "creche" ? name || cur.title : cur.title;
  const canSos = role !== "rsai" && cur.key !== "diagnostic";
  return (
    <div className="pb-36">
      {banner}
      <Header title={title} sub={cur.sub} right={<div className="flex gap-2">
        <RoundBtn label="Mode sombre" onClick={() => theme.setMode(theme.dark ? "clair" : "sombre")}>{theme.dark ? <Sun className="h-5 w-5 text-mobile-blue" /> : <Moon className="h-5 w-5 text-mobile-blue" />}</RoundBtn>
        <RoundBtn label="Profil" onClick={() => go("profil")}><UserCircle className="h-5 w-5 text-mobile-blue" /></RoundBtn>
      </div>} />
      {role === "parent" && <>
        {cur.key === "accueil" && <ParentHome open={open} go={go} />}
        {cur.key === "diagnostic" && <ParentDiagnostic />}
        {cur.key === "dossier" && <ParentHistory open={open} />}
        {cur.key === "alertes" && <Alertes />}
      </>}
      {role === "creche" && <>
        {cur.key === "accueil" && <CrecheHome open={open} />}
        {cur.key === "quotidien" && <CrecheQuotidien open={open} />}
        {cur.key === "traitements" && <CrecheTraitements />}
        {cur.key === "ia" && <CrecheAssistant />}
      </>}
      {role === "rsai" && <>
        {cur.key === "accueil" && <RsaiHome geo={geo} />}
        {cur.key === "enfants" && <RsaiEnfants geo={geo} open={open} />}
        {cur.key === "registres" && <RsaiRegistres geo={geo} />}
        {cur.key === "avis" && <RsaiAvis />}
      </>}
      {canSos && <button onClick={() => setSos(true)} className="fixed bottom-[calc(6.5rem+env(safe-area-inset-bottom))] right-[max(1.25rem,calc(50vw-14rem+1.25rem))] z-30 flex h-10 items-center gap-2 rounded-full bg-mobile-pink px-5 text-[15px] font-bold text-on-vivid shadow-[var(--mobile-glow)] ring-4 ring-mobile-pink/25"><AlertTriangle className="h-5 w-5" />SOS</button>}
      <TabBar tabs={tabs} active={cur.key} onGo={go} />
      {sos && <SosSheet role={role} onClose={() => setSos(false)} />}
    </div>
  );
}

function Profil({ session, role, theme, onBack, onLogout }: { session: Session; role: MRole; theme: Theme; onBack: () => void; onLogout: () => void }) {
  const u = session.user;
  const name = [u.prenom, u.nom].filter(Boolean).join(" ") || u.email || "Mon compte";
  const [standalone, setStandalone] = useState(true);
  const [rgpd, setRgpd] = useState(false);
  const [f, setF] = useState({ prenom: u.prenom ?? "", nom: u.nom ?? "", telephone: (u as any).telephone ?? "" });
  const [avatar, setAvatar] = useState(u.avatarUrl);
  useEffect(() => setStandalone(isStandalone()), []);
  async function onPhoto(file: File | undefined) {
    if (!file) return;
    if (!/^image\/(jpeg|png|webp)$/.test(file.type)) { toast.error("Format accepté : JPG, PNG ou WebP."); return; }
    if (file.size > 2 * 1024 * 1024) { toast.error("Image trop lourde (2 Mo maximum)."); return; }
    try {
      let url: string;
      if (specs.avatar.status === "ok" && !getSession()?.demo) { const fd = new FormData(); fd.append("photo", file); url = (await send<{ avatarUrl: string }>("POST", specs.avatar.path, fd)).data.avatarUrl; }
      else url = await new Promise<string>((res) => { const r = new FileReader(); r.onload = () => res(String(r.result)); r.readAsDataURL(file); });
      patchSessionUser({ avatarUrl: url }); setAvatar(url); toast.success("Photo de profil mise à jour");
    } catch (x) { toast.error((x as Error).message); }
  }
  return (
    <div className="space-y-3 pb-10">
      <Header title="Profil" onBack={onBack} />
      <div className="space-y-3 px-4">
        <Glass className="text-center">
          <label className="relative mx-auto block h-20 w-20 cursor-pointer" aria-label="Changer la photo de profil">
            {avatar ? <img src={avatar} alt="" className="h-20 w-20 rounded-full object-cover" /> : <span className="grid h-20 w-20 place-items-center rounded-full bg-[image:var(--gradient-mobile)] text-xl font-bold text-on-vivid">{name[0]}</span>}
            <span className="absolute -bottom-1 -right-1 grid h-8 w-8 place-items-center rounded-full bg-mobile-blue text-on-vivid ring-4 ring-background"><Camera className="h-4 w-4" /></span>
            <input type="file" accept="image/jpeg,image/png,image/webp" className="sr-only" onChange={(e) => onPhoto(e.target.files?.[0])} />
          </label>
          <p className="mt-3 text-lg font-bold">{name}</p><p className="text-muted-foreground">{u.email}</p>
          <span className="mt-2 inline-flex items-center gap-1 rounded-full bg-mobile-blue/15 px-3 py-1 text-[13px] font-semibold text-mobile-blue"><ShieldCheck className="h-4 w-4" />{ROLE_LABEL[role]}</span>
        </Glass>
        <Glass className="space-y-2"><p className="font-bold">Mes informations</p>
          <div className="grid grid-cols-2 gap-2"><input className={inputCls} placeholder="Prénom" value={f.prenom} onChange={(e) => setF({ ...f, prenom: e.target.value })} /><input className={inputCls} placeholder="Nom" value={f.nom} onChange={(e) => setF({ ...f, nom: e.target.value })} /></div>
          <input className={inputCls} type="tel" placeholder="Téléphone" value={f.telephone} onChange={(e) => setF({ ...f, telephone: e.target.value })} />
          <PrimaryBtn onClick={async () => { try { const r = await send("PUT", "/auth/me", f); toast.success(`Profil mis à jour${r.demo ? " (démo)" : ""}`); } catch (x) { toast.error((x as Error).message); } }}>Enregistrer</PrimaryBtn>
        </Glass>
        <NotifOptIn />
        <Glass><p className="mb-2 font-bold">Sécurité de connexion</p><SecuritySettings compact /></Glass>
        <Glass><p className="font-bold">Apparence</p>
          <div className="mt-3 grid grid-cols-3 gap-2">{([["auto", "Auto", Monitor], ["clair", "Clair", Sun], ["sombre", "Sombre", Moon]] as const).map(([k, l, I]) => (
            <button key={k} onClick={() => theme.setMode(k)} className={`flex h-9 items-center justify-center gap-2 rounded-2xl font-semibold ${theme.mode === k ? "bg-mobile-blue text-on-vivid" : "bg-muted/60"}`}><I className="h-4 w-4" />{l}</button>))}</div></Glass>
        <Glass className="divide-y divide-border !py-1">
          <Row icon={Lock} label="Confidentialité & RGPD santé" onClick={() => setRgpd(true)} />
          <Row icon={HelpCircle} label="Aide & support" href="mailto:contact@kidsmed.fr" />
          <Row icon={Phone} label="Urgences : 15 · 18 · 112" href="tel:15" />
          <Row icon={Info} label={`À propos · v1.0${standalone ? "" : " · non installée"}`} />
        </Glass>
        <button onClick={onLogout} className="flex h-10 w-full items-center justify-center gap-2 rounded-full border-2 border-mobile-pink text-[15px] font-bold text-mobile-pink"><LogOut className="h-5 w-5" />Se déconnecter</button>
      </div>
      {rgpd && <Sheet title="Confidentialité & RGPD santé" onClose={() => setRgpd(false)}><p className="text-muted-foreground">Vos données de santé sont chiffrées, hébergées en France et accessibles uniquement aux personnes liées à l'enfant. Vous pouvez demander l'accès, la rectification ou la suppression de vos données à tout moment via « Aide & support ».</p></Sheet>}
    </div>
  );
}
function Row({ icon: I, label, onClick, href }: { icon: typeof Home; label: string; onClick?: () => void; href?: string }) {
  const inner = <><I className="h-5 w-5 text-muted-foreground" /><span className="flex-1 text-left">{label}</span><ChevronRight className="h-5 w-5 text-muted-foreground" /></>;
  return href ? <a href={href} className="flex items-center gap-2.5 py-2.5">{inner}</a> : <button onClick={onClick} className="flex w-full items-center gap-2.5 py-2.5">{inner}</button>;
}
