import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import { ConfigService } from '@nestjs/config';
import { Env } from './env.validation';

export function databaseConfig(
  config: ConfigService<Env>,
): TypeOrmModuleOptions {
  return {
    type: 'postgres',
    url: config.get('DATABASE_URL', { infer: true }),
    entities: [__dirname + '/../**/*.entity{.ts,.js}'],
    migrations: [__dirname + '/../database/migrations/*{.ts,.js}'],
    synchronize: false,
    logging: config.get('NODE_ENV', { infer: true }) === 'development',
  };
}
