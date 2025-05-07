'use client';

import React, { useState } from 'react';
import { toast } from 'react-hot-toast';
import Image from 'next/image';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
      toast.error('Please enter a valid email address');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // API call to save email to waitlist
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Thank you! You\'ve been added to our waitlist.');
      } else {
        const data = await response.json();
        throw new Error(data.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
          <div className="flex flex-col md:flex-row">
            {/* Image/Branding Side */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 md:w-1/2 p-8 text-white flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">PromptFlow</h1>
                <p className="text-blue-100">AI Prompt Marketplace & Automation Platform</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Run prompts with real models</h3>
                    <p className="text-sm text-blue-100">Access to OpenAI, Sonar, and more</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Chain prompts with Flow</h3>
                    <p className="text-sm text-blue-100">Create complex automations easily</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Monetize your prompts</h3>
                    <p className="text-sm text-blue-100">Earn from your best AI workflows</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Waitlist Form Side */}
            <div className="p-8 md:w-1/2">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Join the Waitlist</h2>
                <p className="text-gray-600 mb-6">Be the first to know when PromptFlow launches. Early access for waitlist members.</p>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Thank You!</h3>
                    <p className="text-gray-600">You're on the list! We'll notify you when PromptFlow launches.</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                      <input
                        id="email"
                        type="email"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                    
                    <button
                      type="submit"
                      className={`w-full py-2 px-4 rounded-lg text-white font-medium
                        ${isSubmitting 
                          ? 'bg-blue-400 cursor-not-allowed'
                          : 'bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300'
                        }`}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? 'Joining...' : 'Join Waitlist'}
                    </button>
                    
                    <p className="text-xs text-gray-500 text-center mt-4">
                      We'll only use your email to send updates about PromptFlow.
                      <br />
                      No spam, we promise.
                    </p>
                  </form>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} PromptFlow. All rights reserved.
        </div>
      </footer>
    </div>
  );
}
