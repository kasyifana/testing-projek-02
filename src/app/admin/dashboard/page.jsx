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
  MoreHorizontal,
  Sparkles,
  TrendingUp
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
  PointElement
} from 'chart.js';
import { createChatSession } from '@/ai/groq';

// Configure ChartJS components
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

// No client-side Genkit init

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
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);

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

  // Generate AI summary using createChatSession like ai-chatbot.jsx
  const generateAiSummary = async (reports) => {
    if (!reports || reports.length === 0) return;
    
    setIsSummaryLoading(true);
    setSummaryError(null);
    
    try {
      // Create report text for AI analysis with additional pattern analysis
      const reportTexts = reports.map(r => 
        `Judul: ${r.judul}, Deskripsi: ${r.deskripsi}, Kategori: ${r.kategori || 'N/A'}, Status: ${r.status}, Tanggal: ${r.tanggal_lapor}`
      ).join('\n---\n');

      // Analyze patterns for predictive insights
      const patternAnalysis = analyzeReportPatterns(reports);

      // Enhanced system instruction for report analysis with predictive capabilities
      const systemInstruction = `
        Anda adalah asisten AI yang bertugas menganalisis laporan dari platform "LaporKampus" dan memberikan insight prediktif.
        Berdasarkan daftar laporan, berikan ringkasan eksekutif yang terstruktur dengan format berikut:
        
        1. **Isu Utama**: Identifikasi 2-3 masalah yang paling sering muncul
        2. **Tren**: Jelaskan pola atau tren yang terlihat dari laporan
        3. **Prioritas**: Sebutkan kategori yang memerlukan perhatian segera
        4. **Prediksi & Rekomendasi**: Berikan prediksi masa depan dan rekomendasi tindakan berdasarkan pola yang terdeteksi
        
        Untuk bagian Prediksi & Rekomendasi, gunakan panduan berikut:
        - AC/Pendingin rusak ≥3x: Sarankan service rutin atau penggantian
        - Kursi/Meja rusak ≥2x: Sarankan penggantian furniture
        - Toilet/Kamar mandi bermasalah ≥3x: Sarankan renovasi atau perbaikan sistem
        - Proyektor/LCD rusak ≥2x: Sarankan upgrade teknologi
        - WiFi/Internet bermasalah ≥4x: Sarankan upgrade infrastruktur jaringan
        - Lampu rusak ≥3x: Sarankan penggantian sistem penerangan
        - Pintu/Jendela rusak ≥2x: Sarankan renovasi struktural
        
        Gunakan format:
        - **Teks Tebal** untuk judul/poin penting
        - Bullet points (- ) untuk daftar
        - Gunakan Bahasa Indonesia yang formal namun mudah dipahami
        - Berikan estimasi waktu dan biaya jika memungkinkan
        
        Fokus pada insight yang actionable untuk manajemen kampus.
      `;

      // Create chat session with enhanced system instruction
      const chat = await createChatSession([], systemInstruction);
      
      // Send the reports data for analysis with pattern insights
      const prompt = `Analisis laporan berikut dan berikan ringkasan eksekutif dengan prediksi masa depan:

DATA LAPORAN:
${reportTexts}

ANALISIS POLA TERDETEKSI:
${patternAnalysis}

Berikan analisis lengkap dengan fokus khusus pada prediksi dan rekomendasi untuk mencegah masalah berulang.`;

      const aiResponse = await chat.sendMessage(prompt);
      setAiSummary(aiResponse);
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      setSummaryError('Gagal menghasilkan ringkasan AI. Silakan coba lagi nanti.');
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Function to analyze report patterns for predictive insights
  const analyzeReportPatterns = (reports) => {
    const patterns = {
      facility: {},
      location: {},
      timePattern: {},
      repeatIssues: {}
    };

    reports.forEach(report => {
      const title = report.judul?.toLowerCase() || '';
      const description = report.deskripsi?.toLowerCase() || '';
      const category = report.kategori?.toLowerCase() || '';
      const fullText = `${title} ${description}`;

      // Analyze facility-specific issues
      const facilityKeywords = {
        'ac': ['ac', 'air conditioner', 'pendingin', 'kondisi udara'],
        'kursi': ['kursi', 'chair', 'tempat duduk'],
        'meja': ['meja', 'table', 'desk'],
        'toilet': ['toilet', 'wc', 'kamar mandi', 'bathroom'],
        'proyektor': ['proyektor', 'projector', 'lcd'],
        'wifi': ['wifi', 'internet', 'jaringan', 'network'],
        'lampu': ['lampu', 'light', 'penerangan'],
        'pintu': ['pintu', 'door'],
        'jendela': ['jendela', 'window']
      };

      Object.keys(facilityKeywords).forEach(facility => {
        const keywords = facilityKeywords[facility];
        if (keywords.some(keyword => fullText.includes(keyword))) {
          patterns.facility[facility] = (patterns.facility[facility] || 0) + 1;
        }
      });

      // Analyze location patterns
      const locationKeywords = ['ruang', 'kelas', 'lab', 'kantin', 'perpustakaan', 'aula'];
      locationKeywords.forEach(loc => {
        if (fullText.includes(loc)) {
          patterns.location[loc] = (patterns.location[loc] || 0) + 1;
        }
      });

      // Analyze time patterns
      if (report.tanggal_lapor) {
        const month = new Date(report.tanggal_lapor).getMonth();
        patterns.timePattern[month] = (patterns.timePattern[month] || 0) + 1;
      }
    });

    // Generate pattern summary
    let analysisText = "POLA YANG TERDETEKSI:\n\n";
    
    // Facility issues analysis
    analysisText += "** Masalah Fasilitas Berulang **\n";
    Object.entries(patterns.facility).forEach(([facility, count]) => {
      if (count >= 2) {
        let recommendation = "";
        switch(facility) {
          case 'ac':
            recommendation = count >= 3 ? "URGENT: Perlu service rutin atau penggantian unit" : "Perlu perhatian khusus";
            break;
          case 'kursi':
          case 'meja':
            recommendation = count >= 2 ? "REKOMENDASI: Penggantian furniture" : "Monitor kondisi";
            break;
          case 'toilet':
            recommendation = count >= 3 ? "URGENT: Renovasi atau perbaikan sistem" : "Perlu perbaikan";
            break;
          case 'proyektor':
            recommendation = count >= 2 ? "REKOMENDASI: Upgrade teknologi" : "Perawatan rutin";
            break;
          case 'wifi':
            recommendation = count >= 4 ? "URGENT: Upgrade infrastruktur jaringan" : "Periksa koneksi";
            break;
          case 'lampu':
            recommendation = count >= 3 ? "REKOMENDASI: Penggantian sistem penerangan" : "Perawatan rutin";
            break;
          case 'pintu':
          case 'jendela':
            recommendation = count >= 2 ? "REKOMENDASI: Renovasi struktural" : "Perbaikan minor";
            break;
        }
        analysisText += `- ${facility.toUpperCase()}: ${count} laporan → ${recommendation}\n`;
      }
    });

    // Location hotspots
    analysisText += "\n** Lokasi Bermasalah **\n";
    Object.entries(patterns.location)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 3)
      .forEach(([location, count]) => {
        analysisText += `- ${location.toUpperCase()}: ${count} laporan\n`;
      });

    return analysisText;
  };

  const processDashboardData = (reports, users) => {
    // 1. Process Stats
    const totalReports = reports.length;
    const completedReports = reports.filter(r => r.status === 'Selesai').length;
    const inProgressReports = reports.filter(r => r.status === 'In Progress' || r.status === 'Pending').length;
    
    // Count unique user_ids
    const uniqueUserIds = new Set();
    reports.forEach(report => {
      if (report.user_id) {
        uniqueUserIds.add(report.user_id);
      }
    });
    
    const totalUniqueUsers = uniqueUserIds.size;
    
    setStats({ 
      totalReports, 
      completedReports, 
      inProgressReports, 
      totalUsers: totalUniqueUsers
    });

    // Call AI summary generator with reports data
    generateAiSummary(reports);

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

      {/* AI Summary */}
      <h2 className="flex items-center gap-2 text-xl font-semibold mt-8">
        <Sparkles className="w-5 h-5 text-purple-500" />
        <TrendingUp className="w-5 h-5 text-blue-500" />
        Ringkasan Eksekutif AI & Prediksi Masa Depan
      </h2>
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
        {isSummaryLoading && (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-purple-800">AI sedang menganalisis laporan dan memprediksi tren masa depan...</p>
          </div>
        )}
        {summaryError && (
          <div className="text-red-700 bg-red-100 p-3 rounded-lg">
            <p><strong>Gagal mendapatkan ringkasan AI:</strong> {summaryError}</p>
          </div>
        )}
        {aiSummary && !isSummaryLoading && (
          <div>
            <h3 className="text-lg font-semibold mb-2 text-purple-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              Analisis Tren & Prediksi Masa Depan
            </h3>
            <div 
              className="text-gray-800 prose prose-sm max-w-none"
              style={{
                lineHeight: '1.6',
                letterSpacing: '0.01em'
              }}
              dangerouslySetInnerHTML={{ 
                __html: aiSummary
                  .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                  .replace(/\n- /g, '<br/>• ')
                  .replace(/\n\d+\. /g, '<br/>$&')
                  .replace(/\n/g, '<br/>')
                  .replace(/URGENT:/g, '<span class="text-red-600 font-bold">🚨 URGENT:</span>')
                  .replace(/REKOMENDASI:/g, '<span class="text-orange-600 font-bold">💡 REKOMENDASI:</span>')
              }}
            />
            <div className="mt-4 p-3 bg-blue-100 rounded-lg border-l-4 border-blue-500">
              <p className="text-sm text-blue-800">
                <TrendingUp className="w-4 h-4 inline mr-1" />
                <strong>Catatan:</strong> Prediksi berdasarkan analisis pola historis laporan. 
                Tindakan preventif direkomendasikan untuk mengurangi keluhan berulang.
              </p>
            </div>
          </div>
        )}
        {!isSummaryLoading && !aiSummary && !summaryError && (
            <p className="text-gray-500">Ringkasan dan prediksi akan muncul di sini setelah laporan dianalisis.</p>
        )}
      </Card>
    </div>
  );
}
