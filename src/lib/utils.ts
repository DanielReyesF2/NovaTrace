import { createHash } from "crypto";

/**
 * Batch code format: {Year}/{Month}/{Reactor}/{Feedstock}/{Consecutive}
 *
 * Year:       A=2024, B=2025, C=2026...
 * Month:      01-12
 * Reactor:    1=DY-500
 * Feedstock:  LDPA (LDPE Agrícola), HDPI (HDPE Industrial),
 *             LDPF (LDPE Film), PPM (PP Mixto), GEN (genérico)
 * Consecutive: 01, 02... (same feedstock+month)
 */

const YEAR_LETTERS: Record<number, string> = {
  2024: "A",
  2025: "B",
  2026: "C",
  2027: "D",
  2028: "E",
};

export const FEEDSTOCK_CODES: Record<string, string> = {
  "LDPE Agrícola": "LDPA",
  "HDPE Industrial": "HDPI",
  "LDPE Film": "LDPF",
  "PP Mixto": "PPM",
};

export function generateBatchCode(
  date: Date,
  feedstockType: string,
  sequenceNumber: number,
): string {
  const yearLetter = YEAR_LETTERS[date.getFullYear()] ?? "X";
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const reactor = "1"; // DY-500
  const feedCode = FEEDSTOCK_CODES[feedstockType] ?? "GEN";
  const seq = String(sequenceNumber).padStart(2, "0");
  return `${yearLetter}/${month}/${reactor}/${feedCode}/${seq}`;
}

/**
 * Generate SHA-256 hash of batch data for certificate integrity
 */
export function hashBatchData(data: Record<string, unknown>): string {
  const canonical = JSON.stringify(data, Object.keys(data).sort());
  return createHash("sha256").update(canonical).digest("hex");
}

/**
 * Generate certificate verification code
 */
export function generateCertCode(): string {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"; // No ambiguous chars
  let code = "";
  for (let i = 0; i < 8; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

/**
 * Format date for display
 */
export function formatDate(date: Date | string): string {
  const d = new Date(date);
  return d.toLocaleDateString("es-MX", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}
