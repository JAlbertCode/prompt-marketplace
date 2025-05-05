'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits } from '@/lib/utils';

interface ReferralProgramCardProps {
  userId: string;
}

interface ReferralStats {
  referralCode: string;
  totalReferrals: number;
  pendingReferrals: number;
  creditsEarned: number;
  referralsData: Array<{
    id: string;
    email: string;
    name: string;
    status: 'pending' | 'complete';
    creditsEarned: number;
    dateJoined: string;
  }>;
}

const ReferralProgramCard: React.FC<ReferralProgramCardProps> = ({ userId }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [referralStats, setReferralStats] = useState<ReferralStats | null>(null);
  const [referralLink, setReferralLink] = useState<string>('');
  const [copied, setCopied] = useState(false);
  
  // Referral rewards configuration - fetched from API but has defaults
  const [referralConfig, setReferralConfig] = useState({
    inviterBonus: 50000, // 50,000 credits per successful referral
    inviteeBonus: 20000,  // 20,000 credits for new users
    minSpendRequirement: 10000, // Minimum credits spent by referral to qualify
  });
  
  useEffect(() => {
    // Fetch referral stats
    const fetchReferralStats = async () => {
      try {
        setLoading(true);
        
        // Get referral program configuration first
        const configResponse = await fetch('/api/referrals/config');
        if (configResponse.ok) {
          const configData = await configResponse.json();
          setReferralConfig(configData);
        }
        
        // Get user's referral stats
        const response = await fetch(`/api/referrals/stats?userId=${userId}`);
        
        if (!response.ok) {
          throw new Error('Failed to fetch referral statistics');
        }
        
        const data = await response.json();
        setReferralStats(data);
        
        // Generate referral link
        const baseUrl = window.location.origin;
        setReferralLink(`${baseUrl}/signup?referral=${data.referralCode}`);
        
        setError(null);
      } catch (err) {
        console.error('Error fetching referral stats:', err);
        setError('Could not load referral statistics');
      } finally {
        setLoading(false);
      }
    };
    
    fetchReferralStats();
  }, [userId]);
  
  // Handle copy to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };
  
  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Referral Program</h2>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-3/4"></div>
          <div className="h-12 bg-gray-200 rounded"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Referral Program</h2>
        <div className="bg-red-50 text-red-600 p-3 rounded-md">
          {error}
        </div>
      </div>
    );
  }
  
  if (!referralStats) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">Referral Program</h2>
        <div className="bg-blue-50 border border-blue-100 rounded-md p-4">
          <p className="text-blue-700">
            Referral program information is not available right now. Please try again later.
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Referral Program</h2>
      
      {/* Program Description */}
      <div className="bg-blue-50 border border-blue-100 rounded-md p-4 mb-6">
        <h3 className="font-medium text-blue-700 mb-2">Earn Credits by Inviting Friends</h3>
        <p className="text-sm text-blue-600 mb-3">
          Share your referral link with friends and colleagues. When they sign up and use PromptFlow, 
          you'll both earn bonus credits.
        </p>
        <ul className="text-sm text-blue-600 list-disc list-inside space-y-1">
          <li>You get <span className="font-medium">{formatCredits(referralConfig.inviterBonus)} credits</span> for each successful referral</li>
          <li>Your friends get <span className="font-medium">{formatCredits(referralConfig.inviteeBonus)} credits</span> when they sign up</li>
          <li>Referrals must use at least {formatCredits(referralConfig.minSpendRequirement)} credits to qualify</li>
        </ul>
      </div>
      
      {/* Referral Stats */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Your Referral Stats</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Successful Referrals</div>
            <div className="text-2xl font-bold">{referralStats.totalReferrals - referralStats.pendingReferrals}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Pending Referrals</div>
            <div className="text-2xl font-bold">{referralStats.pendingReferrals}</div>
          </div>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4">
            <div className="text-sm text-gray-500 mb-1">Credits Earned</div>
            <div className="text-2xl font-bold text-green-600">{formatCredits(referralStats.creditsEarned)}</div>
          </div>
        </div>
      </div>
      
      {/* Referral Link */}
      <div className="mb-6">
        <h3 className="font-medium text-gray-700 mb-3">Your Referral Link</h3>
        
        <div className="flex rounded-md shadow-sm">
          <input
            type="text"
            value={referralLink}
            readOnly
            className="flex-1 rounded-none rounded-l-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
          />
          <button
            type="button"
            onClick={copyToClipboard}
            className={`inline-flex items-center px-4 py-2 border border-l-0 border-gray-300 rounded-r-md ${
              copied ? 'bg-green-50 text-green-700' : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
            }`}
          >
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
        
        <div className="mt-3 flex gap-3">
          <button
            type="button"
            onClick={() => window.open(`mailto:?subject=Join me on PromptFlow&body=I've been using PromptFlow for my AI prompts and flows. Join with my referral link to get ${formatCredits(referralConfig.inviteeBonus)} free credits: ${encodeURIComponent(referralLink)}`, '_blank')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Share via Email
          </button>
          
          <button
            type="button"
            onClick={() => window.open(`https://twitter.com/intent/tweet?text=I've been using PromptFlow for AI prompts and flows. Join with my referral link to get ${formatCredits(referralConfig.inviteeBonus)} free credits: ${encodeURIComponent(referralLink)}`, '_blank')}
            className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Share on Twitter
          </button>
        </div>
      </div>
      
      {/* Referral Table */}
      {referralStats.referralsData.length > 0 && (
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Your Referrals</h3>
          
          <div className="overflow-hidden border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date Joined
                  </th>
                  <th scope="col" className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th scope="col" className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Credits Earned
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {referralStats.referralsData.map((referral) => (
                  <tr key={referral.id} className="hover:bg-gray-50">
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="text-sm font-medium text-gray-900">
                          {referral.name}
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {new Date(referral.dateJoined).toLocaleDateString()}
                      </div>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        referral.status === 'complete' 
                          ? 'bg-green-100 text-green-800' 
                          : 'bg-yellow-100 text-yellow-800'
                      }`}>
                        {referral.status === 'complete' ? 'Complete' : 'Pending'}
                      </span>
                    </td>
                    <td className="px-3 py-2 whitespace-nowrap text-right">
                      <div className={`text-sm font-medium ${referral.status === 'complete' ? 'text-green-600' : 'text-gray-400'}`}>
                        {formatCredits(referral.creditsEarned)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReferralProgramCard;