# PromptFlow Navigation & Credits System Guide

This guide explains the navigation structure and credit system integration in the PromptFlow application.

## Navigation System

The navigation system has been designed to provide a consistent, intuitive experience across the application. Key features include:

1. **DashboardNav**: A unified navigation bar that appears in the dashboard and settings sections
2. **Credits Button**: Accessible from anywhere in the application
3. **UserMenu**: A consistent dropdown menu with links to all major sections
4. **Settings Layout**: Maintains the same navigation structure as the rest of the app

## Credits Integration

The credits system is now integrated throughout the application:

- **Global Credits Display**: The credits balance appears in the main navigation bar
- **Settings Integration**: The credits button appears in all settings pages
- **Consistent Access**: One-click access to the credits management page from anywhere
- **Error Handling**: Proper error states and fallbacks if credit information can't be loaded

## Key Components

### 1. CreditsButton Component

A versatile button component that can be placed anywhere in the app to display and manage credits:

```jsx
<CreditsButton 
  credits={userCredits} 
  variant="minimal" // or "default", "icon" 
/>
```

### 2. UserMenu Component

A consistent dropdown menu with navigation to all important sections:

```jsx
<UserMenu 
  userName={session.user.name}
  userImage={session.user.image}
/>
```

### 3. Enhanced Settings Layout

The settings section now includes:
- The same DashboardNav as the main dashboard
- A sidebar with navigation options
- Integrated credits display and management
- Consistent styling with the rest of the app

### 4. Enhanced DashboardNav

The dashboard navigation now includes:
- Credits display in the top bar
- One-click access to the credits page
- Proper mobile responsiveness

## Benefits

These improvements address the following issues:

1. **Consistent Access to Credits**: The credits button works from anywhere in the app
2. **Unified Experience**: Settings no longer feel disconnected from the main app
3. **Simplified Navigation**: Fewer clicks to access important features
4. **Improved UX**: Clear, consistent placement of navigation elements
5. **Error Resilience**: Proper handling of loading states and errors

## Implementation Details

All components use the "use client" directive for client-side interactivity and follow Next.js App Router best practices. Credit information is loaded asynchronously with proper error handling to ensure the UI remains functional even if the credit system encounters issues.
