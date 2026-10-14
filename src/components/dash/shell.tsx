import { useEffect, useState, type ReactNode } from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import type { LucideIcon } from "lucide-react";
import { Bell, ListChecks, LogOut, Search, ChevronsUpDown } from "lucide-react";
import {
  Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader,
  SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarProvider, SidebarTrigger, useSidebar,
} from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import logo from "@/assets/logo.png.asset.json";
import { getSession, logout, roleToKey, SECURITY_EVENT, type RoleKey, type Session, type SecurityBlock } from "@/lib/api";
import { SecurityBlockedScreen } from "./security-blocked";
import { missingSpecs } from "@/lib/specs";
import { useApiOrDemo } from "@/lib/use-api";
import { specs } from "@/lib/specs";
import { TicketButton, UserAvatar, useSessionUser } from "./beta";
import { InstallQrButton } from "@/components/pwa/install";

export const roleLabels: Record<RoleKey, string> = { creche: "Crèche", rsai: "RSAI", medecin: "Médecin", admin: "Administration", dev: "Développeur", parent: "Parent" };
export const roleHome: Record<RoleKey, "/creche" | "/rsai" | "/medecin" | "/admin" | "/dev" | "/parent"> = { parent: "/parent", creche: "/creche", rsai: "/rsai", medecin: "/medecin", admin: "/admin", dev: "/dev" };

export interface NavGroup { label: string; items: { label: string; icon: LucideIcon; anchor: string; badge?: string }[] }
import { roleNav } from "./nav";

