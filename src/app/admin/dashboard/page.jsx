'use client';

import { Card } from "@/components/ui/card";
import { 
  Users, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Wrench, // Changed from Tool
  ShieldAlert, // Changed from Shield
  GraduationCap,
  Wallet,
  MoreHorizontal
} from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement,
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  PointElement
);

export default function Dashboard() {
  // Kategori Isu
  const categories = [
    { 
      title: 'Fasilitas Rusak', 
      count: 24, 
      icon: Wrench, // Changed from Tool
      color: 'orange' 
    },
    { 
      title: 'Pelecehan/Kekerasan', 
      count: 5, 
      icon: ShieldAlert, // Changed from Shield
      color: 'red' 
    },
    { 
      title: 'Akademik', 
      count: 38, 
      icon: GraduationCap,
      color: 'blue' 
    },
    { 
      title: 'Keuangan', 
      count: 15, 
      icon: Wallet,
      color: 'green' 
    },
    { 
      title: 'Lainnya', 
      count: 8, 
      icon: MoreHorizontal,
      color: 'gray' 
    },
  ];

  // Data untuk statistik bulanan
  const monthlyData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'Laporan Masuk',
        data: [12, 19, 15, 25, 22, 30],
        borderColor: 'rgb(53, 162, 235)',
        backgroundColor: 'rgba(53, 162, 235, 0.5)',
      },
      {
        label: 'Laporan Selesai',
        data: [10, 15, 13, 20, 18, 25],
        borderColor: 'rgb(75, 192, 192)',
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
      },
    ],
  };

  // Data untuk distribusi kategori
  const categoryData = {
    labels: categories.map(cat => cat.title),
    datasets: [
      {
        label: 'Jumlah Laporan',
        data: categories.map(cat => cat.count),
        backgroundColor: [
          'rgba(255, 159, 64, 0.5)',
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(201, 203, 207, 0.5)',
        ],
      },
    ],
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Laporan</p>
              <p className="text-2xl font-bold">90</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-100 rounded-lg">
              <CheckCircle className="w-6 h-6 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Selesai Ditangani</p>
              <p className="text-2xl font-bold">75</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-100 rounded-lg">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Dalam Proses</p>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-100 rounded-lg">
              <Users className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Pengguna</p>
              <p className="text-2xl font-bold">156</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kategori Isu */}
      <h2 className="text-xl font-semibold mt-8">Kategori Isu</h2>
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        {categories.map((category, index) => {
          const Icon = category.icon;
          return (
            <Card key={index} className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 bg-${category.color}-100 rounded-lg mb-3`}>
                  <Icon className={`w-6 h-6 text-${category.color}-600`} />
                </div>
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-2xl font-bold mt-2">{category.count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grafik Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Laporan Bulanan</h3>
          <Line data={monthlyData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }} />
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Kategori</h3>
          <Bar data={categoryData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }} />
        </Card>
      </div>
    </div>
  );
}
