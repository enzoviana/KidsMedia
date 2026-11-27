import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AlertTriangle, Droplets, HeartPulse, Phone, Pill, Printer, ShieldAlert, UserRound } from "lucide-react";
import { API_BASE } from "@/lib/api";
import { SOS_MAX_SCANS, sosExpiresLabel } from "@/lib/sos";

export const Route = createFileRoute("/urgence/$code")({
  head: () => ({
    meta: [
      { title: "Fiche d'urgence — Kids'Med IA" },
      { name: "description", content: "Données médicales vitales d'un enfant, accessibles en scannant son QR code d'urgence." },
      { name: "robots", content: "noindex, nofollow" },
      { property: "og:title", content: "Fiche d'urgence — Kids'Med IA" },
      { property: "og:type", content: "website" },
    ],
  }),
  component: Page,
});

interface UrgenceData {
  enfant: {
    id: string;
    prenom: string;
    nom: string;
    dateNaissance?: string | null;
    sexe?: string | null;
    groupeSanguin?: string | null;
    allergies?: string[];
    antecedents?: string[];
    pai?: boolean;
    photoUrl?: string | null;
  };
  etablissement?: { nom?: string; telephone?: string | null; adresse?: string | null; codePostal?: string | null; ville?: string | null } | null;
  proches?: { prenom?: string; nom?: string; role?: string; telephone?: string | null }[];
  traitements?: { nom: string; posologie?: string | null; horaires?: string[]; dateFin?: string | null }[];
  misAJour?: string;
  sos?: { id?: string; motif?: string | null; maxScans?: number; dureeHeures?: number; scansUtilises?: number; scansRestants?: number; expiresAt?: string | null } | null;
}

const fmtDate = (v?: string | null) => {
  if (!v) return "—";
  const d = new Date(v);
  return Number.isNaN(d.getTime()) ? "—" : d.toLocaleDateString("fr-FR");
};

const age = (v?: string | null) => {
  if (!v) return "";
  const d = new Date(v);
  if (Number.isNaN(d.getTime())) return "";
  const mois = Math.max(0, Math.floor((Date.now() - d.getTime()) / (30.4375 * 864e5)));
  if (mois < 24) return `${mois} mois`;
  return `${Math.floor(mois / 12)} ans`;
};

const tel = (v?: string | null) => (v ? v.replace(/[^\d+]/g, "") : "");
const absolute = (url?: string | null) => (!url ? "" : url.startsWith("http") ? url : `${API_BASE.replace(/\/api$/, "")}${url}`);

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 border-b py-2 text-sm last:border-0">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value}</span>
    </div>
  );
}

