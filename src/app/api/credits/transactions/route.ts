import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Get the session for authentication
    const session = await getServerSession(authOptions);
    
    // Extract query parameters
    const url = new URL(req.url);
    const requestedUserId = url.searchParams.get('userId');
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '10', 10);
    
    // Validate pagination parameters
    if (isNaN(page) || page < 1) {
      return NextResponse.json(
        { error: 'Invalid page parameter' },
        { status: 400 }
      );
    }
    
    if (isNaN(limit) || limit < 1 || limit > 100) {
      return NextResponse.json(
        { error: 'Invalid limit parameter (must be between 1 and 100)' },
        { status: 400 }
      );
    }
    
    // Ensure authentication - user must be logged in
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Determine which user ID to use
    // Only admins can view transactions for other users
    let userId = session.user.id;
    if (requestedUserId && requestedUserId !== userId) {
      const isAdmin = session.user.role === 'ADMIN';
      if (!isAdmin) {
        return NextResponse.json(
          { error: 'Forbidden - cannot view other user transactions' },
          { status: 403 }
        );
      }
      userId = requestedUserId;
    }
    
    // Calculate pagination
    const skip = (page - 1) * limit;
    
    // Query transactions
    const [transactions, total] = await Promise.all([
      prisma.creditTransaction.findMany({
        where: {
          OR: [
            { userId }, // Transactions where user is the spender
            { creatorId: userId } // Transactions where user is the creator receiving payment
          ]
        },
        include: {
          model: {
            select: {
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip,
        take: limit
      }),
      prisma.creditTransaction.count({
        where: {
          OR: [
            { userId },
            { creatorId: userId }
          ]
        }
      })
    ]);
    
    // Return transaction data with pagination info
    return NextResponse.json({
      transactions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit)
    });
  } catch (error) {
    console.error('Error fetching credit transactions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit transactions' },
      { status: 500 }
    );
  }
}