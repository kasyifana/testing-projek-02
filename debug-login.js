// Test script untuk debugging Laravel API response
// Simpan sebagai debug-login.js dan jalankan di browser console

async function testLoginAPI() {
  console.log('=== Testing Laravel Login API ===');
  
  const testCredentials = [
    { email: 'admin@example.com', password: 'password' },
    { email: 'user@example.com', password: 'password' },
    { email: 'test@test.com', password: 'password123' }
  ];
  
  for (const cred of testCredentials) {
    console.log(`\n--- Testing with ${cred.email} ---`);
    
    try {
      const response = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(cred),
        credentials: 'same-origin',
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
      const result = await response.json();
      console.log('Response body:', result);
      
      // Analyze response structure
      console.log('Analysis:');
      console.log('- Has token:', !!result.token);
      console.log('- Has user:', !!result.user);
      console.log('- Has success flag:', !!result.success);
      
      if (result.user) {
        console.log('User structure:');
        console.log('- Name:', result.user.name || result.user.full_name || 'N/A');
        console.log('- Email:', result.user.email || 'N/A');
        console.log('- Role:', result.user.role || 'N/A');
        console.log('- Is Admin:', result.user.is_admin || 'N/A');
        console.log('- All user keys:', Object.keys(result.user));
      }
      
      if (result.error || result.message) {
        console.log('Error/Message:', result.error || result.message);
      }
      
    } catch (error) {
      console.error('Network/Parse error:', error);
    }
  }
}

// Test API connectivity
async function testAPIConnectivity() {
  console.log('=== Testing API Connectivity ===');
  
  try {
    const response = await fetch('http://127.0.0.1:8000/api/test', {
      method: 'GET',
      mode: 'cors'
    });
    console.log('API test endpoint status:', response.status);
  } catch (error) {
    console.log('API connectivity error:', error.message);
  }
  
  // Test basic endpoint
  try {
    const response = await fetch('http://127.0.0.1:8000', {
      method: 'GET',
      mode: 'cors'
    });
    console.log('Laravel homepage status:', response.status);
  } catch (error) {
    console.log('Laravel homepage error:', error.message);
  }
}

// Run tests
console.log('Mulai testing...');
testAPIConnectivity().then(() => testLoginAPI());

// Export untuk digunakan manual
window.testLoginAPI = testLoginAPI;
window.testAPIConnectivity = testAPIConnectivity;
