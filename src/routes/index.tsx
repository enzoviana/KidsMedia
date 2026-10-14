import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getSession, roleToKey } from "@/lib/api";
import { roleHome } from "@/components/dash/shell";
import { isStandalone } from "@/components/pwa/install";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Kids'Med IA — Accueil" },
      { name: "description", content: "Accès aux tableaux de bord Kids'Med IA." },
      { property: "og:title", content: "Kids'Med IA — Accueil" },
      { property: "og:description", content: "Accès aux tableaux de bord Kids'Med IA." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    if (isStandalone()) { navigate({ to: "/app", replace: true }); return; }
    const s = getSession();
    const k = s && !s.demo ? roleToKey(s.user.role) : null;
    navigate({ to: k ? roleHome[k] : "/connexion", replace: true });
  }, [navigate]);
  return <div className="min-h-screen bg-background" />;
}
