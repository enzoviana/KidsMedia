import { describe, expect, it } from "vitest";
import { absoluteUrl, faqJsonLd, seoHead } from "@/lib/seo";

describe("SEO du site vitrine", () => {
  it("construit une URL canonique absolue", () => {
    expect(absoluteUrl("/tarifs")).toMatch(/^https:\/\//);
    expect(absoluteUrl("/tarifs")).toContain("/tarifs");
  });

  it("ajoute canonical, Open Graph et robots indexables", () => {
    const head = seoHead({ title: "Titre", description: "Description", path: "/contact" });
    expect(head.links).toContainEqual({ rel: "canonical", href: absoluteUrl("/contact") });
    expect(head.meta).toContainEqual({ property: "og:title", content: "Titre" });
    expect(head.meta).toContainEqual({ name: "robots", content: "index, follow, max-image-preview:large" });
  });

  it("génère un balisage FAQ conforme à schema.org", () => {
    const json = faqJsonLd([{ question: "Question ?", answer: "Réponse." }]);
    expect(json["@type"]).toBe("FAQPage");
    expect(json.mainEntity[0]?.name).toBe("Question ?");
  });
});
