import { QueryClient } from "@tanstack/react-query";
import { createRouter, rootRouteId } from "@tanstack/react-router";
import { describe, expect, it } from "vitest";

import { routeTree } from "@/routeTree.gen";
import { roleToKey } from "@/lib/api";

// Match routes without running loaders or rendering: loaders may need a server or
// network the test run lacks, and jsdom never loads the stylesheets React waits on.
describe("App routing", () => {
  it("matches a page for / instead of falling back to not found", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });

    const matches = router.matchRoutes("/");

    expect(matches.at(-1)?.routeId).not.toBe(rootRouteId);
  });

  it("opens the child dossier rather than the children list", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    const matches = router.matchRoutes("/enfants/demo-noah");
    expect(matches.at(-1)?.routeId).toBe("/enfants/$enfantId");
    expect(matches.at(-1)?.params).toMatchObject({ enfantId: "demo-noah" });
  });

  it("expose la page d'inscription directe et l'espace directeur territorial", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    expect(router.matchRoutes("/inscription").at(-1)?.routeId).toBe("/inscription");
    expect(router.matchRoutes("/directeur").at(-1)?.routeId).toBe("/directeur");
    expect(router.matchRoutes("/admin/groupes").at(-1)?.routeId).toBe("/admin/groupes");
  });

  it("reconnaît le rôle directeur territorial", () => {
    expect(roleToKey("directeur")).toBe("directeur");
    expect(roleToKey("directeur_territorial")).toBe("directeur");
  });

  it("expose les pages publiques du site vitrine", () => {
    const router = createRouter({ routeTree, context: { queryClient: new QueryClient() } });
    for (const path of ["/", "/fonctionnalites", "/tarifs", "/securite-rgpd", "/a-propos", "/contact", "/mentions-legales", "/confidentialite", "/cgu"]) {
      expect(router.matchRoutes(path).at(-1)?.routeId).not.toBe(rootRouteId);
    }
  });
});
