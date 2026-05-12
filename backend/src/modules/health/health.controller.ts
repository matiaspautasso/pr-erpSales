import {
  Controller,
  Get,
  ServiceUnavailableException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { Public } from '../../common/decorators/public.decorator';

interface HealthResponse {
  status: 'ok' | 'error';
  database: 'ok' | 'unreachable';
  uptime: number;
}

@Controller('health')
export class HealthController {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  @Get()
  @Public()
  async check(): Promise<HealthResponse> {
    try {
      await this.dataSource.query('SELECT 1');
      return { status: 'ok', database: 'ok', uptime: process.uptime() };
    } catch {
      throw new ServiceUnavailableException({
        status: 'error',
        database: 'unreachable',
        uptime: process.uptime(),
      });
    }
  }
}
