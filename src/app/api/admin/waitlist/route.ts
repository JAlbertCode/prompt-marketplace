import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { prisma } from '@/lib/prisma';

// Admin-only endpoint to fetch waitlist entries
export async function GET(request: Request) {
  try {
    // Get server session for authentication check
    const session = await getServerSession();
    
    // Check if user is authenticated and is an admin
    if (!session || !session.user || session.user.role !== 'ADMIN') {
      return NextResponse.json({ 
        success: false, 
        message: 'Unauthorized' 
      }, { 
        status: 403 
      });
    }
    
    // Get all waitlist entries, sorted by most recent first
    const waitlistEntries = await prisma.waitlist.findMany({
      orderBy: {
        joinedAt: 'desc',
      },
    });
    
    return NextResponse.json({
      success: true,
      entries: waitlistEntries,
    });
  } catch (error) {
    console.error('Error fetching waitlist:', error);
    return NextResponse.json({
      success: false,
      message: 'Failed to fetch waitlist entries',
    }, { status: 500 });
  }
}