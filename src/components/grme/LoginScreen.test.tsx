import { cleanup, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import LoginScreen from "./LoginScreen";

const mockRecordLogin = vi.fn();
let mockManagedUsers: { id: string; name: string; role: string; active: boolean }[] = [];

vi.mock("@/lib/grme-managed-users", () => ({
  useManagedUsers: () => ({
    users: mockManagedUsers,
    recordLogin: mockRecordLogin,
  }),
}));

function renderLogin(onLogin = vi.fn().mockResolvedValue({ success: true })) {
  return { onLogin, ...render(<LoginScreen onLogin={onLogin} />) };
}

function getNameInput() {
  return screen.getByPlaceholderText(/e\.g\./i);
}

function getSubmitButton() {
  return screen.getByRole("button", { name: /enter dashboard/i });
}

function getAdminPasswordInput() {
  return screen.getByPlaceholderText(/admin password/i);
}

describe("LoginScreen", () => {
  beforeEach(() => {
    mockManagedUsers = [];
    vi.clearAllMocks();
  });

  afterEach(cleanup);

  // ── Rendering ─────────────────────────────────────────────

  it("renders the name input and submit button", () => {
    renderLogin();
    expect(getNameInput()).toBeInTheDocument();
    expect(getSubmitButton()).toBeInTheDocument();
  });

  it("renders role selection when no managed user is matched", () => {
    renderLogin();
    expect(screen.getByRole("radio", { name: /viewer/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /editor/i })).toBeInTheDocument();
    expect(screen.getByRole("radio", { name: /admin/i })).toBeInTheDocument();
  });

  // ── Validation ────────────────────────────────────────────

  it("shows error when submitting with empty name", async () => {
    renderLogin();
    await userEvent.click(getSubmitButton());
    expect(screen.getByText(/please enter your name/i)).toBeInTheDocument();
  });

  it("shows error when submitting admin without password", async () => {
    renderLogin();
    await userEvent.type(getNameInput(), "Admin User");
    await userEvent.click(screen.getByRole("radio", { name: /admin/i }));
    await userEvent.click(getSubmitButton());
    expect(screen.getByText(/admin password is required/i)).toBeInTheDocument();
  });

  // ── Bootstrap path (no managed users) ─────────────────────

  it("calls onLogin with name and role when no managed users exist", async () => {
    const { onLogin } = renderLogin();
    await userEvent.type(getNameInput(), "Alice");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("Alice", "viewer");
    });
  });

  it("passes the selected role in bootstrap mode", async () => {
    const { onLogin } = renderLogin();
    await userEvent.type(getNameInput(), "Bob");
    await userEvent.click(screen.getByRole("radio", { name: /editor/i }));
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("Bob", "editor");
    });
  });

  // ── Admin path ────────────────────────────────────────────

  it("requires admin password and passes it to onLogin", async () => {
    const { onLogin } = renderLogin();
    await userEvent.type(getNameInput(), "Admin");
    await userEvent.click(screen.getByRole("radio", { name: /admin/i }));
    const pw = getAdminPasswordInput();
    await userEvent.type(pw, "secret");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("Admin", "admin", "secret");
    });
  });

  it("clears password error when password is entered", async () => {
    renderLogin();
    await userEvent.type(getNameInput(), "Admin");
    await userEvent.click(screen.getByRole("radio", { name: /admin/i }));
    await userEvent.click(getSubmitButton());
    expect(screen.getByText(/admin password is required/i)).toBeInTheDocument();
    const pw = getAdminPasswordInput();
    await userEvent.type(pw, "x");
    expect(screen.queryByText(/admin password is required/i)).not.toBeInTheDocument();
  });

  // ── Managed user path ─────────────────────────────────────

  it("shows matched user info when name matches a managed user", async () => {
    mockManagedUsers = [
      { id: "u1", name: "Alice", role: "editor", active: true },
    ];
    renderLogin();
    await userEvent.type(getNameInput(), "Alice");
    expect(screen.getByText(/account found/i)).toBeInTheDocument();
    expect(screen.getByText(/editor/i)).toBeInTheDocument();
    expect(screen.queryByRole("radio", { name: /admin/i })).not.toBeInTheDocument();
  });

  it("requires password for a matched managed user", async () => {
    mockManagedUsers = [
      { id: "u1", name: "Alice", role: "editor", active: true },
    ];
    const { onLogin } = renderLogin();
    await userEvent.type(getNameInput(), "Alice");
    const pw = screen.getByPlaceholderText(/password/i);
    await userEvent.type(pw, "alice-pw");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(onLogin).toHaveBeenCalledWith("Alice", "editor", "alice-pw");
    });
  });

  it("calls recordLogin after a managed user logs in", async () => {
    mockManagedUsers = [
      { id: "u1", name: "Bob", role: "viewer", active: true },
    ];
    const { onLogin } = renderLogin();
    onLogin.mockResolvedValue({ success: true });
    await userEvent.type(getNameInput(), "Bob");
    await userEvent.type(screen.getByPlaceholderText(/password/i), "bob-pw");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(mockRecordLogin).toHaveBeenCalledWith("u1");
    });
  });

  // ── User not found (managed users exist but name not matched) ──

  it("shows contact-admin error when name is not in managed users", async () => {
    mockManagedUsers = [
      { id: "u1", name: "Alice", role: "editor", active: true },
    ];
    const { onLogin } = renderLogin();
    await userEvent.type(getNameInput(), "Unknown");
    await userEvent.click(getSubmitButton());
    expect(screen.getByText(/user not found/i)).toBeInTheDocument();
    expect(onLogin).not.toHaveBeenCalled();
  });

  // ── Error display ─────────────────────────────────────────

  it("displays error message when onLogin fails", async () => {
    const { onLogin } = renderLogin();
    onLogin.mockResolvedValue({ success: false, error: "Bad credentials" });
    await userEvent.type(getNameInput(), "Alice");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/bad credentials/i)).toBeInTheDocument();
    });
  });

  it("clears error when name is changed", async () => {
    const { onLogin } = renderLogin();
    onLogin.mockResolvedValue({ success: false, error: "Wrong password" });
    await userEvent.type(getNameInput(), "Tester");
    await userEvent.click(getSubmitButton());
    await waitFor(() => {
      expect(screen.getByText(/wrong password/i)).toBeInTheDocument();
    });
    // Changing the name should clear the error
    await userEvent.clear(getNameInput());
    await userEvent.type(getNameInput(), "NewName");
    expect(screen.queryByText(/wrong password/i)).not.toBeInTheDocument();
  });

  // ── Loading state ─────────────────────────────────────────

  it("shows 'Verifying...' while login is in progress", async () => {
    const { onLogin } = renderLogin();
    let resolveLogin: (value: unknown) => void;
    onLogin.mockReturnValue(new Promise((resolve) => { resolveLogin = resolve; }));
    await userEvent.type(getNameInput(), "Charlie");
    await userEvent.click(getSubmitButton());
    expect(screen.getByText(/verifying\.\.\./i)).toBeInTheDocument();
    resolveLogin!({ success: true });
    await waitFor(() => {
      expect(screen.queryByText(/verifying\.\.\./i)).not.toBeInTheDocument();
    });
  });

  // ── First-time vs returning info text ─────────────────────

  it("shows first-time message when no managed users exist", () => {
    renderLogin();
    expect(screen.getByText(/first time/i)).toBeInTheDocument();
  });

  it("shows contact-admin message when managed users exist", () => {
    mockManagedUsers = [
      { id: "u1", name: "Admin", role: "admin", active: true },
    ];
    renderLogin();
    expect(screen.getByText(/contact your administrator/i)).toBeInTheDocument();
  });
});
