import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";

// ── Supabase client mock ─────────────────────────────────────────────────────
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      signOut: vi.fn().mockResolvedValue({ error: null }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

// ── usePresence hook mock ────────────────────────────────────────────────────
vi.mock("@/hooks/usePresence", () => ({
  usePresence: () => ({ onlineUsers: 5 }),
  getPresenceBadgeClass: () => "bg-lime",
}));

// ── useAuthHydration hook mock ───────────────────────────────────────────────
vi.mock("@/hooks/useAuthHydration", () => ({
  useAuthHydration: () => ({ user: null, isInitializing: false }),
}));

// ── i18n mocks ───────────────────────────────────────────────────────────────
vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
    i18n: { language: "en" },
  }),
}));

vi.mock("@/lib/i18n", () => ({
  localizedPath: (_lang: string, path: string) => path,
}));

// ── Tests ─────────────────────────────────────────────────────────────────────
describe("Navbar – sticky-header shrink-on-scroll", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    // Start with scrollY at 0
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    // Synchronously execute rAF callbacks in tests
    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
      fn(0);
      return 0;
    });
  });

  it("renders with large header (h-20) at the top of the page", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    const header = screen.getByRole("banner");
    expect(header.className).toContain("h-20");
    expect(header.className).not.toContain("h-14");
  });

  it("shrinks header to h-14 when the user scrolls past 100 px", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    const header = screen.getByRole("banner");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      fireEvent.scroll(window);
    });

    expect(header.className).toContain("h-14");
    expect(header.className).not.toContain("h-20");
  });

  it("restores h-20 when scrolling back to the top", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    const header = screen.getByRole("banner");

    // Scroll down
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, writable: true });
      fireEvent.scroll(window);
    });
    expect(header.className).toContain("h-14");

    // Scroll back to top
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });
      fireEvent.scroll(window);
    });
    expect(header.className).toContain("h-20");
  });

  it("applies data-scrolled attribute to aid CSS-only selectors", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    const header = screen.getByRole("banner");

    // Initially not scrolled
    expect(header.getAttribute("data-scrolled")).toBe("false");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 120, writable: true });
      fireEvent.scroll(window);
    });

    expect(header.getAttribute("data-scrolled")).toBe("true");
  });

  it("applies transition-all CSS class for smooth animation", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );
    const header = screen.getByRole("banner");
    expect(header.className).toContain("transition-all");
    expect(header.className).toContain("duration-300");
  });

  it("logo gets scale-[0.80] class when scrolled", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      fireEvent.scroll(window);
    });

    // The logo Link should include the shrunk scale class
    const logo = document.querySelector(".navbar-logo") as HTMLElement;
    expect(logo.className).toContain("scale-[0.80]");
  });

  it("removes logo shrink scale when back at the top", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>,
    );

    // Scroll down then back
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      fireEvent.scroll(window);
    });
    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });
      fireEvent.scroll(window);
    });

    const logo = document.querySelector(".navbar-logo") as HTMLElement;
    expect(logo.className).toContain("scale-100");
    expect(logo.className).not.toContain("scale-[0.80]");
  });
});
