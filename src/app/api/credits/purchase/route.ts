import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { addCredits } from '@/utils/creditManager';
import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

// Credit package options
const CREDIT_PACKAGES = [
  { id: 'basic', name: 'Basic', amount: 1000000, price: 1.00 },   // 1,000,000 credits = $1.00
  { id: 'standard', name: 'Standard', amount: 5000000, price: 5.00 },   // 5,000,000 credits = $5.00
  { id: 'premium', name: 'Premium', amount: 20000000, price: 20.00 },   // 20,000,000 credits = $20.00
  { id: 'pro', name: 'Professional', amount: 100000000, price: 100.00 },   // 100,000,000 credits = $100.00
];

export async function POST(req: NextRequest) {
  try {
    // Get the authenticated user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await req.json();
    const { packageId } = body;
    
    // Find the credit package
    const creditPackage = CREDIT_PACKAGES.find(pkg => pkg.id === packageId);
    if (!creditPackage) {
      return NextResponse.json(
        { error: 'Credit package not found' },
        { status: 404 }
      );
    }

    // In a real implementation, we would:
    // 1. Create a Stripe checkout session
    // 2. Return the checkout URL to redirect the user
    
    // For this mock implementation, we'll just add the credits directly
    const description = `Credit purchase: ${creditPackage.name} package`;
    const updatedBalance = await addCredits(
      userId,
      creditPackage.amount,
      description,
      'PURCHASE'
    );
    
    // Record the purchase
    await prisma.creditPurchase.create({
      data: {
        userId,
        amount: creditPackage.amount,
        cost: creditPackage.price,
        packageId: creditPackage.id,
        status: 'COMPLETED',
      },
    });
    
    return NextResponse.json({
      success: true,
      credits: creditPackage.amount,
      updatedBalance,
      mockPurchase: true, // Flag to indicate this is a mock purchase
    });
  } catch (error) {
    console.error('Error processing credit purchase:', error);
    return NextResponse.json(
      { error: 'Failed to process credit purchase' },
      { status: 500 }
    );
  }
}
