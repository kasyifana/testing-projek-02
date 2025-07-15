'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, AlertCircle, Loader2 } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

const getStatusColor = (status) => {
  const colors = {
    'Pending': 'bg-gray-500',
    'Diproses': 'bg-yellow-500',
    'Ditanggapi': 'bg-blue-500',
    'Selesai': 'bg-green-500',
    'Ditolak': 'bg-red-500'
  };
  return colors[status] || 'bg-gray-500';
};

const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function History() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [selectedReport, setSelectedReport] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Fetch user ID from local storage
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      console.log('Found user ID in localStorage:', storedUserId);
      setUserId(storedUserId);
    } else {
      console.warn('No user ID found in localStorage');
      // Try to fetch user profile to get ID
      fetchUserProfile();
    }
  }, []);

  // Fetch user profile if userId not in localStorage
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage. User may need to log in.');
        setError('Silakan login terlebih dahulu untuk melihat riwayat laporan');
        setLoading(false);
        return;
      }
      
      const response = await fetch('https://laravel.kasyifana.my.id/api/profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        mode: 'cors'
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile loaded:', userData);
        
        // Extract user ID from the response
        let foundUserId = null;
        
        // Check common API response structures for user ID
        if (userData.id) {
          foundUserId = userData.id;
        } else if (userData.user && userData.user.id) {
          foundUserId = userData.user.id;
        } else if (userData.data && userData.data.id) {
          foundUserId = userData.data.id;
        } else if (userData.data && userData.data.user && userData.data.user.id) {
          foundUserId = userData.data.user.id;
        }
        
        if (foundUserId) {
          console.log('✅ Found user ID:', foundUserId);
          setUserId(foundUserId);
          localStorage.setItem('user_id', foundUserId.toString());
          
          // Now fetch reports with the user ID
          fetchReports(foundUserId);
        } else {
          console.error('Could not find user ID in profile response');
          setError('Tidak dapat menemukan ID pengguna. Silakan login kembali.');
          setLoading(false);
        }
      } else {
        console.error('Failed to load user profile:', response.status);
        setError('Gagal memuat profil pengguna. Silakan login kembali.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Terjadi kesalahan saat memuat profil pengguna');
      setLoading(false);
    }
  };

  // Fetch reports once we have the user ID
  useEffect(() => {
    if (userId) {
      fetchReports(userId);
    }
  }, [userId]);

  const fetchReports = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
      }

      // The Laravel API doesn't have a /laporan/user/{id} endpoint
      // Instead, we'll query all reports and filter by user_id on the client
      const apiUrl = `https://laravel.kasyifana.my.id/api/laporan`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        mode: 'cors'
      });

      if (!response.ok) {
        // If it's a 404, we'll try a fallback approach
        if (response.status === 404) {
          console.warn('The API endpoint returned 404, trying with direct URL...');
          
          // Try a different format of the API URL as fallback
          const fallbackUrl = 'https://laravel.kasyifana.my.id/api/laporan';
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              // Add CORS headers for direct access
              'Origin': window.location.origin
            },
            mode: 'cors'
          });
          
          if (fallbackResponse.ok) {
            return await fallbackResponse.json();
          }
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Safely handle JSON parsing
      let data;
      try {
        data = await response.json();
        console.log('Reports fetched successfully:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Failed to parse server response');
      }
      
      // Handle different API response formats
      let reportData = [];
      if (Array.isArray(data)) {
        reportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        // Try to extract data from various common formats
        if (typeof data === 'object' && data !== null) {
          // If data is an object, check common fields
          const possibleDataFields = Object.keys(data).filter(key => 
            Array.isArray(data[key]) && data[key].length > 0 && 
            typeof data[key][0] === 'object'
          );
          
          if (possibleDataFields.length > 0) {
            reportData = data[possibleDataFields[0]];
            console.log('Found data in field:', possibleDataFields[0]);
          } else {
            // If no arrays found, look for objects with report-like properties
            if (data.judul || data.title || data.id) {
              reportData = [data]; // Single report object
              console.log('Found a single report object');
            }
          }
        }
      }
      
      console.log('Processed report data:', reportData);
      
      // Filter reports for the current user
      const userReports = reportData.filter(report => {
        // Only process actual objects
        if (!report || typeof report !== 'object') return false;
        
        // Handle different field naming conventions
        const reportUserId = report.user_id || report.userId || report.pengguna_id;
        
        // Skip if no user ID field found
        // if (reportUserId === undefined) {
        //   console.warn('Report missing user_id field:', report);
        //   return false;
        // }
        
        // Compare as strings to avoid type mismatches
        return String(reportUserId) === String(id);
      });
      
      // Ensure each report has a unique id or generate one if missing
      const reportsWithIds = userReports.map((report, index) => {
        if (!report.id) {
          return { ...report, id: `generated-${index}` };
        }
        return report;
      });
      
      console.log(`Filtered ${userReports.length} reports for user ID ${id} out of ${reportData.length} total reports`);
      
      setReports(reportsWithIds);
      setError(null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(`Gagal mengambil data laporan: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Laporan Saya</h1>
      
      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat riwayat laporan...</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && reports.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Anda belum memiliki laporan</p>
          <Button className="mt-4" variant="outline" onClick={() => window.location.href = '/user/create-report'}>
            Buat Laporan Baru
          </Button>
        </div>
      )}
      
      {/* Reports list */}
      {!loading && !error && reports.length > 0 && (
        <div className="space-y-4">
          {reports.map((report, index) => (
            <Card key={report.id || `report-${index}`} className="p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold text-lg">{report.judul}</h3>
                  <p className="text-sm text-gray-500">
                    {report.kategori} • {formatDate(report.tanggal_lapor)}
                  </p>
                </div>
                <Badge className={getStatusColor(report.status)}>
                  {report.status}
                </Badge>
              </div>
              
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Tanggapan:</span> {report.respon || 'Belum ada tanggapan'}
                </p>
              </div>
              
              <div className="mt-4 flex justify-end">
                <Button variant="outline" size="sm" onClick={() => viewReportDetails(report)}>
                  <Eye className="h-4 w-4 mr-2" />
                  Lihat Detail
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      
      {/* Report detail dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedReport && (
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>{selectedReport.judul}</DialogTitle>
              <div className="flex flex-col gap-2 mt-1.5">
                <Badge className={getStatusColor(selectedReport.status)} variant="secondary">
                  {selectedReport.status}
                </Badge>
                <DialogDescription className="mt-1">
                  Kategori: {selectedReport.kategori} • Prioritas: {selectedReport.prioritas || 'Normal'}
                </DialogDescription>
              </div>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Deskripsi Laporan:</h4>
                <p className="mt-1 text-sm">{selectedReport.deskripsi}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Tanggal Laporan:</h4>
                <p className="mt-1 text-sm">{formatDate(selectedReport.tanggal_lapor)}</p>
              </div>
              
              <div>
                <h4 className="text-sm font-medium">Tanggapan Admin:</h4>
                <p className="mt-1 text-sm">{selectedReport.respon || 'Belum ada tanggapan'}</p>
              </div>
              
              {selectedReport.lampiran && (
                <div>
                  <h4 className="text-sm font-medium">Lampiran:</h4>
                  <div className="mt-2">
                    {(() => {
                      // Get the correct URL for the attachment - improved with better fallbacks
                      let attachmentUrl;
                      const attachmentPath = selectedReport.lampiran;
                      
                      console.log('Raw attachment path:', attachmentPath);
                      
                      // Handle Laravel paths that include public/uploads
                      if (attachmentPath.includes('public/uploads/')) {
                        // Extract just the filename from the full path
                        const fileName = attachmentPath.split('/').pop();
                        attachmentUrl = `/uploads/${fileName}`;
                        console.log('Extracted filename from public/uploads path:', attachmentUrl);
                      }
                      // Case 1: Path already has a URL structure with /uploads/ or /storage/
                      else if (attachmentPath.includes('/uploads/') || attachmentPath.includes('/storage/')) {
                        attachmentUrl = attachmentPath;
                        console.log('Using full path as is:', attachmentUrl);
                      }
                      // Case 2: Path already includes lampiran/ prefix
                      else if (attachmentPath.startsWith('lampiran/')) {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                        console.log('Using uploads/lampiran path:', attachmentUrl);
                      }
                      // Case 3: Path might be a filename with lampiran_ prefix (local uploads)
                      else if (attachmentPath.startsWith('lampiran_')) {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                        console.log('Using uploads/lampiran_ prefix path:', attachmentUrl);
                      }
                      // Case 4: Default fallback - just use uploads directory
                      else {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                        console.log('Using default uploads path:', attachmentUrl);
                      }
                      
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentPath);
                      
                      if (isImage) {
                        return (
                          <img 
                            src={attachmentUrl} 
                            alt="Lampiran" 
                            className="max-h-40 rounded-md"
                            onError={(e) => {
                              console.log('Error loading image, trying alternative paths');
                              // Try multiple potential paths in sequence
                              const src = e.target.src;
                              const fileName = selectedReport.lampiran.split('/').pop(); // Get just the filename
                              
                              // If we're dealing with a 'public/uploads/' path
                              if (selectedReport.lampiran.includes('public/uploads/')) {
                                // Just use direct uploads path with the filename
                                console.log('Fixing public/uploads path by using direct filename:', `/uploads/${fileName}`);
                                e.target.src = `/uploads/${fileName}`;
                                return;
                              }
                              
                              // Path 1: Try direct uploads path with just filename (most reliable)
                              if (!src.includes(`/uploads/${fileName}`)) {
                                console.log('Attempting direct filename path:', `/uploads/${fileName}`);
                                e.target.src = `/uploads/${fileName}`;
                                return;
                              }
                              
                              // Path 2: Try Laravel storage path as fallback
                              if (!src.includes('/storage/')) {
                                const storagePath = `/storage/${fileName}`;
                                console.log('Attempting storage path with filename:', storagePath);
                                e.target.src = storagePath;
                                return;
                              }
                              
                              // Path 3: If all else fails, show an error placeholder
                              e.target.onerror = null; // Prevent infinite loop
                              e.target.src = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24'%3E%3Cpath fill='%23999' d='M19.5 3h-15A1.5 1.5 0 003 4.5v15A1.5 1.5 0 004.5 21h15a1.5 1.5 0 001.5-1.5v-15A1.5 1.5 0 0019.5 3zm-15 16.5v-15h15v15h-15z'/%3E%3Cpath fill='%23999' d='M12 16.5a1.5 1.5 0 100-3 1.5 1.5 0 000 3zm0-9a1.5 1.5 0 00-1.5 1.5v3a1.5 1.5 0 003 0v-3A1.5 1.5 0 0012 7.5z'/%3E%3C/svg%3E";
                              console.log('All image loading attempts failed, showing placeholder');
                            }}
                          />
                        );
                      } else {
                        return (
                          <a 
                            href={attachmentUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 underline text-sm"
                          >
                            Buka Lampiran
                          </a>
                        );
                      }
                    })()}
                  </div>
                </div>
              )}
            </div>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Tutup
              </Button>
            </DialogFooter>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
