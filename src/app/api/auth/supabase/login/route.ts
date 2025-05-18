import { NextResponse } from "next/server";
import { supabase, createServiceRoleClient } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Check if the user's session is in local storage from verification
    const authVerified = typeof window !== 'undefined' ? localStorage.getItem('auth_verified') : null;
    
    // First try to directly sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    
    // If error is 'Email not confirmed' but we have auth_verified flag, try to force confirm
    if (error && (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed') && authVerified) {
      // Try to use admin API to confirm the email
      try {
        const adminClient = createServiceRoleClient();
        
        // Find user by email
        const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
        
        if (!userError && userData) {
          const user = userData.users.find(u => u.email === email);
          
          if (user) {
            // Force update email confirmation status
            const { error: updateError } = await adminClient.auth.admin.updateUserById(
              user.id,
              { email_confirm: true }
            );
            
            if (!updateError) {
              // Try signing in again
              const { data: retryData, error: retryError } = await supabase.auth.signInWithPassword({
                email,
                password
              });
              
              // If success on second attempt, use this data
              if (!retryError && retryData) {
                return NextResponse.json({
                  user: {
                    id: retryData.user.id,
                    email: retryData.user.email,
                    name: retryData.user.user_metadata?.name || email.split('@')[0]
                  },
                  session: {
                    token: retryData.session.access_token,
                    expires: retryData.session.expires_at
                  }
                });
              }
            }
          }
        }
      } catch (adminError) {
        console.error("Error using admin API to confirm email:", adminError);
      }
    }

    if (error) {
      console.error("Error signing in:", error);
      
      // In development, log the detailed error
      if (process.env.NODE_ENV !== 'production') {
        console.log('Detailed auth error:', {
          message: error.message,
          status: error.status,
          name: error.name
        });
      }
      
      // Special handling for unconfirmed emails
      if (error.message === 'Email not confirmed' || error.code === 'email_not_confirmed') {
        try {
          // Try to send another confirmation email
          const { error: resendError } = await supabase.auth.resend({
            type: 'signup',
            email
          });
          
          if (resendError) {
            console.error("Error resending confirmation email:", resendError);
            // If rate limited, we'll still return a helpful message
            if (resendError.status === 429) {
              return NextResponse.json(
                { 
                  error: "Please confirm your email before signing in. We recently sent you a confirmation email.",
                  needsEmailConfirmation: true,
                  rateLimited: true
                },
                { status: 401 }
              );
            }
          }
          
          return NextResponse.json(
            { 
              error: "Please confirm your email before signing in. We've sent another confirmation email.",
              needsEmailConfirmation: true
            },
            { status: 401 }
          );
        } catch (resendError) {
          console.error("Exception when resending confirmation email:", resendError);
          return NextResponse.json(
            { 
              error: "Please confirm your email before signing in. Check your inbox for the confirmation email.",
              needsEmailConfirmation: true
            },
            { status: 401 }
          );
        }
      }
      
      return NextResponse.json(
        { error: "Invalid email or password" },
        { status: 401 }
      );
    }

    if (!data.user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    // Get user profile from users table
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error("Error fetching user profile:", profileError);
      
      // Create user profile if it doesn't exist
      if (profileError.code === 'PGRST116') {
        const { error: insertError } = await supabase
          .from('users')
          .insert({
            id: data.user.id,
            email: data.user.email,
            name: data.user.user_metadata?.name || email.split('@')[0] // Use name from metadata or email username
          });
          
        if (insertError) {
          console.error("Error creating missing user profile:", insertError);
        }
      }
    }

    // Return session token and user info
    return NextResponse.json({
      user: profile || {
        id: data.user.id,
        email: data.user.email,
        name: data.user.user_metadata?.name || email.split('@')[0]
      },
      session: {
        token: data.session.access_token,
        expires: data.session.expires_at
      }
    });
  } catch (error) {
    console.error("Error in login:", error);
    return NextResponse.json(
      { error: "Error signing in" },
      { status: 500 }
    );
  }
}
