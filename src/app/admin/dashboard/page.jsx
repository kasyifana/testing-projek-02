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
  TrendingUp,
  UserCheck,
  Settings
} from 'lucide-react';
import { Bar, Line, Pie } from 'react-chartjs-2';
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
  ArcElement
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
  PointElement,
  ArcElement
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
  const [personnelData, setPersonnelData] = useState(null);
  const [activeUsersData, setActiveUsersData] = useState(null);
  const [handlingTimeData, setHandlingTimeData] = useState(null);
  const [error, setError] = useState(null);
  const [aiSummary, setAiSummary] = useState('');
  const [isSummaryLoading, setIsSummaryLoading] = useState(false);
  const [summaryError, setSummaryError] = useState(null);
  const [lastRequestTime, setLastRequestTime] = useState(0);
  const [requestCount, setRequestCount] = useState(0);
  const [dataHash, setDataHash] = useState('');
  const [tokenUsage, setTokenUsage] = useState({ input: 0, output: 0, total: 0 });

  // Simple hash function for data comparison
  const hashData = (data) => {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return hash.toString();
  };

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
      // Try different endpoints/methods to get data
      let reportsData, usersData;
      
      // Try direct API call first
      try {
        const [reportsResponse, usersResponse] = await Promise.all([
          fetch('https://laravel.kasyifana.my.id/api/laporan', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          }),
          fetch('https://laravel.kasyifana.my.id/api/user', {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            },
            mode: 'cors'
          })
        ]);

        if (reportsResponse.ok) {
          reportsData = await reportsResponse.json();
        } else {
          console.warn('Reports API failed:', reportsResponse.status);
          // Fallback to empty data
          reportsData = { data: [] };
        }

        if (usersResponse.ok) {
          usersData = await usersResponse.json();
        } else {
          console.warn('Users API failed:', usersResponse.status);
          // Fallback to empty data
          usersData = { data: [] };
        }
      } catch (directApiError) {
        console.warn('Direct API call failed:', directApiError);
        // Use empty data as fallback
        reportsData = { data: [] };
        usersData = { data: [] };
      }

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
    
    // Generate hash of current data
    const currentHash = hashData(reports);
    
    // Check if data hasn't changed since last request
    if (dataHash === currentHash && aiSummary && !summaryError) {
      console.log('Data unchanged, using cached summary');
      return;
    }
    
    // Rate limiting protection
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    const minInterval = 10000; // 10 seconds minimum between requests
    
    // Check if we've made too many requests recently
    if (timeSinceLastRequest < minInterval) {
      console.log('Rate limiting: Skipping request, too soon since last request');
      setSummaryError(`Menunggu ${Math.ceil((minInterval - timeSinceLastRequest) / 1000)} detik sebelum request berikutnya untuk menghindari rate limit.`);
      return;
    }
    
    // Update request tracking
    setLastRequestTime(now);
    setRequestCount(prev => prev + 1);
    setDataHash(currentHash);
    
    setIsSummaryLoading(true);
    setSummaryError(null);
    
    console.log(`Making AI request #${requestCount + 1} at ${new Date().toISOString()}`);
    
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

      // Estimate token usage (rough calculation)
      const estimatedInputTokens = Math.ceil((systemInstruction.length + prompt.length) / 4);
      console.log(`Estimated input tokens: ${estimatedInputTokens}`);

      const aiResponse = await chat.sendMessage(prompt);
      
      // Estimate output tokens
      const estimatedOutputTokens = Math.ceil(aiResponse.length / 4);
      const totalTokens = estimatedInputTokens + estimatedOutputTokens;
      
      // Update token usage tracking
      setTokenUsage({
        input: estimatedInputTokens,
        output: estimatedOutputTokens,
        total: totalTokens
      });
      
      console.log(`Token usage - Input: ${estimatedInputTokens}, Output: ${estimatedOutputTokens}, Total: ${totalTokens}`);
      
      setAiSummary(aiResponse);
      console.log('AI request completed successfully');
      
    } catch (error) {
      console.error('Error generating AI summary:', error);
      
      // Handle rate limiting specifically
      if (error.message.includes('429') || error.message.includes('Too Many Requests')) {
        setSummaryError('Rate limit tercapai. AI summary akan dinonaktifkan sementara untuk menghindari pembatasan API. Silakan refresh halaman dalam beberapa menit.');
      } else {
        setSummaryError('Gagal menghasilkan ringkasan AI. Silakan coba lagi nanti.');
      }
    } finally {
      setIsSummaryLoading(false);
    }
  };

  // Database of personnel with their expertise - same as in reports page
  const personnelDatabase = [
    {
      name: "Pak Budi",
      expertise: ["AC", "pendingin", "cooling", "air conditioner", "hvac", "suhu", "dingin", "panas"],
      position: "Teknisi AC & Cooling System"
    },
    {
      name: "Bu Sari",
      expertise: ["listrik", "lampu", "kabel", "electricity", "electrical", "power", "daya", "korsleting", "mati lampu"],
      position: "Teknisi Listrik"
    },
    {
      name: "Pak Joko",
      expertise: ["toilet", "wc", "kamar mandi", "air", "pipa", "kran", "bocor", "mampet", "saluran", "plumbing"],
      position: "Teknisi Plumbing"
    },
    {
      name: "Bu Maya",
      expertise: ["kebersihan", "sampah", "kotor", "cleaning", "janitor", "bersih", "sanitasi", "hygiene"],
      position: "Supervisor Kebersihan"
    },
    {
      name: "Pak Andi",
      expertise: ["pintu", "jendela", "kunci", "rusak", "patah", "maintenance", "perbaikan", "carpentry"],
      position: "Teknisi Maintenance Umum"
    },
    {
      name: "Bu Lina",
      expertise: ["komputer", "laptop", "internet", "wifi", "network", "IT", "sistem", "software", "hardware"],
      position: "IT Support"
    },
    {
      name: "Bu Ratna",
      expertise: ["layanan", "administrasi", "akademik", "keuangan", "pendaftaran", "surat", "berkas", "dokumen", "service", "pelayanan"],
      position: "Supervisor Layanan Akademik"
    },
    {
      name: "Pak Deni",
      expertise: ["kekerasan", "bullying", "harassment", "pelecehan", "intimidasi", "keamanan", "security", "violence", "abuse", "diskriminasi"],
      position: "Koordinator Keamanan & Anti-Kekerasan"
    }
  ];

  // Function to match reports to personnel based on keywords
  const matchReportToPersonnel = (report) => {
    const reportText = `${report.judul} ${report.deskripsi}`.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    personnelDatabase.forEach(person => {
      let score = 0;
      person.expertise.forEach(keyword => {
        if (reportText.includes(keyword.toLowerCase())) {
          score++;
        }
      });
      
      if (score > highestScore) {
        highestScore = score;
        bestMatch = person;
      }
    });

    // If no match found, assign to general maintenance
    return bestMatch || personnelDatabase.find(p => p.name === "Pak Andi");
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

    // Call AI summary generator with reports data (with rate limiting protection)
    if (!isSummaryLoading && !aiSummary) {
      generateAiSummary(reports);
    }

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
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
        ],
        borderColor: [
          'rgba(255, 99, 132, 1)',
          'rgba(54, 162, 235, 1)',
          'rgba(255, 206, 86, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(153, 102, 255, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 2,
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

    // 4. Process Personnel Data - Match reports to personnel based on keywords
    const personnelCount = {};
    
    // Initialize all personnel with 0 count
    personnelDatabase.forEach(person => {
      personnelCount[person.name] = 0;
    });
    
    // Match reports to personnel based on content
    reports.forEach(report => {
      const assignedPersonnel = matchReportToPersonnel(report);
      if (assignedPersonnel) {
        personnelCount[assignedPersonnel.name]++;
      }
    });

    // Sort personnel by count (descending)
    const sortedPersonnel = Object.entries(personnelCount)
      .sort(([,a], [,b]) => b - a)
      .filter(([,count]) => count > 0); // Only show personnel with reports

    setPersonnelData({
      labels: sortedPersonnel.map(([name]) => name),
      datasets: [{
        label: 'Jumlah Laporan Ditangani',
        data: sortedPersonnel.map(([,count]) => count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.8)',
          'rgba(54, 162, 235, 0.8)',
          'rgba(255, 206, 86, 0.8)',
          'rgba(75, 192, 192, 0.8)',
          'rgba(153, 102, 255, 0.8)',
          'rgba(255, 159, 64, 0.8)',
          'rgba(199, 199, 199, 0.8)',
          'rgba(83, 102, 255, 0.8)',
        ],
      }],
    });

    // 5. Process Active Users Data - Count reports per user
    const userReportCount = {};
    
    reports.forEach(report => {
      const userName = report.nama_pelapor || 'Unknown User';
      userReportCount[userName] = (userReportCount[userName] || 0) + 1;
    });

    // Sort users by report count (descending) and take top 10
    const sortedUsers = Object.entries(userReportCount)
      .sort(([,a], [,b]) => b - a)
      .slice(0, 10); // Top 10 most active users

    setActiveUsersData({
      labels: sortedUsers.map(([name]) => name),
      datasets: [{
        label: 'Jumlah Laporan Dibuat',
        data: sortedUsers.map(([,count]) => count),
        backgroundColor: [
          'rgba(34, 197, 94, 0.8)',
          'rgba(59, 130, 246, 0.8)',
          'rgba(239, 68, 68, 0.8)',
          'rgba(245, 158, 11, 0.8)',
          'rgba(168, 85, 247, 0.8)',
          'rgba(236, 72, 153, 0.8)',
          'rgba(14, 165, 233, 0.8)',
          'rgba(16, 185, 129, 0.8)',
          'rgba(251, 146, 60, 0.8)',
          'rgba(139, 92, 246, 0.8)',
        ],
      }],
    });

    // 6. Process Handling Time Data - Calculate average handling time for completed reports
    const completedReportsWithTime = reports.filter(report => {
      return report.status === 'Selesai' && report.created_at && report.updated_at;
    });

    console.log('Completed reports with time tracking:', completedReportsWithTime.length);
    console.log('Sample report data:', completedReportsWithTime[0]);

    const handlingTimeByCategory = {};
    const handlingTimeByMonth = {};
    const responseTimeByCategory = {};
    const responseTimeByMonth = {};

    completedReportsWithTime.forEach(report => {
      const reportDate = new Date(report.created_at);
      const responseDate = report.waktu_respon ? new Date(report.waktu_respon) : null;
      const completionDate = new Date(report.updated_at);
      
      // Calculate total handling time (from report to completion)
      const totalHandlingTime = Math.abs(completionDate - reportDate);
      const totalHours = Math.ceil(totalHandlingTime / (1000 * 60 * 60));
      
      // Calculate response time (from report to first response)
      let responseHours = null;
      if (responseDate) {
        const responseTime = Math.abs(responseDate - reportDate);
        responseHours = Math.ceil(responseTime / (1000 * 60 * 60));
      }
      
      // Group by category
      const category = report.kategori || 'Lainnya';
      if (!handlingTimeByCategory[category]) {
        handlingTimeByCategory[category] = [];
      }
      handlingTimeByCategory[category].push(totalHours);
      
      if (responseHours !== null) {
        if (!responseTimeByCategory[category]) {
          responseTimeByCategory[category] = [];
        }
        responseTimeByCategory[category].push(responseHours);
      }
      
      // Group by month
      const month = reportDate.toLocaleString('default', { month: 'short' });
      if (!handlingTimeByMonth[month]) {
        handlingTimeByMonth[month] = [];
      }
      handlingTimeByMonth[month].push(totalHours);
      
      if (responseHours !== null) {
        if (!responseTimeByMonth[month]) {
          responseTimeByMonth[month] = [];
        }
        responseTimeByMonth[month].push(responseHours);
      }
    });

    // Calculate averages by category for total handling time
    const categoryAverages = Object.entries(handlingTimeByCategory).map(([category, times]) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      return { category, average: Math.round(average * 10) / 10, count: times.length };
    });

    // Calculate averages by category for response time
    const responseAverages = Object.entries(responseTimeByCategory).map(([category, times]) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      return { category, average: Math.round(average * 10) / 10, count: times.length };
    });

    // Calculate averages by month for total handling time
    const monthAverages = Object.entries(handlingTimeByMonth).map(([month, times]) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      return { month, average: Math.round(average * 10) / 10, count: times.length };
    });

    // Calculate averages by month for response time
    const responseMonthAverages = Object.entries(responseTimeByMonth).map(([month, times]) => {
      const average = times.reduce((sum, time) => sum + time, 0) / times.length;
      return { month, average: Math.round(average * 10) / 10, count: times.length };
    });

    // Sort months properly
    const sortedMonthAverages = monthAverages.sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    const sortedResponseMonthAverages = responseMonthAverages.sort((a, b) => {
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      return months.indexOf(a.month) - months.indexOf(b.month);
    });

    // Calculate overall statistics
    const allHandlingTimes = Object.values(handlingTimeByCategory).flat();
    const allResponseTimes = Object.values(responseTimeByCategory).flat();
    
    const overallHandlingAverage = allHandlingTimes.length > 0 ? 
      Math.round((allHandlingTimes.reduce((sum, time) => sum + time, 0) / allHandlingTimes.length) * 10) / 10 : 0;
    
    const overallResponseAverage = allResponseTimes.length > 0 ? 
      Math.round((allResponseTimes.reduce((sum, time) => sum + time, 0) / allResponseTimes.length) * 10) / 10 : 0;

    setHandlingTimeData({
      byCategory: {
        labels: categoryAverages.map(item => item.category),
        datasets: [
          {
            label: 'Rata-rata Total Penanganan (Jam)',
            data: categoryAverages.map(item => item.average),
            backgroundColor: 'rgba(99, 102, 241, 0.8)',
            borderColor: 'rgba(99, 102, 241, 1)',
            borderWidth: 2,
          },
          {
            label: 'Rata-rata Waktu Respon (Jam)',
            data: categoryAverages.map(item => {
              const responseCategory = responseAverages.find(r => r.category === item.category);
              return responseCategory ? responseCategory.average : 0;
            }),
            backgroundColor: 'rgba(16, 185, 129, 0.8)',
            borderColor: 'rgba(16, 185, 129, 1)',
            borderWidth: 2,
          }
        ],
      },
      byMonth: {
        labels: sortedMonthAverages.map(item => item.month),
        datasets: [
          {
            label: 'Rata-rata Total Penanganan (Jam)',
            data: sortedMonthAverages.map(item => item.average),
            borderColor: 'rgb(99, 102, 241)',
            backgroundColor: 'rgba(99, 102, 241, 0.5)',
            tension: 0.1,
          },
          {
            label: 'Rata-rata Waktu Respon (Jam)',
            data: sortedMonthAverages.map(item => {
              const responseMonth = sortedResponseMonthAverages.find(r => r.month === item.month);
              return responseMonth ? responseMonth.average : 0;
            }),
            borderColor: 'rgb(16, 185, 129)',
            backgroundColor: 'rgba(16, 185, 129, 0.5)',
            tension: 0.1,
          }
        ],
      },
      stats: {
        totalCompleted: completedReportsWithTime.length,
        overallHandlingAverage: overallHandlingAverage,
        overallResponseAverage: overallResponseAverage,
        reportsWithResponse: allResponseTimes.length,
        fastestCategory: categoryAverages.length > 0 ? 
          categoryAverages.reduce((min, item) => item.average < min.average ? item : min) : null,
        slowestCategory: categoryAverages.length > 0 ? 
          categoryAverages.reduce((max, item) => item.average > max.average ? item : max) : null,
        fastestResponseCategory: responseAverages.length > 0 ? 
          responseAverages.reduce((min, item) => item.average < min.average ? item : min) : null,
        slowestResponseCategory: responseAverages.length > 0 ? 
          responseAverages.reduce((max, item) => item.average > max.average ? item : max) : null,
      }
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

      {/* Grafik Statistik */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Tren Laporan Bulanan</h3>
          {monthlyData ? (
            <div style={{ height: '300px' }}>
              <Line data={monthlyData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { position: 'bottom' }
                },
                scales: {
                  y: {
                    beginAtZero: true,
                    ticks: {
                      stepSize: 1
                    }
                  }
                }
              }} />
            </div>
          ) : <p>Loading chart data...</p>}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Distribusi Kategori</h3>
          {categoryData ? (
            <div style={{ height: '300px' }}>
              <Pie data={categoryData} options={{
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                  legend: { 
                    position: 'bottom',
                    labels: {
                      padding: 20,
                      usePointStyle: true,
                    }
                  },
                  tooltip: {
                    callbacks: {
                      label: function(context) {
                        const label = context.label || '';
                        const value = context.parsed || 0;
                        const total = context.dataset.data.reduce((acc, data) => acc + data, 0);
                        const percentage = ((value / total) * 100).toFixed(1);
                        return `${label}: ${value} (${percentage}%)`;
                      }
                    }
                  }
                },
              }} />
            </div>
          ) : <p>Loading chart data...</p>}
        </Card>
      </div>

      {/* Grafik Waktu Penanganan */}
      {handlingTimeData && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Waktu Penanganan per Kategori</h3>
            <p className="text-sm text-gray-600 mb-4">
              Perbandingan rata-rata waktu respon dan total penanganan berdasarkan kategori laporan
            </p>
            <Bar data={handlingTimeData.byCategory} options={{
              responsive: true,
              plugins: {
                legend: { 
                  position: 'bottom',
                  display: true
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const datasetLabel = context.dataset.label;
                      const value = context.parsed.y;
                      return `${datasetLabel}: ${value} jam rata-rata`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Jam'
                  }
                }
              }
            }} />
          </Card>
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Tren Waktu Penanganan Bulanan</h3>
            <p className="text-sm text-gray-600 mb-4">
              Tren rata-rata waktu respon dan total penanganan laporan per bulan
            </p>
            <Line data={handlingTimeData.byMonth} options={{
              responsive: true,
              plugins: {
                legend: { 
                  position: 'bottom',
                  display: true
                },
                tooltip: {
                  callbacks: {
                    label: function(context) {
                      const datasetLabel = context.dataset.label;
                      const value = context.parsed.y;
                      return `${datasetLabel}: ${value} jam rata-rata`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  title: {
                    display: true,
                    text: 'Jam'
                  }
                }
              }
            }} />
          </Card>
        </div>
      )}

      {/* Grafik Personel dan Pengguna Aktif */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">🏆 Ranking Personel Penanganan Laporan</h3>
          <p className="text-sm text-gray-600 mb-4">Peringkat personel berdasarkan jumlah laporan yang ditangani</p>
          {personnelData && personnelData.labels.length > 0 ? (
            <div className="space-y-3">
              {personnelData.labels.map((name, index) => {
                const count = personnelData.datasets[0].data[index];
                const position = index + 1;
                const percentage = personnelData.datasets[0].data.length > 0 ? 
                  ((count / Math.max(...personnelData.datasets[0].data)) * 100).toFixed(1) : 0;
                
                // Medal colors for top 3
                const getMedalColor = (pos) => {
                  switch(pos) {
                    case 1: return 'bg-yellow-100 border-yellow-300 text-yellow-800';
                    case 2: return 'bg-gray-100 border-gray-300 text-gray-800';
                    case 3: return 'bg-orange-100 border-orange-300 text-orange-800';
                    default: return 'bg-blue-50 border-blue-200 text-blue-800';
                  }
                };

                const getMedalIcon = (pos) => {
                  switch(pos) {
                    case 1: return '🥇';
                    case 2: return '🥈';
                    case 3: return '🥉';
                    default: return `#${pos}`;
                  }
                };

                return (
                  <div key={name} className={`p-4 border-2 rounded-lg ${getMedalColor(position)}`}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-xl font-bold min-w-[3rem]">
                          {getMedalIcon(position)}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{name}</p>
                          <p className="text-sm opacity-75">
                            {personnelDatabase.find(p => p.name === name)?.position || 'Staff'}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold">{count}</p>
                        <p className="text-sm opacity-75">laporan</p>
                      </div>
                    </div>
                    <div className="mt-3">
                      <div className="w-full bg-white bg-opacity-50 rounded-full h-2">
                        <div 
                          className="bg-current h-2 rounded-full transition-all duration-500" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                      <p className="text-xs mt-1 opacity-75">{percentage}% dari maksimal</p>
                    </div>
                  </div>
                );
              })}
              {personnelData.labels.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Belum ada data personel yang menangani laporan</p>
                </div>
              )}
            </div>
          ) : <p>Loading ranking data...</p>}
        </Card>
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4">Pengguna Paling Aktif</h3>
          <p className="text-sm text-gray-600 mb-4">Top 10 pengguna yang paling sering melaporkan masalah</p>
          {activeUsersData ? <Bar data={activeUsersData} options={{
            responsive: true,
            plugins: {
              legend: { position: 'bottom' }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                }
              }
            }
          }} /> : <p>Loading chart data...</p>}
        </Card>
      </div>

      {/* AI Summary */}
      <div className="flex justify-between items-center mt-8">
        <h2 className="flex items-center gap-2 text-xl font-semibold">
          <Sparkles className="w-5 h-5 text-purple-500" />
          <TrendingUp className="w-5 h-5 text-blue-500" />
          Ringkasan Eksekutif AI & Prediksi Masa Depan
        </h2>
        {/* Debug info */}
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Requests: {requestCount}</span>
          <span>Last: {lastRequestTime ? new Date(lastRequestTime).toLocaleTimeString() : 'None'}</span>
          <span>Cache: {dataHash ? `${dataHash.substring(0, 8)}...` : 'Empty'}</span>
          <span>Tokens: {tokenUsage.total > 0 ? `${tokenUsage.total} (${tokenUsage.input}→${tokenUsage.output})` : 'N/A'}</span>
          <button 
            onClick={() => {
              setDataHash('');
              setAiSummary('');
              setSummaryError(null);
              setTokenUsage({ input: 0, output: 0, total: 0 });
              if (reports && reports.length > 0) {
                generateAiSummary(reports);
              }
            }}
            className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs hover:bg-blue-200"
            title="Reset cache dan generate ulang AI summary"
          >
            🔄 Reset Cache
          </button>
        </div>
      </div>
      <Card className="p-6 bg-gradient-to-br from-purple-50 to-blue-50 border border-purple-200">
        {isSummaryLoading && (
          <div className="flex items-center gap-3">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-purple-600"></div>
            <p className="text-purple-800">AI sedang menganalisis laporan dan memprediksi tren masa depan...</p>
          </div>
        )}
        {summaryError && (
          <div className="text-red-700 bg-red-100 p-4 rounded-lg border border-red-300">
            <div className="flex items-start gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">Gagal mendapatkan ringkasan AI</p>
                <p className="text-sm mt-1">{summaryError}</p>
                <button 
                  onClick={() => {
                    setSummaryError(null);
                    setAiSummary(''); // Clear existing summary to force regeneration
                    if (stats.totalReports > 0) {
                      fetchDashboardData(localStorage.getItem('token'));
                    }
                  }}
                  className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm flex items-center gap-2"
                  disabled={isSummaryLoading}
                >
                  <TrendingUp className="w-4 h-4" />
                  Coba Lagi
                </button>
              </div>
            </div>
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
            {/* Rate Limit Analysis */}
            <div className="mt-4 p-3 bg-amber-50 rounded-lg border border-amber-200">
              <h4 className="text-sm font-semibold text-amber-800 mb-2">📊 Analisis Rate Limiting</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-xs text-amber-700">
                <div>
                  <p className="font-medium">RPM Limit (30/min)</p>
                  <p>Current: {requestCount}/30</p>
                  <p className="text-green-600">✓ Safe</p>
                </div>
                <div>
                  <p className="font-medium">TPM Limit (12K/min)</p>
                  <p>Used: {tokenUsage.total}/12000</p>
                  <p className={tokenUsage.total > 8000 ? "text-red-600" : "text-green-600"}>
                    {tokenUsage.total > 8000 ? "⚠️ High" : "✓ Safe"}
                  </p>
                </div>
                <div>
                  <p className="font-medium">Estimasi per Request</p>
                  <p>~{tokenUsage.total} tokens</p>
                  <p className="text-blue-600">📈 Monitor</p>
                </div>
                <div>
                  <p className="font-medium">Kemungkinan Limit</p>
                  <p className="font-semibold">
                    {tokenUsage.total > 8000 ? "Token/Min" : 
                     requestCount > 20 ? "Request/Min" : "Normal"}
                  </p>
                </div>
              </div>
              <div className="mt-2 text-xs text-amber-600">
                <p><strong>Tips:</strong> Rate limiting biasanya disebabkan oleh RPM (30/min) atau TPM (12K/min). 
                Jika token usage tinggi ({tokenUsage.total} tokens), kurangi jumlah data dalam 1 request.</p>
              </div>
            </div>
          </div>
        )}
        {!isSummaryLoading && !aiSummary && !summaryError && (
          <div className="text-center py-8">
            <div className="animate-pulse">
              <Sparkles className="w-12 h-12 text-purple-400 mx-auto mb-4" />
            </div>
            <p className="text-gray-500 mb-4">
              Klik tombol di bawah untuk menghasilkan ringkasan AI. 
              <br />
              <small className="text-xs">
                Rate limit: max 1 request per 10 detik untuk menghindari pembatasan API.
              </small>
            </p>
            <button 
              onClick={() => {
                if (stats.totalReports > 0) {
                  // Get reports data for AI analysis
                  fetchDashboardData(localStorage.getItem('token'));
                }
              }}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm flex items-center gap-2 mx-auto"
              disabled={isSummaryLoading}
            >
              <Sparkles className="w-4 h-4" />
              Hasilkan Ringkasan AI
            </button>
          </div>
        )}
      </Card>
    </div>
  );
}
