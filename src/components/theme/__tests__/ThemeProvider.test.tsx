import { render, screen, act } from "@testing-library/react";
import { ThemeProvider, useTheme } from "../ThemeProvider";

// Helper component to consume the theme context
function ThemeConsumer() {
  const { theme, toggleTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme-value">{theme}</span>
      <button onClick={toggleTheme}>Toggle</button>
    </div>
  );
}

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
  document.documentElement.classList.remove("dark", "light");
});

describe("ThemeProvider", () => {
  it("provides theme context to children", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });
    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("toggleTheme switches between dark and light", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("throws error when useTheme is used outside ThemeProvider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => render(<ThemeConsumer />)).toThrow(
      "useTheme must be used within a ThemeProvider"
    );

    consoleSpy.mockRestore();
  });

  it("reads saved 'light' theme from localStorage", async () => {
    localStorageMock.getItem.mockReturnValueOnce("light");

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
  });

  it("honors a system light preference when no theme is saved", async () => {
    // Mirror of the no-flash script in the layout: explicit light → light
    (window.matchMedia as jest.Mock).mockImplementationOnce(
      (query: string) => ({
        matches: query === "(prefers-color-scheme: light)",
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })
    );

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
  });

  it("stays dark when the system expresses no explicit light preference", async () => {
    (window.matchMedia as jest.Mock).mockImplementationOnce(
      (query: string) => ({
        matches: false,
        media: query,
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      })
    );

    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });

  it("does not persist a theme the visitor never chose", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    // Persisting on mount would cement a default over a future change in
    // system preference — only an explicit toggle may write storage.
    expect(localStorageMock.setItem).not.toHaveBeenCalled();
  });

  it("applies theme class to document element", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(document.documentElement.classList.contains("light")).toBe(true);
    expect(document.documentElement.classList.contains("dark")).toBe(false);
  });

  it("persists theme to localStorage on toggle", async () => {
    await act(async () => {
      render(
        <ThemeProvider>
          <ThemeConsumer />
        </ThemeProvider>
      );
    });

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("theme", "light");
  });
});
