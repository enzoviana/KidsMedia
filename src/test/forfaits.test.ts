import { describe, it, expect } from "vitest";
import { forfaitsPourRole } from "@/lib/forfaits";

const rows = [
  { _id: "a", nom: "Crèche", roleCible: "creche", prixMensuel: 79 },
  { _id: "b", nom: "RSAI", roleCible: "rsai", prixMensuel: 29 },
  { _id: "c", nom: "Pour tous", roleCible: "tous", prixMensuel: 10 },
  { _id: "d", nom: "Off", roleCible: "rsai", actif: false },
];

describe("forfaitsPourRole", () => {
  it("une RSAI ne voit que ses forfaits et ceux pour tous", () => {
    expect(forfaitsPourRole(rows, "rsai").map((o) => o.id)).toEqual(["b", "c"]);
  });
  it("une crèche ne voit pas les forfaits RSAI", () => {
    expect(forfaitsPourRole(rows, "creche").map((o) => o.id)).toEqual(["a", "c"]);
  });
});
