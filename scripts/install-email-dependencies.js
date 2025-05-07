/**
 * Script to install Brevo SDK for email automation
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Installing email automation dependencies...');

try {
  // Install Brevo SDK
  console.log('Installing Brevo (SIB) SDK...');
  execSync('npm install --save sib-api-v3-sdk', { stdio: 'inherit' });
  
  console.log('\nDependencies installed successfully!');
  
  // Check if .env.local exists, if not remind user to set it up
  const envPath = path.join(process.cwd(), '.env.local');
  if (!fs.existsSync(envPath)) {
    console.log('\n⚠️ Remember to set up your .env.local file with the following variables:');
    console.log('BREVO_API_KEY=your_brevo_api_key');
    console.log('\nYou can get a free API key by creating an account at https://www.brevo.com/');
  } else {
    // Check if BREVO_API_KEY is already in .env.local
    const envContent = fs.readFileSync(envPath, 'utf8');
    if (!envContent.includes('BREVO_API_KEY=')) {
      console.log('\n⚠️ Remember to add the following variables to your .env.local file:');
      console.log('BREVO_API_KEY=your_brevo_api_key');
      console.log('\nYou can get a free API key by creating an account at https://www.brevo.com/');
    }
  }
  
  console.log('\n📨 Next steps:');
  console.log('1. Create an account at https://www.brevo.com/ if you haven\'t already');
  console.log('2. Create contact lists for waitlist and users');
  console.log('3. Create email templates for different user events');
  console.log('4. Set up automation workflows in the Brevo dashboard');
  
} catch (error) {
  console.error('Error installing dependencies:');
  console.error(error.message);
  process.exit(1);
}
