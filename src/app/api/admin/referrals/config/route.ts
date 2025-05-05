import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

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
    
    // Parse the request body
    const body = await req.json();
    const { inviterBonus, inviteeBonus, minSpendRequirement } = body;
    
    // Validate inputs
    if (inviterBonus === undefined || inviteeBonus === undefined || minSpendRequirement === undefined) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate reasonable values
    if (inviterBonus < 0 || inviteeBonus < 0 || minSpendRequirement < 0) {
      return NextResponse.json(
        { error: 'Values cannot be negative' },
        { status: 400 }
      );
    }
    
    // Save to database
    await prisma.systemConfig.upsert({
      where: { key: 'referralProgram' },
      update: {
        value: JSON.stringify({
          inviterBonus,
          inviteeBonus,
          minSpendRequirement
        })
      },
      create: {
        key: 'referralProgram',
        value: JSON.stringify({
          inviterBonus,
          inviteeBonus,
          minSpendRequirement
        })
      }
    });
    
    // Log the admin action
    await prisma.adminLog.create({
      data: {
        adminId: session.user.id,
        action: 'UPDATE_REFERRAL_CONFIG',
        details: JSON.stringify({
          inviterBonus,
          inviteeBonus,
          minSpendRequirement
        })
      }
    });
    
    // Return success response
    return NextResponse.json({
      success: true,
      config: {
        inviterBonus,
        inviteeBonus,
        minSpendRequirement
      }
    });
  } catch (error) {
    console.error('Error updating referral configuration:', error);
    return NextResponse.json(
      { error: 'Failed to update referral configuration' },
      { status: 500 }
    );
  }
}