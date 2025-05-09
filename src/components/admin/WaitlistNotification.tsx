'use client';

import React, { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

type Notification = {
  id: string;
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  timestamp: string;
};

export default function WaitlistNotification() {
  const { data: session } = useSession();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Only set up the event source if the user is an admin
    if (!session?.user || session.user.role !== 'ADMIN') {
      return;
    }

    let eventSource: EventSource | null = null;

    const setupEventSource = () => {
      // Close any existing connection
      if (eventSource) {
        eventSource.close();
      }

      // Create a new event source
      eventSource = new EventSource('/api/admin/events');

      // Event handlers
      eventSource.onopen = () => {
        console.log('EventSource connected');
        setIsConnected(true);
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        setIsConnected(false);

        // Try to reconnect after a delay
        setTimeout(() => {
          setupEventSource();
        }, 5000);
      };

      // Listen for waitlist events
      eventSource.addEventListener('waitlist', (event) => {
        try {
          const data = JSON.parse(event.data);
          
          // Add the notification to the list
          setNotifications((prev) => [
            {
              id: data.id || crypto.randomUUID(),
              message: data.message,
              type: data.type || 'info',
              timestamp: new Date().toISOString(),
            },
            ...prev,
          ].slice(0, 5)); // Keep only the 5 most recent notifications
        } catch (error) {
          console.error('Error parsing event data:', error);
        }
      });
    };

    // Set up the initial event source
    setupEventSource();

    // Clean up on unmount
    return () => {
      if (eventSource) {
        eventSource.close();
      }
    };
  }, [session]);

  // If no notifications, don't render anything
  if (notifications.length === 0) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 w-80">
      {notifications.map((notification) => (
        <div
          key={notification.id}
          className={`mb-2 p-3 rounded-lg shadow-lg text-white ${
            notification.type === 'success' ? 'bg-green-500' :
            notification.type === 'warning' ? 'bg-yellow-500' :
            notification.type === 'error' ? 'bg-red-500' :
            'bg-blue-500'
          }`}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <p className="font-medium">{notification.message}</p>
              <p className="text-xs opacity-80">
                {new Date(notification.timestamp).toLocaleTimeString()}
              </p>
            </div>
            <button
              onClick={() => setNotifications(prev => prev.filter(n => n.id !== notification.id))}
              className="text-white opacity-70 hover:opacity-100"
            >
              ×
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}