import { registerSchema } from "./register";

describe("registerSchema", () => {
  const base = {
    firstName: "Jane",
    lastName: "Okafor",
    email: "jane@example.com",
    password: "password123",
    confirmPassword: "password123",
    role: "TEACHER" as const,
  };

  it("accepts a valid teacher payload", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords and flags confirmPassword", () => {
    const res = registerSchema.safeParse({
      ...base,
      confirmPassword: "different!!",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const flat = res.error.flatten().fieldErrors;
      expect(flat.confirmPassword?.[0]).toMatch(/do not match/i);
    }
  });

  it("requires first and last names of at least 2 characters", () => {
    const res = registerSchema.safeParse({ ...base, firstName: "J", lastName: "" });
    expect(res.success).toBe(false);
    if (!res.success) {
      const flat = res.error.flatten().fieldErrors;
      expect(flat.firstName?.[0]).toBeTruthy();
      expect(flat.lastName?.[0]).toBeTruthy();
    }
  });

  it("rejects invalid emails and short passwords", () => {
    const res = registerSchema.safeParse({
      ...base,
      email: "not-an-email",
      password: "short",
      confirmPassword: "short",
    });
    expect(res.success).toBe(false);
    if (!res.success) {
      const flat = res.error.flatten().fieldErrors;
      expect(flat.email?.[0]).toBeTruthy();
      expect(flat.password?.[0]).toBeTruthy();
    }
  });
});
