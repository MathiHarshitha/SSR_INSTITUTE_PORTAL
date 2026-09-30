import nodemailer, { Transporter } from "nodemailer";
import { env } from "../config/env";
import { logger } from "../utils/logger";
import { SSR_LOGO_PNG_BASE64 } from "../assets/emailLogo";

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

/** Content-ID the layout's <img src="cid:…"> points at. The logo is attached inline to every
 * email rather than linked, so it shows even when the portal isn't publicly reachable and isn't
 * blocked as a remote image by mail clients. */
const LOGO_CID = "ssr-logo";
const logoAttachment = {
  filename: "ssr-logo.png",
  content: Buffer.from(SSR_LOGO_PNG_BASE64, "base64"),
  contentType: "image/png",
  cid: LOGO_CID,
  contentDisposition: "inline" as const,
};

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

/**
 * Sends through SMTP (`SMTP_*` env vars). Without `SMTP_HOST` emails are only logged. Resolves
 * to whether the message was actually handed to the SMTP server — it never throws, because
 * every email is a side effect of a change that has already been committed, and a mail outage
 * must not turn that into an error response.
 */
async function send(payload: EmailPayload): Promise<boolean> {
  if (!env.smtp.host) {
    logger.info("Email (SMTP not configured, not sent)", { to: payload.to, subject: payload.subject });
    return false;
  }
  try {
    await getTransporter().sendMail({ from: env.emailFrom, ...payload, attachments: [logoAttachment] });
    logger.info("Email sent", { to: payload.to, subject: payload.subject });
    return true;
  } catch (error) {
    logger.error(`Email to ${payload.to} failed ("${payload.subject}")`, error);
    return false;
  }
}

// ---------------------------------------------------------------------------------------------
// Shared layout. Every email goes through `layout()` so they all share the same header, card,
// sign-off and footer. Markup is table-based with inline styles because most mail clients
// (Gmail, Outlook) strip <style> blocks and ignore flexbox/grid.
// ---------------------------------------------------------------------------------------------

// `primary` matches the portal's buttons (--secondary in frontend/app/globals.css).
const BRAND = {
  primary: "#0092b5",
  primaryDark: "#007391",
  primaryTint: "#e6f6fa",
  heading: "#0f172a",
  text: "#1e293b",
  muted: "#64748b",
  border: "#e2e8f0",
  page: "#f1f5f9",
};

type Tone = "success" | "info" | "warning" | "danger";

const TONES: Record<Tone, { bg: string; border: string; text: string }> = {
  success: { bg: "#ecfdf5", border: "#10b981", text: "#065f46" },
  info: { bg: "#e6f6fa", border: "#0092b5", text: "#004f63" },
  warning: { bg: "#fffbeb", border: "#f59e0b", text: "#78350f" },
  danger: { bg: "#fef2f2", border: "#ef4444", text: "#7f1d1d" },
};

interface LayoutOptions {
  /** Short heading shown at the top of the card. Plain text; escaped. */
  heading: string;
  /** Hidden inbox preview text. Plain text; escaped. */
  preheader: string;
  /** Recipient name for the "Hello …" line. Omit for emails sent before we know the name. */
  name?: string;
  /** Trusted HTML — callers must escape any user input they put in it. */
  body: string;
  cta?: { label: string; url: string };
}

