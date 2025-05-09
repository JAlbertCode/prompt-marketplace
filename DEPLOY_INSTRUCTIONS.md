# Deployment Instructions

## Fix for Crypto Module Error on Vercel

If you encounter the error `Module not found: Can't resolve 'crypto'` when deploying to Vercel, follow these steps:

1. **Use the simplified deployment config**:
   ```bash
   # Copy the deployment config to next.config.js
   cp deploy-next-config.js next.config.js
   ```

2. **Make sure these dependencies are installed**:
   ```bash
   npm install --save crypto-browserify stream-browserify buffer process
   ```

3. **Check that runtime directives are correctly set**:
   - All routes using `crypto` should have:
   ```typescript
   export const runtime = 'nodejs';
   ```

4. **Use the custom ID generator**:
   - Routes that need unique IDs should use the `generateUniqueId()` helper function instead of `crypto.randomUUID()`

## Environment Variables

Make sure the following environment variables are set in your Vercel project:

1. `NEXTAUTH_SECRET` - A secure string for NextAuth.js
2. `NEXTAUTH_URL` - Your application's URL
3. `GOOGLE_CLIENT_ID` - Google OAuth client ID
4. `GOOGLE_CLIENT_SECRET` - Google OAuth client secret

## NextAuth Configuration

We've modified the NextAuth configuration to be more compatible with Vercel's Edge runtime. The key changes are:

1. Using JWT strategy for sessions
2. Setting explicit cookie configuration
3. Using a custom ID generator instead of crypto
4. Setting the runtime to 'nodejs' for auth routes

## Deployment Commands

```bash
# To deploy to Vercel
vercel

# To deploy to production
vercel --prod
```