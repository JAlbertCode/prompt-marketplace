'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import FeedbackButton from './FeedbackButton';

const popularFeatures = [
  {
    id: 1,
    title: 'Prompt Versioning',
    description: 'Keep track of changes to prompts and enable rollbacks',
    votes: 42
  },
  {
    id: 2,
    title: 'Collaborative Editing',
    description: 'Allow multiple users to work on the same prompt or flow',
    votes: 36
  },
  {
    id: 3,
    title: 'Advanced Analytics',
    description: 'Track performance metrics for your prompts and flows',
    votes: 29
  }
];

const knownIssues = [
  {
    id: 101,
    title: 'Inconsistent model selection in PromptBuilder',
    status: 'investigating',
    reportCount: 5
  },
  {
    id: 102,
    title: '"Flow not found" error on some dashboards',
    status: 'in progress',
    reportCount: 8
  },
  {
    id: 103,
    title: 'Image generation fails with certain prompts',
    status: 'fixed (pending release)',
    reportCount: 3
  }
];

interface VoteBadgeProps {
  count: number;
}

const VoteBadge: React.FC<VoteBadgeProps> = ({ count }) => (
  <div className="flex items-center bg-indigo-50 text-indigo-700 px-2 py-1 rounded text-xs font-medium">
    <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
      <path d="M2 10.5a1.5 1.5 0 113 0v6a1.5 1.5 0 01-3 0v-6zM6 10.333v5.43a2 2 0 001.106 1.79l.05.025A4 4 0 008.943 18h5.416a2 2 0 001.962-1.608l1.2-6A2 2 0 0015.56 8H12V4a2 2 0 00-2-2 1 1 0 00-1 1v.667a4 4 0 01-.8 2.4L6.8 7.933a4 4 0 00-.8 2.4z" />
    </svg>
    {count}
  </div>
);

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let bgColor = 'bg-gray-100 text-gray-800';
  
  if (status === 'investigating') {
    bgColor = 'bg-yellow-100 text-yellow-800';
  } else if (status === 'in progress') {
    bgColor = 'bg-blue-100 text-blue-800';
  } else if (status.includes('fixed')) {
    bgColor = 'bg-green-100 text-green-800';
  }
  
  return (
    <span className={`px-2 py-1 rounded text-xs font-medium ${bgColor}`}>
      {status}
    </span>
  );
};

const FeedbackSection: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'features' | 'issues'>('features');
  
  return (
    <div className="bg-white shadow-sm rounded-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-lg font-semibold text-gray-900">Community Feedback</h2>
        
        <div className="flex space-x-3">
          <FeedbackButton type="feature" />
          <FeedbackButton type="bug" />
        </div>
      </div>
      
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('features')}
            className={`${
              activeTab === 'features'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Popular Feature Requests
          </button>
          
          <button
            onClick={() => setActiveTab('issues')}
            className={`${
              activeTab === 'issues'
                ? 'border-indigo-500 text-indigo-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
            } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm`}
          >
            Known Issues
          </button>
        </nav>
      </div>
      
      {activeTab === 'features' ? (
        <div className="space-y-4">
          {popularFeatures.map(feature => (
            <div key={feature.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{feature.title}</h3>
                <p className="text-xs text-gray-500 mt-1">{feature.description}</p>
              </div>
              
              <div className="flex items-center space-x-3">
                <VoteBadge count={feature.votes} />
                
                <Link 
                  href={`https://github.com/your-username/prompt-marketplace/issues/${feature.id}`}
                  target="_blank"
                  className="text-xs text-indigo-600 hover:text-indigo-800"
                >
                  View
                </Link>
              </div>
            </div>
          ))}
          
          <div className="text-center mt-4">
            <Link 
              href="https://github.com/your-username/prompt-marketplace/issues?q=is%3Aissue+is%3Aopen+sort%3Areactions-%2B1-desc+label%3Aenhancement"
              target="_blank"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all feature requests →
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {knownIssues.map(issue => (
            <div key={issue.id} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
              <div>
                <h3 className="text-sm font-medium text-gray-900">{issue.title}</h3>
                <div className="flex items-center mt-1 space-x-3">
                  <StatusBadge status={issue.status} />
                  <span className="text-xs text-gray-500">
                    {issue.reportCount} reports
                  </span>
                </div>
              </div>
              
              <Link 
                href={`https://github.com/your-username/prompt-marketplace/issues/${issue.id}`}
                target="_blank"
                className="text-xs text-indigo-600 hover:text-indigo-800"
              >
                View Details
              </Link>
            </div>
          ))}
          
          <div className="text-center mt-4">
            <Link 
              href="https://github.com/your-username/prompt-marketplace/issues?q=is%3Aissue+is%3Aopen+label%3Abug"
              target="_blank"
              className="text-sm text-indigo-600 hover:text-indigo-800"
            >
              View all known issues →
            </Link>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center p-4 border border-gray-200 rounded-md bg-gray-50">
        <p className="text-sm text-gray-600">
          Your feedback helps us improve PromptFlow! Vote on existing issues or submit new ones to help us prioritize development.
        </p>
      </div>
    </div>
  );
};

export default FeedbackSection;
