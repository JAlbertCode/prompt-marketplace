'use client';

import { useRouter } from 'next/navigation';
import { LuSearch, LuZap, LuPlus, LuArrowRight } from 'react-icons/lu';

export default function Hero() {
  const router = useRouter();
  
  return (
    <div className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-16 px-4 sm:px-6 lg:px-8 rounded-xl">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight mb-4">
          Sonar Prompt Marketplace
        </h1>
        
        <p className="text-xl sm:text-2xl mb-8 text-blue-100">
          Discover, run, and publish AI prompts and flows with the Perplexity Sonar API. 
          Create single prompts or connect them in powerful automation flows.
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
              Execute prompts or complete flows with your inputs and see results immediately, including image generation.
            </p>
          </div>
          
          <div className="bg-white/10 backdrop-blur-sm p-5 rounded-lg">
            <div className="flex items-center mb-3">
              <div className="p-2 bg-blue-500 rounded-full mr-3">
                <LuPlus className="text-xl" />
              </div>
              <h3 className="font-semibold text-lg">Create & Connect</h3>
            </div>
            <p className="text-blue-100">
              Build individual prompts or connect multiple prompts into powerful automation flows for complex tasks.
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
            Create Prompt
            <LuPlus className="ml-2" />
          </button>
        </div>
      </div>
    </div>
  );
}
