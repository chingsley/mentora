/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { fireEvent, render, screen } from "@testing-library/react";
import { LoginForm } from "./LoginForm";

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: jest.fn(), refresh: jest.fn() }),
}));

jest.mock("./actions", () => ({
  loginAction: jest.fn(),
}));

describe("LoginForm show password", () => {
  it("reveals password text when the checkbox is checked", () => {
    render(<LoginForm />);

    const passwordInput = screen.getByLabelText("Password");
    expect(passwordInput).toHaveAttribute("type", "password");

    fireEvent.change(passwordInput, { target: { value: "secret123" } });
    fireEvent.click(screen.getByLabelText("Show password"));

    expect(screen.getByLabelText("Show password")).toBeChecked();
    expect(screen.getByLabelText("Password")).toHaveAttribute("type", "text");
    expect(screen.getByLabelText("Password")).toHaveValue("secret123");
  });
});
