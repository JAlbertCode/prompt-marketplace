import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: "Missing name, email, or password" },
        { status: 400 }
      );
    }

    // Check if the email exists in our users table first
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .maybeSingle();

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already in use" },
        { status: 400 }
      );
    }

    // Create the user in Supabase Auth with email confirmation enabled (best practice)
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          name
        },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/auth/callback`,
        // Set a longer expiration time for the confirmation link (24 hours)
        emailRedirectToExpiry: 86400
        // Let Supabase handle email confirmation by default (emailConfirm: true is default)
      }
    });

    if (signUpError) {
      console.error("Error creating user in Supabase Auth:", signUpError);
      return NextResponse.json(
        { error: "Error creating user" },
        { status: 500 }
      );
    }

    if (!authData.user) {
      return NextResponse.json(
        { error: "Error creating user - no user returned" },
        { status: 500 }
      );
    }

    // Create user record in users table
    const { error: profileError } = await supabase
      .from('users')
      .insert({
        id: authData.user.id,
        email,
        name
      });

    if (profileError) {
      console.error("Error creating user profile:", profileError);
      // Continue anyway since auth user was created
    }

    // Add 100k welcome bonus credits (NOT 1M)
    const { error: creditError } = await supabase
      .from('credit_ledger')
      .insert({
        id: uuidv4(),
        user_id: authData.user.id,
        amount: 100000, // 100k welcome credits
        remaining: 100000,
        source: 'bonus',
        expires_at: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString() // 90 days expiry
      });

    if (creditError) {
      console.error("Error adding welcome credits:", creditError);
      // Continue anyway since user was created
    }

    return NextResponse.json(
      { message: "User created successfully", user: { id: authData.user.id, email, name } },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error in user registration:", error);
    return NextResponse.json(
      { error: "Error creating user" },
      { status: 500 }
    );
  }
}