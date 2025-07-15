import { generateSummary } from '@/ai/groq';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    // Get authorization from request headers
    const authHeader = request.headers.get('authorization');
    
    if (!authHeader) {
      return NextResponse.json({ error: 'Authorization header is required' }, { status: 401 });
    }

    // Fetch reports from Laravel API (similar to proxy logic)
    const apiUrl = 'https://laravel.kasyifana.my.id/api/laporan';
    const headers = {
      'Accept': 'application/json',
      'Authorization': authHeader,
    };

    // Forward the request to the Laravel API
    const response = await fetch(apiUrl, {
      method: 'GET',
      headers: headers,
    });

    // Handle error responses (similar to proxy error handling)
    if (!response.ok) {
      console.error(`API Error: ${response.status} ${response.statusText}`);
      
      // Try to get detailed error information
      let errorDetails = '';
      try {
        const errorText = await response.text();
        console.error('Error response content:', errorText);
        
        try {
          // Try parsing as JSON
          const errorJson = JSON.parse(errorText);
          errorDetails = errorJson.message || errorJson.error || JSON.stringify(errorJson);
        } catch {
          // Not JSON, use text
          errorDetails = errorText.substring(0, 100) + (errorText.length > 100 ? '...' : '');
        }
      } catch (e) {
        console.error('Could not read error response:', e);
      }
      
      return NextResponse.json(
        { 
          error: response.statusText,
          details: errorDetails,
          status: response.status
        },
        { status: response.status }
      );
    }

    // Get the successful response
    const data = await response.json();
    const reports = Array.isArray(data.data) ? data.data : [];

    if (!reports || reports.length === 0) {
      return NextResponse.json({ summary: 'Tidak ada laporan yang tersedia untuk diringkas saat ini.' });
    }

    // Create a concise text representation of the reports for the AI prompt
    const reportTexts = reports.map(r => 
      `Judul: ${r.judul}, Deskripsi: ${r.deskripsi}, Kategori: ${r.kategori || 'N/A'}`
    ).join('\n---\n');

    const prompt = `
      Anda adalah asisten AI yang bertugas menganalisis laporan dari platform "LaporKampus".
      Berdasarkan daftar laporan berikut, berikan ringkasan eksekutif singkat (2-3 kalimat) yang menyoroti isu-isu yang paling sering muncul atau paling kritis.
      Fokus pada identifikasi tren atau masalah berulang. Jangan daftar setiap laporan.
      Gunakan Bahasa Indonesia.

      Berikut adalah data laporannya:
      ---
      ${reportTexts}
      ---

      Ringkasan Eksekutif:
    `;

    const summary = await generateSummary(prompt);

    return NextResponse.json({ summary });

  } catch (error) {
    console.error('[AI_SUMMARY_ERROR]', error);
    return NextResponse.json(
      { error: error.message || 'Failed to generate summary' },
      { status: 500 }
    );
  }
}
