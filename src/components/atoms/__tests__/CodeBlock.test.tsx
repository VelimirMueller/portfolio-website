import { render, screen } from "@testing-library/react";
import { CodeBlock } from "../CodeBlock";

describe("CodeBlock", () => {
  it("renders code content", () => {
    render(<CodeBlock code="const x = 1;" />);
    expect(screen.getByText("const x = 1;")).toBeInTheDocument();
  });

  it("renders the fileName header when provided", () => {
    render(<CodeBlock code="hello" fileName="index.ts" />);
    expect(screen.getByText("index.ts")).toBeInTheDocument();
  });

  it("renders window dots when fileName is provided", () => {
    const { container } = render(
      <CodeBlock code="hello" fileName="app.tsx" />
    );
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(3);
  });

  it("does not render the fileName header when not provided", () => {
    const { container } = render(<CodeBlock code="hello" />);
    const dots = container.querySelectorAll(".rounded-full");
    expect(dots.length).toBe(0);
  });

  it("renders code inside a <pre> element", () => {
    const { container } = render(<CodeBlock code="<span>test</span>" />);
    const pre = container.querySelector("pre");
    expect(pre).toBeInTheDocument();
  });
});
