// Test file for validating the correct API endpoint that works in Postman
console.log('Testing connection to the API endpoint that works in Postman...');

// Function to format response data
function formatResponse(data) {
  try {
    // Try to parse as JSON
    return JSON.stringify(JSON.parse(data), null, 2);
  } catch (e) {
    // If not JSON, just return as is
    return data;
  }
}

// Test simple GET request first
fetch('https://laravel.kasyifana.my.id/api/status', {
  method: 'GET',
  mode: 'cors',
  credentials: 'include',
})
.then(response => {
  console.log('GET Status:', response.status);
  console.log('GET Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('GET Response:', formatResponse(data));
  
  // Now test a minimal POST request
  const minimalFormData = new FormData();
  minimalFormData.append('judul', 'Test from debug script');
  minimalFormData.append('kategori', 'fasilitas');
  minimalFormData.append('deskripsi', 'This is a minimal test submission');
  minimalFormData.append('prioritas', 'Low');
  minimalFormData.append('status', 'Pending');
  
  console.log('Sending minimal POST request to test endpoint...');
  
  return fetch('https://laravel.kasyifana.my.id/api/laporan', {
    method: 'POST',
    body: minimalFormData,
    mode: 'cors',
    credentials: 'include',
  });
})
.then(response => {
  console.log('POST Status:', response.status);
  console.log('POST Headers:', Object.fromEntries(response.headers.entries()));
  return response.text();
})
.then(data => {
  console.log('POST Response:', formatResponse(data));
  console.log('Test completed');
})
.catch(error => {
  console.error('Error during test:', error);
});
