import { render, screen } from "@testing-library/react";
import { SectionHeader } from "../SectionHeader";

describe("SectionHeader", () => {
  it("renders the title", () => {
    render(<SectionHeader title="Projects" subtitle="My Work" />);
    expect(screen.getByText("Projects")).toBeInTheDocument();
  });

  it("renders the subtitle", () => {
    render(<SectionHeader title="Projects" subtitle="My Work" />);
    expect(screen.getByText("My Work")).toBeInTheDocument();
  });

  it("renders the title in an h1 element", () => {
    render(<SectionHeader title="About" subtitle="Info" />);
    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("About");
  });

  it("renders no art layer by default", () => {
    render(<SectionHeader title="About" subtitle="Info" />);
    expect(screen.queryByTestId("art-backdrop")).not.toBeInTheDocument();
  });

  it("renders a decorative art layer when artClassName is set", () => {
    render(<SectionHeader title="About" subtitle="Info" artClassName="bg-cover" />);
    const art = screen.getByTestId("art-backdrop");
    expect(art).toHaveAttribute("aria-hidden", "true");
    expect(art).toHaveClass("bg-cover");
  });
});
