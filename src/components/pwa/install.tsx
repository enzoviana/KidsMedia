import { useEffect, useState } from "react";
import { qrDataUrl } from "@/lib/qr";
import { Download, Share, SquarePlus, Smartphone, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";

type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };
let deferred: BIPEvent | null = null;
const listeners = new Set<() => void>();
if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (e) => { e.preventDefault(); deferred = e as BIPEvent; listeners.forEach((l) => l()); });
}

const DISMISS = "kidsmed_install_dismissed";
export const isStandalone = () => typeof window !== "undefined" && (window.matchMedia("(display-mode: standalone)").matches || (navigator as any).standalone === true);
const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent);
const isMobile = () => /android|iphone|ipad|ipod|mobile/i.test(navigator.userAgent);

/** URL d'installation : la version mobile sur l'adresse publique. */
export function installUrl() {
  if (typeof window === "undefined") return "";
  const host = window.location.hostname;
  const origin = host.startsWith("id-preview--") || host === "localhost" ? "https://kidsmedia.vercel.app" : window.location.origin;
  return `${origin}/app`;
}

async function installNow(): Promise<boolean> {
  if (!deferred) return false;
  await deferred.prompt();
  const r = await deferred.userChoice;
  deferred = null;
  return r.outcome === "accepted";
}

function IosSteps() {
  return (
    <ol className="space-y-3 text-sm">
      <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue"><Share className="h-4 w-4" /></span><span>Appuyez sur <b>Partager</b> en bas de Safari</span></li>
      <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-blue/10 text-brand-blue"><SquarePlus className="h-4 w-4" /></span><span>Choisissez <b>Sur l'écran d'accueil</b></span></li>
      <li className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-xl bg-brand-pink/10 text-brand-pink"><Smartphone className="h-4 w-4" /></span>Ouvrez Kids'Med depuis son icône</li>
    </ol>
  );
}

/** Fenêtre d'installation affichée automatiquement sur téléphone. */
export function MobileInstallPrompt() {
  const [open, setOpen] = useState(false);
  const [ios, setIos] = useState(false);
  const [, tick] = useState(0);
  useEffect(() => {
    if (!isMobile() || isStandalone() || localStorage.getItem(DISMISS)) return;
    setIos(isIos());
    const t = setTimeout(() => setOpen(true), 1500);
    const l = () => tick((x) => x + 1);
    listeners.add(l);
    return () => { clearTimeout(t); listeners.delete(l); };
  }, []);
  if (!open) return null;
  const close = () => { localStorage.setItem(DISMISS, "1"); setOpen(false); };
  return (
    <div className="fixed inset-0 z-[60] flex items-end bg-foreground/40 backdrop-blur-sm" onClick={close}>
      <div className="w-full rounded-t-[2rem] bg-card p-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] shadow-2xl animate-in slide-in-from-bottom" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-muted" />
        <button onClick={close} aria-label="Fermer" className="absolute right-5 top-5 text-muted-foreground"><X className="h-5 w-5" /></button>
        <div className="flex items-center gap-4">
          <img src="/logo.png" alt="" className="h-16 w-16 rounded-2xl border bg-card object-contain p-1 shadow" />
          <div>
            <p className="font-display text-xl font-bold">Installer Kids'Med IA</p>
            <p className="text-sm text-muted-foreground">Accès en 1 geste, alertes en temps réel.</p>
          </div>
        </div>
        <div className="mt-5">
          {ios ? <IosSteps /> : deferred ? (
            <Button className="h-12 w-full rounded-2xl bg-[image:var(--gradient-mobile)] text-base font-semibold text-primary-foreground" onClick={async () => { if (await installNow()) close(); }}>
              <Download className="mr-2 h-5 w-5" />Installer l'application
            </Button>
          ) : (
            <p className="text-sm text-muted-foreground">Ouvrez le menu ⋮ de votre navigateur puis choisissez <b>Installer l'application</b> ou <b>Ajouter à l'écran d'accueil</b>.</p>
          )}
        </div>
        <button onClick={close} className="mt-4 w-full text-center text-sm text-muted-foreground">Plus tard</button>
      </div>
    </div>
  );
}

/** Bouton + QR code pour installer depuis un ordinateur. */
export function InstallQrButton({ className, label = "Application mobile" }: { className?: string; label?: string }) {
  const [open, setOpen] = useState(false);
  const [qr, setQr] = useState("");
  const [url, setUrl] = useState("");
  useEffect(() => {
    if (!open) return;
    const u = installUrl();
    setUrl(u);
    setQr(qrDataUrl(u, 260));
  }, [open]);
  return (
    <>
      <Button variant="outline" size="sm" className={className} onClick={() => setOpen(true)}><Smartphone className="mr-1 h-4 w-4" />{label}</Button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-sm text-center">
          <DialogHeader>
            <DialogTitle className="text-center">Installer sur votre téléphone</DialogTitle>
            <DialogDescription className="text-center">Scannez ce code avec l'appareil photo, puis ajoutez l'application à l'écran d'accueil.</DialogDescription>
          </DialogHeader>
          <div className="mx-auto rounded-3xl border bg-card p-4 shadow-sm">
            {qr ? <img src={qr} alt="QR code d'installation" className="h-56 w-56" /> : <div className="h-56 w-56 animate-pulse rounded-xl bg-muted" />}
          </div>
          <p className="break-all text-xs text-muted-foreground">{url}</p>
          {deferred && <Button onClick={() => installNow()}><Download className="mr-1 h-4 w-4" />Installer aussi sur cet ordinateur</Button>}
        </DialogContent>
      </Dialog>
    </>
  );
}
