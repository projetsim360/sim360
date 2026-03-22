import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Resend } from 'resend';
import { verificationEmailTemplate } from './templates/verification.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { emailChangeTemplate } from './templates/email-change.template';

type MailProvider = 'smtp' | 'resend' | 'disabled';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter | null = null;
  private resend: Resend | null = null;
  private provider: MailProvider;

  constructor(private config: ConfigService) {
    const resendApiKey = this.config.get<string>('RESEND_API_KEY', '');
    const smtpHost = this.config.get<string>('SMTP_HOST', '');

    if (resendApiKey) {
      this.provider = 'resend';
      this.resend = new Resend(resendApiKey);
      this.logger.log('Mail provider: Resend (HTTP API)');
    } else if (smtpHost && smtpHost !== 'disabled') {
      this.provider = 'smtp';
      const port = this.config.get<number>('SMTP_PORT', 1025);
      this.transporter = nodemailer.createTransport({
        host: smtpHost,
        port,
        secure: port === 465,
        auth: this.config.get<string>('SMTP_USER')
          ? {
              user: this.config.get<string>('SMTP_USER'),
              pass: this.config.get<string>('SMTP_PASS'),
            }
          : undefined,
      });
      this.logger.log(`Mail provider: SMTP (${smtpHost}:${port})`);
    } else {
      this.provider = 'disabled';
      this.logger.warn('Mail disabled — no RESEND_API_KEY or SMTP_HOST configured');
    }
  }

  private get from(): string {
    return this.config.get<string>('SMTP_FROM', 'onboarding@resend.dev');
  }

  private get frontendUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:5173');
  }

  private async send(to: string, subject: string, html: string): Promise<void> {
    if (this.provider === 'disabled') {
      this.logger.log(`[Mail disabled] Would send "${subject}" to ${to}`);
      return;
    }

    if (this.provider === 'resend' && this.resend) {
      await this.resend.emails.send({
        from: this.from,
        to,
        subject,
        html,
      });
      return;
    }

    if (this.provider === 'smtp' && this.transporter) {
      await this.transporter.sendMail({ from: this.from, to, subject, html });
      return;
    }
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    try {
      await this.send(to, 'Vérifiez votre adresse email - Sim360', verificationEmailTemplate(firstName, verificationUrl));
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    try {
      await this.send(to, 'Réinitialisation de mot de passe - Sim360', passwordResetTemplate(firstName, resetUrl));
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendEmailChangeVerification(to: string, firstName: string, token: string): Promise<void> {
    const confirmUrl = `${this.frontendUrl}/auth/confirm-email-change?token=${token}`;
    try {
      await this.send(to, 'Changement d\'adresse email - Sim360', emailChangeTemplate(firstName, confirmUrl));
      this.logger.log(`Email change verification sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email change verification to ${to}`, error);
    }
  }

  async sendNotificationEmail(to: string, firstName: string, title: string, body: string): Promise<void> {
    try {
      await this.send(to, `${title} - Sim360`, `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Bonjour ${firstName},</h2>
          <p style="color: #555; font-size: 16px;">${body}</p>
          <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
          <p style="color: #999; font-size: 12px;">Cet email a ete envoye automatiquement par Sim360.</p>
        </div>
      `);
      this.logger.log(`Notification email sent to ${to}: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${to}`, error);
    }
  }

  async sendPasswordResetConfirmation(to: string, firstName: string): Promise<void> {
    const loginUrl = `${this.frontendUrl}/auth/sign-in`;
    try {
      await this.send(to, 'Mot de passe réinitialisé - Sim360', welcomeTemplate(firstName, loginUrl));
      this.logger.log(`Password reset confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation to ${to}`, error);
    }
  }
}
