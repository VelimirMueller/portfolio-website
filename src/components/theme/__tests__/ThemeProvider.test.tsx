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
  document.documentElement.removeAttribute("data-mode");
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

  it("applies theme class and data-mode to document element", async () => {
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
    // @synthwerk/tokens resolves its colours from data-mode, not from the class.
    expect(document.documentElement.getAttribute("data-mode")).toBe("light");
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

describe("ThemeProvider hydration", () => {
  const markup = (
    <ThemeProvider>
      <ThemeConsumer />
    </ThemeProvider>
  );

  it("renders dark on the server, whatever the visitor saved", async () => {
    const { renderToString } = await import("react-dom/server");
    localStorageMock.setItem("theme", "light");
    expect(renderToString(markup)).toContain(">dark<");
  });

  it("leaves the no-flash class alone during hydration, then applies the saved theme", async () => {
    const { renderToString } = await import("react-dom/server");
    const container = document.createElement("div");
    container.innerHTML = renderToString(markup);
    document.body.appendChild(container);
    localStorageMock.setItem("theme", "light");
    // The no-flash script has already set the saved theme.
    document.documentElement.classList.add("light");
    // Every class value the root had along the way.
    const classSeen: string[] = [];
    const observer = new MutationObserver((records) =>
      records.forEach((r) => classSeen.push(r.oldValue ?? ""))
    );
    observer.observe(document.documentElement, {
      attributeFilter: ["class"],
      attributeOldValue: true,
    });

    await act(async () => {
      render(markup, { container, hydrate: true });
    });
    classSeen.push(document.documentElement.className);
    observer.takeRecords().forEach((r) => classSeen.push(r.oldValue ?? ""));
    observer.disconnect();

    expect(screen.getByTestId("theme-value")).toHaveTextContent("light");
    expect(document.documentElement.classList.contains("light")).toBe(true);
    // Never flipped to dark on the way.
    expect(classSeen.some((c) => c.includes("dark"))).toBe(false);
    container.remove();
  });

  it("keeps the start theme for the life of the provider", async () => {
    const { rerender } = render(markup);
    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");

    // A later system change applies on the next page load, as before.
    (window.matchMedia as jest.Mock).mockImplementationOnce((query: string) => ({
      matches: query === "(prefers-color-scheme: light)",
      media: query,
      addEventListener: jest.fn(),
      removeEventListener: jest.fn(),
    }));
    rerender(markup);
    expect(screen.getByTestId("theme-value")).toHaveTextContent("dark");
  });
});
