import React from 'react';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { Bell, Mail, MessageSquare, Zap, Megaphone } from 'lucide-react';

export const metadata = {
  title: 'Notification Settings - PromptFlow',
  description: 'Manage your notification preferences and communication settings',
};

export default async function NotificationsPage() {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    redirect('/login?returnUrl=/settings/notifications');
  }
  
  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Notification Settings</h1>
        <p className="text-gray-600 mt-1">
          Manage how and when you receive notifications from PromptFlow
        </p>
      </div>
      
      <div className="space-y-6">
        {/* Email notification settings */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Mail className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Email Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose which emails you'd like to receive
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="accountEmails"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="accountEmails" className="font-medium text-gray-700">Account updates</label>
                <p className="text-gray-500">Important information about your account, purchases, and security</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="promptEmails"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="promptEmails" className="font-medium text-gray-700">Prompt activity</label>
                <p className="text-gray-500">Updates on prompts you've published, including usage and earnings</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="commentEmails"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="commentEmails" className="font-medium text-gray-700">Comments and replies</label>
                <p className="text-gray-500">Notifications when someone comments on or reviews your prompts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="marketingEmails"
                  type="checkbox"
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="marketingEmails" className="font-medium text-gray-700">Marketing emails</label>
                <p className="text-gray-500">Product updates, special offers, and promotional content</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* In-app notification settings */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Bell className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">In-App Notifications</h2>
              <p className="text-sm text-gray-500 mt-1">
                Configure notifications within the PromptFlow app
              </p>
            </div>
          </div>
          
          <div className="space-y-4 mt-4">
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="creditAlerts"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="creditAlerts" className="font-medium text-gray-700">Credit alerts</label>
                <p className="text-gray-500">Receive notifications when your credit balance is low</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="completionAlerts"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="completionAlerts" className="font-medium text-gray-700">Completion alerts</label>
                <p className="text-gray-500">Notification when a long-running prompt or flow is complete</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="earningAlerts"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="earningAlerts" className="font-medium text-gray-700">Earning alerts</label>
                <p className="text-gray-500">Notification when you earn credits from your prompts</p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="systemUpdates"
                  type="checkbox"
                  defaultChecked
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="systemUpdates" className="font-medium text-gray-700">System updates</label>
                <p className="text-gray-500">Important platform announcements and updates</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Communication channels */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <MessageSquare className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Communication Channels</h2>
              <p className="text-sm text-gray-500 mt-1">
                Choose how you'd like to receive notifications
              </p>
            </div>
          </div>
          
          <div className="mt-4 space-y-6">
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Critical Alerts</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="criticalEmail"
                      name="criticalNotification"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="criticalEmail" className="ml-3 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="criticalApp"
                      name="criticalNotification"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="criticalApp" className="ml-3 block text-sm font-medium text-gray-700">
                      In-App
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="criticalSMS"
                      name="criticalNotification"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="criticalSMS" className="ml-3 block text-sm font-medium text-gray-700">
                      SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Prompt Activity</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="promptEmail"
                      name="promptNotification"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="promptEmail" className="ml-3 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="promptApp"
                      name="promptNotification"
                      type="checkbox"
                      defaultChecked
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="promptApp" className="ml-3 block text-sm font-medium text-gray-700">
                      In-App
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="promptSMS"
                      name="promptNotification"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="promptSMS" className="ml-3 block text-sm font-medium text-gray-700">
                      SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Marketing & Announcements</h3>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="marketingEmail"
                      name="marketingNotification"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marketingEmail" className="ml-3 block text-sm font-medium text-gray-700">
                      Email
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="marketingApp"
                      name="marketingNotification"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marketingApp" className="ml-3 block text-sm font-medium text-gray-700">
                      In-App
                    </label>
                  </div>
                </div>
                <div className="relative flex items-center p-3 border rounded-md">
                  <div className="flex items-center h-5">
                    <input
                      id="marketingSMS"
                      name="marketingNotification"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <label htmlFor="marketingSMS" className="ml-3 block text-sm font-medium text-gray-700">
                      SMS
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Notification schedule */}
        <div className="border rounded-lg p-6">
          <div className="flex items-start mb-4">
            <Zap className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
            <div>
              <h2 className="text-lg font-medium">Notification Schedule</h2>
              <p className="text-sm text-gray-500 mt-1">
                Control when you receive non-critical notifications
              </p>
            </div>
          </div>
          
          <div className="mt-4">
            <div className="space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="quietHours"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="quietHours" className="font-medium text-gray-700">Enable quiet hours</label>
                  <p className="text-gray-500">Only receive critical notifications during specified hours</p>
                </div>
              </div>
              
              <div className="ml-7 grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="quietStart" className="block text-sm font-medium text-gray-700 mb-1">
                    Start Time
                  </label>
                  <select
                    id="quietStart"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option>10:00 PM</option>
                    <option>11:00 PM</option>
                    <option>12:00 AM</option>
                    <option>1:00 AM</option>
                    <option>2:00 AM</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="quietEnd" className="block text-sm font-medium text-gray-700 mb-1">
                    End Time
                  </label>
                  <select
                    id="quietEnd"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    disabled
                  >
                    <option>6:00 AM</option>
                    <option>7:00 AM</option>
                    <option>8:00 AM</option>
                    <option>9:00 AM</option>
                    <option>10:00 AM</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="mt-6 space-y-4">
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="weekendQuiet"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="weekendQuiet" className="font-medium text-gray-700">Quiet weekends</label>
                  <p className="text-gray-500">Only receive critical notifications on weekends</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="digestMode"
                    type="checkbox"
                    className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="digestMode" className="font-medium text-gray-700">Daily digest mode</label>
                  <p className="text-gray-500">Receive a single daily summary instead of individual notifications</p>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Save button */}
        <div className="flex justify-end">
          <button
            type="button"
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Notification Settings
          </button>
        </div>
      </div>
    </div>
  );
}
