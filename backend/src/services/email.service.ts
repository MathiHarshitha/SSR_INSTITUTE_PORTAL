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

/**
 * Provider-agnostic email abstraction. Swap the body of `send` for a real
 * SMTP/SES/SendGrid client later without touching any calling code.
 * In development (no SMTP configured), emails are logged instead of sent.
 */
async function send(payload: EmailPayload): Promise<void> {
  if (!env.smtp.host) {
    logger.info("Email (dev mode, not sent)", { to: payload.to, subject: payload.subject });
    return;
  }
  // TODO: wire a real transport (nodemailer/SES/SendGrid) here using env.smtp / env.emailFrom.
  logger.info("Email dispatched", { to: payload.to, subject: payload.subject });
}

export const emailService = {
  sendOtpVerification: (to: string, otp: string) =>
    send({
      to,
      subject: "Verify your SSR Portal account",
      html: `<p>Your verification code is <strong>${otp}</strong>. It expires in ${env.otpExpiresMinutes} minutes.</p>`,
    }),

  sendAccountApproved: (to: string, name: string) =>
    send({
      to,
      subject: "Your SSR Portal account has been approved",
      html: `<p>Hi ${esc(name)}, your account has been approved. You can now log in to SSR Portal.</p>`,
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
};
