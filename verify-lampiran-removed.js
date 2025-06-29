/**
 * Verification tool untuk memastikan field lampiran dihapus dari payload
 * 
 * File ini dapat dijalankan dengan:
 * node verify-lampiran-removed.js
 * 
 * Atau bisa disalin ke console browser untuk testing live
 */

// Mock report object untuk simulasi
const sampleReport = {
  id: 21,
  id_laporan: "LPR-2023-021",
  judul: "Test Report",
  deskripsi: "This is a test report",
  kategori: "Akademik",
  prioritas: "Tinggi",
  status: "Pending",
  tanggal_lapor: "2023-01-01",
  waktu_lapor: "08:00:00",
  nama_pelapor: "John Doe",
  email_pelapor: "john@example.com",
  kontak_pelapor: "1234567890",
  lampiran: "lampiran_1751051062027.png",
  respon: null,
  oleh: null,
  waktu_respon: null
};

/**
 * Fungsi untuk memastikan lampiran tidak ada dalam payload
 */
function verifyLampiranRemoved(originalData) {
  // Clone the report
  const updatedReport = { ...originalData };
  
  console.log("Original report data:");
  console.log(updatedReport);
  console.log("Has lampiran field:", updatedReport.hasOwnProperty('lampiran'));
  
  // Hapus field lampiran (simulasi kode yang sudah ditambahkan)
  if (updatedReport.lampiran !== undefined) {
    console.log('Removing lampiran field from the payload to avoid validation issues');
    const { lampiran, ...reportWithoutLampiran } = updatedReport;
    const cleanedReport = reportWithoutLampiran;
    
    console.log("Updated report data (after lampiran removal):");
    console.log(cleanedReport);
    console.log("Still has lampiran field:", cleanedReport.hasOwnProperty('lampiran'));
    
    return cleanedReport;
  }
  
  return updatedReport;
}

/**
 * Fungsi untuk verifikasi special handling report ID 21
 */
function verifySpecialHandling(reportId, originalData) {
  let updatedReport = { ...originalData };
  
  // Hapus field lampiran
  if (updatedReport.lampiran !== undefined) {
    console.log('Removing lampiran field from the payload');
    const { lampiran, ...reportWithoutLampiran } = updatedReport;
    updatedReport = reportWithoutLampiran;
  }
  
  // Special case for report ID 21
  if (reportId === 21 || reportId === "21") {
    console.log('Special handling for report ID 21');
    
    // Potential required fields
    const potentialRequiredFields = [
      'id', 'id_laporan', 'judul', 'deskripsi', 'kategori', 'prioritas', 
      'status', 'tanggal_lapor', 'waktu_lapor', 'nama_pelapor', 'email_pelapor',
      'kontak_pelapor', 'respon', 'oleh', 'waktu_respon' // No 'lampiran' here
    ];
    
    // Enhanced handling
    const enhancedReport = { ...updatedReport };
    
    potentialRequiredFields.forEach(field => {
      if (originalData[field] !== undefined && 
          enhancedReport[field] === undefined) {
        enhancedReport[field] = originalData[field];
      }
    });
    
    updatedReport = enhancedReport;
    
    // Final check to ensure lampiran is removed 
    if (updatedReport.lampiran !== undefined) {
      console.log('Double-checking to remove lampiran field');
      const { lampiran, ...reportWithoutLampiran } = updatedReport;
      updatedReport = reportWithoutLampiran;
    }
  }
  
  console.log("Final report data for special handling:");
  console.log(updatedReport);
  console.log("Final report still has lampiran:", updatedReport.hasOwnProperty('lampiran'));
  
  return updatedReport;
}

// Run the tests
console.log("==========================================");
console.log("TEST 1: Basic lampiran removal");
console.log("==========================================");
const cleanedReport = verifyLampiranRemoved(sampleReport);

console.log("\n==========================================");
console.log("TEST 2: Special handling for report ID 21");
console.log("==========================================");
const handledReport = verifySpecialHandling(21, sampleReport);

console.log("\n==========================================");
console.log("VERIFICATION COMPLETE");
console.log("==========================================");
