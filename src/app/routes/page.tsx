'use client';

import React from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';

const routes = [
  // Public routes
  { path: '/', name: 'Home', description: 'Main marketplace page', isPublic: true },
  { path: '/login', name: 'Login', description: 'User login page', isPublic: true },
  { path: '/register', name: 'Register', description: 'User registration page', isPublic: true },
  
  // User routes
  { path: '/dashboard', name: 'Dashboard', description: 'User dashboard', authRequired: true },
  { path: '/dashboard/credits', name: 'Credits', description: 'Credit management', authRequired: true },
  { path: '/dashboard/credits/history', name: 'Credit History', description: 'Credit transaction history', authRequired: true },
  { path: '/dashboard/creator', name: 'Creator Dashboard', description: 'Track earnings and prompt usage', authRequired: true },
  { path: '/settings', name: 'Settings', description: 'User settings', authRequired: true },
  
  // Content routes
  { path: '/create/prompt', name: 'Create Prompt', description: 'Create a new prompt', authRequired: true },
  { path: '/create/flow', name: 'Create Flow', description: 'Create a new flow', authRequired: true },
  { path: '/prompts', name: 'Prompts', description: 'Browse prompts', isPublic: true },
  { path: '/flows', name: 'Flows', description: 'Browse flows', isPublic: true },
  
  // Admin routes
  { path: '/admin/login', name: 'Admin Login', description: 'Admin login page', isPublic: true },
  { path: '/admin/dashboard', name: 'Admin Dashboard', description: 'Platform administration', adminRequired: true },
  
  // Debug routes
  { path: '/dev-utils', name: 'Dev Utils', description: 'Development utilities', authRequired: true },
  { path: '/test-credits', name: 'Test Credits', description: 'Credit system testing page', authRequired: true },
  { path: '/routes', name: 'Routes', description: 'This page - all available routes', isPublic: true },
];

export default function RoutesPage() {
  const { data: session, status } = useSession();
  const isAdmin = session?.user?.role === 'ADMIN';
  
  // Filter routes based on authentication status
  const filteredRoutes = routes.filter(route => {
    if (route.isPublic) return true;
    if (route.adminRequired) return isAdmin;
    if (route.authRequired) return status === 'authenticated';
    return false;
  });
  
  const getRouteStyle = (route: typeof routes[0]) => {
    if (route.adminRequired) return 'bg-red-50 border-red-200';
    if (route.authRequired) return 'bg-blue-50 border-blue-200';
    return 'bg-green-50 border-green-200';
  };
  
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">All Routes</h1>
        <p className="text-gray-600">
          Navigation map for PromptFlow
        </p>
      </div>
      
      <div className="mb-4 flex gap-4">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-green-500"></div>
          <span className="text-sm">Public</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
          <span className="text-sm">Requires Login</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500"></div>
          <span className="text-sm">Admin Only</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoutes.map((route) => (
          <Link
            key={route.path}
            href={route.path}
            className={`block p-4 border rounded-lg hover:shadow-md transition-shadow ${getRouteStyle(route)}`}
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="font-bold text-lg">{route.name}</h2>
                <p className="text-gray-600 text-sm">{route.description}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${
                route.adminRequired 
                  ? 'bg-red-500' 
                  : route.authRequired 
                    ? 'bg-blue-500' 
                    : 'bg-green-500'
              }`}></div>
            </div>
            <div className="mt-2">
              <code className="text-xs bg-white/50 px-2 py-1 rounded">{route.path}</code>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
