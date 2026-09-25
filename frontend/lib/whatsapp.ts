/**
 * WhatsApp Click-to-Chat (https://wa.me) helpers. Nothing here sends a message — it only builds
 * a link that opens WhatsApp with the text pre-filled; the admin reviews it and presses Send.
 */

const DEFAULT_COUNTRY_CODE = "91";

/**
 * Converts a registered phone number (stored free-form, e.g. "98765 43210", "+91-98765-43210")
 * to the digits-only international form wa.me expects, e.g. "919876543210". Returns null for
 * anything that can't be confidently mapped, so an incorrect chat is never opened.
 *
 * - Numbers written with a "+" or "00" prefix are taken as already international (8–15 digits).
 * - Otherwise they're treated as Indian mobiles: 10 digits starting 6–9, optionally preceded by
 *   a trunk "0" or the "91" country code.
 */
export function toWhatsAppNumber(phone: string | null | undefined): string | null {
  if (!phone) return null;
  const trimmed = phone.trim();
  if (!/^[0-9+\-\s().]+$/.test(trimmed)) return null;
  const digits = trimmed.replace(/\D/g, "");

  if (trimmed.startsWith("+") || trimmed.startsWith("00")) {
    const international = trimmed.startsWith("00") ? digits.slice(2) : digits;
    if (!/^[1-9]\d{7,14}$/.test(international)) return null;
    if (international.startsWith(DEFAULT_COUNTRY_CODE) && !/^91[6-9]\d{9}$/.test(international)) return null;
    return international;
  }

  let national = digits;
  if (national.length === 11 && national.startsWith("0")) national = national.slice(1);
  else if (national.length === 12 && national.startsWith(DEFAULT_COUNTRY_CODE)) national = national.slice(2);
  return /^[6-9]\d{9}$/.test(national) ? `${DEFAULT_COUNTRY_CODE}${national}` : null;
}

/** The payment-approved message. Only the student's name is interpolated — no ids or links. */
export function paymentApprovedMessage(studentName: string | null | undefined): string {
  const name = studentName?.trim() || "Student";
  return [
    `Hello ${name},`,
    "",
    "Your payment has been approved by SSR Institute Admin.",
    "",
    "Please login to the LMS/CRM portal to view and download your payment receipt.",
    "",
    "Thank you,",
    "SSR Institute",
  ].join("\n");
}

export function buildWhatsAppUrl(number: string, message: string): string {
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}
