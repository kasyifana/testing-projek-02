'use client';

import { useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye } from 'lucide-react';

const DUMMY_REPORTS = [
  {
    id: 1,
    title: "Kerusakan AC Ruang 301",
    category: "Fasilitas",
    status: "Diproses",
    date: "2024-01-15",
    priority: "Mendesak",
    response: "Teknisi akan mengecek dalam 24 jam"
  },
  {
    id: 2,
    title: "Masalah Nilai UTS",
    category: "Akademik",
    status: "Selesai",
    date: "2024-01-10",
    priority: "Biasa",
    response: "Nilai sudah direvisi"
  },
  // Add more dummy reports as needed
];

const getStatusColor = (status) => {
  const colors = {
    'Diproses': 'bg-yellow-500',
    'Ditanggapi': 'bg-blue-500',
    'Selesai': 'bg-green-500',
    'Ditolak': 'bg-red-500'
  };
  return colors[status] || 'bg-gray-500';
};

export default function History() {
  useEffect(() => {
    const style = document.createElement('style');
    style.innerHTML = `
      .no-hover-effect,
      .no-hover-effect *,
      .no-hover-effect *:hover {
        scale: none !important;
        box-shadow: inherit !important;
        transform: none !important;
        transition: none !important;
        transform-style: flat !important;
      }
      
      .no-hover-effect:hover {
        transform: none !important;
        scale: 1 !important;
        transform-origin: center !important;
      }

      .hover-highlight:hover {
        background-color: #f5f5f5 !important;
        transition: background-color 0.2s ease !important;
      }
    `;
    document.head.appendChild(style);
    
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Riwayat Laporan Saya</h1>
      
      <div className="space-y-4">
        {DUMMY_REPORTS.map((report) => (
          <Card key={report.id} className="p-4 no-hover-effect hover-highlight">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-semibold text-lg">{report.title}</h3>
                <p className="text-sm text-gray-500">
                  {report.category} • {report.date}
                </p>
              </div>
              <Badge className={getStatusColor(report.status)}>
                {report.status}
              </Badge>
            </div>
            
            <div className="mt-4">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">Tanggapan:</span> {report.response}
              </p>
            </div>
            
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm">
                <Eye className="h-4 w-4 mr-2" />
                Lihat Detail
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
