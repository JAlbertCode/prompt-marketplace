const fs = require('fs');
const path = require('path');

// Create a backup of the current next.config.js
try {
  console.log('Creating backup of next.config.js...');
  fs.copyFileSync(
    path.join(__dirname, 'next.config.js'),
    path.join(__dirname, 'next.config.backup.js')
  );
  console.log('Backup created at: next.config.backup.js');
} catch (err) {
  console.error('Error creating backup:', err);
  process.exit(1);
}

// Copy the deployment config to next.config.js
try {
  console.log('Copying deployment config to next.config.js...');
  fs.copyFileSync(
    path.join(__dirname, 'deploy-next-config.js'),
    path.join(__dirname, 'next.config.js')
  );
  console.log('Deployment config applied!');
} catch (err) {
  console.error('Error applying deployment config:', err);
  process.exit(1);
}

console.log('\nDEPLOYMENT PREPARATION COMPLETE!');
console.log('You can now run "vercel" to deploy your project.');
console.log('To restore your original config after deployment, run:');
console.log('  mv next.config.backup.js next.config.js');
