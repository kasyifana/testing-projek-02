'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle, 
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

const DUMMY_REPORTS = [
  {
    id: 1,
    title: "Kerusakan AC Ruang 301",
    category: "Fasilitas",
    urgency: "High",
    date: "2024-01-15",
    status: "new",
    description: "AC tidak dingin dan mengeluarkan bunyi keras"
  },
  {
    id: 2,
    title: "Komplain Nilai UAS",
    category: "Akademik",
    urgency: "Medium",
    date: "2024-01-14",
    status: "inProgress",
    description: "Nilai tidak sesuai dengan hasil ujian"
  },
  // Add more dummy data as needed
];

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("new");
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
        <h1 className="text-3xl font-bold">Manajemen Laporan</h1>
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

      {/* Tabs & Content */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Laporan Baru
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Ditangani
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Diarsipkan
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          {DUMMY_REPORTS.filter(report => report.status === "new").map((report) => (
            <ReportCard key={report.id} report={report} />
          ))}
        </TabsContent>

        {/* Similar TabsContent for other statuses */}
      </Tabs>
    </div>
  );
}

function ReportCard({ report }) {
  return (
    <Card className="p-4 mb-4">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold">{report.title}</h3>
          <p className="text-sm text-gray-500">{report.description}</p>
          <div className="flex gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {report.category}
            </span>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {report.urgency}
            </span>
          </div>
        </div>
        <Button variant="outline" size="sm">
          Lihat Detail
        </Button>
      </div>
    </Card>
  );
}
