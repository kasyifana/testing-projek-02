'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertOctagon, Clock, CheckCircle, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { useRouter } from 'next/navigation';

// Calculate days overdue from date string
const calculateDaysOverdue = (dateString) => {
  const reportDate = new Date(dateString);
  const today = new Date();
  const diffTime = Math.abs(today - reportDate);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

// Format date to locale string
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function WarningsPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [warnings, setWarnings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedWarning, setSelectedWarning] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [stats, setStats] = useState({
    critical: 0,
    high: 0,
    medium: 0
  });

  useEffect(() => {
    fetchWarnings();
  }, []);

  const fetchWarnings = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      // Fetch all reports
      const apiUrl = `/api/proxy?endpoint=laporan`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
            const data = await fallbackResponse.json();
            processReportsData(data);
            return;
          }
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Safely handle JSON parsing
      let data;
      try {
        data = await response.json();
        console.log('Reports fetched successfully:', data);
        processReportsData(data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(`Gagal mengambil data laporan: ${error.message}`);
      setLoading(false);
    }
  };

  const processReportsData = (data) => {
    try {
      // Extract reports data from different possible response formats
      let reportData = [];
      if (Array.isArray(data)) {
        reportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        if (typeof data === 'object' && data !== null) {
          const possibleDataFields = Object.keys(data).filter(key => 
            Array.isArray(data[key]) && data[key].length > 0 && 
            typeof data[key][0] === 'object'
          );
          
          if (possibleDataFields.length > 0) {
            reportData = data[possibleDataFields[0]];
          }
        }
      }
      
      console.log('Processing report data for warnings:', reportData);
      
      // Filter reports that need attention
      const warningsData = reportData
        .filter(report => {
          // Common date field names
          const dateField = report.tanggal_lapor || report.created_at || report.timestamp || report.tanggal;
          if (!dateField) return false;
          
          // Calculate days since report was created
          const daysOverdue = calculateDaysOverdue(dateField);
          
          // Check report status - needs attention if pending or not handled in time
          const status = report.status ? report.status.toLowerCase() : "";
          
          const needsAttention = 
            status === "pending" || 
            status === "diproses" || 
            (status !== "selesai" && status !== "ditanggapi" && daysOverdue > 2) ||
            (status === "diproses" && daysOverdue > 5);
            
          return needsAttention;
        })
        .map(report => {
          // Common date field names
          const dateField = report.tanggal_lapor || report.created_at || report.timestamp || report.tanggal;
          const daysOverdue = calculateDaysOverdue(dateField);
          
          // Map status to our warning status types
          let status = "unresolved";
          if (report.status) {
            const reportStatus = report.status.toLowerCase();
            if (reportStatus === "selesai") status = "resolved";
            else if (reportStatus === "diproses" || reportStatus === "ditanggapi") status = "in-progress";
          }
          
          // Determine priority based on category, days overdue, and status
          let priority = "medium";
          
          // Critical if it's related to safety/harassment or very overdue
          if (
            (report.kategori && 
             (report.kategori.toLowerCase().includes("pelecehan") || 
              report.kategori.toLowerCase().includes("keselamatan"))) ||
            daysOverdue > 7
          ) {
            priority = "critical";
          } 
          // High if moderately overdue or specific categories
          else if (
            daysOverdue > 4 || 
            (report.kategori && report.kategori.toLowerCase().includes("fasilitas"))
          ) {
            priority = "high";
          }
          
          // Generate warning title based on situation
          let title = "Laporan Perlu Perhatian";
          if (daysOverdue > 7) title = "Laporan Sangat Terlambat Ditangani";
          else if (daysOverdue > 4) title = "Laporan Terlambat Ditangani";
          else if (status === "unresolved") title = "Laporan Belum Ditangani";
          else if (report.kategori && report.kategori.toLowerCase().includes("pelecehan")) {
            title = "Eskalasi Diperlukan";
          }
          
          // Create warning object
          return {
            id: report.id,
            title: title,
            reportId: `REP-${report.id}`,
            category: report.kategori || "Umum",
            createdAt: dateField,
            daysOverdue: daysOverdue,
            priority: priority,
            status: status,
            details: report.deskripsi || report.judul || "Tidak ada detail",
            // Include original report data for reference
            reportData: report
          };
        });
      
      // Sort warnings by priority and days overdue
      warningsData.sort((a, b) => {
        const priorityValues = { "critical": 3, "high": 2, "medium": 1 };
        if (priorityValues[b.priority] !== priorityValues[a.priority]) {
          return priorityValues[b.priority] - priorityValues[a.priority];
        }
        return b.daysOverdue - a.daysOverdue;
      });
      
      // Count warnings by priority
      const statsData = {
        critical: warningsData.filter(w => w.priority === "critical").length,
        high: warningsData.filter(w => w.priority === "high").length,
        medium: warningsData.filter(w => w.priority === "medium").length
      };
      
      console.log(`Generated ${warningsData.length} warnings:`, statsData);
      
      setWarnings(warningsData);
      setStats(statsData);
      setError(null);
    } catch (error) {
      console.error('Error processing report data:', error);
      setError('Terjadi kesalahan saat memproses data laporan');
    } finally {
      setLoading(false);
    }
  };

  const handleViewDetail = (warning) => {
    setSelectedWarning(warning);
    setDialogOpen(true);
  };

  const handleProcessWarning = (warning) => {
    router.push(`/admin/reports?id=${warning.reportId.replace('REP-', '')}`);
  };

  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'critical':
        return 'border-red-300 bg-red-50';
      case 'high':
        return 'border-orange-300 bg-orange-50';
      default:
        return 'border-yellow-300 bg-yellow-50';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'resolved':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in-progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      default:
        return <AlertOctagon className="w-5 h-5 text-red-500" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Peringatan Sistem</h1>
        <div className="flex gap-2">
          {stats.critical > 0 && (
            <Badge variant="outline" className="bg-red-50">
              <AlertOctagon className="w-4 h-4 mr-1 text-red-500" />
              Critical: {stats.critical}
            </Badge>
          )}
          {stats.high > 0 && (
            <Badge variant="outline" className="bg-orange-50">
              <AlertTriangle className="w-4 h-4 mr-1 text-orange-500" />
              High: {stats.high}
            </Badge>
          )}
          {stats.medium > 0 && (
            <Badge variant="outline" className="bg-yellow-50">
              <AlertTriangle className="w-4 h-4 mr-1 text-yellow-500" />
              Medium: {stats.medium}
            </Badge>
          )}
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat peringatan sistem...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && warnings.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Tidak ada peringatan yang perlu diperhatikan</p>
        </div>
      )}

      {/* Warnings list */}
      {!loading && !error && warnings.length > 0 && (
        <div className="grid gap-4">
          {warnings.map((warning, index) => (
            <Card key={warning.id || `warning-${index}`} className={`p-4 border-l-4 ${getPriorityStyles(warning.priority)}`}>
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(warning.status)}
                    <h3 className="text-lg font-semibold">{warning.title}</h3>
                  </div>
                  <p className="text-sm text-gray-600">{warning.details}</p>
                  <div className="flex gap-2 text-sm flex-wrap">
                    <span className="text-gray-500">Report ID: {warning.reportId}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Kategori: {warning.category}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-gray-500">Tanggal: {formatDate(warning.createdAt)}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-red-500">
                      Terlambat: {warning.daysOverdue} hari
                    </span>
                  </div>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleViewDetail(warning)}
                >
                  Lihat Detail
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Detail Dialog */}
      {selectedWarning && (
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                {getStatusIcon(selectedWarning.status)}
                {selectedWarning.title}
              </DialogTitle>
              <DialogDescription className="pt-2">
                Prioritas: {
                  selectedWarning.priority === 'critical' ? 'Kritis' :
                  selectedWarning.priority === 'high' ? 'Tinggi' :
                  'Sedang'
                }
              </DialogDescription>
              <div className={`mt-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                selectedWarning.priority === 'critical' ? 'bg-red-100 text-red-700' :
                selectedWarning.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                'bg-yellow-100 text-yellow-700'
              }`}>
                Prioritas: {
                  selectedWarning.priority === 'critical' ? 'Kritis' :
                  selectedWarning.priority === 'high' ? 'Tinggi' :
                  'Sedang'
                }
              </div>
            </DialogHeader>

            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium">Detail Laporan:</h4>
                <p className="mt-1 text-sm">{selectedWarning.details}</p>
              </div>
              
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h4 className="text-sm font-medium">ID Laporan:</h4>
                  <p className="mt-1 text-sm">{selectedWarning.reportId}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Kategori:</h4>
                  <p className="mt-1 text-sm">{selectedWarning.category}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Tanggal Laporan:</h4>
                  <p className="mt-1 text-sm">{formatDate(selectedWarning.createdAt)}</p>
                </div>
                <div>
                  <h4 className="text-sm font-medium">Terlambat:</h4>
                  <p className="mt-1 text-sm text-red-500">{selectedWarning.daysOverdue} hari</p>
                </div>
              </div>
              
              {selectedWarning.reportData && selectedWarning.reportData.lampiran && (
                <div>
                  <h4 className="text-sm font-medium">Lampiran:</h4>
                  <div className="mt-2">
                    {(() => {
                      const attachmentPath = selectedWarning.reportData.lampiran;
                      let attachmentUrl;
                      
                      if (attachmentPath.includes('public/uploads/')) {
                        const fileName = attachmentPath.split('/').pop();
                        attachmentUrl = `/uploads/${fileName}`;
                      } else if (attachmentPath.includes('/uploads/') || attachmentPath.includes('/storage/')) {
                        attachmentUrl = attachmentPath;
                      } else if (attachmentPath.startsWith('lampiran/')) {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                      } else if (attachmentPath.startsWith('lampiran_')) {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                      } else {
                        attachmentUrl = `/uploads/${attachmentPath}`;
                      }
                      
                      const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentPath);
                      
                      if (isImage) {
                        return (
                          <img 
                            src={attachmentUrl} 
                            alt="Lampiran" 
                            className="max-h-40 rounded-md"
                            onError={(e) => {
                              // Try alternative paths if initial load fails
                              const fileName = selectedWarning.reportData.lampiran.split('/').pop();
                              e.target.src = `/uploads/${fileName}`;
                              e.target.onerror = () => {
                                e.target.src = `/storage/${fileName}`;
                                e.target.onerror = null;
                              };
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
              <Button 
                variant="outline" 
                onClick={() => setDialogOpen(false)}
              >
                Tutup
              </Button>
              {selectedWarning.status !== 'in-progress' && (
                <Button 
                  onClick={() => handleProcessWarning(selectedWarning)}
                  variant="default"
                >
                  Proses Sekarang
                </Button>
              )}
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
