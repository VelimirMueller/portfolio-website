import React from "react";
import { render, screen, act, fireEvent } from "@testing-library/react";
import { Navigation } from "../Navigation";
import { LanguageProvider } from "@/components/language/LanguageProvider";
import { ThemeProvider } from "@/components/theme/ThemeProvider";

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

// Track current pathname for mock
let mockPathname = "/";
jest.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

// Mock lucide-react icons
jest.mock("lucide-react", () => ({
  Menu: (props: Record<string, unknown>) => (
    <svg data-testid="icon-menu" {...props} />
  ),
  X: (props: Record<string, unknown>) => (
    <svg data-testid="icon-x" {...props} />
  ),
  ChevronDown: (props: Record<string, unknown>) => (
    <svg data-testid="icon-chevron" {...props} />
  ),
  Moon: (props: Record<string, unknown>) => (
    <svg data-testid="icon-moon" {...props} />
  ),
  Sun: (props: Record<string, unknown>) => (
    <svg data-testid="icon-sun" {...props} />
  ),
}));

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};
  return {
    getItem: jest.fn((key: string) => store[key] ?? null),
    setItem: jest.fn((key: string, value: string) => {
      store[key] = value;
    }),
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, "localStorage", { value: localStorageMock });

// Mock matchMedia
Object.defineProperty(window, "matchMedia", {
  value: jest.fn().mockImplementation((query: string) => ({
    matches: query === "(prefers-color-scheme: dark)",
    media: query,
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
});

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  mockPathname = "/";
  document.documentElement.classList.remove("dark", "light");
});

const renderWithProviders = async (ui: React.ReactElement) => {
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(
      <ThemeProvider>
        <LanguageProvider>{ui}</LanguageProvider>
      </ThemeProvider>
    );
  });
  return result!;
};

