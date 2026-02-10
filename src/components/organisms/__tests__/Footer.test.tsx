import { render, screen } from "@testing-library/react";
import { Footer } from "../Footer";
import { LanguageProvider } from "@/components/language/LanguageProvider";

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
      <a href={href} className={className}>
        {children}
      </a>
    );
  };
});

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Mail: () => <svg data-testid="icon-mail" />,
  Linkedin: () => <svg data-testid="icon-linkedin" />,
  Github: () => <svg data-testid="icon-github" />,
}));

const renderWithProviders = (ui: React.ReactElement) => {
  return render(<LanguageProvider>{ui}</LanguageProvider>);
};

describe("Footer", () => {
  it("renders sitemap links", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("Leistungen")).toBeInTheDocument();
    expect(screen.getByText("Projekte")).toBeInTheDocument();
    expect(screen.getByText("Über Mich")).toBeInTheDocument();
  });

  it("renders sitemap links with correct hrefs", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("Leistungen").closest("a")).toHaveAttribute(
      "href",
      "/services"
    );
    expect(screen.getByText("Projekte").closest("a")).toHaveAttribute(
      "href",
      "/projects"
    );
    expect(screen.getByText("Über Mich").closest("a")).toHaveAttribute(
      "href",
      "/about"
    );
  });

  it("renders social link icons", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByTestId("icon-linkedin")).toBeInTheDocument();
    expect(screen.getByTestId("icon-github")).toBeInTheDocument();
    expect(screen.getByTestId("icon-mail")).toBeInTheDocument();
  });

  it("renders copyright with current year", () => {
    const currentYear = new Date().getFullYear().toString();
    renderWithProviders(<Footer />);
    expect(
      screen.getByText(`© ${currentYear} Velimir Müller.`)
    ).toBeInTheDocument();
  });

  it("renders the built-with text", () => {
    renderWithProviders(<Footer />);
    expect(
      screen.getByText("Built with Next.js, Supabase & Vercel.")
    ).toBeInTheDocument();
  });

  it("renders imprint and privacy links", () => {
    renderWithProviders(<Footer />);
    expect(screen.getByText("Impressum")).toBeInTheDocument();
    expect(screen.getByText("Datenschutz")).toBeInTheDocument();
    expect(screen.getByText("Impressum").closest("a")).toHaveAttribute(
      "href",
      "/imprint"
    );
    expect(screen.getByText("Datenschutz").closest("a")).toHaveAttribute(
      "href",
      "/privacy"
    );
  });
});