function layout({ heading, preheader, name, body, cta }: LayoutOptions): string {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>${esc(heading)}</title>
</head>
<body style="margin:0;padding:0;background:${BRAND.page};font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:${BRAND.text};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${esc(preheader)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${BRAND.page};padding:32px 12px;">
  <tr><td align="center">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:#ffffff;border-radius:12px;overflow:hidden;border:1px solid ${BRAND.border};">
      <tr><td style="background:${BRAND.primary};padding:18px 28px;border-bottom:4px solid ${BRAND.primaryDark};">
        <table role="presentation" cellpadding="0" cellspacing="0"><tr>
          <td style="background:#ffffff;border-radius:10px;padding:4px;line-height:0;">
            <img src="cid:${LOGO_CID}" width="48" height="48" alt="SSR Institute" style="display:block;border:0;width:48px;height:48px;" />
          </td>
          <td style="padding-left:14px;">
            <div style="font-size:20px;font-weight:700;color:#ffffff;letter-spacing:0.3px;">SSR Institute</div>
            <div style="font-size:12px;color:#d9f1f7;">Smart Skill Recruitment</div>
          </td>
        </tr></table>
      </td></tr>
      <tr><td style="padding:32px 28px 8px;">
        <h1 style="margin:0 0 18px;font-size:22px;line-height:1.3;color:${BRAND.heading};">${esc(heading)}</h1>
        ${name ? `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">Hello ${esc(name)},</p>` : ""}
        ${body}
        ${cta ? button(cta.label, cta.url) : ""}
        <p style="margin:28px 0 0;font-size:15px;line-height:1.6;">Thank you,<br /><strong>SSR Institute Team</strong></p>
      </td></tr>
      <tr><td style="padding:24px 28px;">
        <p style="margin:0;padding-top:16px;border-top:1px solid ${BRAND.border};font-size:12px;line-height:1.6;color:${BRAND.muted};">
          This is an automated message from SSR Institute Portal. Please do not reply to this email.<br />
          &copy; ${year} SSR Institute. All rights reserved.
        </p>
      </td></tr>
    </table>
  </td></tr>
</table>
</body>
</html>`;
}

function paragraph(html: string): string {
  return `<p style="margin:0 0 14px;font-size:15px;line-height:1.6;">${html}</p>`;
}

function button(label: string, url: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:24px 0 8px;"><tr>
<td style="background:${BRAND.primary};border-radius:8px;">
<a href="${esc(url)}" style="display:inline-block;padding:12px 26px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;">${esc(label)}</a>
</td></tr></table>
<p style="margin:0 0 6px;font-size:12px;color:${BRAND.muted};">Or open this link: <a href="${esc(url)}" style="color:${BRAND.muted};">${esc(url)}</a></p>`;
}

/** Coloured box for status and highlights. `html` is trusted; escape user input first. */
function callout(tone: Tone, html: string): string {
  const t = TONES[tone];
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;"><tr>
<td style="background:${t.bg};border-left:4px solid ${t.border};border-radius:6px;padding:14px 16px;font-size:14px;line-height:1.6;color:${t.text};">${html}</td>
</tr></table>`;
}

/** Label/value table. Both are plain text and escaped. */
function details(rows: [string, string][]): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;border:1px solid ${BRAND.border};border-radius:8px;border-collapse:separate;">${rows
    .map(
      ([label, value], i) =>
        `<tr><td style="padding:10px 14px;font-size:14px;color:${BRAND.muted};${i ? `border-top:1px solid ${BRAND.border};` : ""}">${esc(label)}</td><td style="padding:10px 14px;font-size:14px;font-weight:600;text-align:right;${i ? `border-top:1px solid ${BRAND.border};` : ""}">${esc(value)}</td></tr>`
    )
    .join("")}</table>`;
}

// ---------------------------------------------------------------------------------------------
// Submission evaluation: the message changes with the score so students who did well are
// celebrated and students who scored low are encouraged rather than discouraged.
// ---------------------------------------------------------------------------------------------

interface ScoreBand {
  heading: string;
  tone: Tone;
  message: string;
  tip: string;
}

