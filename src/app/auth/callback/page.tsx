"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { supabase, createServiceRoleClient } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Link from "next/link";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [verificationStatus, setVerificationStatus] = useState<string>("Verifying your email...");
  const [debugInfo, setDebugInfo] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationSuccess, setVerificationSuccess] = useState(false);

  useEffect(() => {
    const handleEmailConfirmation = async () => {
      setIsLoading(true);
      try {
        // Get URL parameters
        const allParams: Record<string, string> = {};
        searchParams.forEach((value, key) => {
          allParams[key] = value;
        });
        
        // Log all parameters for debugging
        console.log("Auth callback params:", allParams);
        setDebugInfo(allParams);
        
        // We need these specific parameters
        const accessToken = searchParams.get("access_token");
        const refreshToken = searchParams.get("refresh_token");
        const type = searchParams.get("type");
        const email = searchParams.get("email");
        
        // Special handling for different confirmation types
        if (type === "signup" || type === "recovery") {
          // If we have tokens, try to set the session
          if (accessToken && refreshToken) {
            try {
              // Process the tokens
              const { data, error } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken,
              });
              
              if (error) {
                console.error("Error setting session:", error);
                setError("There was a problem setting your session. Please try signing in manually.");
                setIsLoading(false);
                return;
              }

              // Check if session was created
              const { data: { session } } = await supabase.auth.getSession();
              
              if (session) {
                // Force confirm email using admin client if needed
                if (type === "signup" && email) {
                  try {
                    // Create admin client and confirm user's email
                    const adminClient = createServiceRoleClient();
                    const { error: adminError } = await adminClient.auth.admin.updateUserById(
                      session.user.id,
                      { email_confirm: true }
                    );
                    
                    if (adminError) {
                      console.error("Error confirming email with admin client:", adminError);
                    }
                  } catch (adminError) {
                    console.error("Exception in admin confirmation:", adminError);
                  }
                }
                
                // Update status and set verification as successful
                setVerificationStatus("Your email has been verified! Redirecting to login...");
                toast.success("Email verified successfully!");
                setVerificationSuccess(true);
                
                // Set cookies and localStorage for immediate authentication
                document.cookie = `supabase_auth=true; path=/; max-age=86400; SameSite=Lax`;
                localStorage.setItem("auth_verified", "true");
                
                // Redirect to login page with success parameter
                setTimeout(() => {
                  router.push("/login?verified=true");
                }, 2000);
              } else {
                setVerificationStatus("Email verification was processed, but we couldn't sign you in automatically. Please log in manually.");
                setIsLoading(false);
              }
            } catch (sessionError) {
              console.error("Error in session handling:", sessionError);
              setError("An error occurred while processing your verification. Please try signing in manually.");
              setIsLoading(false);
            }
          } else if (type === "signup" && email) {
            // No tokens but we have email - try to mark as confirmed using admin client
            try {
              // First try to find the user by email
              const adminClient = createServiceRoleClient();
              const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
              
              if (userError) {
                console.error("Error listing users:", userError);
                setError("Unable to verify your email. Please contact support.");
                setIsLoading(false);
                return;
              }
              
              // Find the user with matching email
              const user = userData?.users?.find(u => u.email === email);
              
              if (user) {
                // Update user to confirm email
                const { error: updateError } = await adminClient.auth.admin.updateUserById(
                  user.id,
                  { email_confirm: true }
                );
                
                if (updateError) {
                  console.error("Error confirming email:", updateError);
                  setError("Unable to confirm your email. Please try signing in or contact support.");
                } else {
                  setVerificationStatus("Your email has been confirmed! Please sign in to continue.");
                  setVerificationSuccess(true);
                  setTimeout(() => {
                    router.push("/login?verified=true");
                  }, 2000);
                }
              } else {
                setError(`User with email ${email} not found. Please check your email address or contact support.`);
              }
            } catch (adminError) {
              console.error("Error in admin email confirmation:", adminError);
              setError("An error occurred during verification. Please try signing in or contact support.");
            }
            setIsLoading(false);
          } else {
            // No tokens and no email
            setError("Invalid verification link. Missing required parameters.");
            setIsLoading(false);
          }
        } else if (type === "magiclink") {
          // Handle magic link login
          setVerificationStatus("Processing your login... Redirecting to home page.");
          setTimeout(() => {
            router.push("/home");
          }, 1500);
        } else {
          // Unknown verification type
          setError(`Unknown verification type: ${type || 'missing'}`); 
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error in email verification:", error);
        setError("An unexpected error occurred. Please try signing in manually or contact support.");
        setIsLoading(false);
      }
    };

    handleEmailConfirmation();
  }, [searchParams, router]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900">
            Email Verification
          </h1>
          
          {isLoading ? (
            <div className="mt-4 p-4 bg-blue-50 rounded-md text-blue-800">
              <p className="mb-4">{verificationStatus}</p>
              <div className="animate-pulse">
                <div className="h-2 bg-blue-200 rounded"></div>
              </div>
            </div>
          ) : error ? (
            <div className="mt-4 p-4 bg-red-50 rounded-md text-red-800">
              <p className="mb-4">{error}</p>
              <div className="mt-4">
                <Link 
                  href="/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Try Signing In
                </Link>
              </div>
            </div>
          ) : verificationSuccess ? (
            <div className="mt-4 p-4 bg-green-50 rounded-md text-green-800">
              <p className="mb-4">{verificationStatus}</p>
              <div className="mt-4">
                <Link 
                  href="/login" 
                  className="inline-block bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition"
                >
                  Continue to Login
                </Link>
              </div>
            </div>
          ) : (
            <div className="mt-4 p-4 bg-yellow-50 rounded-md text-yellow-800">
              <p className="mb-4">Verification process completed but with an unknown state. Please try signing in.</p>
              <div className="mt-4">
                <Link 
                  href="/login" 
                  className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
                >
                  Go to Login
                </Link>
              </div>
            </div>
          )}
          
          {/* Debug information in development */}
          {process.env.NODE_ENV === 'development' && debugInfo && (
            <div className="mt-8 p-4 bg-gray-100 rounded-md text-left">
              <p className="font-bold mb-2">Debug Information:</p>
              <pre className="text-xs overflow-x-auto">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
