import {
  INVITE_CODE_ALPHABET,
  INVITE_CODE_LENGTH,
  formatInviteCode,
  generateInviteCode,
  generateUniqueInviteCode,
  isValidInviteCodeShape,
  normalizeInviteCode,
} from "./inviteCode";

describe("inviteCode", () => {
  describe("generateInviteCode", () => {
    it("produces a code with the configured length", () => {
      const code = generateInviteCode();
      expect(code).toHaveLength(INVITE_CODE_LENGTH);
    });

    it("uses only characters from the alphabet", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateInviteCode();
        for (const ch of code) {
          expect(INVITE_CODE_ALPHABET).toContain(ch);
        }
      }
    });

    it("does not include ambiguous digits/letters (0/O/1/I)", () => {
      for (let i = 0; i < 50; i++) {
        const code = generateInviteCode();
        expect(code).not.toMatch(/[01IO]/);
      }
    });
  });

  describe("formatInviteCode", () => {
    it("formats a 9-char code as XXX-XXX-XXX", () => {
      expect(formatInviteCode("ABCDEFGHJ")).toBe("ABC-DEF-GHJ");
    });

    it("normalizes inputs before formatting", () => {
      expect(formatInviteCode("abc-def-ghj")).toBe("ABC-DEF-GHJ");
      expect(formatInviteCode("abc def ghj")).toBe("ABC-DEF-GHJ");
    });

    it("returns normalized input unchanged when length is wrong", () => {
      expect(formatInviteCode("ABC")).toBe("ABC");
    });
  });

  describe("normalizeInviteCode", () => {
    it("strips dashes, spaces, and uppercases", () => {
      expect(normalizeInviteCode("abc-def-ghj")).toBe("ABCDEFGHJ");
      expect(normalizeInviteCode("  abc  def  ghj  ")).toBe("ABCDEFGHJ");
    });
  });

  describe("isValidInviteCodeShape", () => {
    it("accepts well-formed codes", () => {
      expect(isValidInviteCodeShape("ABC-DEF-GHJ")).toBe(true);
      expect(isValidInviteCodeShape("abcdefghj")).toBe(true);
    });

    it("rejects codes with wrong length or bad chars", () => {
      expect(isValidInviteCodeShape("ABC")).toBe(false);
      expect(isValidInviteCodeShape("ABC-DEF-GHI")).toBe(false); // I is excluded
      expect(isValidInviteCodeShape("ABC-DEF-GH0")).toBe(false); // 0 is excluded
    });
  });

  describe("generateUniqueInviteCode", () => {
    it("returns the first code that does not collide", async () => {
      let calls = 0;
      const code = await generateUniqueInviteCode(async () => {
        calls++;
        return calls < 3;
      });
      expect(calls).toBe(3);
      expect(isValidInviteCodeShape(code)).toBe(true);
    });

    it("throws when the max attempts are exhausted", async () => {
      await expect(
        generateUniqueInviteCode(async () => true, 4),
      ).rejects.toThrow(/unique invite code/i);
    });
  });
});
