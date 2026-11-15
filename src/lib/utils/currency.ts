/**
 * Currency and financial number utilities.
 * Amounts in the database are stored as integer paise (1 INR = 100 paise)
 * to avoid IEEE-754 floating point inaccuracies.
 */

export function paiseToRupees(paise: number): number {
  return (paise || 0) / 100;
}

export function rupeesToPaise(rupees: number | string): number {
  const num = typeof rupees === "string" ? parseFloat(rupees) : rupees;
  if (isNaN(num)) return 0;
  return Math.round(num * 100);
}

export function formatCurrency(
  paise: number,
  currency: string = "INR",
  locale: string = "en-IN"
): string {
  const rupees = paiseToRupees(paise);
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency: currency,
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(rupees);
}

export function formatCompactCurrency(
  paise: number,
  currency: string = "INR"
): string {
  const rupees = paiseToRupees(paise);
  if (Math.abs(rupees) >= 10000000) {
    return `₹${(rupees / 10000000).toFixed(2)} Cr`;
  }
  if (Math.abs(rupees) >= 100000) {
    return `₹${(rupees / 100000).toFixed(2)} L`;
  }
  if (Math.abs(rupees) >= 1000) {
    return `₹${(rupees / 1000).toFixed(1)}k`;
  }
  return formatCurrency(paise, currency);
}
