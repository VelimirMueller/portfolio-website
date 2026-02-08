import { render, screen } from "@testing-library/react";
import { BentoCard } from "../BentoCard";
import { Code } from "lucide-react";

describe("BentoCard", () => {
  it("renders children", () => {
    render(<BentoCard>Card content</BentoCard>);
    expect(screen.getByText("Card content")).toBeInTheDocument();
  });

  it("renders title when provided", () => {
    render(<BentoCard title="My Title">Content</BentoCard>);
    expect(screen.getByText("My Title")).toBeInTheDocument();
  });

  it("renders subtitle when provided", () => {
    render(<BentoCard subtitle="My Subtitle">Content</BentoCard>);
    expect(screen.getByText("My Subtitle")).toBeInTheDocument();
  });

  it("renders icon when provided", () => {
    const { container } = render(
      <BentoCard icon={Code}>Content</BentoCard>
    );
    const svg = container.querySelector("svg");
    expect(svg).toBeInTheDocument();
  });

  it("does not render header section when no title, subtitle, or icon", () => {
    const { container } = render(<BentoCard>Content only</BentoCard>);
    const header = container.querySelector(".p-6.pb-2");
    expect(header).not.toBeInTheDocument();
  });

  it("applies noPadding class to content area", () => {
    const { container } = render(
      <BentoCard noPadding>No pad</BentoCard>
    );
    const contentDiv = container.querySelector(".flex-grow");
    expect(contentDiv?.className).not.toContain("p-6");
  });

  it("applies padding to content area by default", () => {
    const { container } = render(<BentoCard>Padded</BentoCard>);
    const contentDiv = container.querySelector(".flex-grow");
    expect(contentDiv?.className).toContain("p-6");
  });
});
