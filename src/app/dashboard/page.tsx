"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { usePromptStore } from '@/store/usePromptStore';
import { useFlowStore } from '@/store/useFlowStore'; 
import { useFavoriteStore } from '@/store/useFavoriteStore';
import PageHeader from '@/components/layout/system/PageHeader';
import ContentCard from '@/components/layout/system/ContentCard';

export default function DashboardPage({ searchParams }: { searchParams?: { tab?: string } }) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { prompts } = usePromptStore();
  const { flows } = useFlowStore();
  const { favorites } = useFavoriteStore();
  
  const [activeTab, setActiveTab] = useState(searchParams?.tab || "myPrompts");
  const [isLoading, setIsLoading] = useState(true);

  // Get user's prompts and flows (simplified for development - we'll use local store data)
  const myPrompts = prompts.filter(prompt => prompt.creatorId === session?.user?.id);
  const myFlows = flows.filter(flow => flow.creatorId === session?.user?.id);
  
  // Get favorite prompts and flows
  const favoritePrompts = prompts.filter(prompt => favorites.includes(prompt.id));
  const favoriteFlows = flows.filter(flow => favorites.includes(flow.id));

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }
    
    setIsLoading(false);
  }, [status, router]);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">Loading your content...</p>
        </div>
      );
    }

    if (activeTab === "myPrompts") {
      return renderPromptsList(myPrompts, true);
    } else if (activeTab === "myFlows") {
      return renderFlowsList(myFlows, true);
    } else if (activeTab === "favoritePrompts") {
      return renderPromptsList(favoritePrompts, false);
    } else if (activeTab === "favoriteFlows") {
      return renderFlowsList(favoriteFlows, false);
    }
  };

  const renderPromptsList = (prompts, isOwner) => {
    if (prompts.length === 0) {
      return (
        <ContentCard>
          <div className="p-8 text-center">
            <p className="text-gray-500">No prompts found.</p>
            {isOwner && (
              <Link
              href="/create?tab=prompt"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
              Create Your First Prompt
              </Link>
            )}
          </div>
        </ContentCard>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <ContentCard key={prompt.id}>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {prompt.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Model: {prompt.model}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Created: {new Date(prompt.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4 flex space-x-3">
              <Link
                href={`/prompt/${prompt.id}`}
                className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                View
              </Link>
              {isOwner && (
                <>
                  <Link
                    href={`/create?tab=prompt&edit=${prompt.id}`}
                    className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  {!prompt.isPublished ? (
                    <button
                      className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100"
                      onClick={() => {
                        // Implement publish functionality
                        toast.success("Published successfully!");
                      }}
                    >
                      Publish
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                      Published
                    </span>
                  )}
                </>
              )}
            </div>
          </ContentCard>
        ))}
      </div>
    );
  };

  const renderFlowsList = (flows, isOwner) => {
    if (flows.length === 0) {
      return (
        <ContentCard>
          <div className="p-8 text-center">
            <p className="text-gray-500">No flows found.</p>
            {isOwner && (
              <Link
              href="/create?tab=flow"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
              >
              Create Your First Flow
              </Link>
            )}
          </div>
        </ContentCard>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flows.map((flow) => (
          <ContentCard key={flow.id}>
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {flow.title}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              {flow.unlockPrice === null || flow.unlockPrice === 0
                ? "Free to use"
                : `Unlock fee: ${flow.unlockPrice} credits`}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Created: {new Date(flow.createdAt).toLocaleDateString()}
            </p>
            <div className="mt-4 flex space-x-3">
              <Link
                href={`/flow/${flow.id}`}
                className="rounded-md bg-indigo-50 px-3 py-2 text-sm font-medium text-indigo-600 hover:bg-indigo-100"
              >
                View
              </Link>
              {isOwner && (
                <>
                  <Link
                    href={`/create?tab=flow&edit=${flow.id}`}
                    className="rounded-md bg-gray-50 px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
                  >
                    Edit
                  </Link>
                  {!flow.isPublished ? (
                    <button
                      className="rounded-md bg-green-50 px-3 py-2 text-sm font-medium text-green-600 hover:bg-green-100"
                      onClick={() => {
                        // Implement publish functionality
                        toast.success("Published successfully!");
                      }}
                    >
                      Publish
                    </button>
                  ) : (
                    <span className="inline-flex items-center rounded-md bg-green-100 px-3 py-2 text-sm font-medium text-green-800">
                      Published
                    </span>
                  )}
                </>
              )}
            </div>
          </ContentCard>
        ))}
      </div>
    );
  };

  // Create tabs for the page header
  const tabs = [
    { href: '?tab=myPrompts', label: 'My Prompts' },
    { href: '?tab=myFlows', label: 'My Flows' },
    { href: '?tab=favoritePrompts', label: 'Favorite Prompts' },
    { href: '?tab=favoriteFlows', label: 'Favorite Flows' },
  ];

  return (
    <div>
      <PageHeader 
        title="My Dashboard"
        description={session?.user ? `Welcome back, ${session.user.name}` : undefined}
        tabs={tabs.map(tab => ({
          ...tab,
          href: `/dashboard${tab.href}`,
        }))}
      />

      <div>{renderContent()}</div>
    </div>
  );
}