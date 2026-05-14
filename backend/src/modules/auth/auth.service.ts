import { Injectable, UnauthorizedException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { IsNull } from 'typeorm';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { MailerService } from './services/mailer.service';
import { Env } from '../../config/env.validation';

const RESET_TOKEN_TTL_MS = 60 * 60 * 1000; // 1 hora

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(PasswordResetToken)
    private readonly tokenRepo: Repository<PasswordResetToken>,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
    private readonly config: ConfigService<Env>,
  ) {}

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) throw new UnauthorizedException('Credenciales inválidas');

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) throw new UnauthorizedException('Credenciales inválidas');

    const token = this.jwtService.sign({ sub: user.id, email: user.email });
    return { access_token: token };
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this.userRepo.findOne({ where: { email } });
    if (!user) return; // no revelar si el email existe

    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + RESET_TOKEN_TTL_MS);

    await this.tokenRepo.save({ token, user_id: user.id, expires_at: expiresAt, used_at: null });

    const corsOrigin = this.config.get('CORS_ORIGIN', { infer: true }) ?? 'http://localhost:5173';
    const resetLink = `${corsOrigin}/reset-password?token=${token}`;
    await this.mailerService.sendResetEmail(email, resetLink);
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    const record = await this.tokenRepo.findOne({ where: { token, used_at: IsNull() } });

    if (!record || record.expires_at < new Date()) {
      throw new UnauthorizedException('Token inválido o expirado');
    }

    const hash = await bcrypt.hash(newPassword, 10);
    await this.userRepo.update(record.user_id, { password_hash: hash });
    await this.tokenRepo.update(record.id, { used_at: new Date() });
  }
}
