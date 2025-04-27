'use client';

import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-50 border-t border-gray-200 py-6">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-center text-sm text-gray-500">
          <p>Sonar Prompt Marketplace - Powered by Perplexity Sonar API</p>
          <p className="mt-1">
            <a 
              href="https://docs.perplexity.ai/api-reference/chat-completions" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-blue-600 hover:text-blue-800 hover:underline"
            >
              API Documentation
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
