import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ArrowLeft } from "lucide-react";
import { MarketingLayout, PageHero } from "./layout";

export function LegalPage({
  title,
  description,
  updated,
  children,
}: {
  title: string;
  description: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <MarketingLayout>
      <PageHero eyebrow="Informations légales" title={title} lead={description}>
        <div className="flex flex-wrap items-center gap-4 text-xs text-white/45">
          <Link
            to="/"
            className="inline-flex items-center gap-1.5 font-medium text-white/70 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour à l’accueil
          </Link>
          <span>Dernière mise à jour : {updated}</span>
        </div>
      </PageHero>
      <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 lg:px-8 lg:py-20">
        <article className="space-y-7 rounded-[2rem] border border-black/10 bg-white p-6 text-sm leading-relaxed text-[#5a6070] shadow-sm sm:p-10 [&_a]:font-medium [&_a]:text-[#2f6bff] [&_a]:underline [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_h2]:text-[#0b1020] [&_h3]:font-semibold [&_h3]:text-[#0b1020] [&_li]:ml-5 [&_li]:list-disc [&_strong]:text-[#0b1020] [&_ul]:space-y-2">
          {children}
        </article>
      </div>
    </MarketingLayout>
  );
}
