import React, { useEffect, useState } from 'react';
import { getTransactionStatistics } from '@/utils/creditManager';
import { formatCreditsToDollars } from '@/lib/models/modelCosts';

interface TransactionStats {
  totalInference: number;
  totalCreatorPayments: number;
  totalPurchases: number;
  platformRevenue: number;
  modelUsage: Array<{
    model: string;
    runs: number;
    totalCost: number;
  }>;
}

export default function CreditDashboard() {
  const [stats, setStats] = useState<TransactionStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await getTransactionStatistics();
        setStats(data);
      } catch (err) {
        setError('Failed to load credit statistics');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
    
    // Refresh every 5 minutes
    const interval = setInterval(fetchStats, 5 * 60 * 1000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <div className="p-4">Loading credit statistics...</div>;
  }

  if (error) {
    return <div className="p-4 text-red-500">{error}</div>;
  }

  if (!stats) {
    return <div className="p-4">No credit statistics available</div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Credit System Dashboard</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Inference Cost</h3>
          <p className="text-2xl font-bold">{stats.totalInference.toLocaleString()} credits</p>
          <p className="text-sm text-gray-500">{formatCreditsToDollars(stats.totalInference)}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Creator Payments</h3>
          <p className="text-2xl font-bold">{stats.totalCreatorPayments.toLocaleString()} credits</p>
          <p className="text-sm text-gray-500">{formatCreditsToDollars(stats.totalCreatorPayments)}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Credit Purchases</h3>
          <p className="text-2xl font-bold">{stats.totalPurchases.toLocaleString()} credits</p>
          <p className="text-sm text-gray-500">{formatCreditsToDollars(stats.totalPurchases)}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Platform Revenue</h3>
          <p className="text-2xl font-bold">{stats.platformRevenue.toLocaleString()} credits</p>
          <p className="text-sm text-gray-500">{formatCreditsToDollars(stats.platformRevenue)}</p>
        </div>
      </div>
      
      <div className="bg-white p-4 rounded shadow mb-6">
        <h3 className="text-lg font-medium text-gray-700 mb-2">Model Usage</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Model</th>
                <th className="px-4 py-2 text-right">Runs</th>
                <th className="px-4 py-2 text-right">Total Cost (Credits)</th>
                <th className="px-4 py-2 text-right">Cost ($)</th>
              </tr>
            </thead>
            <tbody>
              {stats.modelUsage.map((model, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : ''}>
                  <td className="px-4 py-2">{model.model}</td>
                  <td className="px-4 py-2 text-right">{model.runs.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{model.totalCost.toLocaleString()}</td>
                  <td className="px-4 py-2 text-right">{formatCreditsToDollars(model.totalCost)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      <div className="text-sm text-gray-500">
        <p>Credit conversion rate: 1 credit = $0.000001 (1 million credits = $1.00)</p>
        <p>Last updated: {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
}
