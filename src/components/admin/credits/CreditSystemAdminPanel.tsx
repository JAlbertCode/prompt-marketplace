'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits, creditsToUSD } from '@/lib/utils';
import { AUTOMATION_BONUS_TIERS } from '@/lib/automation/bonusTierCalculator';

interface SystemStats {
  totalUsers: number;
  totalCredits: number;
  creditsUsedToday: number;
  creditsUsedThisMonth: number;
  purchasedCredits: number;
  bonusCredits: number;
  referralCredits: number;
  modelUsage: Array<{
    modelId: string;
    displayName: string;
    creditsBurned: number;
    percentageOfTotal: number;
  }>;
  dailyUsage: Array<{
    date: string;
    credits: number;
  }>;
  revenue: {
    today: number;
    thisMonth: number;
    allTime: number;
  };
}

interface ReferralConfig {
  inviterBonus: number;
  inviteeBonus: number;
  minSpendRequirement: number;
}

const CreditSystemAdminPanel: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<SystemStats | null>(null);
  const [referralConfig, setReferralConfig] = useState<ReferralConfig>({
    inviterBonus: 50000,
    inviteeBonus: 20000,
    minSpendRequirement: 10000
  });
  const [activeTab, setActiveTab] = useState<'overview' | 'settings' | 'manual-credits'>('overview');
  const [manualCreditForm, setManualCreditForm] = useState({
    userId: '',
    amount: 10000,
    reason: 'admin_adjustment',
    expiryDays: 90
  });
  
  // Fetch system stats
  useEffect(() => {
    const fetchSystemStats = async () => {
      try {
        setLoading(true);
        
        const response = await fetch('/api/admin/credits/stats');
        
        if (!response.ok) {
          throw new Error('Failed to fetch credit system stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching credit system stats:', err);
        setError('Could not load credit system statistics');
      } finally {
        setLoading(false);
      }
    };
    
    const fetchReferralConfig = async () => {
      try {
        const response = await fetch('/api/referrals/config');
        
        if (response.ok) {
          const data = await response.json();
          setReferralConfig(data);
        }
      } catch (error) {
        console.error('Error fetching referral config:', error);
      }
    };
    
    fetchSystemStats();
    fetchReferralConfig();
  }, []);
  
  // Handle referral config update
  const handleSaveReferralConfig = async () => {
    try {
      const response = await fetch('/api/admin/referrals/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(referralConfig)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update referral config');
      }
      
      alert('Referral configuration updated successfully');
    } catch (error) {
      console.error('Error saving referral config:', error);
      alert('Failed to update referral configuration');
    }
  };
  
  // Handle manual credit adjustment
  const handleManualCreditAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const response = await fetch('/api/admin/credits/adjust', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          userId: manualCreditForm.userId,
          amount: manualCreditForm.amount,
          reason: manualCreditForm.reason,
          expiryDays: manualCreditForm.expiryDays
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to adjust credits');
      }
      
      alert('Credits adjusted successfully');
      
      // Reset form
      setManualCreditForm({
        userId: '',
        amount: 10000,
        reason: 'admin_adjustment',
        expiryDays: 90
      });
    } catch (error) {
      console.error('Error adjusting credits:', error);
      alert('Failed to adjust credits');
    }
  };
  
  // Handle automation bonus calculation
  const handleCalculateAutomationBonuses = async () => {
    try {
      const response = await fetch('/api/admin/credits/automation-bonus', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to calculate automation bonuses');
      }
      
      const data = await response.json();
      alert(`Automation bonuses calculated successfully. ${data.bonusesIssued} bonuses issued.`);
    } catch (error) {
      console.error('Error calculating automation bonuses:', error);
      alert('Failed to calculate automation bonuses');
    }
  };
  
  // Handle referral qualification processing
  const handleProcessReferrals = async () => {
    try {
      const response = await fetch('/api/admin/referrals/process', {
        method: 'POST'
      });
      
      if (!response.ok) {
        throw new Error('Failed to process referrals');
      }
      
      const data = await response.json();
      alert(`Referrals processed successfully. ${data.referralsProcessed} referrals qualified.`);
    } catch (error) {
      console.error('Error processing referrals:', error);
      alert('Failed to process referrals');
    }
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Credit System Administration</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-40 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Credit System Administration</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Credit System Administration</h2>
      
      {/* Tab navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('overview')}
            className={`pb-4 px-1 ${
              activeTab === 'overview'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            System Overview
          </button>
          
          <button
            onClick={() => setActiveTab('settings')}
            className={`pb-4 px-1 ${
              activeTab === 'settings'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Settings
          </button>
          
          <button
            onClick={() => setActiveTab('manual-credits')}
            className={`pb-4 px-1 ${
              activeTab === 'manual-credits'
                ? 'border-b-2 border-blue-500 text-blue-600 font-medium'
                : 'border-b-2 border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            }`}
          >
            Manual Adjustments
          </button>
        </nav>
      </div>
      
      {/* Tab content */}
      {activeTab === 'overview' && stats && (
        <div>
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Users</div>
              <div className="text-2xl font-bold">{stats.totalUsers.toLocaleString()}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Total Credits</div>
              <div className="text-2xl font-bold">{formatCredits(stats.totalCredits)}</div>
              <div className="text-xs text-gray-500">Approximate value: {creditsToUSD(stats.totalCredits)}</div>
            </div>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
              <div className="text-sm text-gray-500 mb-1">Credits Used Today</div>
              <div className="text-2xl font-bold">{formatCredits(stats.creditsUsedToday)}</div>
            </div>
          </div>
          
          {/* Credits by type */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Credits by Type</h3>
            
            <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
              <div className="flex h-4 rounded-full overflow-hidden">
                <div 
                  className="bg-green-500 h-full" 
                  style={{ width: `${(stats.purchasedCredits / stats.totalCredits) * 100}%` }}
                ></div>
                <div 
                  className="bg-blue-500 h-full" 
                  style={{ width: `${(stats.bonusCredits / stats.totalCredits) * 100}%` }}
                ></div>
                <div 
                  className="bg-purple-500 h-full" 
                  style={{ width: `${(stats.referralCredits / stats.totalCredits) * 100}%` }}
                ></div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-4">
              <div className="flex items-center">
                <div className="bg-green-500 w-3 h-3 rounded-full mr-2"></div>
                <span className="text-sm">
                  Purchased: {formatCredits(stats.purchasedCredits)} 
                  ({Math.round((stats.purchasedCredits / stats.totalCredits) * 100)}%)
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-blue-500 w-3 h-3 rounded-full mr-2"></div>
                <span className="text-sm">
                  Bonus: {formatCredits(stats.bonusCredits)}
                  ({Math.round((stats.bonusCredits / stats.totalCredits) * 100)}%)
                </span>
              </div>
              
              <div className="flex items-center">
                <div className="bg-purple-500 w-3 h-3 rounded-full mr-2"></div>
                <span className="text-sm">
                  Referral: {formatCredits(stats.referralCredits)}
                  ({Math.round((stats.referralCredits / stats.totalCredits) * 100)}%)
                </span>
              </div>
            </div>
          </div>
          
          {/* Revenue summary */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Revenue</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="text-sm text-gray-500 mb-1">Today</div>
                <div className="text-2xl font-bold text-green-600">${stats.revenue.today.toFixed(2)}</div>
              </div>
              
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="text-sm text-gray-500 mb-1">This Month</div>
                <div className="text-2xl font-bold text-green-600">${stats.revenue.thisMonth.toFixed(2)}</div>
              </div>
              
              <div className="bg-green-50 rounded-lg border border-green-200 p-4">
                <div className="text-sm text-gray-500 mb-1">All Time</div>
                <div className="text-2xl font-bold text-green-600">${stats.revenue.allTime.toFixed(2)}</div>
              </div>
            </div>
          </div>
          
          {/* Model usage */}
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Model Usage</h3>
            
            <div className="space-y-3">
              {stats.modelUsage.map((model) => (
                <div key={model.modelId} className="space-y-1">
                  <div className="flex justify-between text-sm">
                    <div className="font-medium">{model.displayName}</div>
                    <div className="text-gray-500">
                      {formatCredits(model.creditsBurned)} ({model.percentageOfTotal}%)
                    </div>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${model.percentageOfTotal}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          
          {/* Admin actions */}
          <div>
            <h3 className="font-medium text-gray-700 mb-3">Admin Actions</h3>
            
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleCalculateAutomationBonuses}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Calculate Automation Bonuses
              </button>
              
              <button
                onClick={handleProcessReferrals}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Process Qualifying Referrals
              </button>
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'settings' && (
        <div>
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Referral Program Settings</h3>
            
            <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
              <div className="space-y-4">
                <div>
                  <label htmlFor="inviterBonus" className="block text-sm font-medium text-gray-700 mb-1">
                    Inviter Bonus (Credits)
                  </label>
                  <input
                    type="number"
                    id="inviterBonus"
                    value={referralConfig.inviterBonus}
                    onChange={(e) => setReferralConfig(prev => ({ ...prev, inviterBonus: parseInt(e.target.value) || 0 }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="inviteeBonus" className="block text-sm font-medium text-gray-700 mb-1">
                    Invitee Bonus (Credits)
                  </label>
                  <input
                    type="number"
                    id="inviteeBonus"
                    value={referralConfig.inviteeBonus}
                    onChange={(e) => setReferralConfig(prev => ({ ...prev, inviteeBonus: parseInt(e.target.value) || 0 }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label htmlFor="minSpendRequirement" className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Spend Requirement (Credits)
                  </label>
                  <input
                    type="number"
                    id="minSpendRequirement"
                    value={referralConfig.minSpendRequirement}
                    onChange={(e) => setReferralConfig(prev => ({ ...prev, minSpendRequirement: parseInt(e.target.value) || 0 }))}
                    className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
            
            <button
              onClick={handleSaveReferralConfig}
              className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Save Referral Settings
            </button>
          </div>
          
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-3">Automation Bonus Tiers</h3>
            
            <div className="overflow-hidden border border-gray-200 rounded-md">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tier
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Min Usage
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Max Usage
                    </th>
                    <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Bonus Credits
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {AUTOMATION_BONUS_TIERS.map((tier) => (
                    <tr key={tier.id} className="hover:bg-gray-50">
                      <td className="px-3 py-2 whitespace-nowrap text-sm font-medium text-gray-900">
                        {tier.name}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                        {formatCredits(tier.minBurn)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right text-gray-500">
                        {tier.maxBurn === Number.MAX_SAFE_INTEGER ? 'No limit' : formatCredits(tier.maxBurn)}
                      </td>
                      <td className="px-3 py-2 whitespace-nowrap text-sm text-right font-medium text-green-600">
                        {formatCredits(tier.bonus)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="mt-2 text-sm text-gray-500">
              Note: Automation bonus tiers are hardcoded and not editable through the UI.
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'manual-credits' && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Manual Credit Adjustment</h3>
          
          <form onSubmit={handleManualCreditAdjustment} className="space-y-4">
            <div>
              <label htmlFor="userId" className="block text-sm font-medium text-gray-700 mb-1">
                User ID
              </label>
              <input
                type="text"
                id="userId"
                required
                value={manualCreditForm.userId}
                onChange={(e) => setManualCreditForm(prev => ({ ...prev, userId: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter user ID"
              />
            </div>
            
            <div>
              <label htmlFor="amount" className="block text-sm font-medium text-gray-700 mb-1">
                Credit Amount
              </label>
              <input
                type="number"
                id="amount"
                required
                value={manualCreditForm.amount}
                onChange={(e) => setManualCreditForm(prev => ({ ...prev, amount: parseInt(e.target.value) || 0 }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter credit amount"
              />
              <p className="mt-1 text-sm text-gray-500">
                Use negative values to deduct credits
              </p>
            </div>
            
            <div>
              <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-1">
                Reason
              </label>
              <select
                id="reason"
                required
                value={manualCreditForm.reason}
                onChange={(e) => setManualCreditForm(prev => ({ ...prev, reason: e.target.value }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              >
                <option value="admin_adjustment">Admin Adjustment</option>
                <option value="customer_support">Customer Support</option>
                <option value="refund">Refund</option>
                <option value="bonus">Bonus</option>
                <option value="promotional">Promotional</option>
                <option value="correction">Correction</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="expiryDays" className="block text-sm font-medium text-gray-700 mb-1">
                Expiry (Days)
              </label>
              <input
                type="number"
                id="expiryDays"
                value={manualCreditForm.expiryDays}
                onChange={(e) => setManualCreditForm(prev => ({ ...prev, expiryDays: parseInt(e.target.value) || 0 }))}
                className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                placeholder="Enter expiry in days (0 for no expiry)"
              />
              <p className="mt-1 text-sm text-gray-500">
                Set to 0 for no expiration
              </p>
            </div>
            
            <div>
              <button
                type="submit"
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Apply Credit Adjustment
              </button>
            </div>
          </form>
          
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-md p-4">
            <h4 className="font-medium text-amber-800 mb-2">Important Notes</h4>
            <ul className="list-disc list-inside text-sm text-amber-700 space-y-1">
              <li>Manual credit adjustments are logged and cannot be reversed</li>
              <li>Positive adjustments create new credit buckets with the specified expiry</li>
              <li>Negative adjustments burn credits from existing buckets in priority order</li>
              <li>Always double-check the user ID and amount before submitting</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
};

export default CreditSystemAdminPanel;