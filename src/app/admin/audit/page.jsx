'use client';

import { useState } from 'react';
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
  Database 
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const DUMMY_LOGS = [
  {
    id: 1,
    action: "Login",
    user: "Admin",
    timestamp: "2024-01-15 09:00:00",
    details: "Login berhasil"
  },
  {
    id: 2,
    action: "Update Status Laporan",
    user: "Admin",
    timestamp: "2024-01-15 09:15:00",
    details: "Mengubah status laporan #123 menjadi 'In Progress'"
  },
  // Add more dummy data
];

export default function AuditLog() {
  const [filters, setFilters] = useState({
    category: "",
    date: "",
    urgency: "",
  });

  const handleExportPDF = () => {
    // Logic untuk export PDF
    console.log('Exporting to PDF...');
  };

  const handleExportExcel = () => {
    // Logic untuk export Excel
    console.log('Exporting to Excel...');
  };

  const handleBackupDatabase = () => {
    // Logic untuk backup database
    console.log('Creating database backup...');
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
                Export & Backup
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Export & Backup Data</DialogTitle>
                <DialogDescription>
                  Pilih format export atau lakukan backup database
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Export Laporan</h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleExportPDF}
                    >
                      <File className="w-4 h-4" />
                      Export PDF
                    </Button>
                    <Button
                      variant="outline"
                      className="flex items-center gap-2"
                      onClick={handleExportExcel}
                    >
                      <FileText className="w-4 h-4" />
                      Export Excel
                    </Button>
                  </div>
                </Card>
                
                <Card className="p-4">
                  <h3 className="font-semibold mb-2">Database Backup</h3>
                  <p className="text-sm text-gray-500 mb-2">
                    Backup terakhir: 2024-01-15 09:00
                  </p>
                  <Button
                    variant="secondary"
                    className="w-full flex items-center justify-center gap-2"
                    onClick={handleBackupDatabase}
                  >
                    <Database className="w-4 h-4" />
                    Backup Sekarang
                  </Button>
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

          <Button>Terapkan Filter</Button>
        </div>
      </Card>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono">{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
