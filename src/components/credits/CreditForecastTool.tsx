'use client';

import React, { useState, useEffect } from 'react';
import { formatCredits, creditsToUSD } from '@/lib/utils';
import { useCreditStore } from '@/store/useCreditStore';

interface ForecastSettings {
  dailyUsage: number;
  daysToForecast: number;
  monthlyBudget: number;
  alerts: {
    enabled: boolean;
    threshold: number;
  };
}

const CreditForecastTool: React.FC = () => {
  const { credits, fetchCredits } = useCreditStore();
  const [settings, setSettings] = useState<ForecastSettings>({
    dailyUsage: 10000,
    daysToForecast: 30,
    monthlyBudget: 300000,
    alerts: {
      enabled: false,
      threshold: 50000,
    }
  });
  
  // Fetch current credit balance
  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);
  
  // Update local storage when settings change
  useEffect(() => {
    localStorage.setItem('creditForecastSettings', JSON.stringify(settings));
  }, [settings]);
  
  // Load settings from local storage on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem('creditForecastSettings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Error parsing saved forecast settings:', e);
      }
    } else {
      // Initialize with estimated usage based on recent history
      fetchRecentUsage();
    }
  }, []);
  
  // Fetch recent usage to estimate daily burn rate
  const fetchRecentUsage = async () => {
    try {
      const response = await fetch('/api/credits/usage?period=week');
      if (response.ok) {
        const data = await response.json();
        if (data.totalUsage > 0) {
          // Calculate average daily usage from the past week
          const dailyAverage = Math.round(data.totalUsage / 7);
          setSettings(prev => ({
            ...prev,
            dailyUsage: dailyAverage,
            monthlyBudget: dailyAverage * 30, // Set default budget to 30 days of current usage
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching recent usage:', error);
    }
  };
  
  // Calculate forecast data
  const calculateForecast = () => {
    const { dailyUsage, daysToForecast } = settings;
    
    // Calculate remaining days at current rate
    const daysRemaining = Math.floor(credits / dailyUsage);
    
    // Calculate forecasted balance for each day
    const forecastData = [];
    let remainingCredits = credits;
    
    for (let day = 0; day <= daysToForecast; day++) {
      forecastData.push({
        day,
        credits: Math.max(0, remainingCredits),
      });
      
      remainingCredits -= dailyUsage;
    }
    
    // Calculate budget comparison
    const monthlyUsage = dailyUsage * 30;
    const monthlyBudget = settings.monthlyBudget;
    const budgetStatus = monthlyUsage > monthlyBudget ? 'over' : 'under';
    const budgetDifference = Math.abs(monthlyUsage - monthlyBudget);
    const budgetPercentage = monthlyBudget > 0 
      ? Math.round((monthlyUsage / monthlyBudget) * 100) 
      : 0;
    
    return {
      daysRemaining,
      projectedZeroDate: daysRemaining > 0 
        ? new Date(Date.now() + (daysRemaining * 24 * 60 * 60 * 1000)).toLocaleDateString() 
        : 'Already depleted',
      forecastData,
      monthlyUsage,
      budgetStatus,
      budgetDifference,
      budgetPercentage,
    };
  };
  
  const forecast = calculateForecast();
  
  // Handle input changes
  const handleInputChange = (field: keyof ForecastSettings, value: number) => {
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Handle alert settings
  const handleAlertToggle = (enabled: boolean) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        enabled
      }
    }));
  };
  
  const handleAlertThreshold = (threshold: number) => {
    setSettings(prev => ({
      ...prev,
      alerts: {
        ...prev.alerts,
        threshold
      }
    }));
  };
  
  // Save alerts to user preferences (via API)
  const saveAlertSettings = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          creditAlerts: settings.alerts
        }),
      });
      
      if (response.ok) {
        alert('Alert settings saved successfully');
      } else {
        alert('Failed to save alert settings');
      }
    } catch (error) {
      console.error('Error saving alert settings:', error);
      alert('Error saving alert settings');
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-6">
      <h2 className="text-xl font-bold mb-4">Credit Forecast</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Forecast Settings */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Forecast Settings</h3>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="dailyUsage" className="block text-sm font-medium text-gray-700 mb-1">
                Daily Credit Usage
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="dailyUsage"
                  value={settings.dailyUsage}
                  onChange={(e) => handleInputChange('dailyUsage', parseInt(e.target.value))}
                  className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  credits/day
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="daysToForecast" className="block text-sm font-medium text-gray-700 mb-1">
                Forecast Period
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="daysToForecast"
                  value={settings.daysToForecast}
                  onChange={(e) => handleInputChange('daysToForecast', parseInt(e.target.value))}
                  className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min="1"
                  max="90"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  days
                </span>
              </div>
            </div>
            
            <div>
              <label htmlFor="monthlyBudget" className="block text-sm font-medium text-gray-700 mb-1">
                Monthly Budget
              </label>
              <div className="flex rounded-md shadow-sm">
                <input
                  type="number"
                  id="monthlyBudget"
                  value={settings.monthlyBudget}
                  onChange={(e) => handleInputChange('monthlyBudget', parseInt(e.target.value))}
                  className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                  min="0"
                />
                <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                  credits/month
                </span>
              </div>
            </div>
            
            <div className="border-t border-gray-200 pt-4">
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="alertToggle" className="block text-sm font-medium text-gray-700">
                  Credit Alerts
                </label>
                <div className="relative inline-block w-10 align-middle select-none">
                  <input
                    type="checkbox"
                    id="alertToggle"
                    checked={settings.alerts.enabled}
                    onChange={(e) => handleAlertToggle(e.target.checked)}
                    className="sr-only"
                  />
                  <div className={`block w-10 h-6 rounded-full transition-colors ${settings.alerts.enabled ? 'bg-blue-600' : 'bg-gray-300'}`}></div>
                  <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${settings.alerts.enabled ? 'transform translate-x-4' : ''}`}></div>
                </div>
              </div>
              
              {settings.alerts.enabled && (
                <>
                  <div>
                    <label htmlFor="alertThreshold" className="block text-sm font-medium text-gray-700 mb-1">
                      Alert Threshold
                    </label>
                    <div className="flex rounded-md shadow-sm">
                      <input
                        type="number"
                        id="alertThreshold"
                        value={settings.alerts.threshold}
                        onChange={(e) => handleAlertThreshold(parseInt(e.target.value))}
                        className="flex-1 rounded-md border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                        min="1000"
                      />
                      <span className="inline-flex items-center px-3 rounded-r-md border border-l-0 border-gray-300 bg-gray-50 text-gray-500 sm:text-sm">
                        credits
                      </span>
                    </div>
                  </div>
                  
                  <button
                    type="button"
                    onClick={saveAlertSettings}
                    className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    Save Alert Settings
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Forecast Results */}
        <div>
          <h3 className="font-medium text-gray-700 mb-3">Forecast Results</h3>
          
          <div className="bg-gray-50 rounded-lg border border-gray-200 p-4 mb-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-sm text-gray-500">Current Balance</div>
                <div className="text-xl font-bold">{formatCredits(credits)}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Days Remaining</div>
                <div className={`text-xl font-bold ${forecast.daysRemaining < 7 ? 'text-red-600' : forecast.daysRemaining < 14 ? 'text-amber-600' : 'text-green-600'}`}>
                  {forecast.daysRemaining} days
                </div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Depletion Date</div>
                <div className="text-base font-medium">{forecast.projectedZeroDate}</div>
              </div>
              
              <div>
                <div className="text-sm text-gray-500">Monthly Usage</div>
                <div className="text-base font-medium">{formatCredits(forecast.monthlyUsage)}</div>
              </div>
            </div>
          </div>
          
          {/* Budget Status */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <div>Monthly Budget</div>
              <div>{formatCredits(settings.monthlyBudget)}</div>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className={`h-2.5 rounded-full ${forecast.budgetPercentage <= 100 ? 'bg-green-600' : 'bg-red-600'}`}
                style={{ width: `${Math.min(100, forecast.budgetPercentage)}%` }}
              ></div>
            </div>
            
            <div className="mt-2 text-sm">
              {forecast.budgetStatus === 'under' ? (
                <span className="text-green-600">
                  Under budget by {formatCredits(forecast.budgetDifference)} credits ({100 - forecast.budgetPercentage}%)
                </span>
              ) : (
                <span className="text-red-600">
                  Over budget by {formatCredits(forecast.budgetDifference)} credits ({forecast.budgetPercentage - 100}%)
                </span>
              )}
            </div>
          </div>
          
          {/* Recommendation */}
          <div className="bg-blue-50 rounded-md border border-blue-100 p-3">
            <h4 className="font-medium text-blue-700 mb-1">Recommendation</h4>
            {forecast.budgetStatus === 'over' ? (
              <p className="text-sm text-blue-600">
                Consider reducing your daily usage to {formatCredits(Math.floor(settings.monthlyBudget / 30))} credits 
                to stay within your monthly budget.
              </p>
            ) : forecast.daysRemaining < 14 ? (
              <p className="text-sm text-blue-600">
                Your credits will run out in {forecast.daysRemaining} days. Consider purchasing a
                {forecast.monthlyUsage < 10000000 ? ' Starter' : 
                 forecast.monthlyUsage < 25000000 ? ' Basic' : 
                 forecast.monthlyUsage < 50000000 ? ' Pro' : ' Business'} credit bundle.
              </p>
            ) : (
              <p className="text-sm text-blue-600">
                Your credit usage is sustainable and within budget. You have approximately {forecast.daysRemaining} days of credits remaining.
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreditForecastTool;