/** URL publique canonique du site (surchargeable via VITE_SITE_URL). */
export const SITE_URL = (
  (import.meta.env["VITE_SITE_URL"] as string | undefined) ?? "https://kidsmedia.vercel.app"
).replace(/\/+$/, "");

export const SITE_NAME = "Kids'Med IA";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/icon-512.png`;
export const DEFAULT_DESCRIPTION =
  "Kids'Med IA réunit crèches, RSAI, médecins et parents autour d'un dossier de santé partagé, sécurisé et conforme RGPD, avec une aide au signalement des symptômes.";

export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//i.test(path)) return path;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

export type SeoInput = {
  title: string;
  description: string;
  path: string;
  image?: string;
  type?: "website" | "article";
  noindex?: boolean;
  keywords?: string[];
};

/**
 * Métadonnées communes à toutes les pages publiques : canonical, Open Graph,
 * Twitter Cards et robots. Les données structurées JSON-LD sont ajoutées dans
 * le corps de page via <JsonLd />.
 */
export function seoHead({
  title,
  description,
  path,
  image = DEFAULT_OG_IMAGE,
  type = "website",
  noindex = false,
  keywords = [],
}: SeoInput) {
  const url = absoluteUrl(path);
  const ogImage = absoluteUrl(image);
  const meta: Record<string, string>[] = [
    { title },
    { name: "description", content: description },
    {
      name: "robots",
      content: noindex ? "noindex, nofollow" : "index, follow, max-image-preview:large",
    },
    { name: "author", content: SITE_NAME },
    { property: "og:site_name", content: SITE_NAME },
    { property: "og:locale", content: "fr_FR" },
    { property: "og:type", content: type },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:url", content: url },
    { property: "og:image", content: ogImage },
    { property: "og:image:alt", content: `${SITE_NAME} — santé et petite enfance` },
    { name: "twitter:card", content: "summary_large_image" },
    { name: "twitter:title", content: title },
    { name: "twitter:description", content: description },
    { name: "twitter:image", content: ogImage },
  ];
  if (keywords.length) meta.push({ name: "keywords", content: keywords.join(", ") });
  return {
    meta,
    links: [{ rel: "canonical", href: url }],
  };
}

/** Données structurées Organization + WebSite, communes au site. */
export const organizationJsonLd = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": `${SITE_URL}/#organization`,
      name: SITE_NAME,
      url: SITE_URL,
      logo: `${SITE_URL}/icon-512.png`,
      description: DEFAULT_DESCRIPTION,
      areaServed: "FR",
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: "contact@kidsmed.fr",
        availableLanguage: ["French"],
      },
    },
    {
      "@type": "WebSite",
      "@id": `${SITE_URL}/#website`,
      url: SITE_URL,
      name: SITE_NAME,
      inLanguage: "fr-FR",
      publisher: { "@id": `${SITE_URL}/#organization` },
    },
  ],
};

/** Données structurées du logiciel (rich results logiciel). */
export const softwareJsonLd = {
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  name: SITE_NAME,
  applicationCategory: "HealthApplication",
  operatingSystem: "Web, iOS, Android",
  url: SITE_URL,
  description: DEFAULT_DESCRIPTION,
  inLanguage: "fr-FR",
  offers: {
    "@type": "AggregateOffer",
    priceCurrency: "EUR",
    lowPrice: "0",
    highPrice: "299",
    offerCount: "6",
  },
  featureList: [
    "Dossier de santé partagé",
    "Transmissions crèche-parents",
    "Suivi des traitements",
    "Aide au signalement des symptômes par IA",
    "Coordination RSAI et crèches",
    "QR code d'urgence",
    "Conformité RGPD",
  ],
};

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

export function breadcrumbJsonLd(items: { name: string; path: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}
