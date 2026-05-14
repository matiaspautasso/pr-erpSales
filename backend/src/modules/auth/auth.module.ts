import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { MailerService } from './services/mailer.service';
import { User } from './entities/user.entity';
import { PasswordResetToken } from './entities/password-reset-token.entity';
import { jwtConfig } from '../../config/jwt.config';
import { Env } from '../../config/env.validation';

@Module({
  imports: [
    PassportModule,
    TypeOrmModule.forFeature([User, PasswordResetToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => jwtConfig(config),
    }),
  ],
  controllers: [AuthController],
  providers: [JwtStrategy, AuthService, MailerService],
  exports: [JwtModule],
})
export class AuthModule {}
