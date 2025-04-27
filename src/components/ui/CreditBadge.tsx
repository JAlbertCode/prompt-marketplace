import React from 'react';

interface CreditBadgeProps {
  cost: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

const CreditBadge: React.FC<CreditBadgeProps> = ({
  cost,
  size = 'md',
  className = '',
}) => {
  const sizeClasses = {
    sm: 'text-xs px-2 py-0.5',
    md: 'text-sm px-2.5 py-1',
    lg: 'text-base px-3 py-1.5',
  };
  
  return (
    <div 
      className={`
        inline-flex items-center rounded-full 
        bg-blue-100 text-blue-800 font-medium
        ${sizeClasses[size]}
        ${className}
      `}
    >
      <span className="mr-1">💎</span>
      <span>{cost} Credits</span>
    </div>
  );
};

export default CreditBadge;
