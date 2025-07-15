/**
 * Test utility for Report ID 21
 * This script will test different ways of updating Report 21
 */

const testUpdateReport21 = async () => {
  try {
    console.log("Starting update test for Report ID 21...");
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No auth token found. Please login first.");
      return;
    }
    
    // First fetch report ID 21 to get current data
    console.log("Fetching Report ID 21...");
    const report21Response = await fetch('https://laravel.kasyifana.my.id/api/laporan/21', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    if (!report21Response.ok) {
      console.error(`Error fetching Report ID 21: ${report21Response.status} ${report21Response.statusText}`);
      return;
    }
    
    const report21 = await report21Response.json();
    console.log("Original Report 21 data:", report21);
    
    // Prepare minimal update payload
    const minimalUpdate = {
      status: 'In Progress',
      respon: 'Test response from minimal update',
      oleh: 'Test Admin',
      waktu_respon: new Date().toISOString()
    };
    
    // Prepare full update payload preserving all fields
    const fullUpdate = {
      ...report21,
      status: 'In Progress',
      respon: 'Test response from full update',
      oleh: 'Test Admin',
      waktu_respon: new Date().toISOString()
    };
    
    // Test 1: Try minimal update with PUT
    console.log("\n=== Test 1: Minimal Update with PUT ===");
    try {
      const putMinimalResponse = await fetch('https://laravel.kasyifana.my.id/api/laporan/21', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        body: JSON.stringify(minimalUpdate)
      });
      
      console.log(`PUT Minimal status: ${putMinimalResponse.status}`);
      
      if (!putMinimalResponse.ok) {
        const errorData = await putMinimalResponse.json();
        console.error("PUT Minimal error data:", errorData);
      } else {
        const successData = await putMinimalResponse.json();
        console.log("PUT Minimal success data:", successData);
      }
    } catch (error) {
      console.error("PUT Minimal error:", error);
    }
    
    // Test 2: Try full update with PUT
    console.log("\n=== Test 2: Full Update with PUT ===");
    try {
      const putFullResponse = await fetch('https://laravel.kasyifana.my.id/api/laporan/21', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        body: JSON.stringify(fullUpdate)
      });
      
      console.log(`PUT Full status: ${putFullResponse.status}`);
      
      if (!putFullResponse.ok) {
        const errorData = await putFullResponse.json();
        console.error("PUT Full error data:", errorData);
      } else {
        const successData = await putFullResponse.json();
        console.log("PUT Full success data:", successData);
      }
    } catch (error) {
      console.error("PUT Full error:", error);
    }
    
    // Test 3: Try minimal update with POST
    console.log("\n=== Test 3: Minimal Update with POST ===");
    try {
      const postMinimalResponse = await fetch('https://laravel.kasyifana.my.id/api/laporan/21', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        body: JSON.stringify(minimalUpdate)
      });
      
      console.log(`POST Minimal status: ${postMinimalResponse.status}`);
      
      if (!postMinimalResponse.ok) {
        const errorData = await postMinimalResponse.json();
        console.error("POST Minimal error data:", errorData);
      } else {
        const successData = await postMinimalResponse.json();
        console.log("POST Minimal success data:", successData);
      }
    } catch (error) {
      console.error("POST Minimal error:", error);
    }
    
    // Test 4: Try full update with POST
    console.log("\n=== Test 4: Full Update with POST ===");
    try {
      const postFullResponse = await fetch('https://laravel.kasyifana.my.id/api/laporan/21', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Origin': window.location.origin
        },
        mode: 'cors',
        body: JSON.stringify(fullUpdate)
      });
      
      console.log(`POST Full status: ${postFullResponse.status}`);
      
      if (!postFullResponse.ok) {
        const errorData = await postFullResponse.json();
        console.error("POST Full error data:", errorData);
      } else {
        const successData = await postFullResponse.json();
        console.log("POST Full success data:", successData);
      }
    } catch (error) {
      console.error("POST Full error:", error);
    }
    
    console.log("\n=== Update Tests Complete ===");
  } catch (error) {
    console.error("Test error:", error);
  }
};

// Execute the tests
testUpdateReport21();
