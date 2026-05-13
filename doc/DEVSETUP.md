# Development Setup Guide

## Prerequisites

Before setting up the MTU LAFP development environment, ensure you have the following installed:

- **Node.js**: Version 18.0.0 or higher
- **pnpm**: Version 8.0.0 or higher (recommended: 9.12.2)

### Installing pnpm

If you don't have pnpm installed globally, run:

```bash
npm install -g pnpm@latest
```

Verify your installation:

```bash
pnpm --version
```

## Step 1: Repository Setup

Clone the repository from GitHub:

```bash
git clone https://github.com/pheeling-codes/mtu_lafp.git
cd lafp
```

## Step 2: Environment Configuration

Create environment files using the provided templates:

```bash
# Root environment configuration
cp .env.example .env.local

# Web app environment configuration
cp apps/web/.env.example apps/web/.env.local
```

Populate both files with your actual values:

### Root .env.local Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `DATABASE_URL`: PostgreSQL connection string
- `DIRECT_URL`: Direct PostgreSQL connection string
- `NEXTAUTH_URL`: Next.js authentication URL
- `NEXTAUTH_SECRET`: Next.js secret key

### Web App .env.local Variables
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Your Supabase anonymous key
- `NEXTAUTH_URL`: Next.js authentication URL
- `NEXTAUTH_SECRET`: Next.js secret key

## Step 3: Dependency Installation

Install all project dependencies using pnpm:

```bash
pnpm install
```

This command will:
- Install root-level dependencies
- Install dependencies for all workspace packages
- Set up the monorepo structure with Turborepo

## Step 4: Database Synchronization

### Generate Prisma Client

Generate the Prisma client with the latest schema:

```bash
npx prisma generate
```

### Push Schema to Database

Synchronize your local schema with the Supabase database:

```bash
npx prisma db push
```

This command will:
- Create all tables defined in `packages/database/schema.prisma`
- Set up proper indexes and constraints
- Establish relationships between entities

### Verify Database Connection

Test your database connection:

```bash
npx prisma db pull
```

## Step 5: Local Development

Start the development server:

```bash
pnpm dev
```

This command will:
- Launch the Next.js development server on port 3001
- Start any additional workspace services
- Enable hot reloading for rapid development
- Initialize Turborepo for efficient builds

Access the application at: **http://localhost:3001**

## Development Workflow

### Running Individual Packages

You can run specific packages using Turborepo:

```bash
# Run only the web application
pnpm turbo run dev --filter=web

# Run linting for all packages
pnpm turbo run lint

# Build all packages
pnpm turbo run build
```

### Database Migrations

For production environments, use migrations instead of `db push`:

```bash
# Create a new migration
npx prisma migrate dev --name migration_name

# Apply migrations in production
npx prisma migrate deploy
```

## Troubleshooting

### Prisma Connection Issues

**Error**: "P1001: Can't reach database server"

**Solutions**:
1. Verify your `DATABASE_URL` and `DIRECT_URL` are correct
2. Check if your Supabase project is active
3. Ensure your IP is whitelisted in Supabase settings
4. Confirm SSL configuration in the connection string

**Error**: "P5001: Unable to read schema file"

**Solutions**:
1. Run `npx prisma generate` again
2. Ensure `packages/database/schema.prisma` exists
3. Check file permissions on the schema file

### Supabase Session Errors

**Error**: "Invalid JWT" or authentication failures

**Solutions**:
1. Verify `NEXT_PUBLIC_SUPABASE_ANON_KEY` is correct
2. Check if keys have expired or been regenerated
3. Clear browser localStorage and cookies
4. Ensure CORS settings allow localhost:3001

### Dependency Issues

**Error**: "Module not found" or peer dependency conflicts

**Solutions**:
1. Delete `node_modules` and `pnpm-lock.yaml`
2. Run `pnpm install` again
3. Ensure you're using the correct Node.js version (`node --version`)
4. Clear pnpm cache: `pnpm store prune`

### Port Conflicts

**Error**: "Port 3001 is already in use"

**Solutions**:
1. Kill processes on port 3001: `npx kill-port 3001`
2. Or modify the port in `apps/web/package.json`:
   ```json
   "scripts": {
     "dev": "next dev -p 3002"
   }
   ```

## Development Best Practices

### Code Organization

- Follow the existing file structure and naming conventions
- Use TypeScript for all new code
- Implement proper error handling and loading states
- Follow the "Clinical Vanguard" design principles

### Database Changes

1. Always modify `packages/database/schema.prisma`
2. Run `npx prisma generate` after schema changes
3. Use `npx prisma db push` for development
4. Create migrations for production changes
5. Test changes with sample data

### Environment Variables

- Never commit `.env.local` to version control
- Use `.env.example` for template variables
- Differentiate between development and production configurations
- Rotate secrets regularly for security
