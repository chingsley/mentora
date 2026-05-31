import { SUBJECT_TILE_PALETTE } from "@/constants/subjectPalette.constants";
import { subjectThemeForId } from "./subjectPalette";

describe("subjectThemeForId", () => {
  it("returns a stable palette entry for the same subject id", () => {
    const first = subjectThemeForId("subj-abc");
    const second = subjectThemeForId("subj-abc");
    expect(first).toBe(second);
    expect(SUBJECT_TILE_PALETTE).toContain(first);
  });

  it("can return different entries for different subject ids", () => {
    const themes = new Set(
      ["a", "b", "c", "d", "e", "f", "g", "h", "i"].map(subjectThemeForId),
    );
    expect(themes.size).toBeGreaterThan(1);
  });
});
