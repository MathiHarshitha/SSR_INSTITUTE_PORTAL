import { env } from "../config/env";
import { logger } from "../utils/logger";

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
      html: `<p>Hi ${name}, your account has been approved. You can now log in to SSR Portal.</p>`,
    }),

  sendAccountRejected: (to: string, name: string, reason?: string) =>
    send({
      to,
      subject: "Your SSR Portal registration was not approved",
      html: `<p>Hi ${name}, unfortunately your registration was not approved.${
        reason ? ` Reason: ${reason}` : ""
      }</p>`,
    }),

  sendPasswordReset: (to: string, resetUrl: string) =>
    send({
      to,
      subject: "Reset your SSR Portal password",
      html: `<p>Click the link below to reset your password. This link expires in ${env.resetTokenExpiresMinutes} minutes.</p><p><a href="${resetUrl}">${resetUrl}</a></p>`,
    }),
};
