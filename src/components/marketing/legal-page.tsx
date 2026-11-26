import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MarketingLayout } from "./layout";

export function LegalPage({ title, description, updated, children }: { title: string; description: string; updated: string; children: ReactNode }) {
  return (
    <MarketingLayout>
      <section className="border-b bg-card/50">
        <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8">
          <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground"><ArrowLeft className="h-4 w-4" />Retour à l'accueil</Link>
          <h1 className="mt-5 font-display text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
          <p className="mt-3 text-muted-foreground">{description}</p>
          <p className="mt-3 text-xs text-muted-foreground">Dernière mise à jour : {updated}</p>
        </div>
      </section>
      <article className="mx-auto max-w-3xl space-y-7 px-4 py-14 text-sm leading-relaxed text-muted-foreground sm:px-6 lg:px-8 [&_a]:font-medium [&_a]:text-brand-blue [&_a]:underline [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h3]:font-semibold [&_h3]:text-foreground [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-foreground [&_ul]:space-y-2">
        {children}
      </article>
    </MarketingLayout>
  );
}
