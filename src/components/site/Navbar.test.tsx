import { render, screen, fireEvent, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { Navbar } from "./Navbar";

// Mock Supabase client
vi.mock("@/lib/supabase/client", () => ({
  createClient: () => ({
    auth: {
      getUser: vi.fn().mockResolvedValue({ data: { user: null } }),
      onAuthStateChange: vi.fn().mockReturnValue({
        data: { subscription: { unsubscribe: vi.fn() } },
      }),
    },
  }),
}));

// Mock usePresence hook
vi.mock("@/hooks/usePresence", () => ({
  usePresence: () => ({ onlineUsers: 5 }),
  getPresenceBadgeClass: () => "bg-lime",
}));

describe("Navbar Sticky Header", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    Object.defineProperty(window, "scrollY", { value: 0, writable: true });
    vi.stubGlobal("requestAnimationFrame", (fn: FrameRequestCallback) => {
      fn(0);
      return 0;
    });
  });

  it("renders with initial un-shrunk header height h-20 when scrollY <= 100", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const header = screen.getByRole("banner");
    expect(header.className).toContain("h-20");
    expect(header.className).not.toContain("h-14");
  });

  it("shrinks header to h-14 when scrolled down past 100px", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const header = screen.getByRole("banner");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 150, writable: true });
      fireEvent.scroll(window);
    });

    expect(header.className).toContain("h-14");
  });

  it("restores to h-20 when scrolling back to the top", () => {
    render(
      <BrowserRouter>
        <Navbar />
      </BrowserRouter>
    );
    const header = screen.getByRole("banner");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 200, writable: true });
      fireEvent.scroll(window);
    });
    expect(header.className).toContain("h-14");

    act(() => {
      Object.defineProperty(window, "scrollY", { value: 0, writable: true });
      fireEvent.scroll(window);
    });
    expect(header.className).toContain("h-20");
  });
});
