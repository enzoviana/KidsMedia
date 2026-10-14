import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Copy, Download, Mail, Monitor, Smartphone, Code2 } from "lucide-react";
import { toast } from "sonner";
import { DashboardShell } from "@/components/dash/shell";
import { Panel } from "@/components/dash/widgets";
import { Button } from "@/components/ui/button";
import { emailTemplates, fillSample } from "@/lib/email-templates";

export const Route = createFileRoute("/dev/emails")({
  head: () => ({
    meta: [
      { title: "Templates d'e-mails — Kids'Med IA" },
      { name: "description", content: "Prévisualisez et téléchargez les templates HTML des e-mails transactionnels de la plateforme." },
      { property: "og:title", content: "Templates d'e-mails — Kids'Med IA" },
      { property: "og:description", content: "Templates HTML prêts à intégrer au backend." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Page,
});

function download(name: string, html: string) {
  const url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
  const a = document.createElement("a");
  a.href = url; a.download = name; a.click();
  URL.revokeObjectURL(url);
}

function Page() {
  const [id, setId] = useState(emailTemplates[0]!.id);
  const [vue, setVue] = useState<"desktop" | "mobile" | "code">("desktop");
  const tpl = emailTemplates.find((e) => e.id === id)!;
  const preview = useMemo(() => fillSample(tpl.html, tpl.variables), [tpl]);
  const cats = [...new Set(emailTemplates.map((e) => e.categorie))];

  const downloadAll = () => emailTemplates.forEach((e, i) => setTimeout(() => download(`${e.id}.html`, e.html), i * 250));

  return (
    <DashboardShell title="Templates d'e-mails" actions={<Button variant="outline" onClick={downloadAll}><Download className="mr-1 h-4 w-4" />Tout télécharger ({emailTemplates.length})</Button>}>
      <div className="grid gap-4 lg:grid-cols-[280px_1fr]">
        <Panel title="Templates" icon={Mail}>
          <div className="space-y-4">
            {cats.map((c) => (
              <div key={c}>
                <p className="mb-1 text-xs font-semibold uppercase text-muted-foreground">{c}</p>
                {emailTemplates.filter((e) => e.categorie === c).map((e) => (
                  <button key={e.id} onClick={() => setId(e.id)}
                    className={`block w-full rounded-md px-2 py-1.5 text-left text-sm ${e.id === id ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {e.nom}
                  </button>
                ))}
              </div>
            ))}
          </div>
        </Panel>
        <div className="space-y-4">
          <Panel title={tpl.nom} icon={Mail} actions={
            <div className="flex flex-wrap gap-2">
              <Button size="sm" variant={vue === "desktop" ? "default" : "outline"} onClick={() => setVue("desktop")}><Monitor className="h-4 w-4" /></Button>
              <Button size="sm" variant={vue === "mobile" ? "default" : "outline"} onClick={() => setVue("mobile")}><Smartphone className="h-4 w-4" /></Button>
              <Button size="sm" variant={vue === "code" ? "default" : "outline"} onClick={() => setVue("code")}><Code2 className="h-4 w-4" /></Button>
              <Button size="sm" variant="outline" onClick={() => { void navigator.clipboard.writeText(tpl.html); toast.success("HTML copié"); }}><Copy className="mr-1 h-4 w-4" />Copier</Button>
              <Button size="sm" onClick={() => download(`${tpl.id}.html`, tpl.html)}><Download className="mr-1 h-4 w-4" />Télécharger .html</Button>
            </div>
          }>
            <div className="mb-3 grid gap-1 text-sm sm:grid-cols-3">
              <p><span className="text-muted-foreground">Objet : </span>{tpl.sujet}</p>
              <p><span className="text-muted-foreground">Pour : </span>{tpl.destinataires}</p>
              <p><span className="text-muted-foreground">Déclencheur : </span><code className="text-xs">{tpl.declencheur}</code></p>
            </div>
            {vue === "code" ? (
              <pre className="max-h-[640px] overflow-auto rounded-md bg-muted p-3 text-xs">{tpl.html}</pre>
            ) : (
              <div className="flex justify-center rounded-md bg-muted p-3">
                <iframe title="Aperçu" srcDoc={preview} sandbox="" className="h-[640px] rounded border bg-background" style={{ width: vue === "mobile" ? 375 : "100%" }} />
              </div>
            )}
          </Panel>
          <Panel title="Variables à fournir par le backend">
            <table className="w-full text-sm">
              <tbody>
                {Object.entries(tpl.variables).map(([k, v]) => (
                  <tr key={k} className="border-b last:border-0">
                    <td className="py-1.5 pr-4"><code className="text-xs">{`{{${k}}}`}</code></td>
                    <td className="py-1.5 text-muted-foreground">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Panel>
        </div>
      </div>
    </DashboardShell>
  );
}
