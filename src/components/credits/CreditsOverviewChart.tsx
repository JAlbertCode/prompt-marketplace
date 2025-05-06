"use client";

import React, { useState } from 'react';
import { Calendar, Filter } from 'lucide-react';
import { formatCredits } from '@/lib/creditHelpers';

// Transaction types with colors
const transactionTypes = [
  { 
    id: 'prompt', 
    name: 'Prompt Usage', 
    color: '#3b82f6',
    selected: true 
  },
  { 
    id: 'completion', 
    name: 'Completion Usage', 
    color: '#10b981',
    selected: true
  },
  { 
    id: 'flow', 
    name: 'Flow Usage', 
    color: '#8b5cf6',
    selected: true
  },
  { 
    id: 'purchased', 
    name: 'Credits Purchased', 
    color: '#f59e0b',
    selected: false
  },
  { 
    id: 'bonus', 
    name: 'Bonus Credits', 
    color: '#6366f1',
    selected: false
  }
];

// Sample data to show chart
const generateSampleData = () => {
  const now = new Date();
  const data = [];

  for (let i = 0; i < 30; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - (29 - i));
    
    // Format date as MM/DD
    const formattedDate = `${date.getMonth() + 1}/${date.getDate()}`;
    
    // Generate random usage data
    const promptUsage = Math.floor(Math.random() * 50000) + 1000;
    const completionUsage = Math.floor(Math.random() * 40000) + 800;
    const flowUsage = Math.floor(Math.random() * 20000) + 500;
    
    // Occasionally add purchases
    const purchased = i % 7 === 0 ? Math.floor(Math.random() * 5000000) + 1000000 : 0;
    const bonus = i % 7 === 0 ? Math.floor(Math.random() * 1000000) : 0;
    
    data.push({
      date: formattedDate,
      fullDate: date,
      prompt: promptUsage,
      completion: completionUsage,
      flow: flowUsage,
      purchased: purchased,
      bonus: bonus,
      total: promptUsage + completionUsage + flowUsage
    });
  }
  
  return data;
};

interface CreditsOverviewChartProps {
  // In a real implementation, this would take actual transaction data
  // transactions: CreditTransaction[];
  timeframe?: '7d' | '30d' | '90d';
}

