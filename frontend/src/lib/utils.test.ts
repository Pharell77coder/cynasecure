import { describe, it, expect } from "vitest";
import { cn, formatPrice, checkPasswordStrength } from "./utils";

describe("cn", () => {
  it("joint les classes non vides", () => {
    expect(cn("a", "b", "c")).toBe("a b c");
  });

  it("ignore les valeurs falsy", () => {
    expect(cn("a", false, null, undefined, "b")).toBe("a b");
  });

  it("retourne une chaine vide si tout est falsy", () => {
    expect(cn(false, null, undefined)).toBe("");
  });
});

describe("formatPrice", () => {
  it("formate un entier avec le symbole euro", () => {
    expect(formatPrice(100)).toContain("€");
    expect(formatPrice(100)).toContain("100");
  });

  it("formate zéro", () => {
    expect(formatPrice(0)).toContain("0");
    expect(formatPrice(0)).toContain("€");
  });

  it("formate un grand nombre", () => {
    const result = formatPrice(1000);
    expect(result).toContain("€");
    expect(result).toMatch(/1\s?000/);
  });

  it("ne montre pas de décimales", () => {
    const result = formatPrice(99);
    expect(result).not.toContain(",");
    expect(result).not.toContain(".");
  });
});

describe("checkPasswordStrength", () => {
  it("mot de passe vide échoue toutes les règles", () => {
    const r = checkPasswordStrength("");
    expect(r.isValid).toBe(false);
    expect(r.minLength).toBe(false);
    expect(r.hasUppercase).toBe(false);
    expect(r.hasLowercase).toBe(false);
    expect(r.hasDigit).toBe(false);
    expect(r.hasSpecial).toBe(false);
  });

  it("mot de passe valide réussit toutes les règles", () => {
    const r = checkPasswordStrength("Secure1!");
    expect(r.isValid).toBe(true);
    expect(r.minLength).toBe(true);
    expect(r.hasUppercase).toBe(true);
    expect(r.hasLowercase).toBe(true);
    expect(r.hasDigit).toBe(true);
    expect(r.hasSpecial).toBe(true);
  });

  it("moins de 8 caractères: minLength faux", () => {
    const r = checkPasswordStrength("Ab1!");
    expect(r.minLength).toBe(false);
    expect(r.isValid).toBe(false);
  });

  it("exactement 8 caractères valides: minLength vrai", () => {
    const r = checkPasswordStrength("Secure1!");
    expect(r.minLength).toBe(true);
  });

  it("sans majuscule: hasUppercase faux", () => {
    const r = checkPasswordStrength("secure1!abc");
    expect(r.hasUppercase).toBe(false);
    expect(r.isValid).toBe(false);
  });

  it("sans minuscule: hasLowercase faux", () => {
    const r = checkPasswordStrength("SECURE1!ABC");
    expect(r.hasLowercase).toBe(false);
    expect(r.isValid).toBe(false);
  });

  it("sans chiffre: hasDigit faux", () => {
    const r = checkPasswordStrength("SecureABC!");
    expect(r.hasDigit).toBe(false);
    expect(r.isValid).toBe(false);
  });

  it("sans caractère spécial: hasSpecial faux", () => {
    const r = checkPasswordStrength("Secure1abc");
    expect(r.hasSpecial).toBe(false);
    expect(r.isValid).toBe(false);
  });

  it("reconnaît les caractères spéciaux variés", () => {
    for (const special of ["!", "@", "#", "$", "%", "^", "&", "*"]) {
      const r = checkPasswordStrength(`Secure1${special}`);
      expect(r.hasSpecial).toBe(true);
    }
  });
});
