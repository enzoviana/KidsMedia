import { describe, expect, it } from "vitest";
import { childIdOfRow, documentUrlOf } from "../lib/row-target";

describe("Cibles des lignes de liste", () => {
  it("trouve l'URL d'un document, même imbriquée", () => {
    expect(documentUrlOf({ url: "/documents/a.pdf" })).toBe("/documents/a.pdf");
    expect(documentUrlOf({ lien: "https://cdn.test/a.pdf" })).toBe("https://cdn.test/a.pdf");
    expect(documentUrlOf({ fichier: { url: "/uploads/a.pdf" } })).toBe("/uploads/a.pdf");
    expect(documentUrlOf({ document: { lien: "https://cdn.test/b.pdf" } })).toBe("https://cdn.test/b.pdf");
    expect(documentUrlOf({ nom: "a.pdf" })).toBe("");
  });

  it("retrouve l'enfant d'une ligne, y compris avec un UUID serveur", () => {
    const uuid = "3f0c3a5e-5f5e-4e3e-9a1a-2b3c4d5e6f70";
    expect(childIdOfRow({ enfant: { id: uuid, prenom: "Léa" } })).toBe(uuid);
    expect(childIdOfRow({ enfantId: uuid })).toBe(uuid);
    expect(childIdOfRow({ enfant: { prenom: "Léa" } })).toBe("demo-lea");
    expect(childIdOfRow({ nom: "sans enfant" })).toBeNull();
  });
});
