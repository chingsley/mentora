import { registerSchema } from "./register";

describe("registerSchema", () => {
  const base = {
    name: "Jane Okafor",
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

  it("requires name of at least 2 characters", () => {
    const res = registerSchema.safeParse({ ...base, name: "J" });
    expect(res.success).toBe(false);
    if (!res.success) {
      const flat = res.error.flatten().fieldErrors;
      expect(flat.name?.[0]).toBeTruthy();
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
