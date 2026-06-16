import {
  formatTeacherLocationLabel,
  parseLegacyLocationLabel,
  resolveTeacherLocationFields,
} from "./teacherProfileLocation";

describe("formatTeacherLocationLabel", () => {
  it("joins city and country", () => {
    expect(formatTeacherLocationLabel("Abuja", "Nigeria")).toBe("Abuja, Nigeria");
  });
});

describe("parseLegacyLocationLabel", () => {
  it("parses city and country", () => {
    expect(parseLegacyLocationLabel("Lagos, Nigeria")).toEqual({
      countryCode: "NG",
      city: "Lagos",
    });
  });

  it("parses country-only labels", () => {
    expect(parseLegacyLocationLabel("Nigeria")).toEqual({
      countryCode: "NG",
      city: "",
    });
  });
});

describe("resolveTeacherLocationFields", () => {
  it("prefers stored structured fields", () => {
    expect(
      resolveTeacherLocationFields({
        locationCountryCode: "NG",
        locationCity: "Abuja",
        locationLabel: "Legacy",
      }),
    ).toEqual({ countryCode: "NG", city: "Abuja" });
  });

  it("falls back to legacy label", () => {
    expect(
      resolveTeacherLocationFields({
        locationCountryCode: "",
        locationCity: "",
        locationLabel: "Nigeria",
      }),
    ).toEqual({ countryCode: "NG", city: "" });
  });
});
