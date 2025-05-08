'use client';

import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { useRouter } from 'next/navigation';

export default function WaitlistPage() {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const router = useRouter();
  
  // Check if already authenticated
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const isAuth = localStorage.getItem('isAuthenticated') === 'true';
      if (isAuth) {
        router.push('/');
      }
    }
  }, [router]);

  const handleWaitlistSubmit = async (e: React.FormEvent) => {
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
        body: JSON.stringify({ 
          email, 
          firstName, 
          lastName,
          source: 'website_landing_page' 
        }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        setSubmitted(true);
        toast.success('Thank you! You\'ve been added to our waitlist.');
      } else {
        throw new Error(data.message || 'Failed to join waitlist');
      }
    } catch (error) {
      console.error('Error joining waitlist:', error);
      toast.error('Failed to join waitlist. Please try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error('Please enter the access password');
      return;
    }
    
    // Simple hardcoded password verification
    const correctPassword = 'promptflow'; // Using the value from your .env
    
    if (password === correctPassword) {
      // Set cookies directly
      document.cookie = 'auth=true; path=/; max-age=2592000'; // 30 days
      localStorage.setItem('isAuthenticated', 'true');
      
      toast.success('Access granted!');
      router.push('/');
    } else {
      toast.error('Invalid password');
    }
  };

  return (
    <div className="fixed inset-0 flex flex-col bg-gradient-to-br from-blue-50 to-indigo-100 z-50 overflow-auto">
      <div className="flex-grow flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-4xl w-full">
          <div className="flex flex-col md:flex-row">
            {/* Image/Branding Side */}
            <div className="bg-gradient-to-br from-blue-600 to-indigo-700 md:w-1/2 p-8 text-white flex flex-col justify-center">
              <div className="mb-6">
                <h1 className="text-3xl md:text-4xl font-bold mb-2">AI Marketplace</h1>
                <p className="text-blue-100">Something exciting is coming soon</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Exclusive early access</h3>
                    <p className="text-sm text-blue-100">Be among the first to try it</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Limited spots available</h3>
                    <p className="text-sm text-blue-100">Join now before it fills up</p>
                  </div>
                </div>
                
                <div className="flex items-start">
                  <div className="bg-blue-500 p-2 rounded-full mr-3">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="font-semibold">Special launch benefits</h3>
                    <p className="text-sm text-blue-100">Waitlist members get bonus features</p>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Waitlist Form Side */}
            <div className="p-8 md:w-1/2">
              <div className="max-w-md mx-auto">
                <h2 className="text-2xl font-bold mb-2 text-gray-800">Join the Waitlist</h2>
                <p className="text-gray-600 mb-6">Be first in line for this exciting new AI platform. Reserved for early adopters only.</p>
                
                {submitted ? (
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                    <svg className="w-12 h-12 text-green-500 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold text-gray-800">Thank You!</h3>
                    <p className="text-gray-600">You're on the list! We'll notify you when we launch.</p>
                  </div>
                ) : (
                  <form onSubmit={handleWaitlistSubmit} className="space-y-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                      <div className="flex-1">
                        <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                        <input
                          id="firstName"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="John"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                        />
                      </div>
                      <div className="flex-1">
                        <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                        <input
                          id="lastName"
                          type="text"
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                          placeholder="Doe"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                        />
                      </div>
                    </div>
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
                      We'll only use your email to send updates about our platform launch.
                      <br />
                      No spam, we promise.
                    </p>
                    
                    <div className="mt-4 pt-4 border-t border-gray-200">
                      <p className="text-sm text-gray-700 text-center mb-2">
                        Already have access?
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowPasswordForm(true)}
                        className="w-full py-2 px-4 border border-blue-600 rounded-lg text-blue-600 font-medium hover:bg-blue-50 focus:ring-4 focus:ring-blue-100"
                      >
                        Enter Access Password
                      </button>
                    </div>
                  </form>
                )}
                
                {/* Password Form */}
                {showPasswordForm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden max-w-md w-full">
                      <div className="bg-gradient-to-br from-blue-600 to-indigo-700 p-6 text-white flex flex-col justify-center">
                        <h3 className="text-xl font-bold mb-1">Enter Access Password</h3>
                        <p className="text-blue-100 text-sm">Get instant access</p>
                      </div>
                      
                      <form onSubmit={handlePasswordSubmit}>
                        <div className="p-6">
                          <div className="mb-4">
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                            <div className="text-xs text-gray-500 mb-2">Enter the access password you received</div>
                            <input
                              id="password"
                              type="password"
                              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-blue-500 focus:border-blue-500"
                              placeholder="Enter access password"
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              required
                            />
                          </div>
                        </div>
                        
                        <div className="flex justify-between p-4 bg-gray-50 border-t border-gray-100">
                          <button
                            type="button"
                            onClick={() => setShowPasswordForm(false)}
                            className="py-2 px-4 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50"
                          >
                            Cancel
                          </button>
                          
                          <button
                            type="submit"
                            className="py-2 px-4 bg-blue-600 hover:bg-blue-700 rounded-lg text-white font-medium focus:ring-4 focus:ring-blue-300"
                          >
                            Access Site
                          </button>
                        </div>
                      </form>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <footer className="bg-white py-4">
        <div className="container mx-auto px-4 text-center text-gray-500 text-sm">
          &copy; {new Date().getFullYear()} AI Platform. All rights reserved.
        </div>
      </footer>
    </div>
  );
}