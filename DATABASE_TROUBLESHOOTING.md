# Database Troubleshooting Guide

This guide helps resolve common database issues with the PromptFlow platform.

## Common Issues

### 1. "The database schema is not empty" Error

**Problem**: When running migrations, you see: `The database schema is not empty`.

**Solution**: Use the direct schema push method instead:

```bash
npm run db-push
```

This will update the schema without requiring migrations, accepting any potential data loss.

### 2. "Data loss warnings" Error

**Problem**: When pushing schema changes, you see warnings about potential data loss.

**Solution**: If you're in development and don't mind the data loss (e.g., removing the CREATOR role), use:

```bash
npx prisma db push --accept-data-loss
```

### 3. Database Connection Issues

**Problem**: Getting errors like "Can't reach database server".

**Solution**:

1. Check your `.env` file to ensure the `DATABASE_URL` is correct
2. Verify that the `USE_LOCAL_STORAGE` flag is set to `false`
3. Make sure your Neon database is active and accessible
4. Visit `/dev-utils` route to check database status

## Using the Dev-Utils Page

The `/dev-utils` page provides several useful tools for debugging database issues:

1. **Database Status Check**: Shows connection status and lists database tables
2. **Admin Access**: Allows setting your user as an admin
3. **Quick Links**: Easy navigation to key pages

## Force Schema Update

If you're still having issues with database schema, you can try a more aggressive approach:

1. Make a backup of your data if needed
2. Run the db-push script:

```bash
npm run db-push
```

This will:
- Force-push the schema with `--accept-data-loss`
- Generate a new Prisma client
- Seed the credit buckets

## Working Without Database

If you're still unable to connect to the database, the application includes fallbacks:

1. The credit system will return default values if database operations fail
2. Mock credit buckets are created when necessary
3. UI components will show placeholders instead of failing completely

## Database Structure

The current schema includes:

- `User`: User accounts with role (USER or ADMIN)
- `CreditBucket`: Stores credit balances with types and expiry dates
- `CreditTransaction`: Records all credit operations
- `FlowUnlock`: Tracks premium flow unlocks
- `CreditBonus`: Records automation bonuses based on monthly usage

## Accessing Admin Dashboard

To access the admin dashboard:

1. Log in to your account
2. Visit `/dev-utils` page
3. Click the "Make Admin" button
4. Navigate to `/admin/dashboard`

Or login directly through:

```
/admin/login
```

With your admin credentials.
