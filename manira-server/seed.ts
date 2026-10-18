import * as dotenv from 'dotenv';
dotenv.config();

import { db } from './src/db';
import { adminUsers } from './src/db/schema';
import bcrypt from 'bcrypt';
import { v4 as uuid } from 'uuid';

async function seed() {
  console.log('Seeding admin user...');

  const passwordHash = await bcrypt.hash('Admin@123', 10);

  await db.insert(adminUsers).values({
    id:           uuid(),
    name:         'Manira Admin',
    email:        'admin@manira.in',
    passwordHash,
    role:         'super_admin',
    isActive:     true,
  }).onConflictDoNothing();

  console.log('✅ Admin user created!');
  console.log('   Email:    admin@manira.in');
  console.log('   Password: Admin@123');
  process.exit(0);
}

seed().catch(err => { console.error(err); process.exit(1); });
