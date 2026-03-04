import { render, screen, fireEvent } from "@testing-library/react";
import { LanguageToggle } from "../LanguageToggle";

// Mock next-intl
let mockLocale = "de";
jest.mock("next-intl", () => ({
  useLocale: () => mockLocale,
}));

// Mock @/i18n/navigation
const mockReplace = jest.fn();
jest.mock("@/i18n/navigation", () => ({
  useRouter: () => ({ replace: mockReplace }),
  usePathname: () => "/",
}));

beforeEach(() => {
  mockLocale = "de";
  mockReplace.mockClear();
});

describe("LanguageToggle", () => {
  it("renders with 'EN' text when locale is 'de'", () => {
    render(<LanguageToggle />);
    expect(screen.getByText("EN")).toBeInTheDocument();
  });

  it("has correct aria-label for German locale", () => {
    render(<LanguageToggle />);
    expect(
      screen.getByLabelText("Switch to English")
    ).toBeInTheDocument();
  });

  it("calls router.replace with 'en' locale when clicked", () => {
    render(<LanguageToggle />);

    fireEvent.click(screen.getByText("EN"));

    expect(mockReplace).toHaveBeenCalledWith("/", { locale: "en" });
  });

  it("renders 'DE' when locale is 'en'", () => {
    mockLocale = "en";
    render(<LanguageToggle />);
    expect(screen.getByText("DE")).toBeInTheDocument();
  });

  it("has correct aria-label for English locale", () => {
    mockLocale = "en";
    render(<LanguageToggle />);
    expect(
      screen.getByLabelText("Auf Deutsch wechseln")
    ).toBeInTheDocument();
  });

  it("renders as a button element", () => {
    render(<LanguageToggle />);
    expect(screen.getByRole("button")).toBeInTheDocument();
  });
});
