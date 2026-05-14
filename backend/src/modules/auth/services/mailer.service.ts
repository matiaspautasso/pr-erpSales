import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { Env } from '../../../config/env.validation';

@Injectable()
export class MailerService {
  private readonly transporter: nodemailer.Transporter;
  private readonly from: string;

  constructor(private readonly config: ConfigService<Env>) {
    this.from = this.config.get('GOOGLE_SMTP_USER', { infer: true }) ?? '';
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.from,
        pass: this.config.get('GOOGLE_SMTP_APP_PASSWORD', { infer: true }) ?? '',
      },
    });
  }

  async sendResetEmail(to: string, resetLink: string): Promise<void> {
    await this.transporter.sendMail({
      from: `"Pollería Santi" <${this.from}>`,
      to,
      subject: 'Recuperación de contraseña — Pollería Santi',
      html: `
        <p>Recibiste este email porque solicitaste restablecer tu contraseña.</p>
        <p><a href="${resetLink}">Hacer clic aquí para restablecer la contraseña</a></p>
        <p>El enlace expira en 1 hora. Si no solicitaste este cambio, ignorá este email.</p>
      `,
    });
  }
}
