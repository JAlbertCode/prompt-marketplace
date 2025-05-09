// Scripts/migrate-credits.ts
// This script migrates the existing user credit data to the new credit system
// It creates UserCredits records for each user and sets up the initial transactions

import { PrismaClient, TransactionType } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateCredits() {
  console.log('Starting credit system migration...');
  
  try {
    // Get all users
    const users = await prisma.user.findMany();
    console.log(`Found ${users.length} users to migrate`);
    
    // Process each user
    for (const user of users) {
      console.log(`Migrating user ${user.id} (${user.email || 'no email'})`);
      
      // Check if user already has a UserCredits record
      const existingCredits = await prisma.userCredits.findUnique({
        where: { userId: user.id },
      });
      
      if (existingCredits) {
        console.log(`User ${user.id} already has UserCredits record, skipping`);
        continue;
      }
      
      // Create UserCredits record with current balance
      const userCredits = await prisma.userCredits.create({
        data: {
          userId: user.id,
          balance: user.credits || 0,
        },
      });
      
      console.log(`Created UserCredits record for user ${user.id} with balance ${userCredits.balance}`);
      
      // Create initial transaction record
      if (userCredits.balance > 0) {
        await prisma.creditTransaction.create({
          data: {
            userId: user.id,
            amount: userCredits.balance,
            description: 'Initial credit balance migration',
            type: 'CREDIT_PURCHASE' as TransactionType,
          },
        });
        
        console.log(`Created initial transaction for user ${user.id}`);
      }
    }
    
    console.log('Credit migration completed successfully');
  } catch (error) {
    console.error('Error during credit migration:', error);
  } finally {
    await prisma.$disconnect();
  }
}

// Run the migration
migrateCredits();
