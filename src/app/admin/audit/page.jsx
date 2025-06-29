'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Filter, 
  Download, 
  FileText, 
  File, 
  Database,
  AlertCircle,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";

// Helper function to format date
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

export default function AuditLog() {
  const { toast } = useToast();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    category: "",
    date: "",
    urgency: "",
  });
  const [filteredLogs, setFilteredLogs] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);
  
  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [totalPages, setTotalPages] = useState(0);
  const [paginatedLogs, setPaginatedLogs] = useState([]);

  // Fetch logs when component mounts
  useEffect(() => {
    fetchAllLogs();
  }, []);

  // Apply filters when filters change
  useEffect(() => {
    if (logs.length > 0) {
      applyFilters();
    }
  }, [filters, logs]);

  // Update pagination when filtered logs or pagination settings change
  useEffect(() => {
    handlePaginationUpdate();
  }, [filteredLogs, currentPage, itemsPerPage]);

  const fetchAllLogs = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      // Using the same endpoint approach as in the history page
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
          const fallbackUrl = 'http://127.0.0.1:8000/api/laporan';
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
            processResponseData(data);
            return;
          }
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Safely handle JSON parsing
      let data;
      try {
        data = await response.json();
        console.log('Logs fetched successfully:', data);
        processResponseData(data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Failed to parse server response');
      }
    } catch (error) {
      console.error('Error fetching logs:', error);
      setError(`Gagal mengambil data log: ${error.message}`);
      setLoading(false);
    }
  };

  const processResponseData = (data) => {
    // Handle different API response formats
    let logData = [];
    if (Array.isArray(data)) {
      logData = data;
    } else if (data.data && Array.isArray(data.data)) {
      logData = data.data;
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
          logData = data[possibleDataFields[0]];
          console.log('Found data in field:', possibleDataFields[0]);
        } else {
          // If no arrays found, look for objects with report-like properties
          if (data.id) {
            logData = [data]; // Single log object
            console.log('Found a single log object');
          }
        }
      }
    }
    
    // Ensure each log has a unique id
    const logsWithIds = logData.map((log, index) => {
      if (!log.id) {
        return { ...log, id: `generated-${index}` };
      }
      return log;
    });
    
    console.log(`Total logs fetched: ${logsWithIds.length}`);
    
    setLogs(logsWithIds);
    setFilteredLogs(logsWithIds);
    setError(null);
    setLoading(false);
  };

  const applyFilters = () => {
    setIsFiltering(true);
    
    let filtered = [...logs];
    
    // Apply category filter
    if (filters.category) {
      filtered = filtered.filter(log => log.kategori === filters.category);
    }
    
    // Apply urgency filter
    if (filters.urgency) {
      filtered = filtered.filter(log => {
        // Handle different naming conventions for urgency/priority
        const priority = log.prioritas || log.urgency || log.priority;
        
        // Map urgency values if needed
        const urgencyMap = {
          'high': ['Tinggi', 'High', 'high'],
          'medium': ['Sedang', 'Medium', 'medium'],
          'low': ['Rendah', 'Low', 'low']
        };
        
        if (urgencyMap[filters.urgency]) {
          return urgencyMap[filters.urgency].includes(priority);
        }
        
        return String(priority).toLowerCase() === filters.urgency.toLowerCase();
      });
    }
    
    // Apply date filter
    if (filters.date) {
      const filterDate = new Date(filters.date);
      filterDate.setHours(0, 0, 0, 0); // Start of the day
      
      filtered = filtered.filter(log => {
        // Handle different date field names
        const dateFields = ['tanggal', 'tanggal_lapor', 'created_at', 'timestamp'];
        
        for (const field of dateFields) {
          if (log[field]) {
            const logDate = new Date(log[field]);
            logDate.setHours(0, 0, 0, 0); // Start of the day
            
            if (logDate.getTime() === filterDate.getTime()) {
              return true;
            }
          }
        }
        
        return false;
      });
    }
    
    setFilteredLogs(filtered);
    setCurrentPage(1); // Reset to first page when filters change
    setIsFiltering(false);
  };
  
  // Handle pagination
  const handlePaginationUpdate = () => {
    const total = Math.ceil(filteredLogs.length / itemsPerPage);
    setTotalPages(total);
    
    // Ensure current page is valid
    if (currentPage > total) {
      setCurrentPage(Math.max(1, total));
    }
    
    // Get current page items
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const currentItems = filteredLogs.slice(startIndex, endIndex);
    
    setPaginatedLogs(currentItems);
  };
  
  const goToFirstPage = () => setCurrentPage(1);
  const goToPreviousPage = () => setCurrentPage(prev => Math.max(1, prev - 1));
  const goToNextPage = () => setCurrentPage(prev => Math.min(totalPages, prev + 1));
  const goToLastPage = () => setCurrentPage(totalPages);
  
  const handleItemsPerPageChange = (e) => {
    setItemsPerPage(Number(e.target.value));
    setCurrentPage(1); // Reset to first page when items per page changes
  };

  const updatePagination = () => {
    const total = filteredLogs.length;
    const pages = Math.ceil(total / itemsPerPage);
    
    setTotalPages(pages);
    
    // Calculate paginated logs
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    
    setPaginatedLogs(filteredLogs.slice(start, end));
  };

  const handleApplyFilter = () => {
    applyFilters();
  };

  const handleResetFilter = () => {
    // Reset all filters
    setFilters({
      category: "",
      date: "",
      urgency: "",
    });
    
    // Reset the UI elements
    const dateInput = document.querySelector('input[type="date"]');
    if (dateInput) dateInput.value = '';
    
    // Update filtered logs with all logs
    setFilteredLogs(logs);
    setCurrentPage(1);
    console.log('Filters reset');
    
    // Show notification
    toast({
      title: "Filter direset",
      description: "Semua filter telah dihapus",
      variant: "default"
    });
  };

  const handleExportPDF = () => {
    // Check if there's data to export
    if (filteredLogs.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    // Format current date for filename
    const date = new Date();
    const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
    
    try {
      // Create a link element to download the file
      const link = document.createElement('a');
      
      // Generate basic HTML for PDF content
      const html = `
        <!DOCTYPE html>
        <html>
        <head>
          <title>Laporan Audit Log - ${formattedDate}</title>
          <style>
            body { font-family: Arial, sans-serif; }
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            h2 { text-align: center; }
            .header { display: flex; justify-content: space-between; }
            .date { text-align: right; }
          </style>
        </head>
        <body>
          <h2>Laporan Audit Log</h2>
          <p class="date">Diekspor pada: ${new Date().toLocaleDateString('id-ID')} ${new Date().toLocaleTimeString('id-ID')}</p>
          
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Judul</th>
                <th>User ID</th>
                <th>Kategori</th>
                <th>Status</th>
                <th>Tanggal</th>
              </tr>
            </thead>
            <tbody>
              ${filteredLogs.map(log => `
                <tr>
                  <td>${log.id}</td>
                  <td>${log.judul || '-'}</td>
                  <td>${log.user_id || log.userId || 'N/A'}</td>
                  <td>${log.kategori || 'N/A'}</td>
                  <td>${log.status || 'N/A'}</td>
                  <td>${formatDate(log.tanggal_lapor || log.created_at || log.timestamp || new Date())}</td>
                </tr>
              `).join('')}
            </tbody>
          </table>
        </body>
        </html>
      `;
      
      // Set up the download link with HTML content
      const blob = new Blob([html], { type: 'application/pdf' });
      link.href = URL.createObjectURL(blob);
      link.download = `audit_log_${formattedDate}.html`;
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // Note: For actual PDF conversion, you would typically use a library like jsPDF
      // This approach generates HTML that can be opened in a browser and printed as PDF
      console.log('PDF export triggered');
      
      // Show success message
      toast({
        title: "Ekspor Berhasil",
        description: "Data berhasil diekspor. Buka file dengan browser dan gunakan fungsi print untuk menyimpan sebagai PDF.",
        variant: "default"
      });
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      toast({
        title: "Ekspor Gagal",
        description: "Terjadi kesalahan saat mengekspor data ke PDF",
        variant: "destructive"
      });
    }
  };

  const handleExportExcel = () => {
    // Check if there's data to export
    if (filteredLogs.length === 0) {
      toast({
        title: "Tidak ada data",
        description: "Tidak ada data untuk diekspor",
        variant: "destructive"
      });
      return;
    }

    try {
      // Format current date for filename
      const date = new Date();
      const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
      
      // Prepare CSV content with headers
      let csvContent = "data:text/csv;charset=utf-8,";
      csvContent += "ID,Judul,User ID,Kategori,Status,Tanggal\n";
      
      // Add data rows
      filteredLogs.forEach(log => {
        // Format each field and handle commas within the data
        const id = `"${log.id}"`;
        const title = log.judul ? `"${log.judul.replace(/"/g, '""')}"` : '"-"';
        const userId = log.user_id || log.userId ? `"${log.user_id || log.userId}"` : '"N/A"';
        const category = log.kategori ? `"${log.kategori.replace(/"/g, '""')}"` : '"N/A"';
        const status = log.status ? `"${log.status.replace(/"/g, '""')}"` : '"N/A"';
        const date = `"${formatDate(log.tanggal_lapor || log.created_at || log.timestamp || new Date())}"`;
        
        csvContent += `${id},${title},${userId},${category},${status},${date}\n`;
      });
      
      // Create a link element to download the file
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement("a");
      link.setAttribute("href", encodedUri);
      link.setAttribute("download", `audit_log_${formattedDate}.csv`);
      
      // Trigger the download
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      console.log('Excel/CSV export complete');
      toast({
        title: "Ekspor Berhasil",
        description: "Data berhasil diekspor ke Excel/CSV",
        variant: "default"
      });
    } catch (err) {
      console.error('Error exporting to Excel:', err);
      toast({
        title: "Ekspor Gagal",
        description: "Terjadi kesalahan saat mengekspor data ke Excel",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Audit Log</h1>
        <div className="flex items-center gap-2">
          {/* Export & Backup Actions */}
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Export Data
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export Data</DialogTitle>
                <DialogDescription>
                  Pilih format export untuk data laporan
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Export Laporan</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 flex-1"
                      onClick={handleExportPDF}
                    >
                      <File className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2 flex-1"
                      onClick={handleExportExcel}
                    >
                      <FileText className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </Card>
              </div>
            </DialogContent>
          </Dialog>

          <Button variant="outline" className="flex items-center gap-2">
            <Filter className="w-4 h-4" />
            Filter
          </Button>
        </div>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Select onValueChange={(value) => setFilters({ ...filters, category: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Kategori" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="fasilitas">Fasilitas</SelectItem>
              <SelectItem value="akademik">Akademik</SelectItem>
              <SelectItem value="keuangan">Keuangan</SelectItem>
            </SelectContent>
          </Select>

          <Select onValueChange={(value) => setFilters({ ...filters, urgency: value })}>
            <SelectTrigger>
              <SelectValue placeholder="Urgensi" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="high">Tinggi</SelectItem>
              <SelectItem value="medium">Sedang</SelectItem>
              <SelectItem value="low">Rendah</SelectItem>
            </SelectContent>
          </Select>

          <Input type="date" placeholder="Tanggal" 
            onChange={(e) => setFilters({ ...filters, date: e.target.value })}
          />

          <div className="flex gap-2">
            <Button onClick={handleApplyFilter} disabled={isFiltering} className="flex-1">
              Terapkan Filter
            </Button>
            <Button 
              onClick={handleResetFilter} 
              variant="outline" 
              disabled={isFiltering || (!filters.category && !filters.date && !filters.urgency)}
              className="flex-1"
            >
              Reset Filter
            </Button>
          </div>
        </div>
      </Card>

      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data log...</p>
        </div>
      )}

      {/* Empty state */}
      {!loading && !error && filteredLogs.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Tidak ada data log yang tersedia</p>
        </div>
      )}

      {/* Logs table */}
      {!loading && !error && filteredLogs.length > 0 && (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Judul</TableHead>
                <TableHead>User ID</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tanggal</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="font-mono">{log.id}</TableCell>
                  <TableCell>{log.judul}</TableCell>
                  <TableCell>{log.user_id || log.userId || 'N/A'}</TableCell>
                  <TableCell>{log.kategori || 'N/A'}</TableCell>
                  <TableCell>{log.status || 'N/A'}</TableCell>
                  <TableCell>{formatDate(log.tanggal_lapor || log.created_at || log.timestamp || new Date())}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* Pagination */}
      {!loading && !error && filteredLogs.length > 0 && (
        <div className="flex justify-between items-center py-4 px-4 border-t">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-muted-foreground">
              Tampilkan
            </span>
            <select
              className="h-8 text-sm border rounded-md px-2"
              value={itemsPerPage}
              onChange={handleItemsPerPageChange}
            >
              <option value={5}>5</option>
              <option value={10}>10</option>
              <option value={20}>20</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span className="text-sm text-muted-foreground">
              per halaman
            </span>
          </div>

          <div className="text-sm text-muted-foreground">
            Menampilkan {((currentPage - 1) * itemsPerPage) + 1} - {Math.min(currentPage * itemsPerPage, filteredLogs.length)} dari {filteredLogs.length} entri
          </div>
          
          {totalPages > 1 && (
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                onClick={goToFirstPage} 
                disabled={currentPage === 1}
                size="sm"
                className="h-8 px-2"
              >
                <ChevronsLeft className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={goToPreviousPage} 
                disabled={currentPage === 1}
                size="sm"
                className="h-8 px-2"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              
              <span className="flex items-center px-2 text-sm">
                {currentPage} / {totalPages}
              </span>
              
              <Button 
                variant="outline" 
                onClick={goToNextPage} 
                disabled={currentPage === totalPages}
                size="sm"
                className="h-8 px-2"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
              <Button 
                variant="outline" 
                onClick={goToLastPage} 
                disabled={currentPage === totalPages}
                size="sm"
                className="h-8 px-2"
              >
                <ChevronsRight className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      )}
      
      {/* Toast notifications */}
      <Toaster />
    </div>
  );
}
