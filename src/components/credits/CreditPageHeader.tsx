"use client";

import React from 'react';
import { CreditCard, History, TrendingUp } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

interface CreditPageHeaderProps {
  title: string;
  description?: string;
  credits?: number;
}

export default function CreditPageHeader({ 
  title, 
  description, 
  credits 
}: CreditPageHeaderProps) {
  const pathname = usePathname();
  
  // Format credits for display
  const formattedCredits = credits !== undefined 
    ? credits.toLocaleString() 
    : '...';
  
  // Credit value in USD
  const creditValueUSD = credits !== undefined 
    ? `$${(credits * 0.000001).toFixed(6)} USD` 
    : '...';
  
  // Define navigation links for credit pages with rendered icons instead of component references
  const links = [
    { 
      href: '/dashboard/credits', 
      label: 'Purchase Credits',
      iconName: 'credit-card'
    },
    { 
      href: '/dashboard/credits/history', 
      label: 'Transaction History',
      iconName: 'history'
    },
    { 
      href: '/dashboard/credits/usage', 
      label: 'Usage Analytics',
      iconName: 'trending-up'
    }
  ];
  
  // Function to render the appropriate icon based on string name
  const renderIcon = (iconName: string, className: string) => {
    switch (iconName) {
      case 'credit-card':
        return <CreditCard className={className} />;
      case 'history':
        return <History className={className} />;
      case 'trending-up':
        return <TrendingUp className={className} />;
      default:
        return null;
    }
  };

  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold mb-1">{title}</h1>
          {description && (
            <p className="text-gray-600">{description}</p>
          )}
        </div>
        
        <div className="mt-4 md:mt-0 bg-white p-3 rounded-lg shadow-sm border border-gray-100">
          <div className="text-sm text-gray-500">Available Credits</div>
          <div className="text-2xl font-bold text-blue-600">{formattedCredits}</div>
          <div className="text-xs text-gray-500">{creditValueUSD}</div>
        </div>
      </div>
      
      <div className="flex overflow-x-auto pb-2 border-b">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const iconClass = `mr-2 h-4 w-4 ${isActive ? 'text-blue-500' : 'text-gray-400'}`;
          
          return (
            <Link
              key={link.href}
              href={link.href}
              className={`flex items-center px-4 py-2 mr-4 text-sm font-medium rounded-md transition-colors whitespace-nowrap
                ${isActive 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-700 hover:bg-gray-50 hover:text-gray-900'
                }
              `}
            >
              {renderIcon(link.iconName, iconClass)}
              {link.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
