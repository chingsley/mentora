import {
  firstIncompleteTeacherProfileSetupPhase,
  isTeacherProfileSetupComplete,
  teacherProfileSetupPhaseComplete,
  type TeacherProfileSetupInput,
} from "./teacherProfileSetup";
import { TEACHER_PAYOUT_METHOD } from "@/constants/teacherPayout.constants";

const completeInput: TeacherProfileSetupInput = {
  image: "https://example.com/photo.jpg",
  bio: "Experienced tutor.",
  spokenLanguages: "English",
  subjectIds: ["math"],
  offeringsCount: 1,
  payoutLegalName: "Jane Doe",
  payoutCountryCode: "NG",
  payoutPreferredMethod: TEACHER_PAYOUT_METHOD.STRIPE_CONNECT,
};

describe("teacherProfileSetup", () => {
  describe("isTeacherProfileSetupComplete", () => {
    it("returns true when every phase is satisfied", () => {
      expect(isTeacherProfileSetupComplete(completeInput)).toBe(true);
    });

    it("returns false when photo is missing", () => {
      expect(isTeacherProfileSetupComplete({ ...completeInput, image: null })).toBe(false);
    });

    it("returns false when payment fields are missing", () => {
      expect(
        isTeacherProfileSetupComplete({
          ...completeInput,
          payoutLegalName: null,
          payoutCountryCode: null,
          payoutPreferredMethod: null,
        }),
      ).toBe(false);
    });

    it("returns false when there are no offerings", () => {
      expect(isTeacherProfileSetupComplete({ ...completeInput, offeringsCount: 0 })).toBe(false);
    });

    it("returns false when bank transfer is selected but bank details are missing", () => {
      expect(
        isTeacherProfileSetupComplete({
          ...completeInput,
          payoutPreferredMethod: TEACHER_PAYOUT_METHOD.BANK_TRANSFER,
          payoutBankName: null,
          payoutBankBranch: null,
          payoutBankAccountNumber: null,
        }),
      ).toBe(false);
    });

    it("returns true when bank transfer details are complete", () => {
      expect(
        isTeacherProfileSetupComplete({
          ...completeInput,
          payoutPreferredMethod: TEACHER_PAYOUT_METHOD.BANK_TRANSFER,
          payoutBankName: "First Bank",
          payoutBankBranch: "Victoria Island",
          payoutBankAccountNumber: "0123456789",
        }),
      ).toBe(true);
    });
  });

  describe("firstIncompleteTeacherProfileSetupPhase", () => {
    it("returns bio when nothing is done", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          image: null,
          bio: "",
          spokenLanguages: "",
          subjectIds: [],
          offeringsCount: 0,
          payoutLegalName: null,
          payoutCountryCode: null,
          payoutPreferredMethod: null,
        }),
      ).toBe("bio");
    });

    it("returns courses after bio is complete", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          ...completeInput,
          subjectIds: [],
          offeringsCount: 0,
          payoutLegalName: null,
          payoutCountryCode: null,
          payoutPreferredMethod: null,
        }),
      ).toBe("courses");
    });

    it("returns payment when only payment is incomplete", () => {
      expect(
        firstIncompleteTeacherProfileSetupPhase({
          ...completeInput,
          payoutPreferredMethod: "",
        }),
      ).toBe("payment");
    });
  });

  describe("teacherProfileSetupPhaseComplete", () => {
    it("marks each phase independently", () => {
      expect(
        teacherProfileSetupPhaseComplete({
          image: completeInput.image,
          bio: completeInput.bio,
          spokenLanguages: completeInput.spokenLanguages,
          subjectIds: [],
          offeringsCount: 0,
          payoutLegalName: null,
          payoutCountryCode: null,
          payoutPreferredMethod: null,
        }),
      ).toEqual({
        bio: true,
        courses: false,
        schedule: false,
        payment: false,
      });
    });
  });
});
