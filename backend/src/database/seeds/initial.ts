import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as bcrypt from 'bcrypt';
import { AppDataSource } from '../data-source';
import { User } from '../../modules/auth/entities/user.entity';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function seed() {
  await AppDataSource.initialize();

  const userRepo = AppDataSource.getRepository(User);
  const existing = await userRepo.findOne({ where: { email: 'owner@polleria.com' } });

  if (!existing) {
    const password_hash = await bcrypt.hash('admin1234', 10);
    await userRepo.save({ email: 'owner@polleria.com', password_hash });
    console.log('Usuario dueño creado: owner@polleria.com / admin1234');
  } else {
    console.log('Usuario dueño ya existe — seed omitido.');
  }

  await AppDataSource.destroy();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
