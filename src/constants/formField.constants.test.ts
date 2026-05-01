import { COLORS } from "@/constants/colors.constants";
import { FORM_FIELD, formFieldControlBorder } from "@/constants/formField.constants";

describe("formFieldControlBorder", () => {
  it("includes configured border width and default border color", () => {
    const border = formFieldControlBorder(false);
    expect(border).toContain(FORM_FIELD.CONTROL_BORDER_WIDTH);
    expect(border).toContain(COLORS.BORDER);
    expect(border).not.toContain(COLORS.DESTRUCTIVE);
  });

  it("uses destructive color when hasError", () => {
    const border = formFieldControlBorder(true);
    expect(border).toContain(COLORS.DESTRUCTIVE);
  });
});
