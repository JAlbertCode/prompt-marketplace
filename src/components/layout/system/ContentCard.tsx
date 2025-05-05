import React from 'react';

interface ContentCardProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
  footer?: React.ReactNode;
  className?: string;
}

export default function ContentCard({ 
  children,
  title,
  description,
  footer,
  className = ''
}: ContentCardProps) {
  return (
    <div className={`bg-white rounded-lg shadow overflow-hidden ${className}`}>
      {/* Header if title is provided */}
      {(title || description) && (
        <div className="px-6 py-4 border-b border-gray-200">
          {title && <h2 className="text-lg font-medium text-gray-900">{title}</h2>}
          {description && <p className="mt-1 text-sm text-gray-500">{description}</p>}
        </div>
      )}
      
      {/* Main content */}
      <div className="p-6">
        {children}
      </div>
      
      {/* Footer if provided */}
      {footer && (
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-200">
          {footer}
        </div>
      )}
    </div>
  );
}
