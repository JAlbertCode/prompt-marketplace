/**
 * Credit Bundle Display Component
 * 
 * This component displays a credit bundle with a purchase button.
 * It's a simpler version of the CreditPurchaseCard component.
 */

'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';

interface CreditBundleDisplayProps {
  id: string;
  name: string;
  price: number;
  baseCredits: number;
  bonusCredits: number;
  totalCredits: number;
  featured?: boolean;
}

export default function CreditBundleDisplay({
  id,
  name,
  price,
  baseCredits,
  bonusCredits,
  totalCredits,
  featured = false,
}: CreditBundleDisplayProps) {
  const [loading, setLoading] = useState(false);
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  const handlePurchase = async () => {
    try {
      setLoading(true);
      toast.loading('Initiating purchase...');
      
      const response = await fetch('/api/credits/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ bundleId: id }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Failed to process purchase');
      }
      
      toast.dismiss();
      
      if (data.redirectUrl) {
        window.location.href = data.redirectUrl;
      } else {
        // For testing/demo purposes, add credits directly
        await simulateAddCredits();
        
        toast.success('Credits added successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    } catch (error) {
      console.error('Error purchasing credits:', error);
      toast.dismiss();
      toast.error('Failed to purchase credits. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  // Just for development/testing purposes
  const simulateAddCredits = async () => {
    try {
      const response = await fetch('/api/credits/add', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: totalCredits,
          type: 'purchased',
          source: 'test_purchase',
          expiryDays: 365,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to add credits');
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error adding credits:', error);
      throw error;
    }
  };
  
  return (
    <div className={`
      border rounded-lg p-4 shadow-sm
      ${featured ? 'bg-blue-50 border-blue-200' : 'bg-white'}
    `}>
      <h3 className="text-lg font-bold mb-1">{name}</h3>
      
      <div className="mb-2">
        <p className="text-2xl font-bold">${price}</p>
      </div>
      
      <div className="space-y-1 mb-4 text-sm">
        <div className="flex justify-between">
          <span>Base Credits:</span>
          <span className="font-medium">{formatNumber(baseCredits)}</span>
        </div>
        
        {bonusCredits > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Bonus:</span>
            <span className="font-medium">+{formatNumber(bonusCredits)}</span>
          </div>
        )}
        
        <div className="flex justify-between pt-1 border-t">
          <span className="font-medium">Total:</span>
          <span className="font-medium">{formatNumber(totalCredits)}</span>
        </div>
      </div>
      
      <button
        onClick={handlePurchase}
        disabled={loading}
        className={`
          w-full py-2 rounded font-medium text-white
          ${loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}
        `}
      >
        {loading ? 'Processing...' : 'Purchase'}
      </button>
    </div>
  );
}
