import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// ── Mocks for child modules ──────────────────────────────────

const mockLogin = vi.fn();
let mockUserState: { user: { name: string; role: string; loginAt: string; scope: { dzongkhagId: string; thromdeId: string | null; stakeholderId: string } } | null; loaded: boolean } = {
  user: null,
  loaded: false,
};

const adminScope = { dzongkhagId: "", thromdeId: null, stakeholderId: "" };

vi.mock("@/lib/grme-user", () => ({
  useGrmeUser: () => ({
    user: mockUserState.user,
    loaded: mockUserState.loaded,
    login: mockLogin,
    logout: vi.fn(),
    switchRole: vi.fn(),
  }),
  canEditFramework: (role: string) => role === "admin",
  canEnterData: (role: string) => role === "admin" || role === "editor",
  canEnterDataDuringWindow: (user: { role: string }) => user.role === "admin" || user.role === "editor",
  canAccessDzongkhag: () => true,
  canAccessThromde: () => true,
  getAccessibleDzongkhags: () => ([{ id: "thimphu", name: "Thimphu" }]),
}));

vi.mock("@/lib/grme-framework-store", () => ({
  useGRMEFramework: () => ({
    domains: [],
    proposals: [],
    pendingProposals: [],
    reviewedProposals: [],
    loaded: true,
  }),
}));

vi.mock("@/lib/grme-store", () => ({
  useGRMEData: () => ({
    cityData: { cityId: "thimphu", cityName: "Thimphu", assessments: {} },
    assessment: { indicators: {}, auditLog: [] },
    availableYears: [2026],
    availableThromdes: [],
    selectedYear: 2026,
    selectedThromdeId: "",
    setSelectedThromdeId: vi.fn(),
    createYear: vi.fn(),
    deleteYear: vi.fn(),
    updateIndicator: vi.fn(),
    addAuditNote: vi.fn(),
    getDomainScore: () => 50,
    getOverallScore: () => 50,
    getDataEntryStats: () => ({ total: 0, filled: 0, missing: 0, percentage: 0, confidence: 0 }),
    getDomainScoreForYear: () => 50,
    getScoreForYear: () => 50,
    getDataEntryStatsForYear: () => ({ total: 0, filled: 0, missing: 0, percentage: 0, confidence: 0 }),
    selectedCity: "thimphu",
    setSelectedCity: vi.fn(),
    loading: false,
    apiAvailable: false,
    refreshData: vi.fn(),
  }),
}));

vi.mock("@/components/grme/ApiStatus", () => ({
  default: () => null,
  SyncProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  useSync: () => ({ trackSync: () => ({ onSuccess: vi.fn(), onError: vi.fn() }), onRetryAll: vi.fn(), retryAll: vi.fn() }),
}));

vi.mock("@/components/grme/RadarChart", () => ({ default: () => null }));
vi.mock("@/components/grme/AnimatedScore", () => ({ default: () => null }));
vi.mock("@/components/grme/DataQualityBar", () => ({ default: () => null }));
vi.mock("@/components/grme/InsightsPanel", () => ({ default: () => null }));
vi.mock("@/components/grme/DomainCards", () => ({ default: () => null }));
vi.mock("@/components/grme/BenchmarkLegend", () => ({ default: () => null }));
vi.mock("@/components/grme/ComparisonView", () => ({ default: () => null }));
vi.mock("@/components/grme/TrendChart", () => ({ default: () => null }));
vi.mock("@/components/grme/UserBadge", () => ({ default: () => null }));
vi.mock("@/components/grme/YearSelector", () => ({ default: () => null }));
vi.mock("@/components/grme/AuditPanel", () => ({ default: () => null }));
vi.mock("@/components/grme/FrameworkEditor", () => ({ default: () => null }));
vi.mock("@/components/grme/DataEntryForm", () => ({ default: () => null }));
vi.mock("@/components/grme/LoginScreen", () => ({
  default: ({ onLogin }: { onLogin: (...args: unknown[]) => void }) => (
    <div data-testid="login-screen">
      <button onClick={() => onLogin("Test", "admin", "pw")}>Mock Login</button>
    </div>
  ),
}));

import GRMEPage from "@/app/grme/page";

describe("GRMEPage auth state machine", () => {
  beforeEach(() => {
    mockUserState = { user: null, loaded: false };
    mockLogin.mockReset();
  });

  afterEach(cleanup);

  it("renders a loading indicator while user is being determined", () => {
    mockUserState = { user: null, loaded: false };
    render(<GRMEPage />);
    expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });

  it("renders the login screen when user is null and loaded is true", () => {
    mockUserState = { user: null, loaded: true };
    render(<GRMEPage />);
    expect(screen.getByTestId("login-screen")).toBeInTheDocument();
  });

  it("calls the page-level login function when LoginScreen triggers onLogin", async () => {
    mockUserState = { user: null, loaded: true };
    render(<GRMEPage />);
    await userEvent.click(screen.getByText(/mock login/i));
    expect(mockLogin).toHaveBeenCalledWith("Test", "admin", "pw");
  });

  it("renders the dashboard (GRMEApp) when a user is logged in", async () => {
    mockUserState = {
      user: { name: "Admin", role: "admin", loginAt: new Date().toISOString(), scope: adminScope },
      loaded: true,
    };
    render(<GRMEPage />);
    // Dashboard should show the GRME header and tabs
    await waitFor(() => {
      expect(screen.getByText(/dynamic assessment dashboard/i)).toBeInTheDocument();
    });
    expect(screen.getByRole("tab", { name: /dashboard/i })).toBeInTheDocument();
  });

  it("shows data entry tab for admin users", async () => {
    mockUserState = {
      user: { name: "Admin", role: "admin", loginAt: new Date().toISOString(), scope: adminScope },
      loaded: true,
    };
    render(<GRMEPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /data entry/i })).toBeInTheDocument();
    });
  });

  it("shows framework tab for admin users", async () => {
    mockUserState = {
      user: { name: "Admin", role: "admin", loginAt: new Date().toISOString(), scope: adminScope },
      loaded: true,
    };
    render(<GRMEPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /framework/i })).toBeInTheDocument();
    });
  });

  it("shows data entry tab but NOT framework tab for editors", async () => {
    mockUserState = {
      user: { name: "Editor", role: "editor", loginAt: new Date().toISOString(), scope: { dzongkhagId: "thimphu", thromdeId: null, stakeholderId: "planning" } },
      loaded: true,
    };
    render(<GRMEPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /data entry/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole("tab", { name: /framework/i })).not.toBeInTheDocument();
  });

  it("hides data entry and framework tabs for viewers", async () => {
    mockUserState = {
      user: { name: "Viewer", role: "viewer", loginAt: new Date().toISOString(), scope: { dzongkhagId: "thimphu", thromdeId: null, stakeholderId: "planning" } },
      loaded: true,
    };
    render(<GRMEPage />);
    await waitFor(() => {
      expect(screen.getByRole("tab", { name: /dashboard/i })).toBeInTheDocument();
    });
    expect(screen.queryByRole("tab", { name: /data entry/i })).not.toBeInTheDocument();
    expect(screen.queryByRole("tab", { name: /framework/i })).not.toBeInTheDocument();
  });
});
