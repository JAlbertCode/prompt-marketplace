import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    // First check if the user exists in our users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (userError) {
      console.error("Error checking user:", userError);
    }

    // Send password reset email via Supabase Auth
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/reset-password/update`,
    });

    if (error) {
      console.error("Error sending password reset email:", error);
      
      // Don't reveal if the email exists or not for security reasons
      return NextResponse.json({
        success: true,
        message: "If an account with this email exists, a password reset link has been sent.",
      });
    }

    return NextResponse.json({
      success: true,
      message: "If an account with this email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Error in password reset request:", error);
    return NextResponse.json(
      { error: "An error occurred while processing your request." },
      { status: 500 }
    );
  }
}
