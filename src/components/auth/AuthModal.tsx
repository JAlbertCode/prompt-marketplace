'use client';

import { useState } from 'react';
import { signIn } from 'next-auth/react';
import Link from 'next/link';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AuthModal({ isOpen, onClose }: AuthModalProps) {
  const [view, setView] = useState<'login' | 'register'>('login');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black opacity-50" 
        onClick={onClose}
      ></div>
      
      {/* Modal */}
      <div className="relative z-10 w-full max-w-md bg-white rounded-lg shadow-xl p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">
            {view === 'login' ? 'Sign in to continue' : 'Create an account'}
          </h2>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="mb-4">
          <p className="text-gray-600 mb-4">
            {view === 'login' 
              ? 'Sign in to run prompts and save your favorites' 
              : 'Create an account to run prompts and save your favorites'}
          </p>
          
          {/* OAuth Providers */}
          <div className="space-y-3 mb-4">
            <button
              onClick={() => signIn('google', { callbackUrl: window.location.href })}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5" viewBox="0 0 24 24">
                <g transform="matrix(1, 0, 0, 1, 27.009001, -39.238998)">
                  <path fill="#4285F4" d="M -3.264 51.509 C -3.264 50.719 -3.334 49.969 -3.454 49.239 L -14.754 49.239 L -14.754 53.749 L -8.284 53.749 C -8.574 55.229 -9.424 56.479 -10.684 57.329 L -10.684 60.329 L -6.824 60.329 C -4.564 58.239 -3.264 55.159 -3.264 51.509 Z"/>
                  <path fill="#34A853" d="M -14.754 63.239 C -11.514 63.239 -8.804 62.159 -6.824 60.329 L -10.684 57.329 C -11.764 58.049 -13.134 58.489 -14.754 58.489 C -17.884 58.489 -20.534 56.379 -21.484 53.529 L -25.464 53.529 L -25.464 56.619 C -23.494 60.539 -19.444 63.239 -14.754 63.239 Z"/>
                  <path fill="#FBBC05" d="M -21.484 53.529 C -21.734 52.809 -21.864 52.039 -21.864 51.239 C -21.864 50.439 -21.724 49.669 -21.484 48.949 L -21.484 45.859 L -25.464 45.859 C -26.284 47.479 -26.754 49.299 -26.754 51.239 C -26.754 53.179 -26.284 54.999 -25.464 56.619 L -21.484 53.529 Z"/>
                  <path fill="#EA4335" d="M -14.754 43.989 C -12.984 43.989 -11.404 44.599 -10.154 45.789 L -6.734 42.369 C -8.804 40.429 -11.514 39.239 -14.754 39.239 C -19.444 39.239 -23.494 41.939 -25.464 45.859 L -21.484 48.949 C -20.534 46.099 -17.884 43.989 -14.754 43.989 Z"/>
                </g>
              </svg>
              <span>Continue with Google</span>
            </button>
            
            <button
              onClick={() => signIn('github', { callbackUrl: window.location.href })}
              className="w-full flex items-center justify-center space-x-2 py-2 px-4 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50"
            >
              <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.163 6.839 9.489.5.092.682-.217.682-.482 0-.237-.008-.866-.013-1.7-2.782.603-3.369-1.342-3.369-1.342-.454-1.155-1.11-1.462-1.11-1.462-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.087 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.202 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.308.678.915.678 1.846 0 1.332-.012 2.407-.012 2.734 0 .267.18.577.688.48C19.138 20.16 22 16.42 22 12c0-5.523-4.477-10-10-10z"/>
              </svg>
              <span>Continue with GitHub</span>
            </button>
          </div>
          
          {/* Login/Register Toggle */}
          <div className="text-center text-sm">
            {view === 'login' ? (
              <p>
                Don't have an account?{' '}
                <button
                  onClick={() => setView('register')}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign up
                </button>
              </p>
            ) : (
              <p>
                Already have an account?{' '}
                <button
                  onClick={() => setView('login')}
                  className="text-indigo-600 hover:text-indigo-500 font-medium"
                >
                  Sign in
                </button>
              </p>
            )}
          </div>
        </div>
        
        {/* Full Page Links */}
        <div className="flex justify-center mt-4 pt-4 border-t border-gray-200">
          <Link 
            href={view === 'login' ? '/login' : '/register'}
            className="text-indigo-600 hover:text-indigo-500 text-sm font-medium"
            onClick={onClose}
          >
            {view === 'login' 
              ? 'Go to full sign in page' 
              : 'Go to full registration page'}
          </Link>
        </div>
      </div>
    </div>
  );
}