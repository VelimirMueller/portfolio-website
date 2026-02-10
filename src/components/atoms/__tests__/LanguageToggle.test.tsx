import { render, screen, act } from "@testing-library/react";
import { LanguageToggle } from "../LanguageToggle";
import { LanguageProvider } from "@/components/language/LanguageProvider";

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

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
});

const renderWithProviders = async (ui: React.ReactElement) => {
  let result: ReturnType<typeof render> | undefined;
  await act(async () => {
    result = render(<LanguageProvider>{ui}</LanguageProvider>);
  });
  return result!;
};

describe("LanguageToggle", () => {
  it("renders with 'EN' text when default language is 'de'", async () => {
    await renderWithProviders(<LanguageToggle />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("has correct aria-label for default German language", async () => {
    await renderWithProviders(<LanguageToggle />);
    expect(
      screen.getByLabelText("Switch to English")
    ).toBeInTheDocument();
  });

  it("switches to 'DE' text after clicking", async () => {
    await renderWithProviders(<LanguageToggle />);

    await act(async () => {
      screen.getByText("EN").click();
    });

    expect(screen.getByText("DE")).toBeInTheDocument();
  });

  it("updates aria-label after toggling to English", async () => {
    await renderWithProviders(<LanguageToggle />);

    await act(async () => {
      screen.getByText("EN").click();
    });

    expect(
      screen.getByLabelText("Auf Deutsch wechseln")
    ).toBeInTheDocument();
  });

  it("renders as a button element", async () => {
    await renderWithProviders(<LanguageToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("toggles back to EN after two clicks", async () => {
    await renderWithProviders(<LanguageToggle />);

    await act(async () => {
      screen.getByText("EN").click();
    });

    await act(async () => {
      screen.getByText("DE").click();
    });

    expect(screen.getByText("EN")).toBeInTheDocument();
  });
});
