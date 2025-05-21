import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import bcrypt from 'bcrypt';
import { NextResponse } from 'next/server';

/**
 * API route for handling user authentication with bcrypt
 * This keeps bcrypt usage on the server only
 */
export async function POST(request: Request) {
  try {
    // Get Supabase URL and anon key from environment variables
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { error: "Missing Supabase environment variables" },
        { status: 500 }
      );
    }
    
    // Create a Supabase client for this request
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    const body = await request.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Missing email or password" },
        { status: 400 }
      );
    }

    // Find user in Supabase
    const { data: user, error: userError } = await supabase
      .from('users')
      .select("*")
      .eq('email', email)
      .single();
    
    if (userError || !user || !user.password) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Compare password using bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Update last login timestamp
    const { error: updateError } = await supabase
      .from('users')
      .update({ last_login: new Date().toISOString() })
      .eq('id', user.id);
    
    if (updateError) {
      console.error("Error updating last login:", updateError);
    }

    // Return sanitized user object
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
        role: user.role || 'USER'
      }
    });
  } catch (error) {
    console.error("Authentication error:", error);
    return NextResponse.json(
      { error: "Authentication error" },
      { status: 500 }
    );
  }
}