import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { UserCog, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { ListPage, type Col } from "@/components/dash/list-page";
import { type Crud } from "@/components/dash/crud";
import { Pill, fullName } from "@/components/dash/widgets";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { specs } from "@/lib/specs";
import { send } from "@/lib/mutate";
import { getSession, roleToKey } from "@/lib/api";

export const Route = createFileRoute("/admin/utilisateurs")({
  head: () => ({
    meta: [
      { title: "Utilisateurs — Kids'Med IA" },
      { name: "description", content: "Créer, modifier, suspendre et supprimer les comptes de la plateforme." },
      { property: "og:title", content: "Utilisateurs — Kids'Med IA" },
      { property: "og:description", content: "Gestion de tous les comptes de la plateforme." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

const demo: any[] = [{_id:"u1",prenom:"Inès",nom:"Moreau",email:"ines@soleils.fr",role:"creche",actif:true},{_id:"u2",prenom:"Nadia",nom:"Roux",email:"n.roux@exemple.fr",role:"rsai",actif:true},{_id:"u3",prenom:"Claire",nom:"Moreau",email:"c.moreau@exemple.fr",role:"medecin",actif:true},{_id:"u4",prenom:"Enzo",nom:"Admin",email:"enzo@kidsmed.fr",role:"admin",actif:true},{_id:"u5",prenom:"Paul",nom:"Girard",email:"paul@exemple.fr",role:"parent",actif:false}];
const isActive = (r: any) => !(r.actif === false || r.isActive === false);

function Actions({ r }: { r: any }) {
  const qc = useQueryClient();
  const [on, setOn] = useState(isActive(r));
  const me = getSession()?.user;
  const self = (me as any)?._id === r._id || (me as any)?.id === r._id;
  const protectedDev = ["developpeur", "dev", "developer"].includes(r.role) && roleToKey(me?.role) !== "dev";
  const id = String(r._id ?? r.id);
  return (
    <span className="flex items-center justify-end gap-2" onClick={(e) => e.stopPropagation()}>
      <Switch checked={on} disabled={self || protectedDev} aria-label={on ? "Suspendre le compte" : "Réactiver le compte"} onCheckedChange={async (v) => {
        setOn(v);
        try { const res = await send("PATCH", `/users/${id}/status`, { actif: v, isActive: v }); toast.success(`${v ? "Compte réactivé" : "Compte suspendu"}${res.demo ? " (démo)" : ""}`); qc.invalidateQueries({ queryKey: ["api", "users"] }); }
        catch (e) { setOn(!v); toast.error((e as Error).message); }
      }} />
      <Button size="sm" variant="ghost" disabled={protectedDev} title="Envoyer un nouveau mot de passe" onClick={async () => {
        try { const res = await send("POST", specs.userResetPwd.path, {}, { userId: id }); toast.success(`Nouveau mot de passe envoyé à ${r.email}${res.demo ? " (démo)" : ""}`); }
        catch (e) { toast.error((e as Error).message); }
      }}><KeyRound className="h-4 w-4" /></Button>
    </span>
  );
}

const cols: Col[] = [
  { label: "Nom", render: (r) => <span className="font-medium">{fullName(r)}</span> },
  { label: "Email", render: (r) => r.email },
  { label: "Rôle", render: (r) => <Pill>{r.role}</Pill> },
  { label: "Statut", render: (r) => <Pill tone={isActive(r) ? "success" : "danger"}>{isActive(r) ? "Actif" : "Suspendu"}</Pill> },
  { label: "Suspendre · MDP", render: (r) => <Actions r={r} /> },
];

function Page() {
  const dev = roleToKey(getSession()?.user.role) === "dev";
  const roles = ["creche", "rsai", "medecin", "parent", "admin", ...(dev ? ["developpeur"] : [])];
  const crud: Crud = { entity: "un utilisateur", base: "/users", fields: [
    { name: "prenom", label: "Prénom", type: "text", required: true },
    { name: "nom", label: "Nom", type: "text", required: true },
    { name: "email", label: "E-mail", type: "email", required: true },
    { name: "role", label: "Rôle", type: "select", required: true, options: roles },
    { name: "telephone", label: "Téléphone (SMS)", type: "tel" },
    { name: "etablissementId", label: "Crèche (comptes crèche)", lookup: "etablissement" },
  ] } as Crud;
  return <ListPage crud={crud} title={dev ? "Utilisateurs — accès complet" : "Utilisateurs"} spec={specs.users} demo={demo} cols={cols} icon={UserCog} />;
}