describe("Navigation", () => {
  it("renders the brand name", async () => {
    await renderWithProviders(<Navigation />);
    expect(screen.getByText("Velimir Müller")).toBeInTheDocument();
  });

  it("renders the VM logo", async () => {
    await renderWithProviders(<Navigation />);
    expect(screen.getByText("VM")).toBeInTheDocument();
  });

  it("renders navigation links (de by default)", async () => {
    await renderWithProviders(<Navigation />);
    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("Leistungen")).toBeInTheDocument();
    expect(screen.getByText("Projekte")).toBeInTheDocument();
    expect(screen.getByText("Über mich")).toBeInTheDocument();
  });

  it("renders the contact button", async () => {
    await renderWithProviders(<Navigation />);
    // Contact appears in both desktop and mobile menu link
    const contactElements = screen.getAllByText("Kontakt");
    expect(contactElements.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the theme toggle button", async () => {
    await renderWithProviders(<Navigation />);
    const themeButtons = screen.getAllByLabelText("Theme umschalten");
    expect(themeButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders the language toggle", async () => {
    await renderWithProviders(<Navigation />);
    const langButtons = screen.getAllByText("EN");
    expect(langButtons.length).toBeGreaterThanOrEqual(1);
  });

  it("renders services dropdown children links", async () => {
    await renderWithProviders(<Navigation />);
    expect(
      screen.getByText("Requirements Engineering")
    ).toBeInTheDocument();
    expect(screen.getByText("UX/UI & Branding")).toBeInTheDocument();
    expect(screen.getByText("Frontend Development")).toBeInTheDocument();
    expect(screen.getByText("Projektplanung")).toBeInTheDocument();
    expect(screen.getByText("Modern Stack")).toBeInTheDocument();
  });

  it("opens mobile menu when hamburger is clicked", async () => {
    await renderWithProviders(<Navigation />);

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();

    const openButton = screen.getByLabelText("Navigationsmenü öffnen");
    await act(async () => {
      fireEvent.click(openButton);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();
  });

  it("closes mobile menu when X is clicked", async () => {
    await renderWithProviders(<Navigation />);

    const openButton = screen.getByLabelText("Navigationsmenü öffnen");
    await act(async () => {
      fireEvent.click(openButton);
    });

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    const closeButton = screen.getByLabelText("Navigationsmenü schließen");
    await act(async () => {
      fireEvent.click(closeButton);
    });

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });

  it("renders mobile menu nav items with descriptions", async () => {
    await renderWithProviders(<Navigation />);

    const openButton = screen.getByLabelText("Navigationsmenü öffnen");
    await act(async () => {
      fireEvent.click(openButton);
    });

    expect(screen.getByText("// Start")).toBeInTheDocument();
    expect(screen.getByText("Home & Overview")).toBeInTheDocument();
    expect(screen.getByText("// Leistungen")).toBeInTheDocument();
    expect(screen.getByText("Product Engineering")).toBeInTheDocument();
  });

  it("renders mobile menu service children", async () => {
    await renderWithProviders(<Navigation />);

    const openButton = screen.getByLabelText("Navigationsmenü öffnen");
    await act(async () => {
      fireEvent.click(openButton);
    });

    // Services children should appear in mobile menu too
    const reqEngLinks = screen.getAllByText("Requirements Engineering");
    expect(reqEngLinks.length).toBeGreaterThanOrEqual(2); // desktop + mobile
  });

  it("highlights the active route", async () => {
    mockPathname = "/services";
    await renderWithProviders(<Navigation />);

    // The services link should have the active class pattern
    const servicesLinks = screen.getAllByText("Leistungen");
    const desktopLink = servicesLinks[0].closest("a");
    expect(desktopLink?.className).toContain("bg-black text-white");
  });

  it("does not highlight non-active routes", async () => {
    mockPathname = "/";
    await renderWithProviders(<Navigation />);

    const projectsLinks = screen.getAllByText("Projekte");
    const desktopLink = projectsLinks[0].closest("a");
    // Non-active links have "hover:bg-black/5" but NOT "bg-black text-white" (active pattern)
    expect(desktopLink?.className).toContain("text-light-sub");
  });

  it("highlights home only when pathname is exactly '/'", async () => {
    mockPathname = "/";
    await renderWithProviders(<Navigation />);

    const homeLinks = screen.getAllByText("Start");
    const desktopLink = homeLinks[0].closest("a");
    expect(desktopLink?.className).toContain("bg-black text-white");
  });

  it("does not highlight home when on another page", async () => {
    mockPathname = "/about";
    await renderWithProviders(<Navigation />);

    const homeLinks = screen.getAllByText("Start");
    const desktopLink = homeLinks[0].closest("a");
    expect(desktopLink?.className).toContain("text-light-sub");
  });

  it("shows correct mobile theme toggle aria-label for dark mode", async () => {
    await renderWithProviders(<Navigation />);

    // Default theme is dark, so mobile toggle should say "Switch to light mode"
    const mobileThemeBtn = screen.getByLabelText("Switch to light mode");
    expect(mobileThemeBtn).toBeInTheDocument();
  });

  it("shows correct mobile theme toggle aria-label after toggling to light", async () => {
    await renderWithProviders(<Navigation />);

    // Toggle theme to light via the desktop toggle button
    const desktopThemeBtns = screen.getAllByLabelText("Theme umschalten");
    await act(async () => {
      fireEvent.click(desktopThemeBtns[0]);
    });

    // Now mobile toggle should say "Switch to dark mode"
    const mobileThemeBtn = screen.getByLabelText("Switch to dark mode");
    expect(mobileThemeBtn).toBeInTheDocument();
  });

  it("highlights service child routes", async () => {
    mockPathname = "/services/frontend-development";
    await renderWithProviders(<Navigation />);

    const feLink = screen.getAllByText("Frontend Development");
    const desktopDropdownLink = feLink[0].closest("a");
    expect(desktopDropdownLink?.className).toContain("font-bold");
  });
});
