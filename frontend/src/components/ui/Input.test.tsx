import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Input } from "./Input";

describe("Input", () => {
  it("rend un élément input", () => {
    render(<Input />);
    expect(screen.getByRole("textbox")).toBeInTheDocument();
  });

  it("affiche la valeur passée en prop", () => {
    render(<Input value="test@example.com" readOnly />);
    expect(screen.getByRole("textbox")).toHaveValue("test@example.com");
  });

  it("appelle onChange quand la valeur change", () => {
    const onChange = vi.fn();
    render(<Input onChange={onChange} />);
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "abc" } });
    expect(onChange).toHaveBeenCalledOnce();
  });

  it("respecte le placeholder", () => {
    render(<Input placeholder="Votre email" />);
    expect(screen.getByPlaceholderText("Votre email")).toBeInTheDocument();
  });

  it("respecte le type password (pas de role textbox)", () => {
    const { container } = render(<Input type="password" />);
    const input = container.querySelector("input");
    expect(input).toHaveAttribute("type", "password");
  });

  it("ajoute padding gauche quand une icône est fournie", () => {
    const { container } = render(<Input icon={<span>@</span>} />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("pl-10");
  });

  it("n'ajoute pas de padding gauche sans icône", () => {
    const { container } = render(<Input />);
    const input = container.querySelector("input");
    expect(input?.className).toContain("px-4");
  });

  it("est désactivable via la prop disabled", () => {
    render(<Input disabled />);
    expect(screen.getByRole("textbox")).toBeDisabled();
  });
});