function scoreBand(percent: number): ScoreBand {
  if (percent >= 90) {
    return {
      heading: "Outstanding work! 🌟",
      tone: "success",
      message: "You nailed this one. A score like this shows real understanding and effort, so be proud of it.",
      tip: "Keep the momentum going. Try helping a classmate or taking on a stretch challenge to go even deeper.",
    };
  }
  if (percent >= 75) {
    return {
      heading: "Great job! 🎉",
      tone: "success",
      message: "This is a strong result. You clearly have a good grip on the concepts.",
      tip: "Go through your trainer's feedback for the few points you missed. Small refinements will take you to the top.",
    };
  }
  if (percent >= 50) {
    return {
      heading: "Good effort, keep going! 💪",
      tone: "info",
      message: "You're on the right track. You've got the foundation in place and there's clear room to grow from here.",
      tip: "Review the feedback carefully, revisit the topics that felt tricky, and don't hesitate to ask your trainer questions.",
    };
  }
  return {
    heading: "Every expert was once a beginner 🌱",
    tone: "warning",
    message:
      "This score doesn't define you. It shows where to focus next. Everyone struggles with new concepts, and what matters most is that you keep showing up.",
    tip: "Read your trainer's feedback, practise the topic again step by step, and reach out to your trainer for help. You can absolutely turn this around on the next task.",
  };
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
  sendOtpVerification: (to: string, otp: string) =>
    send({
      to,
      subject: "Verify your SSR Portal account",
      html: layout({
        heading: "Verify your email address",
        preheader: `Your SSR Portal verification code is ${otp}`,
        body: `${paragraph("Welcome to SSR Institute! Use the verification code below to confirm your email address.")}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:8px 0 18px;"><tr>
<td align="center" style="background:${BRAND.primaryTint};border:1px dashed ${BRAND.primary};border-radius:10px;padding:18px;">
<span style="font-size:32px;font-weight:700;letter-spacing:8px;color:${BRAND.primaryDark};font-family:Consolas,'Courier New',monospace;">${esc(otp)}</span>
</td></tr></table>
${paragraph(`This code expires in <strong>${env.otpExpiresMinutes} minutes</strong>. If you didn't create an account, you can safely ignore this email.`)}`,
      }),
    }),

  sendAccountApproved: (to: string, name: string) =>
    send({
      to,
      subject: "Your SSR Portal account has been approved",
      html: layout({
        heading: "Your account is approved 🎉",
        preheader: "You can now log in to SSR Portal.",
        name,
        body: `${callout("success", "Great news! Your SSR Portal account has been <strong>approved</strong>.")}
${paragraph("You can now log in to access your courses, tasks, and everything else the portal has to offer.")}`,
        cta: { label: "Log in to SSR Portal", url: `${env.clientUrl}/login` },
      }),
    }),

  sendAccountRejected: (to: string, name: string, reason?: string) =>
    send({
      to,
      subject: "Your SSR Portal registration was not approved",
      html: layout({
        heading: "Registration update",
        preheader: "Your SSR Portal registration was not approved.",
        name,
        body: `${paragraph("Unfortunately, your registration for SSR Portal was not approved.")}
${reason ? callout("danger", `<strong>Reason:</strong> ${esc(reason)}`) : ""}
${paragraph("If you think this is a mistake, please contact the SSR Institute office.")}`,
      }),
    }),

  sendPasswordReset: (to: string, resetUrl: string) =>
    send({
      to,
      subject: "Reset your SSR Portal password",
      html: layout({
        heading: "Reset your password",
        preheader: "Use this link to reset your SSR Portal password.",
        body: `${paragraph("We received a request to reset your SSR Portal password. Click the button below to choose a new one.")}
${paragraph(`This link expires in <strong>${env.resetTokenExpiresMinutes} minutes</strong>. If you didn't request a reset, you can ignore this email and your password will stay the same.`)}`,
        cta: { label: "Reset password", url: resetUrl },
      }),
    }),

  sendSubmissionEvaluated: (
    to: string,
    name: string,
    taskTitle: string,
    marks: number,
    maxMarks: number,
    feedback?: string
  ) => {
    const percent = maxMarks > 0 ? Math.round((marks / maxMarks) * 100) : 0;
    const band = scoreBand(percent);
    const trimmedFeedback = feedback?.trim();
    return send({
      to,
      subject: `Your submission for "${taskTitle}" has been evaluated: ${marks}/${maxMarks}`,
      html: layout({
        heading: band.heading,
        preheader: `You scored ${marks}/${maxMarks} (${percent}%) on "${taskTitle}".`,
        name,
        body: `${paragraph(`Your trainer has evaluated your submission for <strong>${esc(taskTitle)}</strong>.`)}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:6px 0 18px;"><tr>
<td align="center" style="background:${BRAND.primary};border-radius:10px;padding:20px;">
<div style="font-size:13px;letter-spacing:1px;text-transform:uppercase;color:#d9f1f7;">Your score</div>
<div style="font-size:36px;font-weight:700;color:#ffffff;margin-top:4px;">${marks}<span style="font-size:20px;color:#b3e3ef;"> / ${maxMarks}</span></div>
<div style="display:inline-block;margin-top:6px;padding:3px 12px;border-radius:999px;background:#ffffff;font-size:14px;font-weight:700;color:${BRAND.primaryDark};">${percent}%</div>
</td></tr></table>
${callout(band.tone, esc(band.message))}
${
  trimmedFeedback
    ? `<p style="margin:0 0 8px;font-size:14px;font-weight:600;color:${BRAND.heading};">Trainer's feedback</p>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px;"><tr>
<td style="background:${BRAND.page};border-radius:8px;padding:14px 16px;font-size:14px;line-height:1.6;font-style:italic;white-space:pre-line;">${esc(trimmedFeedback)}</td>
</tr></table>`
    : ""
}
${paragraph(`<strong>What's next:</strong> ${esc(band.tip)}`)}`,
        cta: { label: "View my tasks", url: `${env.clientUrl}/student/tasks` },
      }),
    });
  },

  sendInterviewScheduled: (to: string, name: string, date: string, time: string) =>
    send({
      to,
      subject: "A mock interview has been scheduled for you",
      html: layout({
        heading: "Mock interview scheduled",
        preheader: `Your mock interview is on ${date} at ${time}.`,
        name,
        body: `${paragraph("A mock interview has been scheduled for you. Here are the details:")}
${details([
  ["Date", date],
  ["Time", time],
])}
${paragraph("Prepare well and join on time. This is a great chance to practise and get useful feedback. All the best! 👍")}`,
        cta: { label: "View interview details", url: `${env.clientUrl}/student/interviews` },
      }),
    }),

  sendCertificateIssued: (to: string, name: string, courseName: string, certificateNumber: string) =>
    send({
      to,
      subject: "Your certificate is ready",
      html: layout({
        heading: "Congratulations, your certificate is ready! 🎓",
        preheader: `Your certificate for ${courseName} has been issued.`,
        name,
        body: `${callout("success", `Your certificate for <strong>${esc(courseName)}</strong> has been issued. Well done on completing the course!`)}
${details([
  ["Course", courseName],
  ["Certificate number", certificateNumber],
])}`,
        cta: { label: "View my certificates", url: `${env.clientUrl}/student/certificates` },
      }),
    }),

  sendApplicationStatusChanged: (to: string, name: string, jobTitle: string, company: string, status: string) =>
    send({
      to,
      subject: `Update on your application to ${company}`,
      html: layout({
        heading: "Application status update",
        preheader: `Your application for ${jobTitle} at ${company} is now ${status}.`,
        name,
        body: `${paragraph("There's an update on your job application:")}
${details([
  ["Position", jobTitle],
  ["Company", company],
  ["Status", status],
])}`,
        cta: { label: "View my applications", url: `${env.clientUrl}/student/jobs` },
      }),
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

/** Shared content for payment confirmation emails. All values are escaped. */
function buildPaymentEmail(
  to: string,
  p: PaymentApprovedEmail,
  opts: { subject: string; intro: string; amountLabel: string; extraRows?: [string, string][] }
): EmailPayload {
  const fullyPaid = p.remainingAfterApproval <= 0;
  const rows: [string, string][] = [
    ["Course", p.courseName],
    ...(p.batchName ? ([["Batch", p.batchName]] as [string, string][]) : []),
    [opts.amountLabel, formatInr(p.amount)],
    ...(opts.extraRows ?? []),
    ["Total paid", formatInr(p.paidAfterApproval)],
    ["Remaining fee", formatInr(Math.max(0, p.remainingAfterApproval))],
    ["Payment date", p.paymentDate.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })],
    ...(p.receiptNumber ? ([["Receipt number", p.receiptNumber]] as [string, string][]) : []),
  ];
  return {
    to,
    subject: fullyPaid ? `Course fee fully paid — ${p.courseName}` : opts.subject,
    html: layout({
      heading: fullyPaid ? "Course fee fully paid ✅" : "Payment confirmation",
      preheader: opts.intro,
      name: p.name,
      body: `${callout("success", `${esc(opts.intro)}${fullyPaid ? " Your course fee is now <strong>fully paid</strong>." : ""}`)}
${details(rows)}
${paragraph("Log in to the portal to view and download your payment receipt.")}`,
      cta: { label: "View payment receipt", url: `${env.clientUrl}/student/fees` },
    }),
  };
}
