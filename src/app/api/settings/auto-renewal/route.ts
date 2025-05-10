import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { updateAutoRenewalPreferences, calculateDefaultThreshold } from "@/lib/autoRenewal";

/**
 * Get user's auto-renewal settings
 */
export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        autoRenewalEnabled: true,
        autoRenewalThreshold: true,
        autoRenewalBundleId: true,
        autoRenewalAttempts: true,
        lastAutoRenewalAttempt: true
      }
    });
    
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    
    // Get auto-renewal history
    const renewalHistory = await prisma.autoRenewalLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 5
    });
    
    return NextResponse.json({
      settings: user,
      history: renewalHistory
    });
    
  } catch (error) {
    console.error("Error getting auto-renewal settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

/**
 * Update user's auto-renewal settings
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    
    const userId = session.user.id;
    const data = await req.json();
    
    const { enabled, threshold, bundleId } = data;
    
    // Validate inputs
    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: "Enabled must be a boolean" },
        { status: 400 }
      );
    }
    
    if (threshold !== undefined && (isNaN(threshold) || threshold < 100000)) {
      return NextResponse.json(
        { error: "Threshold must be a number greater than 100,000" },
        { status: 400 }
      );
    }
    
    // If no threshold is provided but auto-renewal is being enabled,
    // calculate a default threshold
    let effectiveThreshold = threshold;
    if (enabled && threshold === undefined) {
      effectiveThreshold = await calculateDefaultThreshold(userId);
    }
    
    // Update preferences
    const success = await updateAutoRenewalPreferences(
      userId,
      enabled,
      effectiveThreshold,
      bundleId
    );
    
    if (!success) {
      return NextResponse.json(
        { error: "Failed to update preferences" },
        { status: 500 }
      );
    }
    
    // Get updated settings
    const updatedUser = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        autoRenewalEnabled: true,
        autoRenewalThreshold: true,
        autoRenewalBundleId: true
      }
    });
    
    return NextResponse.json({
      success: true,
      settings: updatedUser
    });
    
  } catch (error) {
    console.error("Error updating auto-renewal settings:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
