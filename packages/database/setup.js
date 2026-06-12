#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

try {
  console.log('Running migrations...');
  try {
    execSync('prisma migrate dev ', { stdio: 'inherit', env: process.env });
  } catch (migrationError) {
    console.warn('⚠️  Migration failed (database may be temporarily unavailable)');
    console.warn('Continuing with Prisma client generation...');
  }
  
  console.log('Generating Prisma client...');
  execSync('prisma generate', { stdio: 'inherit', env: process.env });
  
  console.log('✅ Setup completed!');
  process.exit(0);
} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
