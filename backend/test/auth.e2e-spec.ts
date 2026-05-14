import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';
import { HttpExceptionFilter } from '../src/common/filters/http-exception.filter';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.setGlobalPrefix('api');
    app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /api/auth/login', () => {
    it('retorna 401 con credenciales incorrectas', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'noexiste@test.com', password: 'wrongpass' })
        .expect(401);
    });

    it('retorna 400 con body inválido (sin email)', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ password: 'password123' })
        .expect(400);
    });

    it('retorna 400 con contraseña menor a 8 caracteres', () => {
      return request(app.getHttpServer())
        .post('/api/auth/login')
        .send({ email: 'owner@polleria.com', password: 'corta' })
        .expect(400);
    });
  });

  describe('POST /api/auth/forgot-password', () => {
    it('retorna 200 sin revelar si el email existe', () => {
      return request(app.getHttpServer())
        .post('/api/auth/forgot-password')
        .send({ email: 'noexiste@test.com' })
        .expect(200)
        .expect((res: { body: { message: string } }) => {
          expect(res.body.message).toContain('enlace');
        });
    });
  });

  describe('POST /api/auth/reset-password', () => {
    it('retorna 401 con token inválido', () => {
      return request(app.getHttpServer())
        .post('/api/auth/reset-password')
        .send({ token: 'token-invalido-xxx', new_password: 'nuevapass123' })
        .expect(401);
    });
  });
});
