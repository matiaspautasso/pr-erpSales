import { JwtModuleOptions } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.validation';

export function jwtConfig(config: ConfigService<Env>): JwtModuleOptions {
  return {
    secret: config.get('JWT_SECRET', { infer: true }),
    signOptions: {
      expiresIn: config.get('JWT_EXPIRES_IN', { infer: true }) ?? '8h',
    },
  };
}
