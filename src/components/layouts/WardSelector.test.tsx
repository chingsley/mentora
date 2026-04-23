/**
 * @jest-environment jsdom
 */
import "@testing-library/jest-dom";
import { act, fireEvent, render, screen } from "@testing-library/react";
import * as React from "react";

const pushMock = jest.fn();
const refreshMock = jest.fn();
let mockPathname = "/guardian/w/stu-1";
let mockParams: Record<string, string> = { studentId: "stu-1" };

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock, refresh: refreshMock }),
  usePathname: () => mockPathname,
  useParams: () => mockParams,
}));

import { WardSelector } from "./WardSelector";

beforeEach(() => {
  pushMock.mockClear();
  refreshMock.mockClear();
  mockPathname = "/guardian/w/stu-1";
  mockParams = { studentId: "stu-1" };
});

describe("WardSelector", () => {
  const wards = [
    { studentProfileId: "stu-1", name: "Alice Smith", image: null },
    { studentProfileId: "stu-2", name: "Bob Jones", image: null },
  ];

  it("renders nothing when there are no wards", () => {
    const { container } = render(<WardSelector wards={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it("shows the current ward name and switches when clicked", () => {
    render(<WardSelector wards={wards} />);
    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /alice smith/i }));
    const options = screen.getAllByRole("option");
    expect(options).toHaveLength(2);

    act(() => {
      fireEvent.click(screen.getByRole("option", { name: /bob jones/i }));
    });

    expect(pushMock).toHaveBeenCalledWith("/guardian/w/stu-2");
    expect(refreshMock).toHaveBeenCalled();
  });

  it("preserves the sub-route when switching wards", () => {
    mockPathname = "/guardian/w/stu-1/grades";
    render(<WardSelector wards={wards} />);
    fireEvent.click(screen.getByRole("button", { name: /alice smith/i }));
    act(() => {
      fireEvent.click(screen.getByRole("option", { name: /bob jones/i }));
    });
    expect(pushMock).toHaveBeenCalledWith("/guardian/w/stu-2/grades");
  });

  it("renders a compact badge when collapsed", () => {
    const { container } = render(<WardSelector wards={wards} collapsed />);
    expect(container.querySelector('[aria-label="Ward selector"]')).toBeInTheDocument();
    expect(screen.queryByRole("button")).toBeNull();
  });
});
