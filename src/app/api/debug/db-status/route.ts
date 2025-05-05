/**
 * Database Status Check API
 * 
 * This API route checks if the database connection is working properly
 * and provides information about the database schema.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(req: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Test database connection
    const databaseTest = await testDatabaseConnection();
    
    // Get database info
    const databaseInfo = process.env.DATABASE_URL 
      ? process.env.DATABASE_URL.split('@')[1]?.split('/')[0] || 'Unknown'
      : 'Not configured';
    
    // Get environment info
    const environmentInfo = {
      nodeEnv: process.env.NODE_ENV || 'development',
      useLocalStorage: process.env.USE_LOCAL_STORAGE === 'true',
    };
    
    // Check for CreditBucket schema
    const hasCreditBucketSchema = await checkForCreditBucketSchema();
    
    // Get table list
    const tables = await listDatabaseTables();
    
    return NextResponse.json({
      status: 'success',
      databaseConnection: databaseTest.success,
      databaseInfo,
      environmentInfo,
      schemaInfo: {
        tables,
        hasCreditBucketSchema,
      },
      error: databaseTest.error,
      message: databaseTest.success 
        ? 'Database connection successful' 
        : 'Database connection failed',
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    return NextResponse.json(
      { 
        status: 'error',
        message: 'Failed to check database status',
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}

// Test if database connection is working
async function testDatabaseConnection() {
  try {
    // Try a simple query to check connection
    await prisma.$queryRaw`SELECT 1;`;
    return { success: true, error: null };
  } catch (error) {
    console.error('Database connection test failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : String(error)
    };
  }
}

// Check if CreditBucket table exists in schema
async function checkForCreditBucketSchema() {
  try {
    // Try to get a count from the CreditBucket table
    await prisma.creditBucket.count();
    return true;
  } catch (error) {
    console.error('CreditBucket schema check failed:', error);
    return false;
  }
}

// List all tables in the database
async function listDatabaseTables() {
  try {
    // This is PostgreSQL specific - get all tables in the public schema
    const tables = await prisma.$queryRaw`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE';
    `;
    return tables;
  } catch (error) {
    console.error('Failed to list database tables:', error);
    return [];
  }
}
