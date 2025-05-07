'use client';

import React, { useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export default function WaitlistEmailPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [subject, setSubject] = useState('');
  const [template, setTemplate] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [sentStatus, setSentStatus] = useState({ success: false, message: '' });

  // Check if user is authenticated and is an admin
  if (status === 'unauthenticated') {
    router.push('/login');
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!subject || !template) {
      setSentStatus({
        success: false,
        message: 'Subject and template are required',
      });
      return;
    }
    
    setIsSending(true);
    
    try {
      const response = await fetch('/api/admin/waitlist/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          subject,
          template,
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSentStatus({
          success: true,
          message: data.message || 'Emails have been scheduled to send',
        });
        
        // Clear the form
        setSubject('');
        setTemplate('');
      } else {
        setSentStatus({
          success: false,
          message: data.message || 'Failed to send emails',
        });
      }
    } catch (error) {
      console.error('Error sending emails:', error);
      setSentStatus({
        success: false,
        message: 'Error sending emails. Check console for details.',
      });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Send Email to Waitlist</h1>
        <p className="text-gray-600">
          Send an email to all users on the waitlist. Be careful, this will send to everyone!
        </p>
      </div>
      
      {sentStatus.message && (
        <div className={`mb-6 p-4 rounded-lg ${sentStatus.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
          {sentStatus.message}
        </div>
      )}
      
      <div className="bg-white shadow-md rounded-lg p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-1">
              Email Subject
            </label>
            <input
              id="subject"
              type="text"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
              placeholder="Enter email subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          
          <div className="mb-6">
            <label htmlFor="template" className="block text-sm font-medium text-gray-700 mb-1">
              Email Content
            </label>
            <div className="mb-1 text-xs text-gray-500">
              You can use HTML for formatting and the following variables: {{email}}, {{date}}
            </div>
            <textarea
              id="template"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500 h-64"
              placeholder="Enter email content with HTML formatting"
              value={template}
              onChange={(e) => setTemplate(e.target.value)}
              required
            />
          </div>
          
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => router.push('/admin/waitlist')}
              className="mr-2 px-4 py-2 border border-gray-300 rounded-lg text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center"
              disabled={isSending}
            >
              {isSending && (
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
              )}
              {isSending ? 'Sending...' : 'Send to All'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}