// Client-side flow utilities
import { Flow } from "@/types/flow";

/**
 * Get user flows from the API
 */
export async function getFlows(filters: any = {}, sort = 'newest'): Promise<Flow[]> {
  try {
    // Get the user ID from the session if available
    const userId = await getUserId();
    
    if (!userId) {
      console.error("Cannot fetch flows - no user ID available");
      return [];
    }
    
    console.log("Getting flows for user ID:", userId);
    
    // Fetch flows from our API endpoint (which uses Supabase)
    const response = await fetch("/api/auth/flow-auth", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        action: "getUserFlows",
        payload: {
          userId
        }
      }),
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    let flows = await response.json();
    
    // Apply client-side filtering if needed
    if (filters.type && filters.type !== 'all') {
      if (filters.type === 'favorite') {
        flows = flows.filter((flow: Flow) => flow.isFavorite);
      } else if (filters.type === 'private') {
        flows = flows.filter((flow: Flow) => flow.isPrivate);
      } else if (filters.type === 'public') {
        flows = flows.filter((flow: Flow) => !flow.isPrivate);
      }
    }
    
    // Apply search
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      flows = flows.filter((flow: Flow) => 
        flow.title.toLowerCase().includes(searchTerm) || 
        flow.description.toLowerCase().includes(searchTerm));
    }
    
    // Apply sort
    if (sort === 'newest') {
      flows.sort((a: Flow, b: Flow) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    } else if (sort === 'oldest') {
      flows.sort((a: Flow, b: Flow) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    } else if (sort === 'name_asc') {
      flows.sort((a: Flow, b: Flow) => a.title.localeCompare(b.title));
    } else if (sort === 'name_desc') {
      flows.sort((a: Flow, b: Flow) => b.title.localeCompare(a.title));
    }
    
    return flows;
  } catch (error) {
    console.error("Error fetching flows:", error);
    return [];
  }
}

/**
 * Toggle favorite status for a flow via API
 */
export async function toggleFavoriteFlow(flowId: string): Promise<{ isFavorite: boolean }> {
  try {
    const response = await fetch(`/api/favorites/flows/${flowId}`, {
      method: "POST",
    });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error("Error toggling favorite:", error);
    throw error;
  }
}

/**
 * Helper function to get user ID from session
 */
async function getUserId(): Promise<string | null> {
  try {
    // Check if we have a supabase_user in localStorage first (fastest)
    if (typeof window !== 'undefined') {
      const userData = localStorage.getItem('supabase_user');
      if (userData) {
        try {
          const user = JSON.parse(userData);
          if (user?.id) {
            console.log('Found user ID in localStorage:', user.id);
            return user.id;
          }
        } catch (e) {
          console.error('Error parsing supabase_user from localStorage:', e);
        }
      }
    }
    
    // Check for supabase auth cookie
    const supabaseAuthCookie = document.cookie
      .split('; ')
      .find(row => row.startsWith('supabase_auth='));
      
    if (supabaseAuthCookie) {
      console.log('Found supabase_auth cookie');
      // Try to get Supabase session directly
      const res = await fetch('/api/auth/supabase/session');
      if (res.ok) {
        const data = await res.json();
        if (data?.session?.user?.id) {
          console.log('Got user ID from Supabase session:', data.session.user.id);
          return data.session.user.id;
        }
      }
    }
    
    // Try Next-Auth
    const session = await fetch("/api/auth/session");
    const sessionData = await session.json();
    
    if (sessionData?.user?.id) {
      console.log('Got user ID from NextAuth session:', sessionData.user.id);
      return sessionData.user.id;
    }
    
    // As a last resort, try getting a test user
    const testUserResponse = await fetch('/api/auth/test-user');
    if (testUserResponse.ok) {
      const testUserData = await testUserResponse.json();
      if (testUserData?.userId) {
        console.log('Using test user ID:', testUserData.userId);
        return testUserData.userId;
      }
    }
    
    console.warn('No user ID found through any authentication method');
    return null;
  } catch (error) {
    console.error("Error getting user ID:", error);
    return null;
  }
}