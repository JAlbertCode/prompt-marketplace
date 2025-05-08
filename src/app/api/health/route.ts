import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

/**
 * Health check endpoint
 * Used by monitoring systems to verify the application is running
 */
export async function GET() {
  // Start time for measuring response time
  const startTime = Date.now();
  
  try {
    // Check database connection
    let dbStatus = 'unknown';
    let dbMessage = '';
    
    try {
      // Execute a lightweight query to check DB connection
      await prisma.$queryRaw`SELECT 1`;
      dbStatus = 'healthy';
    } catch (error) {
      dbStatus = 'unhealthy';
      dbMessage = error instanceof Error ? error.message : 'Unknown database error';
    }
    
    // Calculate response time
    const responseTime = Date.now() - startTime;
    
    // Create health response
    const healthData = {
      status: dbStatus === 'healthy' ? 'healthy' : 'degraded',
      version: process.env.NEXT_PUBLIC_APP_VERSION || '1.0.0',
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      environment: process.env.NODE_ENV,
      components: {
        database: {
          status: dbStatus,
          message: dbMessage || undefined,
        },
      }
    };
    
    // Return health status with appropriate status code
    return NextResponse.json(
      healthData,
      { 
        status: dbStatus === 'healthy' ? 200 : 503,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
  } catch (error) {
    // Handle any unexpected errors
    console.error('Health check error:', error);
    
    return NextResponse.json(
      {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
