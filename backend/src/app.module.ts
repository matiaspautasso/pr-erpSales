import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { APP_GUARD } from '@nestjs/core';
import { validateEnv, Env } from './config/env.validation';
import { databaseConfig } from './config/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { HealthModule } from './modules/health/health.module';
import { ProductosModule } from './modules/productos/productos.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { ComprasModule } from './modules/compras/compras.module';
import { CajaModule } from './modules/caja/caja.module';
import { VentasModule } from './modules/ventas/ventas.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
    }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env>) => databaseConfig(config),
    }),
    AuthModule,
    HealthModule,
    ProductosModule,
    DashboardModule,
    ComprasModule,
    CajaModule,
    VentasModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