function NavSidebar({ role, session }: { role: RoleKey; session: Session }) {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const groups = roleNav[role];
  const missingCount = missingSpecs().filter((s) => s.roles.includes(role)).length;
  return (
    <Sidebar collapsible="icon">
      <SidebarHeader className="border-b px-3 py-4">
        <Link to={roleHome[role]} className="flex items-center gap-2">
          <img src={logo.url} alt="Kids'Med IA" className="h-9 w-9 shrink-0 rounded-lg bg-card object-cover object-top" />
          {!collapsed && <span className="font-display text-lg font-bold"><span className="text-brand-blue">Kids'</span><span className="text-brand-green">Med</span><span className="text-brand-pink">IA</span></span>}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        {groups.map((g) => (
          <SidebarGroup key={g.label}>
            <SidebarGroupLabel className="uppercase tracking-wider">{g.label}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {g.items.map((it) => (
                  <SidebarMenuItem key={it.to}>
                    <SidebarMenuButton asChild tooltip={it.label}>
                      <Link to={it.to} activeOptions={{ exact: true }} activeProps={{ className: "bg-sidebar-accent font-medium text-sidebar-accent-foreground" }}>
                        <it.icon className="h-4 w-4" />
                        <span className="flex-1">{it.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
        {role !== "admin" && <SidebarGroup>
          <SidebarGroupLabel className="uppercase tracking-wider">Développement</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild tooltip="Routes manquantes">
                  <Link to="/routes-manquantes">
                    <ListChecks className="h-4 w-4" />
                    <span className="flex-1">Routes manquantes</span>
                    {!collapsed && <span className="rounded-md bg-warning/25 px-1.5 text-xs font-semibold">{missingCount}</span>}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>}
      </SidebarContent>
      <SidebarFooter className="p-3">
        {!collapsed && (
          <Link to="/profil" className="flex items-center gap-3 rounded-xl bg-sidebar-accent p-3">
            <span className="grid h-9 w-9 place-items-center rounded-lg bg-sidebar-primary text-sm font-bold text-sidebar-primary-foreground">
              {roleLabels[role][0]}
            </span>
            <div className="min-w-0 flex-1 text-sm">
              <p className="text-xs text-muted-foreground">Mon profil</p>
              <p className="truncate font-medium">{roleLabels[role]}{session.demo ? " · démo" : ""}</p>
            </div>
            <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
          </Link>
        )}
        {!collapsed && <p className="pt-2 text-center text-xs text-muted-foreground">© 2026 Kids'Med IA · DataFuse</p>}
      </SidebarFooter>
    </Sidebar>
  );
}

function NotifBell() {
  const r = useApiOrDemo<{ count?: number } | number>(specs.notifUnread, { count: 3 });
  const n = typeof r.data === "number" ? r.data : r.data?.count ?? 0;
  return (
    <Button variant="ghost" size="icon" className="relative" aria-label="Notifications" asChild><Link to="/notifications">
      <Bell className="h-4 w-4" />
      {n > 0 && <span className="absolute -right-0.5 -top-0.5 grid h-4 min-w-4 place-items-center rounded-full bg-primary px-1 text-[10px] font-bold text-primary-foreground">{n}</span>}
    </Link></Button>
  );
}

export function DashboardShell({ role: forced, title, actions, children }: { role?: RoleKey | undefined; title: string; groups?: NavGroup[]; actions?: ReactNode; children: ReactNode }) {
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [session, setS] = useState<Session | null>(null);
  const liveUser = useSessionUser();
  const [block, setBlock] = useState<SecurityBlock | null>(null);
  useEffect(() => {
    const on = (e: Event) => setBlock((e as CustomEvent<SecurityBlock>).detail);
    window.addEventListener(SECURITY_EVENT, on);
    return () => window.removeEventListener(SECURITY_EVENT, on);
  }, []);

  useEffect(() => {
    const s = getSession();
    if (!s) { navigate({ to: "/connexion", replace: true }); return; }
    const own = roleToKey(s.user.role);
    if (forced && !s.demo && own !== forced) { navigate({ to: own ? roleHome[own] : "/connexion", replace: true }); return; }
    setS(s);
  }, [forced, navigate]);

  const role: RoleKey = forced ?? roleToKey(session?.user.role) ?? "admin";
  if (!session) return <div data-theme={role} className="min-h-screen bg-background" />;

  const doLogout = async () => { await qc.cancelQueries(); qc.clear(); await logout(); navigate({ to: "/connexion", replace: true }); };
  if (block) return <div data-theme={role} className="min-h-screen bg-background"><SecurityBlockedScreen block={block} onRetry={() => { setBlock(null); qc.invalidateQueries(); }} onLogout={doLogout} /></div>;

  const name = [session.user.prenom, session.user.nom].filter(Boolean).join(" ") || session.user.email || "Utilisateur";

  return (
    <div data-theme={role} className="min-h-screen bg-background text-foreground">
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <NavSidebar role={role} session={session} />
          <div className="flex min-w-0 flex-1 flex-col">
            <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b bg-background/85 px-4 backdrop-blur md:px-6">
              <SidebarTrigger />
              <div className="hidden max-w-sm flex-1 items-center gap-2 rounded-lg border bg-card px-3 py-2 text-sm text-muted-foreground sm:flex">
                <Search className="h-4 w-4" /> <span className="flex-1">Rechercher</span><kbd className="text-xs">⌘ K</kbd>
              </div>
              <div className="ml-auto flex items-center gap-2">
                <InstallQrButton className="hidden md:inline-flex" />
                <TicketButton />
                <NotifBell />
                <div className="hidden items-center gap-3 border-l pl-3 sm:flex">
                  <UserAvatar user={liveUser ?? session.user} />
                  <div className="text-sm leading-tight">
                    <p className="font-medium">{name}</p>
                    <p className="text-xs text-muted-foreground">{roleLabels[role]}</p>
                  </div>
                </div>
                <Button variant="ghost" size="icon" aria-label="Déconnexion" onClick={async () => {
                  await qc.cancelQueries(); qc.clear(); await logout(); navigate({ to: "/connexion", replace: true });
                }}><LogOut className="h-4 w-4" /></Button>
              </div>
            </header>
            <main className="flex-1 space-y-6 p-4 md:p-8">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <h1 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">{title}</h1>
                  <p className="text-sm text-muted-foreground">{new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" })}</p>
                </div>
                {actions}
              </div>
              {children}
            </main>
          </div>
        </div>
      </SidebarProvider>
    </div>
  );
}
