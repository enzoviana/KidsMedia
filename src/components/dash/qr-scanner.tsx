import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { ScanLine, X } from "lucide-react";
import { send } from "@/lib/mutate";
import { parseChildQr } from "@/lib/qr-scan";

/** Fenêtre plein écran qui ouvre la caméra et lit le QR code d'un enfant. Renvoie l'ID du dossier. */
export function QrScanner({ onClose, onChild }: { onClose: () => void; onChild: (id: string) => void }) {
  const video = useRef<HTMLVideoElement>(null);
  const [err, setErr] = useState("");
  const done = useRef(false);

  useEffect(() => {
    let stream: MediaStream | null = null;
    let raf = 0;
    let stop = false;
    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        if (stop || !video.current) return;
        video.current.srcObject = stream;
        await video.current.play();
        const jsQR = (await import("jsqr")).default;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        const tick = async () => {
          if (stop || done.current) return;
          const v = video.current;
          if (v && ctx && v.videoWidth) {
            canvas.width = v.videoWidth; canvas.height = v.videoHeight;
            ctx.drawImage(v, 0, 0);
            const img = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const hit = jsQR(img.data, img.width, img.height);
            if (hit?.data) { await handle(hit.data); }
          }
          raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      } catch {
        setErr("Caméra inaccessible. Autorisez l'accès à la caméra dans votre navigateur.");
      }
    })();
    return () => { stop = true; cancelAnimationFrame(raf); stream?.getTracks().forEach((t) => t.stop()); };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  async function handle(raw: string) {
    const p = parseChildQr(raw);
    if (!p) { toast.error("Ce QR code n'est pas un QR KidsMed."); return; }
    done.current = true;
    try {
      if (p.id) { onChild(p.id); onClose(); return; }
      const r = await send<any>("POST", "/enfants/lier-code", { code: p.code });
      const id = r.demo ? `demo-${p.code!.slice(0, 3).toLowerCase()}` : r.data?._id ?? r.data?.id ?? r.data?.enfant?._id ?? r.data?.enfant?.id;
      toast.success(r.demo ? "Dossier ouvert (mode démo)" : "Dossier de l'enfant ouvert");
      if (id) onChild(String(id));
      onClose();
    } catch (e) { toast.error((e as Error).message); done.current = false; }
  }

  return (
    <div className="fixed inset-0 z-[80] flex flex-col items-center justify-center bg-background/95 p-4 backdrop-blur">
      <button onClick={onClose} aria-label="Fermer" className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-muted"><X className="h-5 w-5" /></button>
      <p className="mb-3 flex items-center gap-2 font-bold"><ScanLine className="h-5 w-5" />Scanner le QR code de l'enfant</p>
      <div className="relative aspect-square w-full max-w-sm overflow-hidden rounded-3xl bg-muted">
        <video ref={video} playsInline muted className="h-full w-full object-cover" />
        <div className="pointer-events-none absolute inset-8 rounded-2xl border-4 border-primary/80" />
      </div>
      <p className="mt-3 max-w-sm text-center text-sm text-muted-foreground">{err || "Placez le QR code (carte de l'enfant) dans le cadre."}</p>
    </div>
  );
}
