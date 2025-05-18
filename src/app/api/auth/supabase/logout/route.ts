import { NextResponse } from "next/server";
import { supabase, createServiceRoleClient } from "@/lib/supabase";
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    // Get the authorization header if present
    const authHeader = request.headers.get('authorization');
    let token = '';
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7);
    }
    
    // Sign out from Supabase Auth using the server-side client
    const { error } = await supabase.auth.signOut();

    if (error) {
      console.error("Error signing out with standard client:", error);
      // Continue anyway and try with admin client
    }
    
    // If we have a token, also try to invalidate it with the admin API
    if (token) {
      try {
        // Create a service role client for admin operations
        const adminClient = createServiceRoleClient();
        
        // Use the admin client to forcefully invalidate the session
        const { error: adminError } = await adminClient.auth.admin.signOut(token);
        
        if (adminError) {
          console.error("Error signing out with admin client:", adminError);
        }
      } catch (adminError) {
        console.error("Error using admin client:", adminError);
      }
    }

    // Clear any server-side cookies
    const cookieStore = cookies();
    cookieStore.delete('supabase_auth');
    cookieStore.delete('isAuthenticated');

    return NextResponse.json({ 
      success: true,
      message: "Successfully signed out"
    });
  } catch (error) {
    console.error("Error in logout:", error);
    return NextResponse.json(
      { error: "Error signing out" },
      { status: 500 }
    );
  }
}
