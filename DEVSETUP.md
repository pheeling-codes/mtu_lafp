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
git clone https://https://github.com/pheeling-codes/mtu_lafp.git
cd lafp
```

## Step 2: Dependency Installation

Install all project dependencies using pnpm:

```bash
pnpm install
```

This command will:
- Install root-level dependencies
- Install dependencies for all workspace packages (`apps/web`, `packages/database`, etc.)
- Set up the monorepo structure with Turborepo

## Step 3: Environment Configuration

Create a `.env.local` file in the root directory with the following required environment variables:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Database Configuration
DATABASE_URL=postgresql://user:password@host:port/database
DIRECT_URL=postgresql://user:password@host:port/database

# Next.js Configuration
NEXTAUTH_URL=http://localhost:3001
NEXTAUTH_SECRET=your_nextauth_secret_key

# Optional: Development Configuration
NODE_ENV=development
```

### Obtaining Supabase Credentials

1. Navigate to your Supabase project dashboard
2. Go to **Settings** → **API**
3. Copy the **Project URL** and **anon public** key
4. Generate a **service_role** key from the same section
5. For database URLs, go to **Settings** → **Database** → **Connection string**

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

This should pull the current database schema and confirm connectivity.

## Step 5: Development Server

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

### Seed Data (Optional)

To populate your development database with sample data:

```bash
npx prisma db seed
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

## Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Turborepo Documentation](https://turbo.build/repo/docs)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)

For project-specific questions or issues, please contact the development team or create an issue in the project repository.
