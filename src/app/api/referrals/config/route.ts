import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

// Default configuration - used as fallback if DB settings aren't available
const DEFAULT_REFERRAL_CONFIG = {
  inviterBonus: 50000, // 50,000 credits per successful referral
  inviteeBonus: 20000, // 20,000 credits for new users
  minSpendRequirement: 10000, // Minimum credits spent by referral to qualify
};

export async function GET(req: NextRequest) {
  try {
    // Attempt to get configuration from database
    const config = await prisma.systemConfig.findUnique({
      where: {
        key: 'referralProgram'
      }
    });
    
    if (config?.value) {
      try {
        // Parse the stored configuration
        const parsedConfig = JSON.parse(config.value);
        return NextResponse.json({
          ...DEFAULT_REFERRAL_CONFIG,
          ...parsedConfig
        });
      } catch (e) {
        console.error('Error parsing referral config:', e);
      }
    }
    
    // Return default configuration if we couldn't get one from the database
    return NextResponse.json(DEFAULT_REFERRAL_CONFIG);
  } catch (error) {
    console.error('Error fetching referral configuration:', error);
    return NextResponse.json(
      DEFAULT_REFERRAL_CONFIG,
      { status: 200 } // Still return default config, even on error
    );
  }
}