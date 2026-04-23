jest.mock("server-only", () => ({}));

import {
  fileExtension,
  safeMimeFor,
  validateAssignmentUpload,
  MAX_UPLOAD_SIZE_BYTES,
} from "./uploads";

function makeFile(name: string, size: number, type = ""): File {
  const body = new Uint8Array(size);
  return new File([body], name, { type });
}

describe("uploads", () => {
  describe("fileExtension", () => {
    it("returns the lowercased extension", () => {
      expect(fileExtension("Foo.PDF")).toBe("pdf");
      expect(fileExtension("a.b.c.docx")).toBe("docx");
    });
    it("returns null when missing", () => {
      expect(fileExtension("readme")).toBeNull();
      expect(fileExtension("trailing.")).toBeNull();
    });
  });

  describe("safeMimeFor", () => {
    it("prefers a known allowed content type", () => {
      expect(safeMimeFor("application/pdf", "pdf")).toBe("application/pdf");
    });
    it("falls back to extension when mime is unknown", () => {
      expect(safeMimeFor("application/weird", "pdf")).toBe("application/pdf");
      expect(safeMimeFor(null, "jpg")).toBe("image/jpeg");
    });
    it("defaults to octet-stream for unknown extensions", () => {
      expect(safeMimeFor(null, "exe")).toBe("application/octet-stream");
    });
  });

  describe("validateAssignmentUpload", () => {
    it("rejects empty files", () => {
      const res = validateAssignmentUpload(makeFile("x.pdf", 0));
      expect(res.ok).toBe(false);
    });

    it("rejects files over the size limit", () => {
      const res = validateAssignmentUpload(
        makeFile("x.pdf", MAX_UPLOAD_SIZE_BYTES + 1),
      );
      expect(res.ok).toBe(false);
    });

    it("rejects disallowed extensions", () => {
      const res = validateAssignmentUpload(makeFile("x.exe", 100));
      expect(res.ok).toBe(false);
    });

    it("accepts allowed extensions", () => {
      const res = validateAssignmentUpload(makeFile("homework.pdf", 100));
      expect(res.ok).toBe(true);
      expect(res.extension).toBe("pdf");
    });

    it("rejects when mime is provided but disallowed", () => {
      const res = validateAssignmentUpload(
        makeFile("homework.pdf", 100, "application/x-executable"),
      );
      expect(res.ok).toBe(false);
    });

    it("accepts when mime is empty but extension is valid", () => {
      const res = validateAssignmentUpload(makeFile("homework.pdf", 100, ""));
      expect(res.ok).toBe(true);
    });
  });
});
