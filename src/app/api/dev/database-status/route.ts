import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Function to mask sensitive information in connection strings
function maskConnectionString(url: string | undefined): string {
  if (!url) return '[not set]';
  
  try {
    // Create a URL object to parse the connection string
    // This works for connection strings that follow URL format
    const connUrl = new URL(url);
    
    // Mask the password
    if (connUrl.password) {
      connUrl.password = '********';
    }
    
    return connUrl.toString();
  } catch (error) {
    // For non-URL format connection strings, do a basic password masking
    return url.replace(/:[^:@]+@/, ':********@');
  }
}

export async function GET() {
  // Check if using fallback mode
  const usingFallback = process.env.USE_DB_FALLBACK === 'true';
  
  // Environment variables (masked for security)
  const envVariables = {
    USE_DB_FALLBACK: process.env.USE_DB_FALLBACK || 'false',
    USE_LOCAL_STORAGE: process.env.USE_LOCAL_STORAGE || 'false',
    DATABASE_URL_MASKED: maskConnectionString(process.env.DATABASE_URL)
  };
  
  try {
    // If explicitly using fallback mode, report that
    if (usingFallback) {
      return NextResponse.json({
        status: 'fallback',
        message: 'Using database fallback mode (configured in .env)',
        env: envVariables
      });
    }
    
    // Try a simple query to check database connection
    const connectionTest = await prisma.$queryRaw`SELECT 1 as connection_test`;
    
    if (connectionTest) {
      // Also check if we can query a table
      let tables = {};
      try {
        // This may fail if no tables exist yet
        tables = await prisma.$queryRaw`
          SELECT table_name 
          FROM information_schema.tables 
          WHERE table_schema = 'public'
        `;
      } catch (error) {
        // Ignore this error, it's not critical
      }
      
      return NextResponse.json({
        status: 'connected',
        message: 'Successfully connected to database',
        info: {
          tables
        },
        env: envVariables
      });
    }
    
    // If the query didn't throw but didn't return expected data
    return NextResponse.json({
      status: 'error',
      message: 'Unknown database error',
      env: envVariables
    });
    
  } catch (error: any) {
    console.error('Database connection test error:', error);
    
    // Check if the error is from our fallback system
    if (error.message?.includes('mock data')) {
      return NextResponse.json({
        status: 'fallback',
        message: 'Using database fallback mode (automatically activated)',
        env: envVariables
      });
    }
    
    // Return error details
    return NextResponse.json({
      status: 'error',
      message: `Database connection error: ${error.message}`,
      error: {
        message: error.message,
        name: error.name,
        code: error.code
      },
      env: envVariables
    });
  }
}
