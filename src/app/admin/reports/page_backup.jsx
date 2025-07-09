'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  X,
  ChevronDown,
  ChevronUp,
  Loader2,
  Languages,
  FileText,
  MessageCircle
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { Toaster } from "@/components/ui/toaster";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { createChatSession } from '@/ai/groq';

// Format date to locale string
const formatDate = (dateString) => {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('id-ID', options);
};

// Format date and time to locale string
const formatDateTime = (dateString, timeString) => {
  if (!dateString) return '';
  
  let date;
  if (typeof dateString === 'string' && timeString) {
    // If we have separate date and time strings
    date = new Date(`${dateString}T${timeString}`);
  } else if (dateString instanceof Date) {
    date = dateString;
  } else {
    date = new Date(dateString);
  }
  
  const options = { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' };
  return date.toLocaleDateString('id-ID', options);
};

// Map backend status to frontend status
const mapStatus = (backendStatus) => {
  switch (backendStatus) {
    case 'Pending':
      return 'new';
    case 'In Progress':
      return 'inProgress';
    case 'Selesai':
      return 'archived';
    default:
      return 'new';
  }
};

// Map frontend status to backend status
const mapStatusToBackend = (frontendStatus) => {
  switch (frontendStatus) {
    case 'new':
      return 'Pending';
    case 'inProgress':
      return 'In Progress';
    case 'archived':
      return 'Selesai';
    default:
      return 'Pending';
  }
};

// Helper function for making API requests with fallbacks, including PUT/POST methods
const updateReportRequest = async (reportId, payload) => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error("Token tidak ditemukan. Silakan login terlebih dahulu.");
  }

  const body = JSON.stringify(payload);
  const headers = {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  };
  const directHeaders = { ...headers, 'Origin': window.location.origin };

  const proxyApiUrl = `/api/proxy?endpoint=laporan/${reportId}`;
  const directApiUrl = `http://127.0.0.1:8000/api/laporan/${reportId}`;

  let lastResponse;

  // This function tries PUT, and if it gets a 405, it tries POST.
  const tryRequestMethods = async (url, options) => {
    let response = await fetch(url, { ...options, method: 'PUT' });
    if (response.status === 405) { // Method Not Allowed
      console.warn(`PUT not allowed for ${url}, trying POST...`);
      response = await fetch(url, { ...options, method: 'POST' });
    }
    return response;
  };

  try {
    // Attempt 1: Proxy
    console.log('Attempting request via proxy...');
    lastResponse = await tryRequestMethods(proxyApiUrl, { headers, body });

    // Attempt 2: Direct API if proxy failed
    if (!lastResponse.ok) {
      console.warn('Proxy request failed, trying direct API call...');
      lastResponse = await tryRequestMethods(directApiUrl, { headers: directHeaders, body, mode: 'cors' });
    }
  } catch (error) {
    console.error('A network error occurred:', error);
    throw new Error('Gagal terhubung ke server. Periksa koneksi internet Anda.');
  }

  // Check final result
  if (!lastResponse.ok) {
    let errorMessage = `Gagal memperbarui laporan. Status: ${lastResponse.status}.`;
    if (lastResponse.status === 422) {
      try {
        const errorData = await lastResponse.json();
        if (errorData && errorData.errors) {
          const errorFields = Object.keys(errorData.errors).join(', ');
          errorMessage = `Validasi gagal (422). Bidang yang bermasalah: ${errorFields}`;
        } else if (errorData && errorData.message) {
          errorMessage = `Validasi gagal (422): ${errorData.message}`;
        }
      } catch (e) { /* ignore parsing error */ }
    }
    throw new Error(errorMessage);
  }

  return lastResponse.json();
};


