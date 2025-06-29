// This script helps diagnose image path issues
// Run this with: node check-image-paths.js

// Function to check if a path is in various formats and how it would be resolved
function checkPath(path) {
  console.log('\n----------------------------------');
  console.log(`Analyzing path: "${path}"`);

  // Check for full paths
  if (path.includes('public/uploads/')) {
    console.log('✓ Contains "public/uploads/" - Laravel storage pattern');
    console.log(`→ Extracted filename: ${path.split('/').pop()}`);
    console.log(`→ Recommended URL: /uploads/${path.split('/').pop()}`);
  }

  if (path.includes('/uploads/')) {
    console.log('✓ Contains "/uploads/" - Direct Next.js public path');
    console.log(`→ Can use as is: ${path}`);
  }

  if (path.includes('/storage/')) {
    console.log('✓ Contains "/storage/" - Laravel storage symlink path');
    console.log(`→ Can use as is: ${path}`);
  }

  if (path.startsWith('lampiran/')) {
    console.log('✓ Starts with "lampiran/" - Laravel upload folder');
    console.log(`→ Should convert to: /uploads/${path}`);
  }

  if (path.startsWith('lampiran_')) {
    console.log('✓ Starts with "lampiran_" - Next.js uploaded file');
    console.log(`→ Should use as: /uploads/${path}`);
  }

  // Check browser URL construction
  console.log('\nBrowser URL resolution:');

  // 1. Basic path as stored
  console.log(`1. Direct path: http://localhost:9002${path.startsWith('/') ? path : `/${path}`}`);
  
  // 2. With /uploads/ prefix
  console.log(`2. With uploads: http://localhost:9002/uploads/${path.split('/').pop()}`);
  
  // 3. With /storage/ prefix
  console.log(`3. With storage: http://localhost:9002/storage/${path.split('/').pop()}`);

  console.log('----------------------------------');
}

// Sample paths to check
const samplePaths = [
  // Your example
  'public/uploads/lampiran_1751124655.png',
  // Other common patterns
  'lampiran_1751051521487.png',
  '/uploads/lampiran_1751051521487.png',
  'lampiran/report_image.png',
  '/public/uploads/test.jpg',
  'test.jpg'
];

console.log('=========================================');
console.log('IMAGE PATH RESOLUTION DIAGNOSTIC TOOL');
console.log('=========================================');

samplePaths.forEach(path => {
  checkPath(path);
});

console.log('\n=========================================');
console.log('RECOMMENDATIONS:');
console.log('=========================================');
console.log('1. For paths from database containing "public/uploads/":');
console.log('   → Extract just the filename and use /uploads/filename.ext');
console.log('2. For direct filenames:');
console.log('   → Always add /uploads/ prefix: /uploads/filename.ext');
console.log('3. In onError handlers:');
console.log('   → First fallback should be /uploads/filename.ext (most reliable)');
console.log('   → Second fallback should use just the filename without folders');
console.log('=========================================');
