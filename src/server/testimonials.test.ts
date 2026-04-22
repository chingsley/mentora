jest.mock("server-only", () => ({}));

const studentFindUnique = jest.fn();
const enrollmentFindFirst = jest.fn();
const testimonialUpsert = jest.fn();
const testimonialFindMany = jest.fn();

jest.mock("@/lib/db", () => ({
  db: {
    studentProfile: { findUnique: studentFindUnique },
    enrollment: { findFirst: enrollmentFindFirst },
    classTestimonial: {
      upsert: testimonialUpsert,
      findMany: testimonialFindMany,
    },
  },
}));

import { createTestimonial, TestimonialNotAllowedError } from "./testimonials";

beforeEach(() => {
  jest.clearAllMocks();
});

describe("createTestimonial", () => {
  it("refuses when the user has no student profile", async () => {
    studentFindUnique.mockResolvedValueOnce(null);
    await expect(
      createTestimonial("user-1", {
        offeringId: "offering-1",
        rating: 5,
        body: "Great class!",
      }),
    ).rejects.toBeInstanceOf(TestimonialNotAllowedError);
  });

  it("refuses when the student is not enrolled", async () => {
    studentFindUnique.mockResolvedValueOnce({ id: "student-1" });
    enrollmentFindFirst.mockResolvedValueOnce(null);
    await expect(
      createTestimonial("user-1", {
        offeringId: "offering-1",
        rating: 5,
        body: "Great class!",
      }),
    ).rejects.toBeInstanceOf(TestimonialNotAllowedError);
  });

  it("upserts a testimonial when the student has an active enrollment", async () => {
    studentFindUnique.mockResolvedValueOnce({ id: "student-1" });
    enrollmentFindFirst.mockResolvedValueOnce({ id: "enrol-1" });
    testimonialUpsert.mockResolvedValueOnce({ id: "testimonial-1" });

    const result = await createTestimonial("user-1", {
      offeringId: "offering-1",
      rating: 4,
      body: "Patient and thorough.",
    });

    expect(result).toEqual({ id: "testimonial-1" });
    expect(testimonialUpsert).toHaveBeenCalledWith({
      where: {
        offeringId_studentProfileId: {
          offeringId: "offering-1",
          studentProfileId: "student-1",
        },
      },
      create: expect.objectContaining({
        offeringId: "offering-1",
        studentProfileId: "student-1",
        rating: 4,
      }),
      update: expect.objectContaining({ rating: 4, body: "Patient and thorough." }),
    });
  });
});
