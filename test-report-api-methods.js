const testReportEndpoints = async () => {
  // Get token from local storage
  const token = localStorage.getItem('token');
  
  if (!token) {
    console.error('No auth token found. Please login first.');
    return;
  }
  
  console.log('Starting API endpoint test...');
  
  // Test data
  const testReport = {
    id: 1, // Replace with an actual report ID
    status: 'In Progress',
    respon: 'Test response from API method checker',
    oleh: 'API Test',
    waktu_respon: new Date().toISOString()
  };
  
  // 1. Test proxy endpoint with various methods
  const proxyBaseUrl = `/api/proxy?endpoint=laporan`;
  
  console.log('1. Testing proxy with GET method...');
  try {
    const getResponse = await fetch(`${proxyBaseUrl}/1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });
    console.log(`GET result: ${getResponse.status} ${getResponse.statusText}`);
    console.log('Supported? ', getResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('GET test failed:', error);
  }
  
  console.log('2. Testing proxy with PUT method...');
  try {
    const putResponse = await fetch(`${proxyBaseUrl}/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testReport)
    });
    console.log(`PUT result: ${putResponse.status} ${putResponse.statusText}`);
    console.log('Supported? ', putResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('PUT test failed:', error);
  }
  
  console.log('3. Testing proxy with POST method...');
  try {
    const postResponse = await fetch(`${proxyBaseUrl}/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(testReport)
    });
    console.log(`POST result: ${postResponse.status} ${postResponse.statusText}`);
    console.log('Supported? ', postResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('POST test failed:', error);
  }
  
  // 2. Test direct endpoint with various methods
  const directBaseUrl = `http://127.0.0.1:8000/api/laporan`;
  
  console.log('4. Testing direct API with GET method...');
  try {
    const getResponse = await fetch(`${directBaseUrl}/1`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    console.log(`GET result: ${getResponse.status} ${getResponse.statusText}`);
    console.log('Supported? ', getResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('GET test failed:', error);
  }
  
  console.log('5. Testing direct API with PUT method...');
  try {
    const putResponse = await fetch(`${directBaseUrl}/1`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      body: JSON.stringify(testReport)
    });
    console.log(`PUT result: ${putResponse.status} ${putResponse.statusText}`);
    console.log('Supported? ', putResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('PUT test failed:', error);
  }
  
  console.log('6. Testing direct API with POST method...');
  try {
    const postResponse = await fetch(`${directBaseUrl}/1`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors',
      body: JSON.stringify(testReport)
    });
    console.log(`POST result: ${postResponse.status} ${postResponse.statusText}`);
    console.log('Supported? ', postResponse.ok ? 'YES' : 'NO');
  } catch (error) {
    console.error('POST test failed:', error);
  }
  
  console.log('API endpoint test completed. Check the console output above to see which methods are supported.');
};

// Run the test
testReportEndpoints();
