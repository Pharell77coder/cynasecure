import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import React from "react";
import { Button } from "./Button";

describe("Button", () => {
  it("affiche le contenu enfant", () => {
    render(<Button>Connexion</Button>);
    expect(screen.getByRole("button", { name: "Connexion" })).toBeInTheDocument();
  });

  it("déclenche onClick quand cliqué", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Cliquer</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("ne déclenche pas onClick quand disabled", () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick} disabled>Désactivé</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).not.toHaveBeenCalled();
  });

  it("applique disabled sur l'élément button", () => {
    render(<Button disabled>Btn</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });

  it("utilise le type submit si spécifié", () => {
    render(<Button type="submit">Envoyer</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("type", "submit");
  });

  it("sans prop type, le bouton n'a pas d'attribut type explicite", () => {
    render(<Button>Btn</Button>);
    // Le composant ne force pas type="button" — comportement HTML natif
    expect(screen.getByRole("button")).not.toHaveAttribute("type", "submit");
  });

  it("ajoute la classe fullWidth quand la prop est présente", () => {
    render(<Button fullWidth>Btn</Button>);
    expect(screen.getByRole("button").className).toContain("w-full");
  });

  it("passe les attributs HTML supplémentaires", () => {
    render(<Button aria-label="mon bouton">Btn</Button>);
    expect(screen.getByRole("button")).toHaveAttribute("aria-label", "mon bouton");
  });
});
