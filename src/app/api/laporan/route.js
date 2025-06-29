// import { NextResponse } from 'next/server';

// /**
//  * API route for handling report submissions
//  * Forwards requests to the LaporanController backend
//  */
// export async function POST(request) {
//   try {
//     const formData = await request.formData();
    
//     // Create a new FormData object to send to the backend
//     const backendFormData = new FormData();
    
//     // Copy all form data fields to the new FormData
//     for (const [key, value] of formData.entries()) {
//       backendFormData.append(key, value);
//     }
    
//     // Forward the request to the PHP backend
//     const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/testing-projek-02-master/php-backend/api/laporan';
    
//     const response = await fetch(apiUrl, {
//       method: 'POST',
//       body: backendFormData,
//       // Don't set Content-Type header, the browser will set it with the boundary
//     });
    
//     // Get the response data
//     const responseData = await response.json();
    
//     // Return the response from the backend
//     return NextResponse.json(responseData, { status: response.status });
    
//   } catch (error) {
//     console.error('Error submitting report:', error);
//     return NextResponse.json(
//       { error: 'Failed to submit report', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * GET method to fetch reports from the backend
//  */
// export async function GET(request) {
//   try {
//     const { searchParams } = new URL(request.url);
//     const status = searchParams.get('status');
//     const id = searchParams.get('id');
    
//     // Base URL for the PHP backend
//     const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost/testing-projek-02-master/php-backend/api/laporan';
    
//     // Build the URL with any query parameters
//     let apiUrl = baseUrl;
//     if (id) {
//       apiUrl += `/${id}`;
//     } else if (status) {
//       apiUrl += `?status=${status}`;
//     }
    
//     // Fetch data from the backend
//     const response = await fetch(apiUrl, {
//       headers: {
//         'Content-Type': 'application/json',
//       },
//     });
    
//     // Get the response data
//     const responseData = await response.json();
    
//     // Return the response from the backend
//     return NextResponse.json(responseData, { status: response.status });
    
//   } catch (error) {
//     console.error('Error fetching reports:', error);
//     return NextResponse.json(
//       { error: 'Failed to fetch reports', details: error.message },
//       { status: 500 }
//     );
//   }
// }

// /**
//  * PATCH method to update report status and responses
//  */
// export async function PATCH(request) {
//   try {
//     const data = await request.json();
//     const { id, status, respon, oleh } = data;
    
//     if (!id) {
//       return NextResponse.json(
//         { error: 'Report ID is required' },
//         { status: 400 }
//       );
//     }
    
//     // Base URL for the PHP backend
//     const apiUrl = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost/testing-projek-02-master/php-backend/api/laporan'}/${id}`;
    
//     // Send PATCH request to backend
//     const response = await fetch(apiUrl, {
//       method: 'PATCH',
//       headers: {
//         'Content-Type': 'application/json',
//       },
//       body: JSON.stringify({ status, respon, oleh }),
//     });
    
//     // Get the response data
//     const responseData = await response.json();
    
//     // Return the response from the backend
//     return NextResponse.json(responseData, { status: response.status });
    
//   } catch (error) {
//     console.error('Error updating report:', error);
//     return NextResponse.json(
//       { error: 'Failed to update report', details: error.message },
//       { status: 500 }
//     );
//   }
// }
