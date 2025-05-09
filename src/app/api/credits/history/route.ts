import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getUserCreditHistory } from '@/lib/credits';
import { z } from 'zod';

// Query parameters schema
const querySchema = z.object({
  limit: z.coerce.number().min(1).max(100).default(10),
  page: z.coerce.number().min(1).default(1),
  userId: z.string().optional(), // Only for admin usage
});

/**
 * GET /api/credits/history
 * 
 * Get credit transaction history for a user
 * Only admin users can view history of other users
 */
export async function GET(req: NextRequest) {
  try {
    // Get session and verify authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    const currentUserId = session.user.id;
    const isAdmin = session.user.role === 'admin';
    
    // Parse and validate query parameters
    const url = new URL(req.url);
    const limit = parseInt(url.searchParams.get('limit') || '10');
    const page = parseInt(url.searchParams.get('page') || '1');
    const userId = url.searchParams.get('userId') || currentUserId;
    
    const validation = querySchema.safeParse({ limit, page, userId });
    
    if (!validation.success) {
      return NextResponse.json({ 
        error: 'Invalid request', 
        details: validation.error.format() 
      }, { status: 400 });
    }
    
    // If userId is provided, ensure the current user is an admin
    if (userId !== currentUserId && !isAdmin) {
      return NextResponse.json({ 
        error: 'Unauthorized. Only admins can view credit history of other users'
      }, { status: 403 });
    }
    
    // Calculate offset
    const offset = (validation.data.page - 1) * validation.data.limit;
    
    // Get credit history
    const history = await getUserCreditHistory(
      userId,
      validation.data.limit,
      offset
    );
    
    // Return success response
    return NextResponse.json({
      data: history,
      pagination: {
        page: validation.data.page,
        limit: validation.data.limit,
        total: history.length // This is not accurate for total count, just the current page
      }
    });
  } catch (error) {
    console.error('Error fetching credit history:', error);
    return NextResponse.json(
      { error: 'Failed to fetch credit history' },
      { status: 500 }
    );
  }
}