export default function CreditsOverviewChart({ 
  timeframe = '30d' 
}: CreditsOverviewChartProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'7d' | '30d' | '90d'>(timeframe);
  const [showFilters, setShowFilters] = useState(false);
  const [selectedTypes, setSelectedTypes] = useState(
    transactionTypes.filter(t => t.selected).map(t => t.id)
  );
  
  // Get sample data
  const allData = generateSampleData();
  
  // Filter data based on timeframe
  const getTimeframeData = () => {
    switch (selectedTimeframe) {
      case '7d':
        return allData.slice(-7);
      case '90d':
        return allData; // Our sample only has 30 days
      default:
        return allData;
    }
  };
  
  const data = getTimeframeData();
  
  // Calculate total usage
  const totalUsage = data.reduce((sum, day) => {
    return sum + day.prompt + day.completion + day.flow;
  }, 0);
  
  // Format large numbers
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  };
  
  // Toggle transaction type selection
  const toggleType = (typeId: string) => {
    if (selectedTypes.includes(typeId)) {
      setSelectedTypes(selectedTypes.filter(id => id !== typeId));
    } else {
      setSelectedTypes([...selectedTypes, typeId]);
    }
  };
  
  return (
    <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
      <div className="p-4 border-b border-gray-200 flex flex-col md:flex-row justify-between md:items-center gap-4">
        <div>
          <h3 className="text-lg font-semibold">Credit Usage Overview</h3>
          <p className="text-sm text-gray-500">
            Total usage: {formatCredits(totalUsage)} credits
          </p>
        </div>
        
        <div className="flex space-x-2">
          {/* Timeframe selector */}
          <div className="flex text-sm rounded-md overflow-hidden border border-gray-300">
            <button
              onClick={() => setSelectedTimeframe('7d')}
              className={`px-3 py-1.5 ${
                selectedTimeframe === '7d' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              7D
            </button>
            <button
              onClick={() => setSelectedTimeframe('30d')}
              className={`px-3 py-1.5 ${
                selectedTimeframe === '30d' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              30D
            </button>
            <button
              onClick={() => setSelectedTimeframe('90d')}
              className={`px-3 py-1.5 ${
                selectedTimeframe === '90d' 
                  ? 'bg-blue-50 text-blue-700 font-medium' 
                  : 'bg-white text-gray-600 hover:bg-gray-50'
              }`}
            >
              90D
            </button>
          </div>
          
          {/* Filter button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-3 py-1.5 border rounded-md ${
              showFilters 
                ? 'bg-blue-50 text-blue-700 border-blue-300' 
                : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50'
            }`}
          >
            <Filter className="h-4 w-4 mr-1" />
            <span>Filter</span>
          </button>
        </div>
      </div>
      
      {/* Filters */}
      {showFilters && (
        <div className="p-4 bg-gray-50 border-b border-gray-200">
          <div className="flex flex-wrap gap-2">
            {transactionTypes.map((type) => (
              <button
                key={type.id}
                onClick={() => toggleType(type.id)}
                className={`flex items-center px-3 py-1.5 rounded-full text-sm ${
                  selectedTypes.includes(type.id)
                    ? 'bg-white border border-gray-300 font-medium'
                    : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
                }`}
              >
                <div 
                  className="w-3 h-3 rounded-full mr-2" 
                  style={{ backgroundColor: type.color }}
                ></div>
                {type.name}
              </button>
            ))}
          </div>
        </div>
      )}
      
      {/* Chart - Simple bar chart implementation without recharts */}
      <div className="p-4">
        <div className="h-80 relative">
          <div className="absolute inset-0 flex items-end">
            {data.map((day, index) => {
              // Calculate total height for this day's data
              const total = selectedTypes.reduce((sum, type) => {
                return sum + (day[type as keyof typeof day] as number || 0);
              }, 0);
              
              // Get max value for scaling
              const maxValue = Math.max(
                ...data.map(d => 
                  selectedTypes.reduce((sum, type) => {
                    return sum + (d[type as keyof typeof d] as number || 0);
                  }, 0)
                )
              );
              
              // Calculate percentage height based on max value
              const heightPercentage = (total / maxValue) * 100;
              
              return (
                <div
                  key={day.date}
                  className="flex-1 mx-px flex flex-col justify-end"
                >
                  {/* Stacked bars for selected types */}
                  <div className="flex flex-col-reverse w-full">
                    {selectedTypes.map(type => {
                      const value = day[type as keyof typeof day] as number || 0;
                      if (value === 0) return null;
                      
                      const typeHeight = (value / maxValue) * 100;
                      const typeColor = transactionTypes.find(t => t.id === type)?.color || '#gray';
                      
                      return (
                        <div
                          key={`${day.date}-${type}`}
                          className="w-full transition-all rounded-t hover:opacity-80"
                          style={{
                            height: `${typeHeight}%`,
                            backgroundColor: typeColor
                          }}
                          title={`${day.date}: ${formatCredits(value)} ${type} credits`}
                        ></div>
                      );
                    })}
                  </div>
                  
                  {/* X-axis labels */}
                  <div className="text-xs text-gray-500 text-center mt-2 truncate">
                    {day.date}
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Y-axis lines (grid) */}
          <div className="absolute inset-0 flex flex-col justify-between pointer-events-none">
            {[0, 1, 2, 3, 4].map(i => (
              <div key={i} className="border-t border-gray-200 w-full h-0"></div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Chart legend at bottom */}
      <div className="p-4 bg-gray-50 border-t border-gray-200 text-sm text-gray-500">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <div className="font-semibold mb-1">Usage Types</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-blue-500"></div>
                Prompt: Initial AI request
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-green-500"></div>
                Completion: AI response
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-purple-500"></div>
                Flow: Connected prompt chains
              </li>
            </ul>
          </div>
          
          <div>
            <div className="font-semibold mb-1">Credit Sources</div>
            <ul className="space-y-1">
              <li className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-amber-500"></div>
                Purchased: Bundle purchases
              </li>
              <li className="flex items-center">
                <div className="w-3 h-3 rounded-full mr-2 bg-indigo-500"></div>
                Bonus: Free bonus credits
              </li>
            </ul>
          </div>
          
          <div>
            <div className="font-semibold mb-1">Understanding the Chart</div>
            <p className="text-xs">
              This chart shows credit usage over time. Usage types are stacked to show total daily usage. Credit purchases and bonuses use a separate stack.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
