import { createHash } from "crypto";

/**
 * Generate batch code: ECO-DY500-YYYYMMDD-NNN
 */
export function generateBatchCode(date: Date, sequenceNumber: number): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  const seq = String(sequenceNumber).padStart(3, "0");
  return `ECO-DY500-${y}${m}${d}-${seq}`;
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
