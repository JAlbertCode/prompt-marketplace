# Note About Next.js Parameter Handling

## Current Implementation

The current implementation in `src/app/run/[promptId]/page.tsx` accesses route parameters directly:

```typescript
// Access params directly without using React.use()
const { promptId } = params;
```

## Next.js Warning

You may see this warning in the console:

```
A param property was accessed directly with `params.promptId`. `params` is now a Promise and should be unwrapped with `React.use()` before accessing properties of the underlying params object. In this version of Next.js direct access to param properties is still supported to facilitate migration but in a future version you will be required to unwrap `params` with `React.use()`.
```

## Why We're Not Using React.use()

Attempting to implement the recommended approach using `React.use()` led to the following error:

```
Error: An unknown Component is an async Client Component. Only Server Components can be async at the moment. This error is often caused by accidentally adding `'use client'` to a module that was originally written for the server.
```

This happens because:
1. Our page uses `'use client'` directive (it's a Client Component)
2. Client Components cannot use React.use() with promises

## Future Solution Options

When Next.js requires the change in a future version, we'll need to refactor this component using one of these approaches:

1. Convert to a Server Component (remove 'use client') and use React.use()
2. Move the parameter handling to a server component and pass the result to this client component
3. Use a different approach for parameter access that's compatible with Client Components

For now, the direct access method works correctly and we can safely ignore the warning.
