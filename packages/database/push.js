#!/usr/bin/env node
require('dotenv').config({ path: '.env.local' });

const { execSync } = require('child_process');

try {
  const args = process.argv.slice(2).join(' ');
  console.log('Pushing schema to database...');
  execSync(`prisma db push ${args}`, { stdio: 'inherit', env: process.env });
  process.exit(0);
} catch (error) {
  console.error('Push failed:', error.message);
  process.exit(1);
}
