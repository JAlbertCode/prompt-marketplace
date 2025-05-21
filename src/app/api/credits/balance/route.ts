import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { createClient } from "@supabase/supabase-js";
import { Database } from "@/types/supabase";

export async function GET(req: NextRequest) {
  // Create a Supabase client
  const supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
      },
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value;
        },
      },
    }
  );

  // Get the user from the Supabase session
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json(
      { error: "Unauthorized", message: "You must be logged in to view your credits" },
      { status: 401 }
    );
  }

  try {
    // Get all credit buckets for the user
    const { data: creditBuckets, error: creditError } = await supabase
      .from("credit_ledger")
      .select("*")
      .eq("user_id", user.id)
      .gt("remaining", 0)
      .order("created_at", { ascending: true });

    if (creditError) {
      console.error("Error fetching credit buckets:", creditError);
      return NextResponse.json(
        { error: "Database error", message: creditError.message },
        { status: 500 }
      );
    }

    // Calculate total credits
    let totalCredits = 0;
    let creditBreakdown = {
      purchased: 0,
      bonus: 0,
      referral: 0,
    };

    creditBuckets.forEach((bucket) => {
      totalCredits += bucket.remaining;
      const source = bucket.source as keyof typeof creditBreakdown;
      creditBreakdown[source] += bucket.remaining;
    });

    return NextResponse.json({ 
      totalCredits, 
      creditBreakdown 
    });
  } catch (error) {
    console.error("Unexpected error in credits API:", error);
    return NextResponse.json(
      { error: "Server error", message: "Failed to fetch credits" },
      { status: 500 }
    );
  }
}
