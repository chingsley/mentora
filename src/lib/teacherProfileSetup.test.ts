import {
  firstIncompleteTeacherProfileSetupPhase,
  isTeacherProfileSetupComplete,
  teacherProfileSetupPhaseComplete,
  type TeacherProfileSetupInput,
} from "./teacherProfileSetup";

const completeInput: TeacherProfileSetupInput = {
  image: "https://example.com/photo.jpg",
  bio: "Experienced tutor.",
  spokenLanguages: "English",
  locationCountryCode: "CA",
  locationCity: "Toronto",
  subjectIds: ["math"],
  offeringsCount: 1,
};

describe("teacherProfileSetup", () => {
  describe("isTeacherProfileSetupComplete", () => {
    it("returns true when every phase is satisfied", () => {
      expect(isTeacherProfileSetupComplete(completeInput)).toBe(true);
    });

    it("returns false when photo is missing", () => {
      expect(isTeacherProfileSetupComplete({ ...completeInput, image: null })).toBe(false);
    });

    it("returns false when there are no offerings", () => {
      expect(isTeacherProfileSetupComplete({ ...completeInput, offeringsCount: 0 })).toBe(false);
    });
  });

  describe("firstIncompleteTeacherProfileSetupPhase", () => {
    it("returns bio when nothing is done", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          image: null,
          bio: "",
          spokenLanguages: "",
          locationCountryCode: "",
          locationCity: "",
          subjectIds: [],
          offeringsCount: 0,
        }),
      ).toBe("bio");
    });

    it("returns location after bio is complete", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          ...completeInput,
          spokenLanguages: "",
          locationCountryCode: "",
          locationCity: "",
          subjectIds: [],
          offeringsCount: 0,
        }),
      ).toBe("location");
    });

    it("returns courses after bio and location are complete", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          ...completeInput,
          subjectIds: [],
          offeringsCount: 0,
        }),
      ).toBe("courses");
    });

    it("returns schedule when only schedule is incomplete", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          ...completeInput,
          offeringsCount: 0,
        }),
      ).toBe("schedule");
    });
  });

  describe("teacherProfileSetupPhaseComplete", () => {
    it("marks each phase independently", () => {
      expect(
        teacherProfileSetupPhaseComplete({
          image: completeInput.image,
          bio: completeInput.bio,
          spokenLanguages: completeInput.spokenLanguages,
          locationCountryCode: completeInput.locationCountryCode,
          locationCity: completeInput.locationCity,
          subjectIds: [],
          offeringsCount: 0,
        }),
      ).toEqual({
        bio: true,
        location: true,
        courses: false,
        schedule: false,
      });
    });
  });
});
