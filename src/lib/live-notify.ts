import { useEffect, useRef } from "react";
import { apiFetch, getSession, toList } from "./api";

/** Interroge les notifications toutes les 20 s et affiche une notification système pour chaque nouvelle. */
export function useLiveNotifications(onNew?: (n: any) => void) {
  const seen = useRef<Set<string> | null>(null);
  useEffect(() => {
    let stop = false;
    async function poll() {
      const s = getSession();
      if (!s || s.demo || stop) return;
      try {
        const list = toList(await apiFetch("/notifications"));
        const ids = list.map((n: any) => String(n.id ?? n._id));
        if (seen.current) {
          for (const n of list) {
            const id = String(n.id ?? n._id);
            if (seen.current.has(id) || n.lu || n.read) continue;
            onNew?.(n);
            if ("Notification" in window && Notification.permission === "granted") {
              const title = n.titre ?? n.title ?? "Kids'Med IA";
              const body = n.message ?? n.contenu ?? n.body ?? "";
              const reg = await navigator.serviceWorker?.getRegistration?.().catch(() => undefined);
              if (reg) reg.showNotification(title, { body, icon: "/icon-192.png" });
              else new Notification(title, { body, icon: "/icon-192.png" });
            }
          }
        }
        seen.current = new Set(ids);
      } catch { /* hors ligne ou route absente : on réessaie */ }
    }
    poll();
    const t = setInterval(poll, 20_000);
    return () => { stop = true; clearInterval(t); };
  }, [onNew]);
}

export async function askNotificationPermission(): Promise<NotificationPermission | "unsupported"> {
  if (!("Notification" in window)) return "unsupported";
  if (Notification.permission !== "default") return Notification.permission;
  return Notification.requestPermission();
}
