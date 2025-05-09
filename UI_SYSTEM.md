# PromptFlow UI System

This document outlines the standardized layout system implemented in PromptFlow to ensure a consistent user experience across all parts of the application.

## Components Overview

The UI system consists of several core components that work together to create a consistent look and feel:

### 1. AppShell

`AppShell` serves as the base layout wrapper for all pages. It provides consistent page structure with:

- Global navigation header
- Container with appropriate padding
- Optional page title and description
- Support for optional sidebar

```jsx
<AppShell
  sidebar={optionalSidebar}
  pageTitle="Optional Page Title"
  pageDescription="Optional description text"
>
  {children}
</AppShell>
```

### 2. Sidebar

The `Sidebar` component provides a consistent navigation sidebar with:

- Optional user profile information
- Credit balance display
- Navigation items with icons
- Active state highlighting

```jsx
const sidebarItems = [
  { href: '/settings/profile', label: 'Profile', icon: User },
  { href: '/settings/account', label: 'Account', icon: Settings },
  // ...
];

<Sidebar
  items={sidebarItems}
  showUserProfile={true}
  showCredits={true}
  credits={credits}
/>
```

### 3. PageHeader

`PageHeader` provides consistent page headers with:

- Page title and description
- Optional tab navigation
- Optional right side content (like stats, buttons, or credit display)

```jsx
<PageHeader
  title="Page Title"
  description="Page description text"
  tabs={[
    { href: '/tab1', label: 'Tab 1', icon: Icon1 },
    { href: '/tab2', label: 'Tab 2', icon: Icon2 },
  ]}
  rightContent={<SomeComponent />}
/>
```

### 4. ContentCard

`ContentCard` provides consistent content containers with:

- Optional title and description
- Consistent padding and styling
- Optional footer section

```jsx
<ContentCard
  title="Card Title"
  description="Optional description"
  footer={<FooterComponent />}
  className="mb-6"  // Optional additional classes
>
  Card content goes here
</ContentCard>
```

## Layout Patterns

### Dashboard Layout

All dashboard pages follow this structure:

1. `AppShell` as the base wrapper
2. `PageHeader` with page title and tab navigation
3. Content organized in `ContentCard` components
4. Consistent spacing and grid layouts

### Settings Layout

Settings pages follow this structure:

1. `AppShell` as the base wrapper
2. `Sidebar` for navigation between settings sections
3. Content in the main area wrapped in a `ContentCard`

### Credits Pages

Credit management pages follow this structure:

1. `AppShell` as the base wrapper
2. `PageHeader` with title, tabs, and credit balance display
3. Content organized in `ContentCard` components for different sections

## Design Consistency Guidelines

To maintain visual consistency:

1. **Spacing**:
   - Use consistent margins: `mb-8` for major sections, `mb-6` for cards, `mb-4` for inner elements
   - Use consistent padding: `p-6` for cards, `p-4` for inner sections

2. **Colors**:
   - Primary action buttons: `bg-blue-600 text-white`
   - Secondary actions: `bg-gray-100 text-gray-700`
   - Active state: `bg-blue-50 text-blue-700`
   - Credit amounts: `text-blue-600` (for emphasis)

3. **Typography**:
   - Page titles: `text-3xl font-bold`
   - Section titles: `text-xl font-bold` or `text-lg font-medium`
   - Body text: Regular size, `text-gray-600` for secondary text

4. **Components**:
   - Cards have a consistent `shadow-sm rounded-lg` appearance
   - Form controls maintain consistent styling
   - Tab navigation has a consistent active state

## Implementation

The components are located in:

```
src/components/layout/system/
├── AppShell.tsx
├── ContentCard.tsx
├── PageHeader.tsx
└── Sidebar.tsx
```

Import these components in your page files to ensure consistency across the application.

## Example: Dashboard Page

```jsx
export default function DashboardPage() {
  return (
    <AppShell>
      <PageHeader 
        title="Dashboard"
        description="Welcome to your dashboard"
        tabs={dashboardTabs}
      />
      
      <ContentCard title="Your Activity">
        {/* Card content */}
      </ContentCard>
      
      <ContentCard title="Recent Items">
        {/* Card content */}
      </ContentCard>
    </AppShell>
  );
}
```

By following these guidelines, we ensure a consistent, professional user experience across all parts of the PromptFlow application.
