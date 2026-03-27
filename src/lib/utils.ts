import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Mask a mobile money number for display.
 * "770001234" → "77X XXX X34"
 */
export function maskMobileNumber(number: string): string {
  if (!number || number.length < 4) return number;
  const clean = number.replace(/\s/g, "");
  const first2 = clean.slice(0, 2);
  const last2 = clean.slice(-2);
  const middleLen = clean.length - 4;
  const masked = "X".repeat(middleLen);
  return `${first2}${masked}${last2}`;
}

/**
 * Format a number as FCFA currency.
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("fr-FR", {
    style: "decimal",
    maximumFractionDigits: 0,
  }).format(amount) + " FCFA";
}

/**
 * Format a timestamp as a localized date string.
 */
export function formatDate(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

/**
 * Format a timestamp as a localized datetime string.
 */
export function formatDateTime(timestamp: number): string {
  return new Date(timestamp).toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

/**
 * Validate mobile money number format (9-10 digits).
 */
export function isValidMobileNumber(number: string): boolean {
  const clean = number.replace(/\s/g, "");
  return /^\d{9,10}$/.test(clean);
}
