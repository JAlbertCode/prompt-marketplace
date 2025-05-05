"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface TabItem {
  href: string;
  label: string;
  icon?: React.ElementType;
}

interface PageHeaderProps {
  title: string;
  description?: string;
  tabs?: TabItem[];
  rightContent?: React.ReactNode;
}

export default function PageHeader({ 
  title, 
  description, 
  tabs,
  rightContent 
}: PageHeaderProps) {
  const pathname = usePathname();
  
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        
        {rightContent && (
          <div className="mt-4 md:mt-0">
            {rightContent}
          </div>
        )}
      </div>
      
      {/* Tabbed navigation if provided */}
      {tabs && tabs.length > 0 && (
        <div className="flex overflow-x-auto pb-2 border-b">
          {tabs.map((tab) => {
            const isActive = pathname === tab.href;
            const Icon = tab.icon;
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`flex items-center px-4 py-2 mr-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                  ${isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                  }
                `}
              >
                {Icon && <Icon className={`mr-2 h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`} />}
                {tab.label}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
