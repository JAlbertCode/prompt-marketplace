/**
 * Database Setup Script
 * 
 * This script:
 * 1. Runs prisma migrations
 * 2. Seeds the database with initial credit buckets
 */

const { exec } = require('child_process');
const { promisify } = require('util');

const execPromise = promisify(exec);

async function runCommand(command) {
  console.log(`Running: ${command}`);
  try {
    const { stdout, stderr } = await execPromise(command);
    
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    
    return true;
  } catch (error) {
    console.error(`Error running command: ${command}`);
    console.error(error);
    return false;
  }
}

async function setupDatabase() {
  console.log('Starting database setup...');
  
  // Step 1: Run Prisma migrations to update schema
  console.log('\n🔄 Step 1: Running database migrations...');
  const migrationSuccess = await runCommand('npx prisma migrate deploy');
  
  if (!migrationSuccess) {
    console.log('Migration failed, trying db push instead...');
    const pushSuccess = await runCommand('npx prisma db push --accept-data-loss');
    
    if (!pushSuccess) {
      console.error('❌ Failed to update database schema. Setup cancelled.');
      return;
    }
  }
  
  console.log('✅ Database schema updated successfully!');
  
  // Step 2: Generate Prisma client
  console.log('\n🔄 Step 2: Generating Prisma client...');
  const generateSuccess = await runCommand('npx prisma generate');
  
  if (!generateSuccess) {
    console.error('❌ Failed to generate Prisma client.');
    return;
  }
  
  console.log('✅ Prisma client generated successfully!');
  
  // Step 3: Run the credit seeding script
  console.log('\n🔄 Step 3: Seeding credit data...');
  const seedSuccess = await runCommand('node scripts/seed-credits.js');
  
  if (!seedSuccess) {
    console.error('❌ Failed to seed credit data.');
  } else {
    console.log('✅ Credit data seeded successfully!');
  }
  
  console.log('\n🎉 Database setup completed!');
  console.log('\nNext steps:');
  console.log('1. Run the application: npm run dev');
  console.log('2. Visit http://localhost:3000/dev-utils to check database status');
  console.log('3. Set up admin privileges if needed');
}

setupDatabase().catch(error => {
  console.error('Unhandled error during setup:', error);
  process.exit(1);
});
