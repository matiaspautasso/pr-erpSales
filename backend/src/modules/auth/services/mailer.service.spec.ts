jest.mock('nodemailer', () => ({
  createTransport: jest.fn().mockReturnValue({
    sendMail: jest.fn().mockResolvedValue({ messageId: 'test-id' }),
  }),
}));

import * as nodemailer from 'nodemailer';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { MailerService } from './mailer.service';

describe('MailerService', () => {
  let service: MailerService;
  let mockSendMail: jest.Mock;

  beforeEach(async () => {
    mockSendMail = jest.fn().mockResolvedValue({ messageId: 'test-id' });
    (nodemailer.createTransport as jest.Mock).mockReturnValue({ sendMail: mockSendMail });

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MailerService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string) => {
              if (key === 'GOOGLE_SMTP_USER') return 'sender@gmail.com';
              if (key === 'GOOGLE_SMTP_APP_PASSWORD') return 'app-pass';
              return undefined;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<MailerService>(MailerService);
  });

  it('llama a sendMail con el destinatario y el link de reset correctos', async () => {
    await service.sendResetEmail('owner@polleria.com', 'http://localhost:5173/reset-password?token=abc123');

    expect(mockSendMail).toHaveBeenCalledTimes(1);
    expect(mockSendMail).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'owner@polleria.com',
        subject: expect.stringContaining('contraseña'),
        html: expect.stringContaining('abc123'),
      }),
    );
  });

  it('configura el transporte con las credenciales de Google SMTP', () => {
    expect(nodemailer.createTransport).toHaveBeenCalledWith(
      expect.objectContaining({
        service: 'gmail',
        auth: expect.objectContaining({
          user: 'sender@gmail.com',
          pass: 'app-pass',
        }),
      }),
    );
  });
});
