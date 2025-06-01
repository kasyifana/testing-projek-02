'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function Dashboard() {
  const stats = [
    { label: 'Diproses', count: 2, icon: Clock, color: 'text-yellow-500' },
    { label: 'Ditanggapi', count: 3, icon: AlertCircle, color: 'text-blue-500' },
    { label: 'Ditolak', count: 1, icon: XCircle, color: 'text-red-500' },
    { label: 'Selesai', count: 5, icon: CheckCircle, color: 'text-green-500' },
  ];

  // Updated campus-themed report progress data
  const reportProgress = [
    { 
      id: 'LP-2023-001', 
      title: 'Kerusakan AC di Ruang Kuliah 3.02', 
      date: '14 Mei 2023',
      status: 'Diproses', 
      statusIcon: Clock,
      statusColor: 'bg-yellow-100 text-yellow-600'
    },
    { 
      id: 'LP-2023-002', 
      title: 'Proyektor Tidak Berfungsi di Lab Komputer', 
      date: '11 Mei 2023',
      status: 'Ditanggapi', 
      statusIcon: AlertCircle,
      statusColor: 'bg-blue-100 text-blue-600'
    },
    { 
      id: 'LP-2023-003', 
      title: 'Kebocoran Atap di Perpustakaan Lantai 2', 
      date: '7 Mei 2023',
      status: 'Selesai', 
      statusIcon: CheckCircle,
      statusColor: 'bg-green-100 text-green-600'
    },
    { 
      id: 'LP-2023-004', 
      title: 'WiFi Lambat di Area Kantin Fakultas', 
      date: '3 Mei 2023',
      status: 'Ditolak', 
      statusIcon: XCircle,
      statusColor: 'bg-red-100 text-red-600'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Beranda Pelapor</h1>
        <Link href="/user/create-report">
          <Button variant="accent" className="flex items-center gap-2">
            <PlusCircle className="h-5 w-5" />
            Buat Laporan Baru
          </Button>
        </Link>
      </div>

      <div className="grid grid-cols-4 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <p className="mt-2 text-2xl font-bold">{stat.count}</p>
            <p className="text-gray-600">{stat.label}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Progres Laporan</h2>
        <div className="space-y-4">
          {reportProgress.map((report) => (
            <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-gray-500">{report.id}</span>
                  <span className="text-xs text-gray-400">•</span>
                  <span className="text-sm text-gray-500">{report.date}</span>
                </div>
                <h3 className="font-medium mt-1">{report.title}</h3>
              </div>
              <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${report.statusColor}`}>
                <report.statusIcon className="h-4 w-4" />
                <span className="text-sm font-medium">{report.status}</span>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link href="/user/history">
            <Button variant="link" className="text-primary">
              Lihat Semua Laporan
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