export default function ReportsManagement() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("new");
  const [expandedReportId, setExpandedReportId] = useState(null);
  
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setError] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [translatedReports, setTranslatedReports] = useState({});
  const [translatingReports, setTranslatingReports] = useState({});
  const [matchingReports, setMatchingReports] = useState({});
  const [referralResults, setReferralResults] = useState({});

  useEffect(() => {
    // Fetch user profile
    fetchUserProfile();
    
    // Fetch reports
    fetchReports();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.error('No token found for user profile fetch');
        return;
      }
      
      console.log('Fetching user profile...');
      // Adjust the endpoint based on your actual API
      const response = await fetch('/api/proxy?endpoint=user/profile', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        console.error(`Error fetching user profile: ${response.status} ${response.statusText}`);
        
        // Try a direct API call as fallback
        try {
          console.log('Trying direct API call for user profile');
          const directResponse = await fetch('http://127.0.0.1:8000/api/user/profile', {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            },
            mode: 'cors'
          });
          
          if (directResponse.ok) {
            console.log('Direct API call for user profile succeeded');
            const data = await directResponse.json();
            console.log('User profile from direct API:', data);
            setUserProfile(data);
            return;
          } else {
            console.error(`Direct API call for user profile failed: ${directResponse.status}`);
          }
        } catch (directErr) {
          console.error('Direct API call for user profile failed:', directErr);
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      console.log('User profile fetched successfully:', data);
      setUserProfile(data);
    } catch (error) {
      console.error('Failed to fetch user profile:', error);
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        setError('Token tidak ditemukan. Silakan login terlebih dahulu.');
        setLoading(false);
        return;
      }

      // Use API endpoint to fetch all reports
      const apiUrl = `/api/proxy?endpoint=laporan`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        // Try fallback approach if API returns 404
        if (response.status === 404) {
          console.warn('API endpoint returned 404, trying with direct URL...');
          
          const fallbackUrl = 'http://127.0.0.1:8000/api/laporan';
          const fallbackResponse = await fetch(fallbackUrl, {
            method: 'GET',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
              'Origin': window.location.origin
            },
            mode: 'cors'
          });
          
          if (fallbackResponse.ok) {
            const data = await fallbackResponse.json();
            processReportsData(data);
            return;
          }
        }
        
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      console.log('Reports fetched:', data);
      processReportsData(data);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError(`Gagal mengambil data laporan: ${error.message}`);
      setLoading(false);
    }
  };

  const processReportsData = (data) => {
    try {
      // Extract reports based on different possible response formats
      let reportData = [];
      if (Array.isArray(data)) {
        reportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        if (typeof data === 'object' && data !== null) {
          const possibleDataFields = Object.keys(data).filter(key => 
            Array.isArray(data[key]) && data[key].length > 0
          );
          
          if (possibleDataFields.length > 0) {
            reportData = data[possibleDataFields[0]];
          }
        }
      }
      
      // Transform the report data to match our frontend structure
      const transformedReports = reportData.map(report => {
        // Parse responses if they exist
        let responses = [];
        if (report.respon) {
          try {
            if (typeof report.respon === 'string') {
              // Try to parse responses if they're stored as JSON string
              responses = JSON.parse(report.respon);
            } else if (Array.isArray(report.respon)) {
              responses = report.respon;
            } else if (typeof report.respon === 'object') {
              responses = [report.respon];
            }
          } catch (e) {
            // If parsing fails, assume it's a single response
            responses = [{
              message: report.respon,
              timestamp: report.waktu_respon || new Date().toISOString(),
              author: report.oleh || 'Admin'
            }];
          }
        }
        
        // If responses is not an array or is empty but we have oleh/waktu_respon fields
        if ((!Array.isArray(responses) || responses.length === 0) && (report.oleh || report.waktu_respon)) {
          responses = [{
            message: report.respon || 'Laporan telah ditanggapi',
            timestamp: report.waktu_respon || new Date().toISOString(),
            author: report.oleh || 'Admin'
          }];
        }
        
        return {
          id: report.id_laporan || report.id,
          title: report.judul,
          category: report.kategori,
          urgency: report.prioritas || 'Medium',
          date: report.tanggal_lapor,
          status: mapStatus(report.status),
          description: report.deskripsi,
          submittedBy: report.nama_pelapor || 'Pengguna',
          submittedAt: formatDateTime(report.tanggal_lapor, report.waktu_lapor),
          estimatedTime: '',
          responses: responses,
          // Keep the original data for reference when updating
          original: report
        };
      });
      
      console.log('Transformed reports:', transformedReports);
      setReports(transformedReports);
      setLoading(false);
      setError(null);
    } catch (error) {
      console.error('Error processing report data:', error);
      setError('Terjadi kesalahan saat memproses data laporan');
      setLoading(false);
    }
  };

  const handleTabChange = (value) => {
    setActiveTab(value);
    setExpandedReportId(null); // Close any expanded report when changing tabs
  };

  const toggleReportDetail = (reportId) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
    }
  };

  const handleSubmitResponse = async (reportId, responseText) => {
    try {
      if (!responseText.trim()) {
        toast({
          title: "Tidak dapat mengirim",
          description: "Respon tidak boleh kosong",
          variant: "destructive"
        });
        return;
      }

      const reportToUpdate = reports.find(r => r.id === reportId);
      if (!reportToUpdate) {
        toast({
          title: "Error",
          description: "Laporan tidak ditemukan",
          variant: "destructive"
        });
        return;
      }

      const now = new Date();
      const formattedDate = now.toISOString();
      const adminName = userProfile ? (userProfile.name || userProfile.nama || 'Admin') : 'Admin';

      const newResponseObj = {
        message: responseText,
        timestamp: formattedDate,
        author: adminName
      };

      const payload = {
        id: reportId,
        status: 'In Progress',
        respon: responseText,
        oleh: adminName,
        waktu_respon: formattedDate
      };

      console.log('Sending payload to backend:', payload);
      await updateReportRequest(reportId, payload);

      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status: 'inProgress',
            responses: [...(report.responses || []), newResponseObj]
          };
        }
        return report;
      });
      setReports(updatedReports);

      toast({
        title: "Berhasil",
        description: "Respon telah dikirim",
        variant: "default"
      });

      fetchReports();

    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Gagal",
        description: `Terjadi kesalahan saat mengirim respon: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const handleResolveReport = async (reportId) => {
    try {
      const reportToUpdate = reports.find(r => r.id === reportId);
      if (!reportToUpdate) {
        toast({
          title: "Error",
          description: "Laporan tidak ditemukan",
          variant: "destructive"
        });
        return;
      }

      const adminName = userProfile ? (userProfile.name || userProfile.nama || 'Admin') : 'Admin';
      const responseText = reportToUpdate.original.respon || "Laporan telah ditangani dan diselesaikan.";
      const responseDate = reportToUpdate.original.waktu_respon || new Date().toISOString();

      const payload = {
        id: reportId,
        status: 'Selesai',
        respon: responseText,
        oleh: adminName,
        waktu_respon: responseDate
      };

      console.log('Sending payload to backend for status update:', payload);
      await updateReportRequest(reportId, payload);

      // Update local state
      const updatedReports = reports.map(report => {
        if (report.id === reportId) {
          return {
            ...report,
            status: 'archived'
          };
        }
        return report;
      });
      setReports(updatedReports);

      toast({
        title: "Berhasil",
        description: "Status laporan telah diubah menjadi Selesai",
        variant: "default"
      });

      fetchReports();

    } catch (error) {
      console.error('Error updating report status:', error);
      toast({
        title: "Gagal",
        description: `Terjadi kesalahan saat mengubah status laporan: ${error.message}`,
        variant: "destructive"
      });
    }
  };

  const translateText = async (text, targetLang = 'id') => {
    try {
      // Check if text is likely already in Indonesian
      const indonesianWords = ['dan', 'atau', 'yang', 'untuk', 'dengan', 'pada', 'di', 'ke', 'dari', 'adalah', 'akan', 'tidak', 'ini', 'itu', 'saya', 'kamu', 'kami', 'mereka', 'kampus', 'laporan', 'masalah'];
      const words = text.toLowerCase().split(' ');
      const indonesianWordsCount = words.filter(word => indonesianWords.includes(word)).length;
      
      // If more than 25% of words are Indonesian, skip translation
      if (indonesianWordsCount / words.length > 0.25) {
        return text;
      }

      // System instruction for translation
      const systemInstruction = `
        Anda adalah penerjemah profesional yang bertugas menerjemahkan teks ke Bahasa Indonesia.
        Tugas Anda:
        1. Terjemahkan teks yang diberikan ke Bahasa Indonesia yang natural dan mudah dipahami
        2. Pertahankan konteks dan makna asli dari teks
        3. Gunakan bahasa yang formal namun mudah dipahami
        4. Jika teks sudah dalam Bahasa Indonesia, kembalikan teks asli tanpa perubahan
        5. Untuk istilah teknis atau nama tempat, pertahankan nama aslinya jika tidak ada padanan yang tepat
        6. Fokus pada konteks laporan kampus dan aduan
        
        Format output: Berikan hanya hasil terjemahan tanpa penjelasan tambahan.
      `;

      // Create chat session for translation
      const chat = await createChatSession([], systemInstruction);
      
      // Prepare translation prompt
      const prompt = `Terjemahkan teks berikut ke Bahasa Indonesia:

