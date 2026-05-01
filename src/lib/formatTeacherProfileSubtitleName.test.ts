import { formatTeacherProfileSubtitleName } from "./formatTeacherProfileSubtitleName";

describe("formatTeacherProfileSubtitleName", () => {
  it("returns full name when length is at most 20", () => {
    expect(formatTeacherProfileSubtitleName("Jane Okafor")).toBe("Jane Okafor");
    expect(formatTeacherProfileSubtitleName("  Jane Okafor  ")).toBe("Jane Okafor");
    const twenty = "a".repeat(20);
    expect(formatTeacherProfileSubtitleName(twenty)).toBe(twenty);
  });

  it("abbreviates additional names when full name exceeds 20 characters", () => {
    expect(formatTeacherProfileSubtitleName("John Snoweeeeeeeeeeeeeeeee")).toBe("John S");
  });

  it("uses first letters for multiple trailing parts", () => {
    expect(formatTeacherProfileSubtitleName("Jonathan Middlebee Snoweeeeeeeeeeeeeeeee")).toBe(
      "Jonathan M S",
    );
  });

  it("truncates a single long token to 20 characters", () => {
    const long = "Snoweeeeeeeeeeeeeeeeeeee";
    expect(formatTeacherProfileSubtitleName(long)).toBe(long.slice(0, 20));
  });

  it("returns empty string for empty input", () => {
    expect(formatTeacherProfileSubtitleName("")).toBe("");
    expect(formatTeacherProfileSubtitleName("   ")).toBe("");
  });
});
