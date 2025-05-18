"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const registered = searchParams.get("registered");
  const verified = searchParams.get("verified");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Show success toast if user just registered or verified email
  useEffect(() => {
    if (registered) {
      toast.success("Account created! Please log in.");
    }
    
    if (verified) {
      toast.success("Email verified successfully! You can now log in.");
      
      // Set the auth_verified flag to help with the login process
      localStorage.setItem("auth_verified", "true");
    }
  }, [registered, verified]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      setIsLoading(true);
      setError("");

      try {
        // Force cleanup localStorage to prevent issues
        if (localStorage.getItem("auth_verified") && !verified) {
          localStorage.removeItem("auth_verified");
        }
        
        // Use our Supabase login endpoint
        const response = await fetch("/api/auth/supabase/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          if (data.needsEmailConfirmation) {
            if (data.rateLimited) {
              toast.error("Please check your email for the confirmation link that was recently sent.");
            } else {
              toast.success("Confirmation email sent! Please check your inbox.");
            }
            setError(data.error || "Please verify your email before logging in.");
            
            // If the user is verified but still getting this error, try to force confirm
            if (verified || localStorage.getItem("auth_verified")) {
              try {
                const confirmResponse = await fetch("/api/auth/supabase/confirm-email", {
                  method: "POST",
                  headers: {
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({ email }),
                });
                
                const confirmData = await confirmResponse.json();
                
                if (confirmResponse.ok && confirmData.success) {
                  toast.success("Email confirmed! Please try logging in again.");
                  // Don't auto-retry the login to avoid infinite loops
                }
              } catch (confirmError) {
                console.error("Error confirming email:", confirmError);
              }
            }
          } else {
            setError(data.error || "Invalid login credentials");
          }
          
          console.error("Login error:", data.error);
        } else {
          // Store session info for the app to use
          localStorage.setItem("supabase_user", JSON.stringify(data.user));
          localStorage.setItem("supabase_session", JSON.stringify(data.session));
          
          // Clean up auth_verified flag as it's no longer needed
          localStorage.removeItem("auth_verified");
          
          toast.success("Welcome back!");
          
          // Ensure application knows about the logged in state
          // Set cookie for redundancy
          document.cookie = `supabase_auth=true; path=/; max-age=86400; SameSite=Lax`;
          document.cookie = `isAuthenticated=true; path=/; max-age=86400; SameSite=Lax`;
          
          // Check if there's a returnUrl in the query parameters
          const urlParams = new URLSearchParams(window.location.search);
          const returnUrl = urlParams.get('returnUrl');
          
          // Force full page reload to ensure all components pick up the authentication state
          if (returnUrl) {
            window.location.href = decodeURIComponent(returnUrl);
          } else {
            window.location.href = "/home";
          }
        }
      } catch (error) {
        console.error("Login error:", error);
        setError("An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    },
    [email, password, router]
  );

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Sign in to PromptFlow
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Or{" "}
            <Link
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              create a new account
            </Link>
          </p>
        </div>

        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="flex">
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">{error}</h3>
              </div>
            </div>
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="-space-y-px rounded-md shadow-sm">
            <div>
              <label htmlFor="email-address" className="sr-only">
                Email address
              </label>
              <input
                id="email-address"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="relative block w-full rounded-t-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Email address"
              />
            </div>
            <div>
              <label htmlFor="password" className="sr-only">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="relative block w-full rounded-b-md border-0 py-1.5 text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                placeholder="Password"
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-sm">
              <Link
                href="/reset-password"
                className="font-medium text-indigo-600 hover:text-indigo-500"
              >
                Forgot your password?
              </Link>
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:bg-indigo-400"
            >
              {isLoading ? "Signing in..." : "Sign in"}
            </button>
          </div>
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-gray-50 px-2 text-gray-500">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              onClick={() => toast.error("GitHub login is currently being updated to work with Supabase")}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg
                className="h-5 w-5 mr-2"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 0C4.477 0 0 4.484 0 10.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0110 4.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.203 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.942.359.31.678.921.678 1.856 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0020 10.017C20 4.484 15.522 0 10 0z"
                  clipRule="evenodd"
                />
              </svg>
              GitHub
            </button>

            <button
              onClick={() => toast.error("Google login is currently being updated to work with Supabase")}
              className="flex w-full items-center justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50"
            >
              <svg
                className="h-5 w-5 mr-2"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6 12C6 8.68629 8.68629 6 12 6C13.6569 6 15.1569 6.67157 16.2426 7.75736L19.0711 4.92893C17.1823 3.04019 14.6863 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22C17.5228 22 22 17.5228 22 12V10H12V14H17.6569C16.7562 17.3923 14.1423 20 11 20C7.13401 20 4 16.866 4 13C4 9.13401 7.13401 6 11 6C13.4633 6 15.6111 7.28973 16.8274 9.17398L19.1 6.9C17.3 4.2 14.4 2.5 11 2.5C6.30558 2.5 2.5 6.30558 2.5 11C2.5 15.6944 6.30558 19.5 11 19.5C15.6944 19.5 19.5 15.6944 19.5 11C19.5 10.3256 19.4251 9.66934 19.2839 9.04143L19.0711 7.92893L22 5L12 15L16.2426 10.7574C15.1569 9.67157 13.6569 9 12 9C10.3431 9 8.84315 9.67157 7.75736 10.7574C6.67157 11.8431 6 13.3431 6 15C6 16.6569 6.67157 18.1569 7.75736 19.2426C8.84315 20.3284 10.3431 21 12 21C13.6569 21 15.1569 20.3284 16.2426 19.2426C17.3284 18.1569 18 16.6569 18 15H14"
                  fill="currentColor"
                />
              </svg>
              Google
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}