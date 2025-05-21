import { NextResponse } from "next/server";
import { supabase } from '@/lib/supabase';

/**
 * API endpoint to get Supabase session info
 */
export async function GET() {
  try {
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      console.error("Error getting Supabase session:", error);
      return NextResponse.json({ error: "Failed to get session" }, { status: 500 });
    }
    
    return NextResponse.json({ session: data.session });
  } catch (error) {
    console.error("Exception getting Supabase session:", error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}