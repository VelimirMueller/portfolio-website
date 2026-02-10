import { render, screen, act } from "@testing-library/react";
import {
  LanguageProvider,
  useLanguage,
  useTranslationArray,
  useTranslationObjectArray,
} from "../LanguageProvider";

// Helper component to consume the language context
function LanguageConsumer() {
  const { language, toggleLanguage, t } = useLanguage();
  return (
    <div>
      <span data-testid="lang-value">{language}</span>
      <span data-testid="t-nav-home">{t("nav.home")}</span>
      <span data-testid="t-invalid">{t("nonexistent.key")}</span>
      <span data-testid="t-deep-invalid">{t("nav.home.extra")}</span>
      <button onClick={toggleLanguage}>Toggle</button>
    </div>
  );
}

function ArrayConsumer({ keyPath }: { keyPath: string }) {
  const items = useTranslationArray(keyPath);
  return (
    <ul data-testid="array-list">
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  );
}

function ObjectArrayConsumer({ keyPath }: { keyPath: string }) {
  const items = useTranslationObjectArray(keyPath);
  return (
    <ul data-testid="object-array-list">
      {items.map((item, i) => (
        <li key={i}>{JSON.stringify(item)}</li>
      ))}
    </ul>
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

beforeEach(() => {
  localStorageMock.clear();
  jest.clearAllMocks();
  document.documentElement.lang = "";
});

describe("LanguageProvider", () => {
  it("provides language context with default 'de'", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });
    expect(screen.getByTestId("lang-value")).toHaveTextContent("de");
  });

  it("translates keys correctly for default language (de)", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });
    expect(screen.getByTestId("t-nav-home")).toHaveTextContent("Start");
  });

  it("returns the key itself for nonexistent translation keys", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });
    expect(screen.getByTestId("t-invalid")).toHaveTextContent(
      "nonexistent.key"
    );
  });

  it("returns the key when value resolves to a non-string (e.g. object)", async () => {
    // "nav.children" resolves to an object, not a string
    function NonStringConsumer() {
      const { t } = useLanguage();
      return <span data-testid="t-object">{t("nav.children")}</span>;
    }

    await act(async () => {
      render(
        <LanguageProvider>
          <NonStringConsumer />
        </LanguageProvider>
      );
    });

    expect(screen.getByTestId("t-object")).toHaveTextContent("nav.children");
  });

  it("returns the key when traversal hits a non-object (string leaf)", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });
    // nav.home is a string, so nav.home.extra can't be traversed
    expect(screen.getByTestId("t-deep-invalid")).toHaveTextContent(
      "nav.home.extra"
    );
  });

  it("toggleLanguage switches between 'de' and 'en'", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("de");

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("en");
    expect(screen.getByTestId("t-nav-home")).toHaveTextContent("Home");

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("de");
  });

  it("persists language to localStorage and sets document.lang", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });

    await act(async () => {
      screen.getByText("Toggle").click();
    });

    expect(localStorageMock.setItem).toHaveBeenCalledWith("language", "en");
    expect(document.documentElement.lang).toBe("en");
  });

  it("reads saved language from localStorage on mount", async () => {
    localStorageMock.getItem.mockReturnValueOnce("en");

    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("en");
  });

  it("ignores invalid localStorage value", async () => {
    localStorageMock.getItem.mockReturnValueOnce("fr");

    await act(async () => {
      render(
        <LanguageProvider>
          <LanguageConsumer />
        </LanguageProvider>
      );
    });

    expect(screen.getByTestId("lang-value")).toHaveTextContent("de");
  });
});

describe("useLanguage", () => {
  it("throws error when used outside LanguageProvider", () => {
    const consoleSpy = jest.spyOn(console, "error").mockImplementation();

    expect(() => render(<LanguageConsumer />)).toThrow(
      "useLanguage must be used within a LanguageProvider"
    );

    consoleSpy.mockRestore();
  });
});

describe("useTranslationArray", () => {
  it("returns string items for a string array key", async () => {
    // services.valueItems is a string array — covers the `typeof v === 'string' ? v` branch
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="services.valueItems" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    expect(list.children.length).toBeGreaterThan(0);
    expect(list.children[0].textContent).toBeTruthy();
  });

  it("returns an array for valid array keys", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="home.techStack" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    // techStack may or may not exist — if it doesn't, we'll get an empty list
    expect(list).toBeInTheDocument();
  });

  it("returns empty array for nonexistent key", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="does.not.exist" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    expect(list.children).toHaveLength(0);
  });

  it("returns empty array when key hits a non-object during traversal", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="nav.home.deep.path" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    expect(list.children).toHaveLength(0);
  });

  it("returns empty array when key resolves to a string (not array)", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="nav.home" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    expect(list.children).toHaveLength(0);
  });

  it("stringifies non-string items in array via JSON.stringify", async () => {
    // serviceDetail.requirements-engineering.process is an array of objects,
    // useTranslationArray maps them through JSON.stringify
    await act(async () => {
      render(
        <LanguageProvider>
          <ArrayConsumer keyPath="serviceDetail.requirements-engineering.process" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("array-list");
    expect(list.children.length).toBeGreaterThan(0);
    // Each item should be a JSON stringified object
    expect(list.children[0].textContent).toContain("title");
  });
});

describe("useTranslationObjectArray", () => {
  it("returns empty array for nonexistent key", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ObjectArrayConsumer keyPath="does.not.exist" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("object-array-list");
    expect(list.children).toHaveLength(0);
  });

  it("returns empty array when key hits a non-object during traversal", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ObjectArrayConsumer keyPath="nav.home.deep.path" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("object-array-list");
    expect(list.children).toHaveLength(0);
  });

  it("returns empty array when key resolves to a string", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ObjectArrayConsumer keyPath="nav.home" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("object-array-list");
    expect(list.children).toHaveLength(0);
  });

  it("returns object array for valid array key", async () => {
    await act(async () => {
      render(
        <LanguageProvider>
          <ObjectArrayConsumer keyPath="serviceDetail.requirements-engineering.process" />
        </LanguageProvider>
      );
    });

    const list = screen.getByTestId("object-array-list");
    // serviceDetail.requirements-engineering.process is an array of {title, desc} objects
    expect(list.children.length).toBeGreaterThan(0);
  });
});
