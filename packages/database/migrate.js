#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

try {
  const args = process.argv.slice(2).join(' ');
  console.log('Running Prisma migrations...');
  execSync(`prisma migrate dev ${args}`, { stdio: 'inherit', env: process.env });
  process.exit(0);
} catch (error) {
  console.error('Migration failed:', error.message);
  process.exit(1);
}
