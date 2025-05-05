/**
 * Credit System Seeding Script
 * 
 * This script migrates users from the legacy credit system to the new bucket-based system.
 * It also creates some initial credit buckets for testing purposes.
 */

const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
  console.log('Starting credit system migration...');
  
  // Get all users
  const users = await prisma.user.findMany();
  console.log(`Found ${users.length} users to migrate`);
  
  // For each user, migrate their credits to the bucket system
  for (const user of users) {
    // Check if they have legacy credits
    if (user.credits > 0) {
      console.log(`Migrating ${user.credits} credits for user ${user.id}`);
      
      // Create a new purchased credit bucket with their legacy credits
      await prisma.creditBucket.create({
        data: {
          userId: user.id,
          type: 'purchased',
          amount: user.credits,
          remaining: user.credits,
          source: 'legacy_migration',
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      // Add a small bonus for the migration
      await prisma.creditBucket.create({
        data: {
          userId: user.id,
          type: 'bonus',
          amount: 10000, // 10,000 bonus credits = $0.01
          remaining: 10000,
          source: 'migration_bonus',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log(`Created credit buckets for user ${user.id}`);
    } else {
      // User has no legacy credits, give them a small starting amount
      console.log(`User ${user.id} has no legacy credits, creating starter bucket`);
      
      await prisma.creditBucket.create({
        data: {
          userId: user.id,
          type: 'bonus',
          amount: 100000, // 100,000 bonus credits = $0.10
          remaining: 100000,
          source: 'new_user_bonus',
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days expiry
          createdAt: new Date(),
          updatedAt: new Date()
        }
      });
    }
  }
  
  console.log('Credit system migration completed!');
}

main()
  .catch(e => {
    console.error('Error during credit migration:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
