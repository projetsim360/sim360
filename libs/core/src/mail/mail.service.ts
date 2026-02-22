import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { verificationEmailTemplate } from './templates/verification.template';
import { passwordResetTemplate } from './templates/password-reset.template';
import { welcomeTemplate } from './templates/welcome.template';
import { emailChangeTemplate } from './templates/email-change.template';

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: this.config.get<string>('SMTP_HOST', 'localhost'),
      port: this.config.get<number>('SMTP_PORT', 1025),
      auth: this.config.get<string>('SMTP_USER')
        ? {
            user: this.config.get<string>('SMTP_USER'),
            pass: this.config.get<string>('SMTP_PASS'),
          }
        : undefined,
    });
  }

  private get from(): string {
    return this.config.get<string>('SMTP_FROM', 'noreply@sim360.dev');
  }

  private get frontendUrl(): string {
    return this.config.get<string>('APP_URL', 'http://localhost:5173');
  }

  async sendVerificationEmail(to: string, firstName: string, token: string): Promise<void> {
    const verificationUrl = `${this.frontendUrl}/auth/verify-email?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Vérifiez votre adresse email - Sim360',
        html: verificationEmailTemplate(firstName, verificationUrl),
      });
      this.logger.log(`Verification email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send verification email to ${to}`, error);
    }
  }

  async sendPasswordResetEmail(to: string, firstName: string, token: string): Promise<void> {
    const resetUrl = `${this.frontendUrl}/auth/reset-password?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Réinitialisation de mot de passe - Sim360',
        html: passwordResetTemplate(firstName, resetUrl),
      });
      this.logger.log(`Password reset email sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset email to ${to}`, error);
    }
  }

  async sendEmailChangeVerification(to: string, firstName: string, token: string): Promise<void> {
    const confirmUrl = `${this.frontendUrl}/auth/confirm-email-change?token=${token}`;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Changement d\'adresse email - Sim360',
        html: emailChangeTemplate(firstName, confirmUrl),
      });
      this.logger.log(`Email change verification sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send email change verification to ${to}`, error);
    }
  }

  async sendNotificationEmail(to: string, firstName: string, title: string, body: string): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: `${title} - Sim360`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Bonjour ${firstName},</h2>
            <p style="color: #555; font-size: 16px;">${body}</p>
            <hr style="border: none; border-top: 1px solid #eee; margin: 24px 0;" />
            <p style="color: #999; font-size: 12px;">Cet email a ete envoye automatiquement par Sim360.</p>
          </div>
        `,
      });
      this.logger.log(`Notification email sent to ${to}: ${title}`);
    } catch (error) {
      this.logger.error(`Failed to send notification email to ${to}`, error);
    }
  }

  async sendPasswordResetConfirmation(to: string, firstName: string): Promise<void> {
    const loginUrl = `${this.frontendUrl}/auth/sign-in`;
    try {
      await this.transporter.sendMail({
        from: this.from,
        to,
        subject: 'Mot de passe réinitialisé - Sim360',
        html: welcomeTemplate(firstName, loginUrl),
      });
      this.logger.log(`Password reset confirmation sent to ${to}`);
    } catch (error) {
      this.logger.error(`Failed to send password reset confirmation to ${to}`, error);
    }
  }
}
