"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { supabase } from "@/lib/supabase";

export default function SignOutPage() {
  const router = useRouter();
  const [status, setStatus] = useState("Signing out...");
  const [error, setError] = useState("");

  useEffect(() => {
    const performSignOut = async () => {
      try {
        setStatus("Clearing browser storage...");
        // Clear all storage and cookies manually first
        localStorage.removeItem('supabase_user');
        localStorage.removeItem('supabase_session');
        localStorage.removeItem('isAuthenticated');
        sessionStorage.clear();
        
        // Clear cookies
        document.cookie.split(";").forEach(function(c) {
          document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
        });
        
        setStatus("Signing out from Supabase (browser)...");
        // Call Supabase sign out directly in the browser
        const { error: supabaseClientError } = await supabase.auth.signOut();
        if (supabaseClientError) {
          console.error("Supabase client signout error:", supabaseClientError);
          setError("Supabase client error: " + supabaseClientError.message);
        }
        
        // Get the token from local storage
        const sessionStr = localStorage.getItem('supabase_session');
        let token = '';
        if (sessionStr) {
          try {
            const sessionData = JSON.parse(sessionStr);
            token = sessionData.token || '';
          } catch (e) {
            console.error('Error parsing session data:', e);
          }
        }
        
        setStatus("Calling Supabase logout API...");
        // Also call our server endpoint for extra certainty
        const supabaseResponse = await fetch('/api/auth/supabase/logout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'Authorization': `Bearer ${token}` } : {})
          },
        });

        if (!supabaseResponse.ok) {
          const errorData = await supabaseResponse.json();
          console.error("Supabase API signout error:", errorData);
          setError("Supabase API error: " + (errorData.error || "Unknown error"));
        }
        
        setStatus("Signing out from NextAuth...");
        // Try to sign out from NextAuth
        try {
          await signOut({ redirect: false });
        } catch (nextAuthError) {
          console.error("NextAuth signout error", nextAuthError);
          setError("NextAuth error: " + (nextAuthError.message || "Unknown error"));
          // Continue even if NextAuth fails
        }

        setStatus("Verifying logout status...");
        // Check if we're still logged in with Supabase
        const { data: session } = await supabase.auth.getSession();
        if (session && session.session) {
          console.error("Still logged in after signout!", session);
          setError("Failed to sign out completely. Session still active.");
        } else {
          setStatus("Successfully signed out!");
          toast.success("Signed out successfully");
        }
        
        // Redirect to waitlist/home page after a short delay
        setTimeout(() => {
          // Use window.location for a full page reload
          window.location.href = "/waitlist";
        }, 1000);
      } catch (error) {
        console.error("Error in sign out process:", error);
        setStatus("Error signing out");
        setError(error.message || "Unknown error");
        
        // Still try to redirect after a delay
        setTimeout(() => {
          window.location.href = "/waitlist";
        }, 3000);
      }
    };

    performSignOut();
  }, []);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="bg-white p-8 rounded-xl shadow-md max-w-md w-full text-center">
        <div className="mb-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto"></div>
        </div>
        <h1 className="text-2xl font-bold mb-2">{status}</h1>
        {error && (
          <p className="text-red-600 mb-2">{error}</p>
        )}
        <p className="text-gray-600">Please wait while we complete the sign-out process.</p>
      </div>
    </div>
  );
}
