import { splitFullName } from "./displayName";

describe("splitFullName", () => {
  it("splits on first space", () => {
    expect(splitFullName("Jane Okafor")).toEqual({ firstName: "Jane", lastName: "Okafor" });
  });

  it("collapses internal whitespace", () => {
    expect(splitFullName("  Ana   Maria   Costa  ")).toEqual({
      firstName: "Ana",
      lastName: "Maria Costa",
    });
  });

  it("uses whole string as first name when no space", () => {
    expect(splitFullName("Madonna")).toEqual({ firstName: "Madonna", lastName: "" });
  });
});
