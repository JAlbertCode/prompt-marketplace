import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function GET(request: Request) {
  try {
    // Get user ID from query parameter or auth session
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    // If no userId provided, try to get it from the auth session
    let userIdToUse = userId;
    if (!userIdToUse) {
      const { data: { session } } = await supabase.auth.getSession();
      userIdToUse = session?.user?.id;
      
      if (!userIdToUse) {
        return NextResponse.json(
          { error: "No user ID provided and no active session found" },
          { status: 400 }
        );
      }
    }
    
    // Fetch all credit entries for the user
    const { data: creditEntries, error: creditError } = await supabase
      .from('credit_ledger')
      .select('*')
      .eq('user_id', userIdToUse);
    
    if (creditError) {
      console.error("Error fetching credit entries:", creditError);
      return NextResponse.json(
        { error: "Error fetching credit information" },
        { status: 500 }
      );
    }
    
    // Calculate total remaining credits
    const totalCredits = creditEntries?.reduce((sum, entry) => sum + entry.remaining, 0) || 0;
    
    // Get credit details by source type
    const creditsBySource = creditEntries?.reduce((acc, entry) => {
      const source = entry.source || 'unknown';
      acc[source] = (acc[source] || 0) + entry.remaining;
      return acc;
    }, {} as Record<string, number>) || {};
    
    return NextResponse.json({
      userId: userIdToUse,
      totalCredits,
      creditsBySource,
      entries: creditEntries
    });
  } catch (error) {
    console.error("Error checking credits:", error);
    return NextResponse.json(
      { error: "Error checking credits" },
      { status: 500 }
    );
  }
}
