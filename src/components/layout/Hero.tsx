'use client';

import { useRouter } from 'next/navigation';
import { LuSearch, LuZap, LuPlus, LuArrowRight } from 'react-icons/lu';

export default function Hero() {
  const router = useRouter();
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-xl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          PromptFlow Marketplace
        </h1>
        
        <p className="text-xl sm:text-2xl mb-8 text-blue-100">
          Discover, run, and publish AI prompts with the Perplexity Sonar API. 
          Monetize your prompts or automate workflows with just a few clicks.
        </p>
        
        <div className="grid gap-6 sm:grid-cols-2 md:grid-cols-3 mb-10">
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-500 rounded-full mr-3">
                <LuSearch className="text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Browse Prompts</h3>
            </div>
            <p className="text-blue-100">
              Discover expertly crafted prompts for text generation, code, image creation, and more.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-500 rounded-full mr-3">
                <LuZap className="text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Run Instantly</h3>
            </div>
            <p className="text-blue-100">
              Execute prompts with your own inputs and see results immediately. Pay only for what you use.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-500 rounded-full mr-3">
                <LuPlus className="text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Create & Publish</h3>
            </div>
            <p className="text-blue-100">
              Share your expertise by creating prompts. Set your own fees and earn when others use them.
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-4 justify-center sm:justify-start">
          <button 
            onClick={() => router.push('/')}
            className="px-8 py-3 bg-white text-blue-700 font-medium rounded-lg hover:bg-blue-50 flex items-center transition-colors"
          >
            Browse Prompts
            <LuArrowRight className="ml-2" />
          </button>
          
          <button 
            onClick={() => router.push('/submit')}
            className="px-8 py-3 bg-blue-800 text-white font-medium rounded-lg hover:bg-blue-900 border border-blue-400/30 flex items-center transition-colors"
          >
            Create Your Own
            <LuPlus className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
