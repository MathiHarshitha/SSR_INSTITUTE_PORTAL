import { PaymentRecord } from "@/types/fee";

const ONES = [
  "", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven",
  "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen",
];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function belowThousand(n: number): string {
  const parts: string[] = [];
  if (n >= 100) {
    parts.push(`${ONES[Math.floor(n / 100)]} Hundred`);
    n %= 100;
  }
  if (n >= 20) {
    parts.push(TENS[Math.floor(n / 10)] + (n % 10 ? ` ${ONES[n % 10]}` : ""));
  } else if (n > 0) {
    parts.push(ONES[n]);
  }
  return parts.join(" ");
}

/** Indian numbering (lakh/crore), e.g. 125000 → "One Lakh Twenty Five Thousand". */
function toIndianWords(n: number): string {
  if (n === 0) return "Zero";
  const parts: string[] = [];
  const crore = Math.floor(n / 10_000_000);
  const lakh = Math.floor((n % 10_000_000) / 100_000);
  const thousand = Math.floor((n % 100_000) / 1000);
  const rest = n % 1000;
  if (crore) parts.push(`${toIndianWords(crore)} Crore`);
  if (lakh) parts.push(`${belowThousand(lakh)} Lakh`);
  if (thousand) parts.push(`${belowThousand(thousand)} Thousand`);
  if (rest) parts.push(belowThousand(rest));
  return parts.join(" ");
}

export function amountInWords(amount: number): string {
  const rupees = Math.floor(amount);
  const paise = Math.round((amount - rupees) * 100);
  return `Rupees ${toIndianWords(rupees)}${paise ? ` and ${toIndianWords(paise)} Paise` : ""} Only`;
}

// The PDF's built-in Helvetica has no ₹ glyph, so amounts use "Rs." in the file.
function rs(amount: number): string {
  return `Rs. ${amount.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function formatDate(value: string): string {
  return new Date(value).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

/**
 * Builds and downloads a PDF receipt for one recorded payment. Every figure comes from the
 * backend's `Payment` record — this only formats it. jsPDF is loaded on demand so it isn't in
 * the page bundle.
 */
export async function downloadPaymentReceipt(payment: PaymentRecord): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const left = 20;
  const right = 190;
  let y = 24;

  // Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(30, 41, 59);
  doc.text("SSR Institute", left, y);
  doc.setFontSize(11);
  doc.setTextColor(100, 116, 139);
  doc.text("PAYMENT RECEIPT", left, y + 7);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.text("Receipt No.", right, y - 4, { align: "right" });
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(payment.receiptNumber, right, y + 1, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setTextColor(100, 116, 139);
  doc.text(`Date: ${formatDate(payment.paymentDate)}`, right, y + 7, { align: "right" });

  y += 16;
  doc.setDrawColor(226, 232, 240);
  doc.line(left, y, right, y);

  // Received from
  y += 10;
  doc.setFontSize(9);
  doc.text("RECEIVED FROM", left, y);
  y += 6;
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(30, 41, 59);
  doc.text(payment.student?.name ?? "-", left, y);
  if (payment.student?.email) {
    y += 5.5;
    doc.setFont("helvetica", "normal");
    doc.setFontSize(10);
    doc.setTextColor(100, 116, 139);
    doc.text(payment.student.email, left, y);
  }

  // Details
  y += 12;
  const rows: [string, string][] = [
    ["Course", payment.course?.name ?? "-"],
    ["Batch", payment.batch?.name ?? "-"],
    ["Payment date", formatDate(payment.paymentDate)],
    ["Payment method", payment.paymentMethod.replace("_", " ")],
  ];
  if (payment.transactionRef) rows.push(["Transaction reference", payment.transactionRef]);
  if (payment.notes) rows.push(["Notes", payment.notes]);

  doc.setFontSize(10);
  for (const [label, value] of rows) {
    doc.setFont("helvetica", "normal");
    doc.setTextColor(100, 116, 139);
    doc.text(label, left, y);
    doc.setTextColor(30, 41, 59);
    const lines = doc.splitTextToSize(value, 110) as string[];
    doc.text(lines, left + 60, y);
    y += 7 * lines.length;
  }

  // Amount
  y += 4;
  doc.setFillColor(241, 245, 249);
  doc.roundedRect(left, y, right - left, 26, 3, 3, "F");
  doc.setFontSize(10);
  doc.setTextColor(100, 116, 139);
  doc.text("Amount received", left + 6, y + 9);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(16);
  doc.setTextColor(22, 163, 74);
  doc.text(rs(payment.amount), right - 6, y + 10, { align: "right" });
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.setTextColor(71, 85, 105);
  doc.text(doc.splitTextToSize(amountInWords(payment.amount), right - left - 12) as string[], left + 6, y + 19);

  // Footer
  y += 42;
  doc.setDrawColor(226, 232, 240);
  doc.line(left, y, right, y);
  y += 7;
  doc.setFontSize(8.5);
  doc.setTextColor(148, 163, 184);
  doc.text("This is a computer-generated receipt and does not require a signature.", left, y);
  doc.text(
    `Quote receipt number ${payment.receiptNumber} for any fee-related query. Generated on ${formatDate(new Date().toISOString())}.`,
    left,
    y + 5
  );

  doc.save(`Receipt-${payment.receiptNumber}.pdf`);
}
