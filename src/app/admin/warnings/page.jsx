'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, AlertOctagon, Clock, CheckCircle } from "lucide-react";

const DUMMY_WARNINGS = [
  {
    id: 1,
    title: "Laporan Terlambat Ditangani",
    reportId: "REP-123",
    category: "Fasilitas",
    createdAt: "2024-01-10",
    daysOverdue: 7,
    priority: "high",
    status: "unresolved",
    details: "Laporan kerusakan fasilitas belum ditindaklanjuti selama 7 hari"
  },
  {
    id: 2,
    title: "Pengaduan Berulang",
    reportId: "REP-125",
    category: "Akademik",
    createdAt: "2024-01-13",
    daysOverdue: 4,
    priority: "medium",
    status: "in-progress",
    details: "Pengaduan yang sama telah diajukan 3 kali dalam seminggu"
  },
  {
    id: 3,
    title: "Eskalasi Diperlukan",
    reportId: "REP-128",
    category: "Pelecehan",
    createdAt: "2024-01-15",
    daysOverdue: 2,
    priority: "critical",
    status: "unresolved",
    details: "Kasus pelecehan memerlukan penanganan segera dari pihak berwenang"
  }
];

export default function WarningsPage() {
  const getPriorityStyles = (priority) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-700 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-700 border-orange-300';
      default:
        return 'bg-yellow-100 text-yellow-700 border-yellow-300';
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
          <Badge variant="outline" className="bg-red-50">
            <AlertOctagon className="w-4 h-4 mr-1" />
            Critical: 1
          </Badge>
          <Badge variant="outline" className="bg-orange-50">
            <AlertTriangle className="w-4 h-4 mr-1" />
            High: 1
          </Badge>
        </div>
      </div>

      <div className="grid gap-4">
        {DUMMY_WARNINGS.map((warning) => (
          <Card key={warning.id} className={`p-4 border-l-4 ${getPriorityStyles(warning.priority)}`}>
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  {getStatusIcon(warning.status)}
                  <h3 className="text-lg font-semibold">{warning.title}</h3>
                </div>
                <p className="text-sm text-gray-600">{warning.details}</p>
                <div className="flex gap-2 text-sm">
                  <span className="text-gray-500">Report ID: {warning.reportId}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-gray-500">Kategori: {warning.category}</span>
                  <span className="text-gray-500">•</span>
                  <span className="text-red-500">
                    Terlambat: {warning.daysOverdue} hari
                  </span>
                </div>
              </div>
              <Button variant="outline" size="sm">
                Lihat Detail
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
