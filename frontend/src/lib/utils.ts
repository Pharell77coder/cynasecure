export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + "€";
}

export interface PasswordStrength {
  minLength: boolean;
  hasUppercase: boolean;
  hasLowercase: boolean;
  hasDigit: boolean;
  hasSpecial: boolean;
  isValid: boolean;
}

export function checkPasswordStrength(pw: string): PasswordStrength {
  const minLength = pw.length >= 8;
  const hasUppercase = /[A-Z]/.test(pw);
  const hasLowercase = /[a-z]/.test(pw);
  const hasDigit = /[0-9]/.test(pw);
  const hasSpecial = /[!@#$%^&*()\-_=+[\]{};':"\\|,.<>/?]/.test(pw);
  return {
    minLength,
    hasUppercase,
    hasLowercase,
    hasDigit,
    hasSpecial,
    isValid: minLength && hasUppercase && hasLowercase && hasDigit && hasSpecial,
  };
}
