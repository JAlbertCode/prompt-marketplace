import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { processQualifyingReferrals } from '@/lib/referrals/referralProcessor';

export async function POST(req: NextRequest) {
  try {
    // Check admin authorization
    const session = await getServerSession(authOptions);
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Unauthorized - Admin access required' },
        { status: 401 }
      );
    }
    
    // Process qualifying referrals
    const referralsProcessed = await processQualifyingReferrals();
    
    // Return success response
    return NextResponse.json({
      success: true,
      referralsProcessed
    });
  } catch (error) {
    console.error('Error processing referrals:', error);
    return NextResponse.json(
      { error: 'Failed to process referrals' },
      { status: 500 }
    );
  }
}