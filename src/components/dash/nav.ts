import type { LucideIcon } from "lucide-react";
import type { LinkProps } from "@tanstack/react-router";
import {
  LayoutDashboard, Baby, LayoutGrid, Users, NotebookPen, Pill, FileText, ClipboardCheck, MessageSquare, Bell, Star,
  Stethoscope, HeartPulse, Building2, BrainCircuit, ScrollText, UserCog, CreditCard, Tag, ShieldAlert, Bug, LifeBuoy, Database, Network, Link2, Wallet, Sparkles, Lock, Heart, MapPinned, Gauge, FileLock2, DatabaseZap, MailOpen,
} from "lucide-react";
import type { RoleKey } from "@/lib/api";

export interface NavLinkItem { label: string; icon: LucideIcon; to: NonNullable<LinkProps["to"]> }
export interface NavLinkGroup { label: string; items: NavLinkItem[] }

const abo: NavLinkItem = { label: "Mon abonnement", icon: Wallet, to: "/abonnement" };
const com: NavLinkGroup = { label: "Communication", items: [
  { label: "Messagerie", icon: MessageSquare, to: "/messagerie" },
  { label: "Notifications", icon: Bell, to: "/notifications" },
  { label: "Documents & alertes", icon: FileText, to: "/documents" },
  abo,
]};

export const roleNav: Record<RoleKey, NavLinkGroup[]> = {
  creche: [
    { label: "Général", items: [
      { label: "Tableau de bord", icon: LayoutDashboard, to: "/creche" },
      { label: "Enfants", icon: Baby, to: "/enfants" },
      { label: "Sections", icon: LayoutGrid, to: "/sections" },
      { label: "Personnel", icon: Users, to: "/personnel" },
    ]},
    { label: "Quotidien", items: [
      { label: "Transmissions", icon: NotebookPen, to: "/transmissions" },
      { label: "Médicaments", icon: Pill, to: "/medicaments" },
      { label: "Signaler un symptôme (IA)", icon: Sparkles, to: "/analyse-ia" },
      { label: "Documents", icon: FileText, to: "/documents" },
    ]},
    { label: "Annuaires", items: [
      { label: "Médecins", icon: Stethoscope, to: "/medecins" },
      { label: "RSAI", icon: HeartPulse, to: "/rsai-annuaire" },
      { label: "Demandes RSAI", icon: MapPinned, to: "/coordination" },
    ]},
    com,
  ],
  rsai: [
    { label: "Général", items: [
      { label: "Tableau de bord", icon: LayoutDashboard, to: "/rsai" },
      { label: "Mes affectations", icon: MapPinned, to: "/affectations" },
      { label: "Avis & coordination", icon: Star, to: "/coordination" },
      { label: "Enfants", icon: Baby, to: "/enfants" },
      { label: "Médicaments", icon: Pill, to: "/medicaments" },
      { label: "Ordonnances", icon: ScrollText, to: "/ordonnances" },
      { label: "Diagnostics IA", icon: BrainCircuit, to: "/diagnostics" },
      { label: "Signaler un symptôme (IA)", icon: Sparkles, to: "/analyse-ia" },
    ]},
    { label: "Conformité", items: [
      { label: "Documents", icon: FileText, to: "/documents" },
      { label: "Documents obligatoires", icon: ClipboardCheck, to: "/documents-obligatoires" },
      { label: "Médecins", icon: Stethoscope, to: "/medecins" },
    ]},
    com,
  ],
  medecin: [
    { label: "Général", items: [
      { label: "Tableau de bord", icon: LayoutDashboard, to: "/medecin" },
      { label: "Patients", icon: Baby, to: "/enfants" },
      { label: "Ordonnances", icon: ScrollText, to: "/ordonnances" },
      { label: "Diagnostics IA", icon: BrainCircuit, to: "/diagnostics" },
      { label: "Signaler un symptôme (IA)", icon: Sparkles, to: "/analyse-ia" },
      { label: "RSAI", icon: HeartPulse, to: "/rsai-annuaire" },
    ]},
    com,
  ],
  admin: [
    { label: "Général", items: [
      { label: "Tableau de bord", icon: LayoutDashboard, to: "/admin" },
      { label: "Utilisateurs", icon: UserCog, to: "/admin/utilisateurs" },
      { label: "Crèches", icon: Building2, to: "/etablissements" },
      { label: "Enfants", icon: Baby, to: "/enfants" },
      { label: "Liaisons", icon: Link2, to: "/admin/liaisons" },
      { label: "Supervision & RSAI", icon: MapPinned, to: "/coordination" },
      { label: "Médecins", icon: Stethoscope, to: "/medecins" },
      { label: "RSAI", icon: HeartPulse, to: "/rsai-annuaire" },
    ]},
    { label: "Business", items: [
      { label: "Abonnements", icon: CreditCard, to: "/admin/abonnements" },
      { label: "Tarifs", icon: Tag, to: "/admin/tarifs" },
      { label: "Journaux", icon: ShieldAlert, to: "/admin/logs" },
      { label: "Sécurité d'accès", icon: Lock, to: "/admin/securite" },
    ]},
    { label: "Communication", items: com.items.filter((i) => i !== abo) },
  ],
  parent: [
    { label: "Ma famille", items: [
      { label: "Accueil", icon: Heart, to: "/parent" },
      { label: "Mes enfants", icon: Baby, to: "/enfants" },
      { label: "Signaler un symptôme (IA)", icon: Sparkles, to: "/analyse-ia" },
      { label: "Documents", icon: FileText, to: "/documents" },
    ]},
    com,
  ],
  dev: [
    { label: "Console", items: [
      { label: "Tableau de bord", icon: LayoutDashboard, to: "/dev" },
      { label: "Utilisateurs", icon: UserCog, to: "/admin/utilisateurs" },
      { label: "Clés API & messages", icon: Lock, to: "/dev/configuration" },
      { label: "Supervision & RSAI", icon: MapPinned, to: "/coordination" },
      { label: "Performance", icon: Gauge, to: "/dev/performance" },
      { label: "Erreurs", icon: Bug, to: "/dev/erreurs" },
      { label: "Support", icon: LifeBuoy, to: "/dev/support" },
      { label: "Base de données", icon: Database, to: "/dev/base-de-donnees" },
      { label: "Endpoints", icon: Network, to: "/dev/endpoints" },
      { label: "Journaux", icon: ShieldAlert, to: "/admin/logs" },
      { label: "Registre RGPD", icon: FileLock2, to: "/dev/rgpd" },
      { label: "Migrations BDD", icon: DatabaseZap, to: "/migrations" },
      { label: "Templates e-mails", icon: MailOpen, to: "/dev/emails" },
    ]},
    { label: "Communication", items: [{ label: "Notifications", icon: Bell, to: "/notifications" }] },
  ],
};
