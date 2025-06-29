'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
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
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [stats, setStats] = useState({
    totalReports: 0,
    completedReports: 0,
    inProgressReports: 0,
    totalUsers: 0,
  });
  const [categoryData, setCategoryData] = useState(null);
  const [monthlyData, setMonthlyData] = useState(null);
  const [error, setError] = useState(null);

  // Check authentication and authorization
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';

      if (!token || !isLoggedIn) {
        console.log('Not authenticated, redirecting to home');
        router.push('/');
        return;
      }

      if (user) {
        try {
          const userData = JSON.parse(user);
          const isAdmin = userData.is_admin === 1 || userData.is_admin === true || userData.role === 'admin';
          
          if (!isAdmin) {
            console.log('Not authorized for admin access, redirecting to user dashboard');
            router.push('/user/dashboard');
            return;
          }

          setIsAuthorized(true);
          fetchDashboardData(token); // Fetch data after authorization
        } catch (error) {
          console.error('Error parsing user data:', error);
          router.push('/');
          return;
        }
      } else {
        console.log('No user data found, redirecting to home');
        router.push('/');
        return;
      }
    };

    checkAuth();
  }, [router]);

  const fetchDashboardData = async (token) => {
    setIsLoading(true);
    try {
      const [reportsResponse, usersResponse] = await Promise.all([
        fetch('/api/proxy?endpoint=laporan', {
          headers: { 'Authorization': `Bearer ${token}` }
        }),
        fetch('/api/proxy?endpoint=user', {
          headers: { 'Authorization': `Bearer ${token}` }
        })
      ]);

      if (!reportsResponse.ok || !usersResponse.ok) {
        throw new Error('Failed to fetch data from the server.');
      }

      const reportsData = await reportsResponse.json();
      const usersData = await usersResponse.json();

      const reports = Array.isArray(reportsData.data) ? reportsData.data : [];
      const users = Array.isArray(usersData.data) ? usersData.data : [];

      processDashboardData(reports, users);

    } catch (err) {
      setError(err.message);
      console.error("Error fetching dashboard data:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const processDashboardData = (reports, users) => {
    // 1. Process Stats
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'Selesai').length;
    const inProgressReports = reports.filter(r => r.status === 'In Progress' || r.status === 'Pending').length;
    const totalUsers = users.length;
    setStats({ totalReports, completedReports, inProgressReports, totalUsers });

    // 2. Process Category Data
    const categoriesCount = reports.reduce((acc, report) => {
      const category = report.kategori || 'Lainnya';
      acc[category] = (acc[category] || 0) + 1;
      return acc;
    }, {});

    setCategoryData({
      labels: Object.keys(categoriesCount),
      datasets: [{
        label: 'Jumlah Laporan',
        data: Object.values(categoriesCount),
        backgroundColor: [
          'rgba(255, 99, 132, 0.5)',
          'rgba(54, 162, 235, 0.5)',
          'rgba(255, 206, 86, 0.5)',
          'rgba(75, 192, 192, 0.5)',
          'rgba(153, 102, 255, 0.5)',
          'rgba(255, 159, 64, 0.5)',
        ],
      }],
    });

    // 3. Process Monthly Data
    const monthlyReports = reports.reduce((acc, report) => {
      const month = new Date(report.tanggal_lapor).toLocaleString('default', { month: 'short' });
      acc[month] = (acc[month] || { total: 0, selesai: 0 });
      acc[month].total++;
      if (report.status === 'Selesai') {
        acc[month].selesai++;
      }
      return acc;
    }, {});
    
    const sortedMonths = Object.keys(monthlyReports).sort((a, b) => {
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        return months.indexOf(a) - months.indexOf(b);
    });

    setMonthlyData({
      labels: sortedMonths,
      datasets: [
        {
          label: 'Laporan Masuk',
          data: sortedMonths.map(m => monthlyReports[m].total),
          borderColor: 'rgb(53, 162, 235)',
          backgroundColor: 'rgba(53, 162, 235, 0.5)',
        },
        {
          label: 'Laporan Selesai',
          data: sortedMonths.map(m => monthlyReports[m].selesai),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.5)',
        },
      ],
    });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  // Kategori Isu - Disesuaikan dengan kategori dari database
  const staticCategories = [
    { dbKey: 'fasilitas', title: 'Fasilitas', icon: Wrench, color: 'orange' },
    { dbKey: 'layanan', title: 'Layanan', icon: Users, color: 'blue' },
    { dbKey: 'kekerasan', title: 'Kekerasan', icon: ShieldAlert, color: 'red' },
    { dbKey: 'lainnya', title: 'Lainnya', icon: MoreHorizontal, color: 'gray' },
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Dashboard</h1>
      
      {error && <div className="p-4 text-red-700 bg-red-100 border border-red-400 rounded-lg">{error}</div>}

      {/* Summary Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <AlertTriangle className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Laporan</p>
              <p className="text-2xl font-bold">{stats.totalReports}</p>
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
              <p className="text-2xl font-bold">{stats.completedReports}</p>
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
              <p className="text-2xl font-bold">{stats.inProgressReports}</p>
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
              <p className="text-2xl font-bold">{stats.totalUsers}</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Kategori Isu */}
      <h2 className="text-xl font-semibold mt-8">Kategori Isu</h2>
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {staticCategories.map((category, index) => {
          const Icon = category.icon;
          // Match using dbKey to get the correct count from processed data
          const count = categoryData?.labels.includes(category.dbKey) 
            ? categoryData.datasets[0].data[categoryData.labels.indexOf(category.dbKey)] 
            : 0;
          return (
            <Card key={index} className="p-6">
              <div className="flex flex-col items-center text-center">
                <div className={`p-3 bg-${category.color}-100 rounded-lg mb-3`}>
                  <Icon className={`w-6 h-6 text-${category.color}-600`} />
                </div>
                <h3 className="font-medium">{category.title}</h3>
                <p className="text-2xl font-bold mt-2">{count}</p>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Grafik Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Laporan Bulanan</h3>
          {monthlyData ? <Line data={monthlyData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }} /> : <p>Loading chart data...</p>}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Kategori</h3>
          {categoryData ? <Bar data={categoryData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            }
          }} /> : <p>Loading chart data...</p>}
        </Card>
      </div>
    </div>
  );
}
