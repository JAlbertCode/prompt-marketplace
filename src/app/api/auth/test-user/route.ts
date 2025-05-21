import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

/**
 * API endpoint that returns the first user in the system for testing
 * This should only be used in development environments
 */
export async function GET() {
  try {
    // Only allow this in development
    if (process.env.NODE_ENV !== 'development' && 
        process.env.ALLOW_TEST_USER !== 'true') {
      return NextResponse.json(
        { error: "Test user endpoint not available in production" }, 
        { status: 403 }
      );
    }
    
    // Get the first user from the users table
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .limit(1)
      .single();
    
    if (error || !data) {
      console.error("Error getting test user:", error);
      return NextResponse.json({ error: "No test user found" }, { status: 404 });
    }
    
    console.log("Using first user for testing:", data.id);
    
    // Return the user ID
    return NextResponse.json({ 
      userId: data.id,
      message: "This is a test user. Do not use in production."
    });
  } catch (error) {
    console.error("Exception getting test user:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}