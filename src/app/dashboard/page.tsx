"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import Link from "next/link";

type Prompt = {
  id: string;
  title: string;
  model: string;
  isPublished: boolean;
  createdAt: string;
};

type Flow = {
  id: string;
  title: string;
  unlockFee: number | null;
  isPublished: boolean;
  createdAt: string;
};

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  
  const [myPrompts, setMyPrompts] = useState<Prompt[]>([]);
  const [myFlows, setMyFlows] = useState<Flow[]>([]);
  const [favoritePrompts, setFavoritePrompts] = useState<Prompt[]>([]);
  const [favoriteFlows, setFavoriteFlows] = useState<Flow[]>([]);
  const [activeTab, setActiveTab] = useState("myPrompts");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Redirect if not authenticated
    if (status === "unauthenticated") {
      router.push("/login");
      return;
    }

    // Fetch user's prompts, flows, and favorites
    const fetchUserContent = async () => {
      try {
        setIsLoading(true);
        // We'll implement these API endpoints later
        const [promptsRes, flowsRes, favPromptsRes, favFlowsRes] = await Promise.all([
          fetch("/api/prompts/user"),
          fetch("/api/flows/user"),
          fetch("/api/favorites/prompts"),
          fetch("/api/favorites/flows"),
        ]);

        if (promptsRes.ok) {
          const data = await promptsRes.json();
          setMyPrompts(data);
        }
        
        if (flowsRes.ok) {
          const data = await flowsRes.json();
          setMyFlows(data);
        }
        
        if (favPromptsRes.ok) {
          const data = await favPromptsRes.json();
          setFavoritePrompts(data);
        }
        
        if (favFlowsRes.ok) {
          const data = await favFlowsRes.json();
          setFavoriteFlows(data);
        }
      } catch (error) {
        toast.error("Failed to load your content");
        console.error(error);
      } finally {
        setIsLoading(false);
      }
    };

    if (status === "authenticated") {
      fetchUserContent();
    }
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

  const renderPromptsList = (prompts: Prompt[], isOwner: boolean) => {
    if (prompts.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No prompts found.</p>
          {isOwner && (
            <Link
              href="/create/prompt"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create Your First Prompt
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {prompts.map((prompt) => (
          <div
            key={prompt.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
          >
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">
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
                      href={`/create/prompt?edit=${prompt.id}`}
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
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderFlowsList = (flows: Flow[], isOwner: boolean) => {
    if (flows.length === 0) {
      return (
        <div className="p-8 text-center">
          <p className="text-gray-500">No flows found.</p>
          {isOwner && (
            <Link
              href="/create/flow"
              className="mt-4 inline-block rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white"
            >
              Create Your First Flow
            </Link>
          )}
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {flows.map((flow) => (
          <div
            key={flow.id}
            className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow"
          >
            <div className="p-5">
              <h3 className="text-lg font-medium text-gray-900">
                {flow.title}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {flow.unlockFee === null
                  ? "Free to use"
                  : `Unlock fee: ${flow.unlockFee} credits`}
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
                      href={`/create/flow?edit=${flow.id}`}
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
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">My Dashboard</h1>
        {session?.user && (
          <p className="text-gray-600 mt-2">
            Welcome back, {session.user.name}
          </p>
        )}
      </div>

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("myPrompts")}
              className={`${
                activeTab === "myPrompts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              My Prompts
            </button>
            <button
              onClick={() => setActiveTab("myFlows")}
              className={`${
                activeTab === "myFlows"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              My Flows
            </button>
            <button
              onClick={() => setActiveTab("favoritePrompts")}
              className={`${
                activeTab === "favoritePrompts"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Favorite Prompts
            </button>
            <button
              onClick={() => setActiveTab("favoriteFlows")}
              className={`${
                activeTab === "favoriteFlows"
                  ? "border-indigo-500 text-indigo-600"
                  : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
              } whitespace-nowrap border-b-2 py-4 px-1 text-sm font-medium`}
            >
              Favorite Flows
            </button>
          </nav>
        </div>
      </div>

      <div>{renderContent()}</div>
    </div>
  );
}