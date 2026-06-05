import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import { MemoryRouter } from "react-router-dom";

const mockLogin = vi.fn();

vi.mock("../../hooks/useAuth", () => ({
  useAuth: () => ({
    login: mockLogin,
    isAuthenticated: false,
  }),
}));

vi.mock("../../api/auth", () => ({
  authApi: {
    resendVerification: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("../../hooks/useToast", () => ({
  toast: vi.fn(),
}));

vi.mock("react-i18next", () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}));

const renderLogin = async () => {
  const { default: LoginPage } = await import("./LoginPage");
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>
  );
};

describe("LoginPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockLogin.mockResolvedValue({});
  });

  it("affiche le champ email", async () => {
    await renderLogin();
    expect(screen.getByLabelText(/auth\.email/i)).toBeInTheDocument();
  });

  it("affiche le champ mot de passe", async () => {
    await renderLogin();
    expect(screen.getByLabelText(/auth\.password/i)).toBeInTheDocument();
  });

  it("affiche le bouton de soumission", async () => {
    await renderLogin();
    expect(screen.getByRole("button", { name: /auth\.loginBtn/i })).toBeInTheDocument();
  });

  it("affiche une erreur si soumis sans email ni mot de passe", async () => {
    await renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /auth\.loginBtn/i }));

    await waitFor(() => {
      const alerts = screen.getAllByRole("alert");
      expect(alerts.length).toBeGreaterThan(0);
    });
  });

  it("n'appelle pas login si les champs sont vides", async () => {
    await renderLogin();

    fireEvent.click(screen.getByRole("button", { name: /auth\.loginBtn/i }));

    await waitFor(() => {
      expect(mockLogin).not.toHaveBeenCalled();
    });
  });

  it("met à jour le champ email après saisie", async () => {
    await renderLogin();
    const emailInput = screen.getByLabelText(/auth\.email/i);
    fireEvent.change(emailInput, { target: { value: "test@example.com" } });
    expect(emailInput).toHaveValue("test@example.com");
  });

  it("met à jour le champ mot de passe après saisie", async () => {
    await renderLogin();
    const pwInput = screen.getByLabelText(/auth\.password/i);
    fireEvent.change(pwInput, { target: { value: "monpass" } });
    expect(pwInput).toHaveValue("monpass");
  });
});
