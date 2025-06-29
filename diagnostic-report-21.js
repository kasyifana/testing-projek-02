/**
 * Diagnostic tool for analyzing Report ID 21 vs other report IDs
 * This script helps identify schema differences that might cause 422 validation errors
 */

const runDiagnostic = async () => {
  try {
    console.log("Starting diagnostic for Report ID 21...");
    
    const token = localStorage.getItem('token');
    if (!token) {
      console.error("No auth token found. Please login first.");
      return;
    }
    
    // First fetch report ID 21
    console.log("Fetching Report ID 21...");
    const report21Response = await fetch('http://127.0.0.1:8000/api/laporan/21', {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });
    
    // Now fetch a working report ID (e.g., ID 1) for comparison
    console.log("Fetching working Report ID 1 for comparison...");
    const report1Response = await fetch('http://127.0.0.1:8000/api/laporan/1', {
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
    
    if (!report1Response.ok) {
      console.error(`Error fetching Report ID 1: ${report1Response.status} ${report1Response.statusText}`);
      return;
    }
    
    const report21 = await report21Response.json();
    const report1 = await report1Response.json();
    
    console.log("Report ID 21 data:", report21);
    console.log("Report ID 1 data:", report1);
    
    // Compare structure and fields
    console.log("\n=== Field Comparison ===");
    const report21Fields = Object.keys(report21);
    const report1Fields = Object.keys(report1);
    
    console.log("Fields only in Report 21:", 
      report21Fields.filter(field => !report1Fields.includes(field))
    );
    
    console.log("Fields only in Report 1:", 
      report1Fields.filter(field => !report21Fields.includes(field))
    );
    
    console.log("\n=== Data Type Comparison ===");
    const commonFields = report21Fields.filter(field => report1Fields.includes(field));
    
    const typeDifferences = {};
    commonFields.forEach(field => {
      const type21 = typeof report21[field];
      const type1 = typeof report1[field];
      
      if (type21 !== type1) {
        typeDifferences[field] = {
          "report21Type": type21,
          "report1Type": type1,
          "report21Value": report21[field],
          "report1Value": report1[field]
        };
      }
    });
    
    console.log("Fields with different data types:", typeDifferences);
    
    // Analyze potential validation issues
    console.log("\n=== Potential Validation Issues ===");
    
    // Check for null or undefined values
    const nullFields21 = {};
    report21Fields.forEach(field => {
      if (report21[field] === null || report21[field] === undefined) {
        nullFields21[field] = report21[field];
      }
    });
    
    console.log("Null or undefined fields in Report 21:", nullFields21);
    
    // Check for empty strings
    const emptyFields21 = {};
    report21Fields.forEach(field => {
      if (report21[field] === '') {
        emptyFields21[field] = true;
      }
    });
    
    console.log("Empty string fields in Report 21:", emptyFields21);
    
    // Check for potential date format issues
    const dateFields = ['tanggal_lapor', 'waktu_lapor', 'waktu_respon', 'created_at', 'updated_at'];
    const dateIssues = {};
    
    dateFields.forEach(field => {
      if (report21[field]) {
        try {
          const date = new Date(report21[field]);
          if (isNaN(date.getTime())) {
            dateIssues[field] = report21[field];
          }
        } catch (e) {
          dateIssues[field] = `Error parsing: ${report21[field]}`;
        }
      }
    });
    
    console.log("Potential date format issues in Report 21:", dateIssues);
    
    console.log("\n=== Diagnostic Complete ===");
  } catch (error) {
    console.error("Diagnostic error:", error);
  }
};

// Execute the diagnostic
runDiagnostic();
