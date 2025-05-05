'use client';

import React, { useState, useEffect } from 'react';
import { calculateAutomationTier, AUTOMATION_BONUS_TIERS } from '@/lib/automation/bonusTierCalculator';
import { formatNumber } from '@/lib/utils';

interface AutomationStatsProps {
  userId: string;
}

const AutomationStatsCard: React.FC<AutomationStatsProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        setLoading(true);
        
        // Fetch automation tier data
        const response = await fetch(`/api/credits/automation/stats?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch automation stats');
        }
        
        const data = await response.json();
        setStats(data);
        setError(null);
      } catch (err) {
        console.error('Error fetching automation stats:', err);
        setError('Could not load automation statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStats();
  }, [userId]);
  
  // If no automation usage, show a getting started card
  if (!loading && stats && stats.monthlyBurn === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Automation Bonus Program</h2>
        
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-4">
          <h3 className="font-medium text-blue-700 mb-2">Get started with automation</h3>
          <p className="text-sm text-blue-600">
            Use our n8n integration to automate your prompts and flows to earn monthly bonus credits.
            The more you automate, the higher your bonus tier!
          </p>
        </div>
        
        <div className="space-y-3">
          <h3 className="font-medium text-gray-700">Bonus Tiers</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {AUTOMATION_BONUS_TIERS.map(tier => (
              <div 
                key={tier.id}
                className="border border-gray-200 rounded-md p-3 bg-gray-50"
              >
                <div className="font-medium">{tier.name}</div>
                <div className="text-sm text-gray-500">{formatNumber(tier.minBurn)}+ credits/month</div>
                <div className="mt-2 text-green-600 font-medium">
                  {formatNumber(tier.bonus)} bonus credits
                </div>
              </div>
            ))}
          </div>
          
          <div className="mt-4">
            <a 
              href="/docs/automation"
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Learn more about automation bonuses →
            </a>
          </div>
        </div>
      </div>
    );
  }
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Automation Bonus</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-8 bg-gray-200 rounded w-2/3"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Automation Bonus</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  // Render the stats card
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Automation Bonus</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <div className="text-sm text-gray-500 mb-1">Current Usage</div>
          <div className="text-2xl font-bold">
            {formatNumber(stats.monthlyBurn)} <span className="text-gray-500 text-base font-normal">credits/month</span>
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            Daily average: {formatNumber(stats.dailyRate)} credits
          </div>
        </div>
        
        <div>
          <div className="text-sm text-gray-500 mb-1">Current Bonus Tier</div>
          <div className="text-2xl font-bold text-green-600">
            {stats.currentTier ? stats.currentTier.name : "Not Qualified"}
          </div>
          
          <div className="mt-2 text-sm text-gray-500">
            {stats.currentTier ? 
              `Monthly bonus: ${formatNumber(stats.currentTier.bonus)} credits` : 
              `Need ${formatNumber(stats.creditsToNextTier)} more credits to qualify`
            }
          </div>
        </div>
      </div>
      
      {/* Progress bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 mb-1">
          <div>
            {stats.currentTier ? stats.currentTier.name : "Not qualified"}
          </div>
          <div>
            {stats.nextTier ? `${stats.progress}% to ${stats.nextTier.name}` : "Maximum tier reached"}
          </div>
        </div>
        
        <div className="w-full bg-gray-200 rounded-full h-2.5">
          <div 
            className="bg-blue-600 h-2.5 rounded-full" 
            style={{ width: `${stats.progress}%` }}
          ></div>
        </div>
        
        {stats.nextTier && (
          <div className="mt-2 text-sm text-gray-500">
            {stats.creditsToNextTier > 0 ? (
              <>
                <span className="font-medium">{formatNumber(stats.creditsToNextTier)}</span> more credits needed 
                {stats.daysToNextTier && (
                  <span className="text-blue-600">
                    (estimated in {stats.daysToNextTier} days at current usage)
                  </span>
                )}
              </>
            ) : (
              <span className="text-green-600">You've qualified for the next tier!</span>
            )}
          </div>
        )}
      </div>
      
      {/* Benefits section */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Next Tier Benefits</h3>
        
        {stats.nextTier ? (
          <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
            <div className="font-medium text-blue-700 mb-1">{stats.nextTier.name}</div>
            <div className="text-sm text-blue-600 mb-3">{stats.nextTier.description}</div>
            
            <div className="flex items-center">
              <span className="font-medium text-blue-700 mr-2">
                +{formatNumber(stats.projectedBonusChange)} bonus credits
              </span>
              {stats.currentTier && (
                <span className="text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full">
                  {Math.round((stats.projectedBonusChange / stats.currentTier.bonus) * 100)}% increase
                </span>
              )}
            </div>
          </div>
        ) : (
          <div className="bg-green-50 border border-green-100 rounded-md p-4">
            <div className="font-medium text-green-700 mb-1">Maximum Tier Reached!</div>
            <div className="text-sm text-green-600">
              You're at the highest automation tier. Enjoy your monthly bonus of {formatNumber(stats.currentTier.bonus)} credits!
            </div>
          </div>
        )}
      </div>
      
      {/* All tiers section */}
      <div>
        <h3 className="font-medium text-gray-700 mb-3">All Automation Tiers</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
          {AUTOMATION_BONUS_TIERS.map(tier => {
            const isCurrentTier = stats.currentTier && stats.currentTier.id === tier.id;
            const isNextTier = stats.nextTier && stats.nextTier.id === tier.id;
            
            return (
              <div 
                key={tier.id}
                className={`border rounded-md p-3 ${isCurrentTier ? 'bg-blue-50 border-blue-200' : isNextTier ? 'bg-gray-50 border-blue-200' : 'border-gray-200'}`}
              >
                <div className="font-medium">{tier.name}</div>
                <div className="text-sm text-gray-500">{formatNumber(tier.minBurn)}+ credits/month</div>
                <div className={`mt-2 font-medium ${isCurrentTier ? 'text-blue-600' : 'text-green-600'}`}>
                  {formatNumber(tier.bonus)} bonus credits
                </div>
                
                {isCurrentTier && (
                  <div className="mt-2 text-xs bg-blue-200 text-blue-800 px-2 py-0.5 rounded-full inline-block">
                    Current tier
                  </div>
                )}
                
                {isNextTier && (
                  <div className="mt-2 text-xs bg-gray-200 text-gray-800 px-2 py-0.5 rounded-full inline-block">
                    Next tier
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default AutomationStatsCard;