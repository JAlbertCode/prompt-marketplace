# Database Fallback Mode for PromptFlow

This document explains the database fallback system implemented in PromptFlow to handle database connection issues gracefully.

## Overview

The database fallback system allows PromptFlow to continue working even when there are database connection issues. Instead of crashing or showing error pages, the application will display mock data that mimics real database results.

## How It Works

When the application starts:

1. It first tries to connect to the real database using the connection string in your `.env` file
2. If the connection fails (due to incorrect credentials, network issues, etc.), it automatically switches to fallback mode
3. In fallback mode, all database operations use mock data that simulates real application data

## Configuration

You can control the fallback behavior using the `.env` file:

### Option 1: Enable Fallback Mode Explicitly

Add this line to your `.env` file:

```
USE_DB_FALLBACK=true
```

This forces the application to use fallback mode regardless of database connectivity.

### Option 2: Disable Fallback Mode

Remove the `USE_DB_FALLBACK` line from your `.env` file to let the application attempt to connect to the real database and only fall back on error.

## Mock Data

The fallback mode includes realistic mock data:

- **Credit buckets**: Simulated purchased and bonus credits
- **Credit transactions**: Simulated usage history
- **User data**: Basic user profile information

This allows you to test and develop features without a working database connection.

## Fixing Database Connection Issues

The most common cause of database connection failures is incorrect credentials. To fix this:

1. Check your `.env` file and ensure the `DATABASE_URL` contains the correct:
   - Username
   - Password
   - Hostname
   - Port
   - Database name

2. If using Neon (PostgreSQL), verify that:
   - Your project is active
   - You're using the correct connection string from your Neon dashboard
   - Your IP address is allowed in Neon's security settings

3. For local PostgreSQL:
   - Ensure PostgreSQL service is running
   - Verify that your user has the correct permissions
   - Check that the database exists and is accessible

## Testing Database Connectivity

You can test your database connection by running:

```bash
npx prisma db pull
```

This will attempt to introspect your database schema. If successful, it means your connection string is correct.

## Migrating from Fallback to Real Database

When you're ready to switch from fallback mode to a real database:

1. Set up your PostgreSQL database (either locally or using a service like Neon)
2. Update your `.env` file with the correct `DATABASE_URL`
3. Remove the `USE_DB_FALLBACK=true` line or set it to `false`
4. Run database migrations:
   ```bash
   npx prisma migrate deploy
   ```
5. Restart your application

## Troubleshooting Common Issues

### "password authentication failed for user X"

This means your database connection string has an incorrect username or password. 

**Solution:** Double-check your credentials and update the `DATABASE_URL` in your `.env` file.

### "could not connect to server: Connection refused"

This indicates that the database server is not running or not accessible.

**Solution:**
- For local PostgreSQL, ensure the service is running
- For cloud databases, check your firewall and network connectivity

### "database X does not exist"

The database specified in your connection string doesn't exist.

**Solution:**
- Create the database manually: `createdb promptflow`
- Or update your connection string to use an existing database

## Using Local Storage Instead

If you prefer to work without a database during development, you can use local file storage:

1. Set `USE_LOCAL_STORAGE=true` in your `.env` file
2. The application will store data in JSON files instead of a database

Note: Local storage is not suitable for production use.

## Credits System in Fallback Mode

When using fallback mode, the credits system will display mock data:

- A base balance of 10,000,000 credits
- Sample credit transactions
- Simulated credit breakdown by type

This allows you to test all credit-related features while troubleshooting database issues.
