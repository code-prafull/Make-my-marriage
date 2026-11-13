import nodemailer from "nodemailer";
import env from "../config/environment.js";

/**
 * Email sender.
 * - With SMTP configured: sends real emails.
 * - Without SMTP (default in dev): prints the email to the console so the
 *   flow can be tested end to end without a provider account.
 */
function createTransport() {
  if (!env.SMTP.host) return null;

  return nodemailer.createTransport({
    host: env.SMTP.host,
    port: env.SMTP.port,
    secure: env.SMTP.port === 465,
    auth: env.SMTP.user ? { user: env.SMTP.user, pass: env.SMTP.pass } : undefined,
  });
}

const transport = createTransport();

export async function sendEmail({ to, subject, text, html }) {
  if (!transport) {
    console.log(
      `\n[email] SMTP not configured — dev email\n  To:      ${to}\n  Subject: ${subject}\n  Body:    ${text}\n`
    );
    return { delivered: false, dev: true };
  }

  const info = await transport.sendMail({
    from: env.EMAIL_FROM,
    to,
    subject,
    text,
    html,
  });

  return { delivered: true, messageId: info.messageId };
}
