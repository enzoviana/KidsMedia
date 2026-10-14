import { useEffect, useState } from "react";
import { qrDataUrl } from "@/lib/qr";
import { Baby, Copy, RefreshCw, Link2, ScanLine, UserPlus, Trash2, Users } from "lucide-react";
import { QrScanner } from "./qr-scanner";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { FormDialog, ConfirmDialog } from "./crud";
import { Pill, fullName } from "./widgets";
import { send } from "@/lib/mutate";
import { useNavigate } from "@tanstack/react-router";

const randCode = (p: string) => `${(p || "ENF").slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;

/** Bouton « Scanner un QR code » par caméra (crèche, médecin, RSAI). */
export function ScanQrButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><ScanLine className="mr-1 h-4 w-4" />Scanner un QR code</Button>
      {open && <QrScanner onClose={() => setOpen(false)} onChild={(id) => navigate({ to: "/enfants/$enfantId", params: { enfantId: id } })} />}
    </>
  );
}

/** Formulaire « Déclarer un enfant » (parent). */
export function DeclarerEnfantButton({ onCreated }: { onCreated?: () => void }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <Button onClick={() => setOpen(true)}><Baby className="mr-1 h-4 w-4" />Déclarer un enfant</Button>
      <FormDialog open={open} onOpenChange={setOpen} title="Déclarer un enfant" description="Créez le dossier de votre enfant. Vous pourrez ensuite partager son code avec la crèche et le médecin."
        fields={[
          { name: "prenom", label: "Prénom", required: true }, { name: "nom", label: "Nom", required: true },
          { name: "dateNaissance", label: "Date de naissance", type: "date", required: true },
          { name: "allergies", label: "Allergies (séparées par des virgules)" },
        ]} submitLabel="Créer le dossier"
        onSubmit={async (v) => {
          try {
            const allergies = String(v.allergies ?? "").split(",").map((s) => s.trim()).filter(Boolean);
            const r = await send("POST", "/enfants", { prenom: v.prenom, nom: v.nom, dateNaissance: v.dateNaissance, allergies });
            toast.success(r.demo ? "Enfant déclaré (mode démo)" : "Dossier de l'enfant créé"); onCreated?.();
          } catch (e) { toast.error((e as Error).message); throw e; }
        }} />
    </>
  );
}

/** Bouton « Lier un enfant avec un code » (médecin, crèche, parent). */
export function LierCodeButton() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  return (
    <>
      <Button variant="outline" onClick={() => setOpen(true)}><Link2 className="mr-1 h-4 w-4" />Lier avec un code</Button>
      <FormDialog open={open} onOpenChange={setOpen} title="Lier un enfant" description="Saisissez le code de liaison partagé par la crèche, l'administrateur ou les parents."
        fields={[{ name: "code", label: "Code de liaison (ex. LEA-4821)", required: true }]} submitLabel="Lier"
        onSubmit={async (v) => {
          try {
            const r = await send<any>("POST", "/enfants/lier-code", { code: String(v.code).trim().toUpperCase() });
            toast.success(r.demo ? "Enfant lié (mode démo)" : "Enfant lié à votre compte");
            const id = r.demo ? `demo-${String(v.code).slice(0, 3).toLowerCase()}` : r.data?._id ?? r.data?.enfant?._id;
            if (id) navigate({ to: "/enfants/$enfantId", params: { enfantId: id } });
          } catch (e) { toast.error((e as Error).message); throw e; }
        }} />
    </>
  );
}

export interface Lien { _id?: string; user: { prenom?: string; nom?: string; email?: string }; role: string; acces?: string }

/** Encart Liaison & Accès sur le dossier enfant. */
export function LiaisonPanel({ enfantId, code: initialCode, prenom, liens: initialLiens }: { enfantId: string; code?: string; prenom?: string; liens: Lien[] }) {
  const [code, setCode] = useState(initialCode ?? randCode(prenom ?? ""));
  const [qr, setQr] = useState("");
  const [liens, setLiens] = useState<Lien[]>(initialLiens);
  const [adding, setAdding] = useState(false);
  const [revoke, setRevoke] = useState<Lien | null>(null);
  useEffect(() => { setCode(initialCode ?? randCode(prenom ?? "")); }, [initialCode, prenom]);
  useEffect(() => { setLiens(initialLiens); }, [initialLiens.length]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    try { setQr(qrDataUrl(`kidsmed://lier/${code}`, 180)); } catch { setQr(""); }
  }, [code]);

  async function regen() {
    try {
      const r = await send<any>("POST", `/enfants/${enfantId}/regenerer-code`);
      setCode(r.data?.code ?? randCode(prenom ?? ""));
      toast.success(r.demo ? "Nouveau code généré (mode démo)" : "Nouveau code généré — l'ancien n'est plus valable");
    } catch (e) { toast.error((e as Error).message); }
  }

  return (
    <div className="grid gap-4 md:grid-cols-[auto_1fr]">
      <div className="flex flex-col items-center gap-2 rounded-xl bg-muted/50 p-4">
        {qr ? <img src={qr} alt={`QR code ${code}`} className="h-36 w-36 rounded-lg bg-card p-1" /> : <div className="h-36 w-36" />}
        <p className="font-mono text-xl font-bold tracking-wider">{code}</p>
        <div className="flex gap-1">
          <Button size="sm" variant="outline" onClick={() => { navigator.clipboard?.writeText(code); toast.success("Code copié"); }}><Copy className="mr-1 h-3.5 w-3.5" />Copier</Button>
          <Button size="sm" variant="outline" onClick={regen}><RefreshCw className="mr-1 h-3.5 w-3.5" />Régénérer</Button>
        </div>
      </div>
      <div>
        <div className="mb-2 flex items-center justify-between">
          <p className="flex items-center gap-1.5 text-sm font-medium"><Users className="h-4 w-4" />Personnes liées ({liens.length})</p>
          <Button size="sm" onClick={() => setAdding(true)}><UserPlus className="mr-1 h-3.5 w-3.5" />Lier quelqu'un</Button>
        </div>
        <ul className="divide-y text-sm">
          {liens.map((l, i) => (
            <li key={l._id ?? i} className="flex items-center justify-between gap-2 py-2">
              <div className="min-w-0"><p className="truncate font-medium">{fullName(l.user)}</p><p className="truncate text-xs text-muted-foreground">{l.user.email}</p></div>
              <div className="flex items-center gap-2"><Pill tone={l.role === "parent" ? "success" : "default"}>{l.role}</Pill>
                <Button size="icon" variant="ghost" className="h-7 w-7 text-destructive" title="Révoquer" onClick={() => setRevoke(l)}><Trash2 className="h-3.5 w-3.5" /></Button></div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted-foreground">Partagez ce code ou ce QR code aux parents et au médecin : une fois saisi dans leur espace, le dossier circule entre la crèche, la famille et le médecin.</p>
      </div>
      <FormDialog open={adding} onOpenChange={setAdding} title="Lier une personne à cet enfant"
        fields={[{ name: "email", label: "E-mail de la personne", type: "email", required: true }, { name: "role", label: "Rôle", type: "select", options: ["parent", "medecin", "rsai", "creche"], required: true }]}
        submitLabel="Lier" onSubmit={async (v) => {
          try {
            const r = await send<any>("POST", "/liaisons", { enfant: enfantId, email: v.email, role: v.role });
            setLiens((x) => [...x, { _id: r.data?._id ?? `local-${Date.now()}`, user: { email: String(v.email), prenom: String(v.email).split("@")[0] ?? "" }, role: String(v.role) }]);
            toast.success(r.demo ? "Personne liée (mode démo)" : "Personne liée");
          } catch (e) { toast.error((e as Error).message); throw e; }
        }} />
      <ConfirmDialog open={!!revoke} onOpenChange={(o) => !o && setRevoke(null)} title="Révoquer l'accès ?" description={`${fullName(revoke?.user)} n'aura plus accès au dossier.`} label="Révoquer"
        onConfirm={async () => {
          if (!revoke) return;
          try {
            const r = await send("DELETE", `/liaisons/${revoke._id}`);
            setLiens((x) => x.filter((l) => l !== revoke));
            toast.success(r.demo ? "Accès révoqué (mode démo)" : "Accès révoqué");
          } catch (e) { toast.error((e as Error).message); }
        }} />
    </div>
  );
}