"${text}"

Hasil terjemahan:`;

      // Get translation from AI
      const aiResponse = await chat.sendMessage(prompt);
      
      // Clean up the response (remove quotes, extra whitespace, etc.)
      let translatedText = aiResponse.trim();
      
      // Remove surrounding quotes if present
      if ((translatedText.startsWith('"') && translatedText.endsWith('"')) ||
          (translatedText.startsWith("'") && translatedText.endsWith("'"))) {
        translatedText = translatedText.slice(1, -1);
      }
      
      // If translation seems to be the same or very similar, return original
      if (translatedText.toLowerCase() === text.toLowerCase()) {
        return text;
      }
      
      return translatedText.trim();
      
    } catch (error) {
      console.error('AI Translation error:', error);
      // Always return original text as fallback
      return text;
    }
  };

  const handleTranslateReport = async (reportId) => {
    try {
      setTranslatingReports(prev => ({ ...prev, [reportId]: true }));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Laporan tidak ditemukan');
      }

      // Show loading toast
      toast({
        title: "Menerjemahkan dengan AI...",
        description: "AI sedang menerjemahkan laporan ke Bahasa Indonesia",
        variant: "default"
      });

      const [translatedTitle, translatedDescription] = await Promise.all([
        translateText(report.title),
        translateText(report.description)
      ]);

      // Check if translation actually changed the text
      const titleChanged = translatedTitle !== report.title;
      const descriptionChanged = translatedDescription !== report.description;
      
      if (!titleChanged && !descriptionChanged) {
        toast({
          title: "Informasi",
          description: "Laporan sudah dalam Bahasa Indonesia atau tidak memerlukan terjemahan",
          variant: "default"
        });
        return;
      }

      setTranslatedReports(prev => ({
        ...prev,
        [reportId]: {
          title: translatedTitle,
          description: translatedDescription,
          originalTitle: report.title,
          originalDescription: report.description
        }
      }));

      // Success feedback
      const changedParts = [];
      if (titleChanged) changedParts.push('judul');
      if (descriptionChanged) changedParts.push('deskripsi');
      
      toast({
        title: "Berhasil",
        description: `AI berhasil menerjemahkan ${changedParts.join(' dan ')}`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error translating report:', error);
      
      // More specific error messages
      let errorMessage = "Terjadi kesalahan saat menerjemahkan dengan AI";
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = "Gagal terhubung ke layanan AI. Periksa koneksi internet Anda.";
      } else if (error.message.includes('quota') || error.message.includes('limit')) {
        errorMessage = "Batas penggunaan AI tercapai. Coba lagi nanti.";
      } else if (error.message.includes('API')) {
        errorMessage = "Layanan AI sedang tidak tersedia. Coba lagi nanti.";
      }
      
      toast({
        title: "Gagal",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setTranslatingReports(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleResetTranslation = (reportId) => {
    setTranslatedReports(prev => {
      const updated = { ...prev };
      delete updated[reportId];
      return updated;
    });
  };

  // Database of personnel with their expertise and WhatsApp numbers
  const personnelDatabase = [
    {
      name: "Pak Budi",
      expertise: ["AC", "pendingin", "cooling", "air conditioner", "hvac", "suhu", "dingin", "panas"],
      whatsapp: "6281234567890",
      position: "Teknisi AC & Cooling System"
    },
    {
      name: "Bu Sari",
      expertise: ["listrik", "lampu", "kabel", "electricity", "electrical", "power", "daya", "korsleting", "mati lampu"],
      whatsapp: "6281234567891",
      position: "Teknisi Listrik"
    },
    {
      name: "Pak Joko",
      expertise: ["toilet", "wc", "kamar mandi", "air", "pipa", "kran", "bocor", "mampet", "saluran", "plumbing"],
      whatsapp: "6281234567892",
      position: "Teknisi Plumbing"
    },
    {
      name: "Bu Maya",
      expertise: ["kebersihan", "sampah", "kotor", "cleaning", "janitor", "bersih", "sanitasi", "hygiene"],
      whatsapp: "6281234567893",
      position: "Supervisor Kebersihan"
    },
    {
      name: "Pak Andi",
      expertise: ["pintu", "jendela", "kunci", "rusak", "patah", "maintenance", "perbaikan", "carpentry"],
      whatsapp: "6281234567894",
      position: "Teknisi Maintenance Umum"
    },
    {
      name: "Bu Lina",
      expertise: ["komputer", "laptop", "internet", "wifi", "network", "IT", "sistem", "software", "hardware"],
      whatsapp: "6281234567895",
      position: "IT Support"
    }
  ];

  const findBestPersonnel = async (reportTitle, reportDescription) => {
    try {
      const systemInstruction = `
        Anda adalah sistem AI yang bertugas mencocokkan laporan masalah kampus dengan personel yang tepat untuk menanganinya.
        
        Database Personel:
        ${personnelDatabase.map(person => 
          `- ${person.name} (${person.position}): Ahli dalam ${person.expertise.join(', ')}`
        ).join('\n')}
        
        Tugas Anda:
        1. Analisis judul dan deskripsi laporan
        2. Tentukan personel yang paling cocok berdasarkan keahlian mereka
        3. Berikan alasan mengapa personel tersebut cocok
        4. Format response dalam JSON seperti ini:
        {
          "selectedPersonnel": "Nama Personel",
          "confidence": 95,
          "reason": "Alasan pemilihan personel ini"
        }
        
        Jika tidak ada yang cocok, pilih "Pak Andi" sebagai default (maintenance umum).
      `;

      const chat = await createChatSession([], systemInstruction);
      
      const prompt = `
        Analisis laporan berikut dan tentukan personel yang paling cocok:
        
        Judul: "${reportTitle}"
        Deskripsi: "${reportDescription}"
        
        Berikan response dalam format JSON yang diminta.
      `;

      const aiResponse = await chat.sendMessage(prompt);
      
      // Parse AI response
      let aiData;
      try {
        // Extract JSON from response if it's wrapped in text
        const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : aiResponse;
        aiData = JSON.parse(jsonStr);
      } catch (parseError) {
        // Fallback parsing
        aiData = {
          selectedPersonnel: "Pak Andi",
          confidence: 50,
          reason: "Default selection - maintenance umum"
        };
      }

      // Find the personnel data
      const selectedPerson = personnelDatabase.find(p => p.name === aiData.selectedPersonnel);
      
      if (!selectedPerson) {
        // Fallback to default
        return {
          personnel: personnelDatabase.find(p => p.name === "Pak Andi"),
          confidence: 50,
          reason: "Default selection - tidak ditemukan kecocokan spesifik"
        };
      }

      return {
        personnel: selectedPerson,
        confidence: aiData.confidence || 85,
        reason: aiData.reason || `Dipilih berdasarkan keahlian dalam ${selectedPerson.expertise.slice(0, 3).join(', ')}`
      };

    } catch (error) {
      console.error('Error in AI personnel matching:', error);
      // Return default personnel on error
      return {
        personnel: personnelDatabase.find(p => p.name === "Pak Andi"),
        confidence: 30,
        reason: "Terjadi kesalahan dalam pencocokan AI, menggunakan teknisi maintenance umum"
      };
    }
  };

  const sendWhatsAppMessage = (whatsappNumber, reportTitle, reportDescription, personnelName) => {
    const message = `🚨 *LAPORAN KAMPUS BARU*

