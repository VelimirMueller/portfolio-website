import { render, screen, fireEvent } from "@testing-library/react";
import { Button } from "../Button";

// Mock next/link
jest.mock("next/link", () => {
  return function MockLink({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) {
    return (
      <a href={href} className={className} data-testid="next-link">
        {children}
      </a>
    );
  };
});

describe("Button", () => {
  it("renders children correctly", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText("Click me")).toBeInTheDocument();
  });

  it("renders as a <button> when no `to` prop is provided", () => {
    render(<Button>Click</Button>);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("calls onClick when clicked", () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it("renders as an <a> tag for external links", () => {
    render(
      <Button to="https://example.com" external>
        External
      </Button>
    );
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "https://example.com");
    expect(link).toHaveAttribute("target", "_blank");
    expect(link).toHaveAttribute("rel", "noopener noreferrer");
  });

  it("renders as a Next.js Link for internal `to`", () => {
    render(<Button to="/about">About</Button>);
    const link = screen.getByTestId("next-link");
    expect(link).toHaveAttribute("href", "/about");
  });

  it("applies the primary variant class by default", () => {
    render(<Button>Primary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-black");
  });

  it("applies the secondary variant class", () => {
    render(<Button variant="secondary">Secondary</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("bg-gray-100");
  });

  it("applies custom className", () => {
    render(<Button className="my-custom">Styled</Button>);
    const button = screen.getByRole("button");
    expect(button.className).toContain("my-custom");
  });
});