function Page() {
  const { code } = Route.useParams();
  const [data, setData] = useState<UrgenceData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const r = await fetch(`${API_BASE}/urgence/${encodeURIComponent(code)}`);
        const j = await r.json().catch(() => ({}));
        if (!r.ok || j?.success === false) throw new Error(j?.error ?? j?.message ?? "Fiche d'urgence introuvable.");
        if (alive) setData(j.data as UrgenceData);
      } catch (e) {
        if (alive) setError((e as Error).message);
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => { alive = false; };
  }, [code]);

  const e = data?.enfant;
  const parentTel = data?.proches?.find((p) => p.role === "parent" && tel(p.telephone))?.telephone;
  const medecin = data?.proches?.find((p) => p.role === "medecin");

  return (
    <main className="min-h-dvh bg-muted/40 px-3 py-5 text-foreground print:bg-white print:p-0">
      <div className="mx-auto max-w-lg space-y-3">
        <header className="rounded-2xl bg-destructive px-4 py-3 text-destructive-foreground shadow-sm print:shadow-none">
          <p className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider"><ShieldAlert className="h-4 w-4" />Fiche d'urgence médicale</p>
          <h1 className="mt-1 font-display text-2xl font-bold">{loading ? "Chargement…" : e ? `${e.prenom} ${e.nom}` : "Dossier indisponible"}</h1>
          {e?.dateNaissance && <p className="text-sm opacity-90">Né(e) le {fmtDate(e.dateNaissance)}{age(e.dateNaissance) ? ` · ${age(e.dateNaissance)}` : ""}</p>}
        </header>

        {loading && <section className="rounded-2xl border bg-card p-4 text-sm text-muted-foreground">Lecture du dossier…</section>}

        {!loading && error && (
          <section className="rounded-2xl border border-destructive/30 bg-card p-4">
            <p className="flex items-center gap-2 font-semibold text-destructive"><AlertTriangle className="h-4 w-4" />{error}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Vérifiez que le QR code est complet et qu'il provient bien de Kids'Med IA. En cas d'urgence vitale, appelez immédiatement le 15.
            </p>
            <a href="tel:15" className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-destructive px-4 py-3 font-bold text-destructive-foreground">
              <Phone className="h-5 w-5" />Appeler le 15
            </a>
          </section>
        )}

        {!loading && data && e && (
          <>
            {data.sos && (
              <section className="rounded-2xl border-2 border-warning bg-warning/10 p-3 text-sm">
                <p className="font-semibold">Fenêtre SOS active{data.sos.motif ? ` · ${data.sos.motif}` : ""}</p>
                <p className="mt-1">{data.sos.scansUtilises ?? 0}/{data.sos.maxScans ?? SOS_MAX_SCANS} scans utilisés · expire le {sosExpiresLabel(data.sos.expiresAt)}</p>
                <p className="mt-1 text-xs text-muted-foreground">Partage limité à {data.sos.maxScans ?? SOS_MAX_SCANS} scans pendant {data.sos.dureeHeures ?? 5} h. Chaque accès est tracé.</p>
              </section>
            )}
            <div className="grid grid-cols-2 gap-2 print:hidden">
              <a href="tel:15" className="flex items-center justify-center gap-2 rounded-xl bg-destructive px-3 py-3 text-sm font-bold text-destructive-foreground"><Phone className="h-4 w-4" />Appeler le 15</a>
              {parentTel
                ? <a href={`tel:${tel(parentTel)}`} className="flex items-center justify-center gap-2 rounded-xl bg-primary px-3 py-3 text-sm font-bold text-primary-foreground"><Phone className="h-4 w-4" />Appeler le parent</a>
                : <span className="flex items-center justify-center gap-2 rounded-xl border bg-card px-3 py-3 text-sm text-muted-foreground">Aucun numéro parent</span>}
            </div>

            {(e.allergies ?? []).length > 0 && (
              <section className="rounded-2xl border-2 border-destructive bg-destructive/10 p-4">
                <p className="flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-destructive"><AlertTriangle className="h-4 w-4" />Allergies</p>
                <p className="mt-1 text-lg font-semibold">{e.allergies?.join(", ")}</p>
              </section>
            )}

            <section className="rounded-2xl border bg-card p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Droplets className="h-3.5 w-3.5" />Données vitales</p>
              <Row label="Groupe sanguin" value={e.groupeSanguin || "—"} />
              <Row label="PAI" value={e.pai ? "Oui" : "Non"} />
              <Row label="Antécédents" value={(e.antecedents ?? []).join(", ") || "—"} />
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><Pill className="h-3.5 w-3.5" />Traitements en cours</p>
              {(data.traitements ?? []).length
                ? data.traitements!.map((t, i) => <Row key={i} label={t.nom} value={[t.posologie, ...(t.horaires ?? [])].filter(Boolean).join(" · ") || "—"} />)
                : <p className="py-2 text-sm text-muted-foreground">Aucun traitement en cours.</p>}
            </section>

            <section className="rounded-2xl border bg-card p-4">
              <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><UserRound className="h-3.5 w-3.5" />Contacts</p>
              {(data.proches ?? []).length
                ? data.proches!.map((p, i) => (
                    <Row key={i} label={`${p.prenom ?? ""} ${p.nom ?? ""}`.trim() || (p.role === "medecin" ? "Médecin" : "Contact")}
                      value={p.telephone ? <a className="text-primary underline" href={`tel:${tel(p.telephone)}`}>{p.telephone}</a> : "—"} />
                  ))
                : <p className="py-2 text-sm text-muted-foreground">Aucun contact renseigné.</p>}
            </section>

            {data.etablissement?.nom && (
              <section className="rounded-2xl border bg-card p-4">
                <p className="mb-1 flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground"><HeartPulse className="h-3.5 w-3.5" />Crèche</p>
                <Row label={data.etablissement.nom} value={data.etablissement.telephone ? <a className="text-primary underline" href={`tel:${tel(data.etablissement.telephone)}`}>{data.etablissement.telephone}</a> : "—"} />
                {(data.etablissement.adresse || data.etablissement.ville) && <Row label="Adresse" value={[data.etablissement.adresse, data.etablissement.codePostal, data.etablissement.ville].filter(Boolean).join(" ")} />}
              </section>
            )}

            {medecin?.telephone && <p className="text-center text-sm">Médecin : {medecin.prenom} {medecin.nom} · <a className="text-primary underline" href={`tel:${tel(medecin.telephone)}`}>{medecin.telephone}</a></p>}

            <div className="flex items-center justify-between text-xs text-muted-foreground print:mt-4">
              <span>Mis à jour le {fmtDate(data.misAJour)} · code {code}</span>
              <button type="button" onClick={() => window.print()} className="flex items-center gap-1 underline print:hidden"><Printer className="h-3.5 w-3.5" />Imprimer</button>
            </div>
            <p className="pb-4 text-center text-[11px] text-muted-foreground">
              Fiche générée par Kids'Med IA via le QR code d'urgence. Elle ne remplace pas un avis médical.
            </p>
          </>
        )}
      </div>
    </main>
  );
}
