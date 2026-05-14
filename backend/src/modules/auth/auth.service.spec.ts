import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuthService } from './auth.service';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailerService } from './services/mailer.service';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
  hash: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let userRepo: { findOne: jest.Mock; update: jest.Mock };
  let tokenRepo: { save: jest.Mock; findOne: jest.Mock; update: jest.Mock };
  let jwtService: { sign: jest.Mock };
  let mailerService: { sendResetEmail: jest.Mock };

  beforeEach(async () => {
    userRepo = { findOne: jest.fn(), update: jest.fn() };
    tokenRepo = { save: jest.fn(), findOne: jest.fn(), update: jest.fn() };
    jwtService = { sign: jest.fn() };
    mailerService = { sendResetEmail: jest.fn() };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getRepositoryToken(User), useValue: userRepo },
        { provide: getRepositoryToken(PasswordResetToken), useValue: tokenRepo },
        { provide: JwtService, useValue: jwtService },
        { provide: MailerService, useValue: mailerService },
        { provide: ConfigService, useValue: { get: jest.fn().mockReturnValue('http://localhost:5173') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('retorna access_token con credenciales válidas', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, email: 'owner@test.com', password_hash: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      jwtService.sign.mockReturnValue('jwt-token-123');

      const result = await service.login('owner@test.com', 'password123');

      expect(result).toEqual({ access_token: 'jwt-token-123' });
      expect(jwtService.sign).toHaveBeenCalledWith({ sub: 1, email: 'owner@test.com' });
    });

    it('lanza UnauthorizedException cuando el usuario no existe', async () => {
      userRepo.findOne.mockResolvedValue(null);

      await expect(service.login('noexiste@test.com', 'pass')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException cuando la contraseña es incorrecta', async () => {
      userRepo.findOne.mockResolvedValue({ id: 1, email: 'owner@test.com', password_hash: 'hash' });
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);

      await expect(service.login('owner@test.com', 'wrong')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  describe('resetPassword', () => {
    it('lanza UnauthorizedException con token inválido', async () => {
      tokenRepo.findOne.mockResolvedValue(null);

      await expect(service.resetPassword('token-invalido', 'newpass123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('lanza UnauthorizedException con token expirado', async () => {
      tokenRepo.findOne.mockResolvedValue({
        id: 1,
        token: 'token',
        user_id: 1,
        expires_at: new Date(Date.now() - 1000),
        used_at: null,
      });

      await expect(service.resetPassword('token', 'newpass123')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('actualiza password_hash y marca el token como usado', async () => {
      const futureDate = new Date(Date.now() + 3600000);
      tokenRepo.findOne.mockResolvedValue({
        id: 5,
        token: 'valid-token',
        user_id: 1,
        expires_at: futureDate,
        used_at: null,
      });
      (bcrypt.hash as jest.Mock).mockResolvedValue('new-hash');
      userRepo.update = jest.fn();
      tokenRepo.update.mockResolvedValue(undefined);

      await service.resetPassword('valid-token', 'newpass123');

      expect(userRepo.update).toHaveBeenCalledWith(1, { password_hash: 'new-hash' });
      expect(tokenRepo.update).toHaveBeenCalledWith(5, expect.objectContaining({ used_at: expect.any(Date) }));
    });
  });
});
