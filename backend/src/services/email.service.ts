import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";

/** User-controlled values (names, task/job titles, reasons) are escaped before being placed in
 * email HTML, so they can't inject markup or links into messages sent from our domain. */
function esc(value: unknown): string {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

interface EmailPayload {
  to: string;
  subject: string;
  html: string;
}

function formatInr(amount: number): string {
  return `₹${amount.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
}

let transporter: Transporter | null = null;

/** Created on first use so a process that never sends mail never opens an SMTP connection. */
function getTransporter(): Transporter {
  transporter ??= nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    // 465 is implicit TLS; other ports (587/25) upgrade via STARTTLS.
    secure: env.smtp.port === 465,
    auth: env.smtp.user ? { user: env.smtp.user, pass: env.smtp.password } : undefined,
  });
  return transporter;
}

/** Splits `"Name <address>"` (or a bare address) into Brevo's sender shape. */
function parseSender(from: string): { name?: string; email: string } {
  const match = from.match(/^\s*"?([^"<]*?)"?\s*<([^>]+)>\s*$/);
  return match ? { name: match[1] || undefined, email: match[2].trim() } : { email: from.trim() };
}

async function sendViaBrevo(payload: EmailPayload): Promise<void> {
  const res = await fetch("https://api.brevo.com/v3/smtp/email", {
    method: "POST",
    headers: { "api-key": env.brevoApiKey, "content-type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      sender: parseSender(env.emailFrom),
      to: [{ email: payload.to }],
      subject: payload.subject,
      htmlContent: payload.html,
    }),
    signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) {
    throw new Error(`Brevo API responded ${res.status}: ${await res.text()}`);
  }
}

/**
 * Sends through Brevo's HTTPS API when `BREVO_API_KEY` is set, otherwise through SMTP
 * (`SMTP_*` env vars). With neither configured emails are only logged. Resolves to whether the
 * message was actually handed off — it never throws, because every email is a side effect of a
 * change that has already been committed, and a mail outage must not turn that into an error
 * response.
 */
async function send(payload: EmailPayload): Promise<boolean> {
  if (!env.brevoApiKey && !env.smtp.host) {
    logger.info("Email (SMTP not configured, not sent)", { to: payload.to, subject: payload.subject });
    return false;
  }
  try {
    if (env.brevoApiKey) {
      await sendViaBrevo(payload);
    } else {
      await getTransporter().sendMail({ from: env.emailFrom, ...payload });
    }
    logger.info("Email sent", { to: payload.to, subject: payload.subject });
    return true;
  } catch (error) {
    logger.error(`Email to ${payload.to} failed ("${payload.subject}")`, error);
    return false;
  }
}

export interface PaymentApprovedEmail {
  name: string;
  courseName: string;
  batchName?: string;
  amount: number;
  paidAfterApproval: number;
  remainingAfterApproval: number;
  receiptNumber?: string;
  paymentDate: Date;
}

export interface PaymentRecordedEmail extends PaymentApprovedEmail {
  paymentMethod: string;
}

export const emailService = {
  sendOtpVerification: (to: string, name: string, otp: string) =>
    send({
      to,
      subject: `${otp} is your SSR Institute verification code`,
      html: buildOtpEmail(name, otp),
    }),

  sendAccountApproved: (to: string, name: string) =>
    send({
      to,
      subject: "Your SSR Institute account has been approved",
      html: buildAccountApprovedEmail(name),
    }),

  sendAccountRejected: (to: string, name: string, reason?: string) =>
    send({
      to,
      subject: "Your SSR Portal registration was not approved",
      html: `<p>Hi ${esc(name)}, unfortunately your registration was not approved.${
        reason ? ` Reason: ${esc(reason)}` : ""
      }</p>`,
    }),

  sendPasswordReset: (to: string, resetUrl: string) =>
    send({
      to,
      subject: "Reset your SSR Portal password",
      html: `<p>Click the link below to reset your password. This link expires in ${env.resetTokenExpiresMinutes} minutes.</p><p><a href="${esc(resetUrl)}">${esc(resetUrl)}</a></p>`,
    }),

  sendSubmissionEvaluated: (to: string, name: string, taskTitle: string, marks: number, maxMarks: number) =>
    send({
      to,
      subject: `Your submission for "${taskTitle}" has been evaluated`,
      html: `<p>Hi ${esc(name)}, your submission for <strong>${esc(taskTitle)}</strong> has been evaluated: ${marks}/${maxMarks}.</p>`,
    }),

  sendInterviewScheduled: (to: string, name: string, date: string, time: string) =>
    send({
      to,
      subject: "A mock interview has been scheduled for you",
      html: `<p>Hi ${esc(name)}, a mock interview has been scheduled on ${esc(date)} at ${esc(time)}.</p>`,
    }),

  sendCertificateIssued: (to: string, name: string, courseName: string, certificateNumber: string) =>
    send({
      to,
      subject: "Your certificate is ready",
      html: `<p>Hi ${esc(name)}, your certificate for <strong>${esc(courseName)}</strong> has been issued. Certificate number: ${esc(certificateNumber)}.</p>`,
    }),

  sendApplicationStatusChanged: (to: string, name: string, jobTitle: string, company: string, status: string) =>
    send({
      to,
      subject: `Update on your application to ${company}`,
      html: `<p>Hi ${esc(name)}, your application for <strong>${esc(jobTitle)}</strong> at ${esc(company)} is now <strong>${esc(status)}</strong>.</p>`,
    }),

  /** Sent automatically when an admin approves a payment screenshot. Figures come from the
   * committed approval, never from the client. */
  sendPaymentApproved: (to: string, p: PaymentApprovedEmail) =>
    send(buildPaymentEmail(to, p, {
      subject: `Payment approved — ${formatInr(p.amount)} for ${p.courseName}`,
      intro: "Your payment has been approved by SSR Institute Admin.",
      amountLabel: "Amount approved",
    })),

  /** Sent automatically when an admin records a cash (or other offline) payment. */
  sendPaymentRecorded: (to: string, p: PaymentRecordedEmail) => {
    const method = p.paymentMethod === "CASH" ? "cash payment" : `${p.paymentMethod.replace("_", " ").toLowerCase()} payment`;
    return send(buildPaymentEmail(to, p, {
      subject: `Payment received — ${formatInr(p.amount)} for ${p.courseName}`,
      intro: `Your ${method} has been received and recorded by SSR Institute.`,
      amountLabel: "Amount received",
      extraRows: [["Payment method", p.paymentMethod.replace("_", " ")]],
    }));
  },
};

/** Branded wrapper shared by the account emails: teal header with the logo, white card, footer.
 * Table layout with inline styles, since that's what renders consistently across Gmail, Outlook
 * and mobile mail apps. The logo is a PNG served by the frontend (many clients can't show WebP). */
function brandedLayout(bodyHtml: string, footerText: string): string {
  const logoUrl = `${env.clientUrl}/ssr-logo-email.png`;
  return `<!doctype html>
<html>
<body style="margin:0;padding:0;background:#eef2f7;font-family:Arial,Helvetica,sans-serif;color:#0f172a">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#eef2f7;padding:32px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:520px;background:#ffffff;border-radius:12px;overflow:hidden">
  <tr><td style="background:#0891a1;padding:24px;text-align:center">
    <table role="presentation" cellpadding="0" cellspacing="0" align="center"><tr><td style="background:#ffffff;border-radius:12px;padding:6px">
      <img src="${esc(logoUrl)}" width="64" height="64" alt="SSR" style="display:block;border:0;width:64px;height:64px">
    </td></tr></table>
    <div style="margin-top:10px;color:#ffffff;font-size:22px;font-weight:bold">SSR Institute</div>
  </td></tr>
  <tr><td style="padding:32px 28px">
${bodyHtml}
    <p style="margin:24px 0 0;font-size:15px;line-height:1.6">Warm regards,<br/><strong>SSR Institute</strong></p>
  </td></tr>
  <tr><td style="background:#f8fafc;border-top:1px solid #e2e8f0;padding:16px 28px;font-size:12px;line-height:1.5;color:#64748b;text-align:center">${esc(footerText)}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;
}

const supportLink = `<a href="mailto:smartskillsrecruitment@gmail.com" style="color:#0891a1;font-weight:bold;text-decoration:none">smartskillsrecruitment@gmail.com</a>`;

/** Registration verification email. */
function buildOtpEmail(name: string, otp: string): string {
  return brandedLayout(`    <p style="margin:0 0 12px;font-size:18px;font-weight:bold">Dear ${esc(name.trim() || "Student")},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6">Thank you for registering with <strong>SSR Institute</strong>! We're glad to have you with us. Please use the verification code below to confirm your email address.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="background:#e7f6f7;border:2px dashed #0891a1;border-radius:10px;padding:20px">
        <div style="font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;margin-bottom:8px">Your verification code</div>
        <div style="font-size:40px;font-weight:bold;letter-spacing:10px;color:#0f172a;font-family:'Courier New',Courier,monospace">${esc(otp)}</div>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:14px;line-height:1.6;color:#64748b">This code expires in <strong>${env.otpExpiresMinutes} minutes</strong>. For your security, don't share it with anyone.</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-top:20px">
      <tr><td style="background:#fef3c7;border-left:5px solid #f59e0b;border-radius:8px;padding:16px 18px">
        <div style="font-size:15px;font-weight:bold;color:#92400e;margin-bottom:6px">&#9888;&#65039; Admin approval required</div>
        <div style="font-size:14px;line-height:1.6;color:#78350f">After you verify your email, your account must be <strong>approved by the SSR Institute admin</strong> before you can log in. We'll email you as soon as it's approved.</div>
        <div style="font-size:14px;line-height:1.6;color:#78350f;margin-top:8px">If your account isn't approved within <strong>1 day</strong>, please email us at ${supportLink}.</div>
      </td></tr>
    </table>`, "If you didn't create an account with SSR Institute, you can safely ignore this email.");
}

/** Sent when an admin approves a pending student/trainer account. */
function buildAccountApprovedEmail(name: string): string {
  const loginUrl = `${env.clientUrl}/login`;
  return brandedLayout(`    <p style="margin:0 0 12px;font-size:18px;font-weight:bold">Dear ${esc(name.trim() || "Student")},</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="background:#dcfce7;border-left:5px solid #16a34a;border-radius:8px;padding:18px">
        <div style="font-size:20px;font-weight:bold;color:#166534">&#9989; Your account has been approved!</div>
      </td></tr>
    </table>
    <p style="margin:20px 0 0;font-size:15px;line-height:1.6">Great news — the <strong>SSR Institute admin</strong> has approved your account. You can now log in to the SSR Portal and get started.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0">
      <tr><td align="center" style="background:#0891a1;border-radius:999px">
        <a href="${esc(loginUrl)}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none">Log in to SSR Portal &#8599;</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b">If the button doesn't work, copy this link into your browser:<br/><a href="${esc(loginUrl)}" style="color:#0891a1;word-break:break-all">${esc(loginUrl)}</a></p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b">Need help? Email us at ${supportLink}.</p>`, "You're receiving this email because you registered an account with SSR Institute.");
}

/** Shared branded layout for payment confirmation emails. All values are escaped. */
function buildPaymentEmail(
  to: string,
  p: PaymentApprovedEmail,
  opts: { subject: string; intro: string; amountLabel: string; extraRows?: [string, string][] }
): EmailPayload {
  const fullyPaid = p.remainingAfterApproval <= 0;
  const feesUrl = `${env.clientUrl}/student/fees`;
  const rows: [string, string][] = [
    ["Course", p.courseName],
    ...(p.batchName ? ([["Batch", p.batchName]] as [string, string][]) : []),
    [opts.amountLabel, formatInr(p.amount)],
    ...(opts.extraRows ?? []),
    ["Total paid", formatInr(p.paidAfterApproval)],
    ["Payment date", p.paymentDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    ...(p.receiptNumber ? ([["Receipt number", p.receiptNumber]] as [string, string][]) : []),
  ];
  const remaining = formatInr(Math.max(0, p.remainingAfterApproval));
  const rowsHtml = rows
    .map(
      ([label, value], i) =>
        `<tr style="background:${i % 2 ? "#ffffff" : "#f8fafc"}"><td style="padding:10px 14px;font-size:14px;color:#64748b;border-bottom:1px solid #e2e8f0">${esc(label)}</td><td style="padding:10px 14px;font-size:14px;font-weight:bold;color:#0f172a;text-align:right;border-bottom:1px solid #e2e8f0">${esc(value)}</td></tr>`
    )
    .join("");
  // Remaining balance is the figure students act on, so it gets its own coloured row:
  // green once the fee is cleared, amber while something is still due.
  const remainingRow = fullyPaid
    ? `<tr style="background:#dcfce7"><td style="padding:12px 14px;font-size:15px;font-weight:bold;color:#166534">Remaining fee</td><td style="padding:12px 14px;font-size:15px;font-weight:bold;color:#166534;text-align:right">${remaining} &#10003;</td></tr>`
    : `<tr style="background:#fef3c7"><td style="padding:12px 14px;font-size:15px;font-weight:bold;color:#92400e">Remaining fee</td><td style="padding:12px 14px;font-size:15px;font-weight:bold;color:#92400e;text-align:right">${remaining}</td></tr>`;

  return {
    to,
    subject: fullyPaid ? `Course fee fully paid — ${p.courseName}` : opts.subject,
    html: brandedLayout(`    <p style="margin:0 0 12px;font-size:18px;font-weight:bold">Dear ${esc(p.name.trim() || "Student")},</p>
    <p style="margin:0 0 20px;font-size:15px;line-height:1.6">${esc(opts.intro)}${fullyPaid ? " Your course fee is now <strong>fully paid</strong>." : ""}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center" style="background:#dcfce7;border-left:5px solid #16a34a;border-radius:8px;padding:18px">
        <div style="font-size:13px;color:#166534;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">${esc(opts.amountLabel)}</div>
        <div style="font-size:32px;font-weight:bold;color:#166534">&#9989; ${esc(formatInr(p.amount))}</div>
        ${fullyPaid ? `<div style="margin-top:10px"><span style="display:inline-block;background:#16a34a;color:#ffffff;font-size:13px;font-weight:bold;padding:5px 14px;border-radius:999px">&#127881; Course fee fully paid</span></div>` : ""}
      </td></tr>
    </table>
    <p style="margin:24px 0 8px;font-size:15px;font-weight:bold">Payment details</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;border-collapse:separate">
      ${rowsHtml}
      ${remainingRow}
    </table>
    <table role="presentation" cellpadding="0" cellspacing="0" align="center" style="margin:28px auto 0">
      <tr><td align="center" style="background:#0891a1;border-radius:999px">
        <a href="${esc(feesUrl)}" style="display:inline-block;padding:14px 32px;color:#ffffff;font-size:16px;font-weight:bold;text-decoration:none">View &amp; download receipt &#8599;</a>
      </td></tr>
    </table>
    <p style="margin:24px 0 0;font-size:14px;line-height:1.6;color:#64748b">If the button doesn't work, copy this link into your browser:<br/><a href="${esc(feesUrl)}" style="color:#0891a1;word-break:break-all">${esc(feesUrl)}</a></p>
    <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#64748b">Questions about your payment? Email us at ${supportLink}.</p>`, "This is an automated payment confirmation from SSR Institute. Please keep it for your records."),
  };
}
