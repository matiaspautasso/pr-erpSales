import 'reflect-metadata';
import * as dotenv from 'dotenv';
import * as path from 'path';
import { AppDataSource } from '../data-source';

dotenv.config({ path: path.join(__dirname, '../../../.env') });

async function seed() {
  await AppDataSource.initialize();
  console.log('Database connected. Seed placeholder — user creation is part of the auth change.');
  await AppDataSource.destroy();
}

seed().catch((err: unknown) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
