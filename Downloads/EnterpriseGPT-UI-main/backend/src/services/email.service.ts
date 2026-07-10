import nodemailer, { Transporter } from 'nodemailer';
import { env } from '../config/env';
import { logger } from '../utils/logger';

function createTransporter(): Transporter {
  if (!env.smtp.user) {
    // No SMTP credentials configured (e.g. local development) — log emails instead of sending them.
    return nodemailer.createTransport({ jsonTransport: true });
  }

  return nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.secure,
    auth: { user: env.smtp.user, pass: env.smtp.password },
  });
}

const transporter = createTransporter();

export const emailService = {
  async sendPasswordResetEmail(to: string, resetLink: string): Promise<void> {
    const info = await transporter.sendMail({
      from: `"${env.smtp.fromName}" <${env.smtp.fromEmail}>`,
      to,
      subject: 'Reset your EnterpriseGPT password',
      text: `We received a request to reset your password. Use the link below within ${env.passwordReset.tokenTtlMinutes} minutes:\n\n${resetLink}\n\nIf you did not request this, you can safely ignore this email.`,
      html: `<p>We received a request to reset your password. Use the link below within ${env.passwordReset.tokenTtlMinutes} minutes:</p><p><a href="${resetLink}">${resetLink}</a></p><p>If you did not request this, you can safely ignore this email.</p>`,
    });

    if (!env.smtp.user) {
      logger.info('Password reset email (dev jsonTransport — not actually sent)', { to, resetLink });
    } else {
      logger.info('Password reset email sent', { to, messageId: info.messageId });
    }
  },
};