Halo ${personnelName}, Anda telah ditugaskan untuk menangani laporan berikut:

📋 *Judul Laporan:*
${reportTitle}

📝 *Deskripsi:*
${reportDescription}

🏫 *Dari Sistem:* LaporKampus
⏰ *Waktu:* ${new Date().toLocaleString('id-ID')}

Silakan segera ditindaklanjuti. Terima kasih!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
    
    // Open WhatsApp in new tab
    window.open(whatsappUrl, '_blank');
  };

  const handleAIMatching = async (reportId) => {
    try {
      setMatchingReports(prev => ({ ...prev, [reportId]: true }));
      
      const report = reports.find(r => r.id === reportId);
      if (!report) {
        throw new Error('Laporan tidak ditemukan');
      }

      toast({
        title: "AI sedang menganalisis...",
        description: "Mencari personel yang paling cocok untuk menangani laporan ini",
        variant: "default"
      });

      // Use translated text if available, otherwise use original
      const titleToAnalyze = translatedReports[reportId]?.title || report.title;
      const descriptionToAnalyze = translatedReports[reportId]?.description || report.description;

      const matchResult = await findBestPersonnel(titleToAnalyze, descriptionToAnalyze);
      
      // Store the result
      setReferralResults(prev => ({
        ...prev,
        [reportId]: matchResult
      }));

      toast({
        title: "Berhasil!",
        description: `AI merekomendasikan ${matchResult.personnel.name} (${matchResult.confidence}% cocok)`,
        variant: "default"
      });

    } catch (error) {
      console.error('Error in AI matching:', error);
      toast({
        title: "Gagal",
        description: `Terjadi kesalahan dalam pencocokan AI: ${error.message}`,
        variant: "destructive"
      });
    } finally {
      setMatchingReports(prev => ({ ...prev, [reportId]: false }));
    }
  };

  const handleSendToWhatsApp = (reportId) => {
    const report = reports.find(r => r.id === reportId);
    const matchResult = referralResults[reportId];

    if (!report || !matchResult) {
      toast({
        title: "Error",
        description: "Data laporan atau hasil pencocokan tidak ditemukan",
        variant: "destructive"
      });
      return;
    }

    // Use translated text if available
    const titleToSend = translatedReports[reportId]?.title || report.title;
    const descriptionToSend = translatedReports[reportId]?.description || report.description;

    sendWhatsAppMessage(
      matchResult.personnel.whatsapp,
      titleToSend,
      descriptionToSend,
      matchResult.personnel.name
    );

    toast({
      title: "WhatsApp Dibuka",
      description: `Pesan telah disiapkan untuk ${matchResult.personnel.name}`,
      variant: "default"
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Laporan</h1>
        <Button
          variant="outline"
          onClick={fetchReports}
          className="gap-2"
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <AlertCircle className="h-4 w-4" />}
          Refresh Data
        </Button>
      </div>

      {errorMessage && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat data laporan...</p>
        </div>
      ) : (
        // Tabs & Content
        <Tabs defaultValue="new" className="w-full" onValueChange={handleTabChange}>
          <TabsList>
            <TabsTrigger value="new" className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4" /> Laporan Baru
              <span className="bg-blue-100 text-blue-600 rounded-full text-xs px-2 py-0.5 ml-1">
                {reports.filter(report => report.status === "new").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="inProgress" className="flex items-center gap-2">
              <Clock className="w-4 h-4" /> Sedang Progres
              <span className="bg-orange-100 text-orange-600 rounded-full text-xs px-2 py-0.5 ml-1">
                {reports.filter(report => report.status === "inProgress").length}
              </span>
            </TabsTrigger>
            <TabsTrigger value="archived" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" /> Ditangani
              <span className="bg-green-100 text-green-600 rounded-full text-xs px-2 py-0.5 ml-1">
                {reports.filter(report => report.status === "archived").length}
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="new" className="mt-6">
            {reports.filter(report => report.status === "new").length === 0 ? (
              <div className="text-center py-10 border rounded-md">
                <p className="text-muted-foreground">Tidak ada laporan baru</p>
              </div>
            ) : (
              reports.filter(report => report.status === "new").map((report) => (
                <ExpandableReportCard 
                  key={report.id} 
                  report={report} 
                  isExpanded={expandedReportId === report.id}
                  onToggleDetail={() => toggleReportDetail(report.id)}
                  onSubmitResponse={(responseText) => handleSubmitResponse(report.id, responseText)}
                  onTranslate={() => handleTranslateReport(report.id)}
                  onResetTranslation={() => handleResetTranslation(report.id)}
                  translatedData={translatedReports[report.id]}
                  isTranslating={translatingReports[report.id] || false}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="inProgress" className="mt-6">
            {reports.filter(report => report.status === "inProgress").length === 0 ? (
              <div className="text-center py-10 border rounded-md">
                <p className="text-muted-foreground">Tidak ada laporan yang sedang diproses</p>
              </div>
            ) : (
              reports.filter(report => report.status === "inProgress").map((report) => (
                <ExpandableReportCard 
                  key={report.id} 
                  report={report} 
                  isExpanded={expandedReportId === report.id}
                  onToggleDetail={() => toggleReportDetail(report.id)}
                  onSubmitResponse={(responseText) => handleSubmitResponse(report.id, responseText)}
                  onTranslate={() => handleTranslateReport(report.id)}
                  onResetTranslation={() => handleResetTranslation(report.id)}
                  translatedData={translatedReports[report.id]}
                  isTranslating={translatingReports[report.id] || false}
                  showResolveButton={true}
                  onResolve={() => handleResolveReport(report.id)}
                  showAIMatching={true}
                  onAIMatching={() => handleAIMatching(report.id)}
                  onSendWhatsApp={() => handleSendToWhatsApp(report.id)}
                  isMatching={matchingReports[report.id] || false}
                  matchResult={referralResults[report.id]}
                />
              ))
            )}
          </TabsContent>

          <TabsContent value="archived" className="mt-6">
            {reports.filter(report => report.status === "archived").length === 0 ? (
              <div className="text-center py-10 border rounded-md">
                <p className="text-muted-foreground">Tidak ada laporan yang telah ditangani</p>
              </div>
            ) : (
              reports.filter(report => report.status === "archived").map((report) => (
                <ExpandableReportCard 
                  key={report.id} 
                  report={report} 
                  isExpanded={expandedReportId === report.id}
                  onToggleDetail={() => toggleReportDetail(report.id)}
                  onSubmitResponse={(responseText) => handleSubmitResponse(report.id, responseText)}
                  onTranslate={() => handleTranslateReport(report.id)}
                  onResetTranslation={() => handleResetTranslation(report.id)}
                  translatedData={translatedReports[report.id]}
                  isTranslating={translatingReports[report.id] || false}
                  readOnly={true}
                />
              ))
            )}
          </TabsContent>
        </Tabs>
      )}

      <Toaster />
    </div>
  );
}

function ExpandableReportCard({ 
  report, 
  isExpanded, 
  onToggleDetail, 
  onSubmitResponse, 
  onTranslate,
  onResetTranslation,
  translatedData,
  isTranslating = false,
  readOnly = false,
  showResolveButton = false,
  onResolve,
  showAIMatching = false,
  onAIMatching,
  onSendWhatsApp,
  isMatching = false,
  matchResult
}) {
  const [newResponse, setNewResponse] = useState('');
  const [height, setHeight] = useState('auto');
  const [isContentVisible, setIsContentVisible] = useState(false);
  const detailRef = useRef(null);
  const [isHeightSet, setIsHeightSet] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Content size observer with improved height management
  useEffect(() => {
    if (isExpanded) {
      setIsContentVisible(true);
      
      // Create a ResizeObserver to dynamically adjust height when content changes
      const resizeObserver = new ResizeObserver(entries => {
        for (const entry of entries) {
          // Add extra padding to ensure all content is visible
          setHeight(entry.contentRect.height + 60 + 'px');
        }
      });
      
      // Initial height calculation with requestAnimationFrame for DOM update
      const updateHeight = () => {
        if (detailRef.current) {
          // Add extra padding to ensure all content is visible
          setHeight(detailRef.current.scrollHeight + 50 + 'px');
          setIsHeightSet(true);
          // Observe changes to content size
          resizeObserver.observe(detailRef.current);
        } else {
          // Retry if ref is not ready yet
          setTimeout(updateHeight, 50);
        }
      };

      // Allow DOM to update first
      setTimeout(updateHeight, 50);
      
      return () => {
        if (detailRef.current) {
          resizeObserver.unobserve(detailRef.current);
        }
      };
    } else {
      setHeight('0px');
      setIsHeightSet(false);
      // Set a timeout to hide content after animation completes
      const timer = setTimeout(() => {
        setIsContentVisible(false);
      }, 500); // Match this to the duration in the transition
      return () => clearTimeout(timer);
    }
  }, [isExpanded]);
  
  // Handle response submission
  const handleSubmit = async () => {
    if (newResponse.trim()) {
      setIsSubmitting(true);
      try {
        await onSubmitResponse(newResponse);
        setNewResponse('');
      } catch (error) {
        console.error("Error submitting response:", error);
      } finally {
        setIsSubmitting(false);
      }
    }
  };

  // Format date for display
  const displayDate = report.date ? formatDate(report.date) : 'Tidak diketahui';
  
  return (
    <Card 
      className={`p-4 mb-6 transition-all duration-500 ease-in-out ${
        isExpanded ? 'border-blue-400 shadow-lg transform scale-[1.01]' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="font-semibold text-lg">
              {translatedData ? translatedData.title : report.title}
            </h3>
            {translatedData && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-1 rounded">
                AI Translated
              </span>
            )}
          </div>
          
          {translatedData && (
            <div className="mb-2">
              <p className="text-xs text-gray-400 mb-1">Judul asli:</p>
              <p className="text-sm text-gray-600 italic">{translatedData.originalTitle}</p>
            </div>
          )}
          
          <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-none">
            {translatedData ? translatedData.description : report.description}
          </p>
          
          {translatedData && (
            <div className="mt-2">
              <p className="text-xs text-gray-400 mb-1">Deskripsi asli:</p>
              <p className="text-sm text-gray-600 italic line-clamp-2 md:line-clamp-none">
                {translatedData.originalDescription}
              </p>
            </div>
          )}
          
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {report.category}
            </span>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {report.urgency}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hidden sm:inline-block">
              {displayDate}
            </span>
          </div>

          {/* AI Matching Result Display */}
          {matchResult && (
            <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  AI Rekomendasi: {matchResult.personnel.name}
                </span>
                <span className="text-xs bg-green-200 text-green-700 px-2 py-1 rounded">
                  {matchResult.confidence}% cocok
                </span>
              </div>
              <p className="text-xs text-green-700">{matchResult.personnel.position}</p>
              <p className="text-sm text-green-800 mt-1">{matchResult.reason}</p>
            </div>
          )}
        </div>
        
        <div className="flex flex-col gap-2 ml-2">
          {/* Translate Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={translatedData ? onResetTranslation : onTranslate}
            disabled={isTranslating}
            className="whitespace-nowrap"
          >
            {isTranslating ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                AI Translate...
              </>
            ) : translatedData ? (
              <>
                <X className="w-4 h-4 mr-1" />
                Reset
              </>
            ) : (
              <>
                <Languages className="w-4 h-4 mr-1" />
                AI Translate
              </>
            )}
          </Button>

          {/* AI Matching Button - Only for inProgress reports */}
          {showAIMatching && (
            <Button
              variant="outline"
              size="sm"
              onClick={onAIMatching}
              disabled={isMatching}
              className="whitespace-nowrap bg-purple-50 text-purple-600 hover:bg-purple-100 border-purple-200"
            >
              {isMatching ? (
                <>
                  <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                  AI Matching...
                </>
              ) : (
                <>
                  <AlertCircle className="w-4 h-4 mr-1" />
                  AI Match
                </>
              )}
            </Button>
          )}

          {/* WhatsApp Button - Only show if we have a match result */}
          {matchResult && onSendWhatsApp && (
            <Button
              variant="outline"
              size="sm"
              onClick={onSendWhatsApp}
              className="whitespace-nowrap bg-green-50 text-green-600 hover:bg-green-100 border-green-200"
            >
              <MessageCircle className="w-4 h-4 mr-1" />
              Kirim WA
            </Button>
          )}
          
          {/* Resolve Button for In Progress reports */}
          {showResolveButton && onResolve && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onResolve}
              className="bg-green-100 text-green-600 hover:bg-green-200 border border-green-200 whitespace-nowrap"
            >
              <CheckCircle className="w-4 h-4 mr-1" /> Tandai Selesai
            </Button>
          )}
          
          {/* Detail Toggle Button */}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={onToggleDetail}
            className={`transition-all duration-500 ease-in-out whitespace-nowrap ${
              isExpanded ? 'bg-blue-50 border-blue-300' : ''
            }`}
          >
            <span className="flex items-center gap-1">
              {isExpanded ? (
                <>
                  <ChevronUp className="w-4 h-4 transition-transform duration-500 ease-in-out" />
                  <span>Tutup Detail</span>
                </>
              ) : (
                <>
                  <ChevronDown className="w-4 h-4 transition-transform duration-500 ease-in-out" />
                  <span>Lihat Detail</span>
                </>
              )}
            </span>
          </Button>
        </div>
      </div>

      <div 
        className={`overflow-hidden transition-all duration-500 ease-in-out ${
          isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}
        style={{ 
          height: isExpanded ? (isHeightSet ? height : 'auto') : '0px',
          visibility: isContentVisible ? 'visible' : 'hidden',
          paddingBottom: isExpanded ? '20px' : '0'
        }}
      >
        <div ref={detailRef} className="mt-6 border-t pt-4">
          <div 
            className={`flex justify-between items-start mb-4 flex-wrap transition-all duration-500 ease-in-out delay-[50ms] ${
              isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
            }`}
          >
            <div>
              <div className="flex flex-wrap gap-2">
                <span className="text-sm text-gray-500">
                  Oleh: {report.submittedBy}
                </span>
                <span className="text-sm text-gray-500">
                  • {report.submittedAt}
                </span>
              </div>
            </div>
            <div className="flex items-center gap-2 mt-2 sm:mt-0">
              <StatusBadge status={getStatusText(report.status)} />
              <UrgencyBadge urgency={report.urgency} />
            </div>
          </div>

          {report.estimatedTime ? (
            <div 
              className={`flex items-center gap-2 text-sm text-gray-500 mb-4 transition-all duration-500 ease-in-out delay-[100ms] ${
                isExpanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-2'
              }`}
            >
              <Clock className="w-4 h-4 flex-shrink-0" />
              <span>Estimasi waktu penanganan: {report.estimatedTime}</span>
            </div>
          ) : null}

          {/* Attachment display if available */}
          {report.original && report.original.lampiran && (
            <div className="mb-4 mt-2">
              <h4 className="font-semibold mb-2">Lampiran:</h4>
              <div className="overflow-hidden rounded-md border border-gray-200">
                {(() => {
                  // Format the attachment URL
                  const attachmentPath = report.original.lampiran;
                  let attachmentUrl;
                  
                  if (attachmentPath.includes('public/uploads/')) {
                    const fileName = attachmentPath.split('/').pop();
                    attachmentUrl = `/uploads/${fileName}`;
                  } else if (attachmentPath.includes('/uploads/') || attachmentPath.includes('/storage/')) {
                    attachmentUrl = attachmentPath;
                  } else if (attachmentPath.startsWith('lampiran/')) {
                    attachmentUrl = `/uploads/${attachmentPath}`;
                  } else if (attachmentPath.startsWith('lampiran_')) {
                    attachmentUrl = `/uploads/${attachmentPath}`;
                  } else {
                    attachmentUrl = `/uploads/${attachmentPath}`;
                  }
                  
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(attachmentPath);
                  
                  if (isImage) {
                    return (
                      <img 
                        src={attachmentUrl} 
                        alt="Lampiran" 
                        className="w-full max-h-64 object-contain"
                        onError={(e) => {
                          // Try alternative paths if initial load fails
                          const fileName = attachmentPath.split('/').pop();
                          e.target.src = `/uploads/${fileName}`;
                          e.target.onerror = () => {
                            e.target.src = `/storage/${fileName}`;
                            e.target.onerror = null;
                          };
                        }}
                      />
                    );
                  } else {
                    return (
                      <a 
                        href={attachmentUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 underline text-sm flex items-center gap-2 p-4"
                      >
                        <FileText className="w-5 h-5" /> Lihat Lampiran
                      </a>
                    );
                  }
                })()}
              </div>
            </div>
          )}

          {/* Response Section - Made more responsive and adaptive */}
          <div 
            className={`border-t pt-4 mt-4 transition-all duration-500 ease-in-out delay-[150ms] ${
              isExpanded ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
            }`}
          >
            <h4 className="font-semibold mb-2 text-lg">Riwayat Respon</h4>
            <div className="space-y-3 mb-6 max-h-[500px] overflow-y-auto pb-2">
              {report.responses && report.responses.length > 0 ? (
                report.responses.map((response, idx) => (
                  <div 
                    key={idx} 
                    className="bg-gray-50 p-4 rounded-lg transform transition-all duration-300 hover:bg-gray-100 hover:shadow-sm break-words"
                  >
                    <p className="text-sm whitespace-pre-line">{response.message}</p>
                    <div className="flex flex-wrap gap-2 mt-2 text-xs text-gray-500">
                      <span>{response.author}</span>
                      <span>•</span>
                      <span>{typeof response.timestamp === 'string' ? 
                        formatDateTime(new Date(response.timestamp)) : 
                        formatDateTime(response.timestamp)}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">Belum ada respon</p>
              )}
            </div>

            {!readOnly && (
              <div className="space-y-4 mb-2">
                <div>
                  <h4 className="font-semibold mb-2">Berikan Respon</h4>
                  <Textarea 
                    placeholder="Tulis respon..." 
                    value={newResponse}
                    onChange={(e) => setNewResponse(e.target.value)}
                    className="transition-all focus:border-blue-400 hover:border-gray-300 min-h-[120px] text-base"
                    disabled={isSubmitting}
                  />
                </div>
                
                <div className="flex justify-end">
                  <Button 
                    onClick={handleSubmit}
                    className="transition-all hover:bg-blue-600 active:scale-95 h-10 text-base"
                    disabled={!newResponse.trim() || isSubmitting}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Mengirim...
                      </>
                    ) : (
                      'Kirim Respon'
                    )}
                  </Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
}

function StatusBadge({ status }) {
  const getStatusStyle = () => {
    switch (status) {
      case 'Completed':
      case 'Selesai':
        return 'bg-green-100 text-green-600';
      case 'In Progress':
        return 'bg-blue-100 text-blue-600';
      default:
        return 'bg-yellow-100 text-yellow-600';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${getStatusStyle()}`}>
      {status}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const getUrgencyStyle = () => {
    switch (urgency) {
      case 'High':
        return 'bg-red-100 text-red-600';
      case 'Medium':
        return 'bg-orange-100 text-orange-600';
      case 'Low':
        return 'bg-gray-100 text-gray-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm ${getUrgencyStyle()}`}>
      {urgency}
    </span>
  );
}

function getStatusText(status) {
  switch (status) {
    case 'new':
      return 'Pending';
    case 'inProgress':
      return 'In Progress';
    case 'archived':
      return 'Selesai';
    default:
      return 'Pending';
  }
}
