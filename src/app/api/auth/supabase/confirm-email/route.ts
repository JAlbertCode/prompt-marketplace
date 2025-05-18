import { NextResponse } from "next/server";
import { createServiceRoleClient } from "@/lib/supabase";

/**
 * This endpoint allows forcing email confirmation for a user
 * It should only be called from the auth callback page
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, userId } = body;

    if (!email && !userId) {
      return NextResponse.json(
        { error: "Either email or userId must be provided" },
        { status: 400 }
      );
    }

    // Create a service role client for admin operations
    const adminClient = createServiceRoleClient();
    
    // If we have a userId, directly update that user
    if (userId) {
      const { error: updateError } = await adminClient.auth.admin.updateUserById(
        userId,
        { email_confirm: true }
      );
      
      if (updateError) {
        console.error("Error confirming email for user:", updateError);
        return NextResponse.json(
          { error: "Unable to confirm email" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({ success: true });
    }
    
    // Otherwise, find the user by email first
    const { data: userData, error: userError } = await adminClient.auth.admin.listUsers();
    
    if (userError) {
      console.error("Error listing users:", userError);
      return NextResponse.json(
        { error: "Unable to find user" },
        { status: 500 }
      );
    }
    
    // Find the user with matching email
    const user = userData?.users?.find(u => u.email === email);
    
    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }
    
    // Update user to confirm email
    const { error: updateError } = await adminClient.auth.admin.updateUserById(
      user.id,
      { email_confirm: true }
    );
    
    if (updateError) {
      console.error("Error confirming email:", updateError);
      return NextResponse.json(
        { error: "Unable to confirm email" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ 
      success: true,
      userId: user.id
    });
  } catch (error) {
    console.error("Error in confirm-email API:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
