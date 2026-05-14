export function cn(...classes: Array<string | undefined | null | false>): string {
  return classes.filter(Boolean).join(" ");
}

export function formatPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value) + "€";
}
