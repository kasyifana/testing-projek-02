// This is a simple script to check the uploads directory structure
const fs = require('fs');
const path = require('path');

// Define paths to check
const paths = [
  path.join(process.cwd(), 'public', 'uploads'),
  path.join(process.cwd(), 'public', 'storage'),
  path.join(process.cwd(), 'storage', 'app', 'public'),
];

console.log('Checking upload directories...');

paths.forEach(dirPath => {
  console.log(`\nChecking path: ${dirPath}`);
  
  try {
    if (fs.existsSync(dirPath)) {
      console.log(`✅ Directory exists`);
      
      // Check if it's readable
      try {
        const files = fs.readdirSync(dirPath);
        console.log(`✅ Directory is readable`);
        console.log(`Files found (${files.length}):`);
        
        if (files.length === 0) {
          console.log('   No files found in directory');
        } else {
          files.forEach(file => {
            const filePath = path.join(dirPath, file);
            const stats = fs.statSync(filePath);
            console.log(`   - ${file} (${stats.size} bytes, created: ${stats.birthtime.toISOString()})`);
          });
        }
      } catch (readErr) {
        console.log(`❌ Cannot read directory: ${readErr.message}`);
      }
    } else {
      console.log(`❌ Directory does not exist`);
    }
  } catch (err) {
    console.log(`❌ Error checking directory: ${err.message}`);
  }
});

console.log('\nChecking file permission configuration:');
try {
  // Get current process info
  console.log(`Current working directory: ${process.cwd()}`);
  console.log(`Process running as user: ${process.getuid ? process.getuid() : 'N/A (Windows)'}`);
} catch (err) {
  console.log(`Error getting process info: ${err.message}`);
}

// Check if directories are writeable by creating a test file
paths.forEach(dirPath => {
  if (!fs.existsSync(dirPath)) {
    try {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created directory: ${dirPath}`);
    } catch (err) {
      console.log(`❌ Cannot create directory ${dirPath}: ${err.message}`);
      return;
    }
  }
  
  const testFilePath = path.join(dirPath, '_test_write_permission.txt');
  try {
    fs.writeFileSync(testFilePath, 'Test write permission');
    console.log(`✅ Successfully wrote test file to ${dirPath}`);
    
    // Clean up
    fs.unlinkSync(testFilePath);
    console.log(`   Test file removed`);
  } catch (err) {
    console.log(`❌ Cannot write to ${dirPath}: ${err.message}`);
  }
});
