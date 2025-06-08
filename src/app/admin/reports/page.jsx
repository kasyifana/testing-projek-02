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
  ChevronUp
} from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

const DUMMY_REPORTS = [
  {
    id: 1,
    title: "Kerusakan AC Ruang 301",
    category: "Fasilitas",
    urgency: "High",
    date: "2024-01-15",
    status: "new",
    description: "AC tidak dingin dan mengeluarkan bunyi keras",
    submittedBy: "Mahasiswa A",
    submittedAt: "2024-01-15 10:30",
    estimatedTime: "", // Removed fixed estimation time
    responses: [
      {
        message: "Teknisi sedang melakukan pengecekan. Mohon tunggu update selanjutnya.",
        timestamp: "2024-01-15 11:00",
        author: "Admin"
      }
    ]
  },
  {
    id: 2,
    title: "Komplain Nilai UAS",
    category: "Akademik",
    urgency: "Medium",
    date: "2024-01-14",
    status: "archived",
    description: "Nilai tidak sesuai dengan hasil ujian",
    submittedBy: "Mahasiswa B",
    submittedAt: "2024-01-14 09:15",
    estimatedTime: "5 hari",
    responses: []
  },
  {
    id: 3,
    title: "Kerusakan Proyektor di Ruang 204",
    category: "Fasilitas",
    urgency: "High",
    date: "2024-01-16",
    status: "new",
    description: "Proyektor tidak dapat tersambung ke laptop dan gambar yang dihasilkan tidak jelas. Sudah dicoba dengan beberapa laptop berbeda namun masalah tetap sama. Sangat mengganggu proses belajar mengajar.",
    submittedBy: "Dosen C",
    submittedAt: "2024-01-16 08:45",
    estimatedTime: "2 hari",
    responses: [
      {
        message: "Terima kasih atas laporannya. Tim IT akan segera memeriksa kondisi proyektor tersebut hari ini.",
        timestamp: "2024-01-16 09:30",
        author: "Admin"
      },
      {
        message: "Update: Proyektor tersebut memerlukan penggantian kabel HDMI dan penyesuaian pengaturan resolusi. Teknisi akan melakukan perbaikan besok pagi.",
        timestamp: "2024-01-16 14:15",
        author: "Tim IT"
      }
    ]
  },
  {
    id: 4,
    title: "Kebocoran Atap Perpustakaan",
    category: "Fasilitas",
    urgency: "Medium",
    date: "2024-01-13",
    status: "inProgress",
    description: "Terdapat kebocoran pada atap perpustakaan di bagian sudut timur. Saat hujan, air menetes dan bisa merusak buku-buku yang ada di bawahnya.",
    submittedBy: "Staf Perpustakaan",
    submittedAt: "2024-01-13 11:20",
    estimatedTime: "7 hari",
    responses: [
      {
        message: "Tim pemeliharaan akan melakukan pengecekan hari ini.",
        timestamp: "2024-01-13 13:00",
        author: "Admin"
      },
      {
        message: "Perbaikan telah dilakukan dengan menambal bagian yang bocor. Untuk sementara masalah sudah teratasi, namun perlu perbaikan lebih lanjut saat musim hujan berakhir.",
        timestamp: "2024-01-14 16:45",
        author: "Tim Pemeliharaan"
      },
      {
        message: "Perbaikan permanen telah selesai dilakukan. Mohon informasikan jika masih terdapat masalah.",
        timestamp: "2024-01-17 10:30",
        author: "Tim Pemeliharaan"
      }
    ]
  }
];

export default function ReportsManagement() {
  const [activeTab, setActiveTab] = useState("new");
  const [expandedReportId, setExpandedReportId] = useState(null);
  const [newResponse, setNewResponse] = useState('');

  const toggleReportDetail = (reportId) => {
    if (expandedReportId === reportId) {
      setExpandedReportId(null);
    } else {
      setExpandedReportId(reportId);
    }
  };

  const handleSubmitResponse = () => {
    // Handle response submission logic here
    console.log('Response submitted:', newResponse);
    setNewResponse('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Laporan</h1>
      </div>

      {/* Tabs & Content */}
      <Tabs defaultValue="new" className="w-full">
        <TabsList>
          <TabsTrigger value="new" className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4" /> Laporan Baru
          </TabsTrigger>
          <TabsTrigger value="inProgress" className="flex items-center gap-2">
            <XCircle className="w-4 h-4" /> Sedang Progres
          </TabsTrigger>
          <TabsTrigger value="archived" className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4" /> Ditangani
          </TabsTrigger>
        </TabsList>

        <TabsContent value="new" className="mt-6">
          {DUMMY_REPORTS.filter(report => report.status === "new").map((report) => (
            <ExpandableReportCard 
              key={report.id} 
              report={report} 
              isExpanded={expandedReportId === report.id}
              onToggleDetail={() => toggleReportDetail(report.id)}
              onSubmitResponse={handleSubmitResponse}
            />
          ))}
        </TabsContent>

        <TabsContent value="inProgress" className="mt-6">
          {DUMMY_REPORTS.filter(report => report.status === "inProgress").map((report) => (
            <ExpandableReportCard 
              key={report.id} 
              report={report} 
              isExpanded={expandedReportId === report.id}
              onToggleDetail={() => toggleReportDetail(report.id)}
              onSubmitResponse={handleSubmitResponse}
            />
          ))}
        </TabsContent>

        <TabsContent value="archived" className="mt-6">
          {DUMMY_REPORTS.filter(report => report.status === "archived").map((report) => (
            <ExpandableReportCard 
              key={report.id} 
              report={report} 
              isExpanded={expandedReportId === report.id}
              onToggleDetail={() => toggleReportDetail(report.id)}
              onSubmitResponse={handleSubmitResponse}
            />
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function ExpandableReportCard({ report, isExpanded, onToggleDetail, onSubmitResponse }) {
  const [newResponse, setNewResponse] = useState('');
  const [height, setHeight] = useState('auto');
  const [isContentVisible, setIsContentVisible] = useState(false);
  const detailRef = useRef(null);
  const [isHeightSet, setIsHeightSet] = useState(false);

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
  const handleSubmit = () => {
    if (newResponse.trim()) {
      onSubmitResponse(newResponse);
      setNewResponse('');
    }
  };
  
  return (
    <Card 
      className={`p-4 mb-6 transition-all duration-500 ease-in-out ${
        isExpanded ? 'border-blue-400 shadow-lg transform scale-[1.01]' : 'shadow-sm hover:shadow-md'
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex-grow">
          <h3 className="font-semibold text-lg">{report.title}</h3>
          <p className="text-sm text-gray-500 line-clamp-2 md:line-clamp-none">{report.description}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            <span className="text-xs bg-blue-100 text-blue-600 px-2 py-1 rounded">
              {report.category}
            </span>
            <span className="text-xs bg-orange-100 text-orange-600 px-2 py-1 rounded">
              {report.urgency}
            </span>
            <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded hidden sm:inline-block">
              {report.date}
            </span>
          </div>
        </div>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={onToggleDetail}
          className={`transition-all duration-500 ease-in-out ml-2 whitespace-nowrap ${
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
            </div>
          ) : null}

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
                      <span>{response.timestamp}</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 py-2">Belum ada respon</p>
              )}
            </div>

            <div className="space-y-4 mb-2">
              <div>
                <h4 className="font-semibold mb-2">Berikan Respon</h4>
                <Textarea 
                  placeholder="Tulis respon..." 
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                  className="transition-all focus:border-blue-400 hover:border-gray-300 min-h-[120px] text-base"
                />
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="w-full sm:w-1/2">
                  <label className="block text-sm font-medium mb-1 text-gray-700">
                    Estimasi Waktu Penyelesaian
                  </label>
                  <Select defaultValue="3">
                    <SelectTrigger className="w-full sm:w-[200px] transition-all focus:border-blue-400 hover:border-gray-300 bg-white h-10">
                      <SelectValue placeholder="Estimasi waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hari</SelectItem>
                      <SelectItem value="3">3 hari</SelectItem>
                      <SelectItem value="7">1 minggu</SelectItem>
                      <SelectItem value="14">2 minggu</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="w-full sm:w-1/2 flex items-end">
                  <Button 
                    onClick={handleSubmit}
                    className="transition-all hover:bg-blue-600 active:scale-95 h-10 w-full sm:w-auto text-base"
                    disabled={!newResponse.trim()}
                  >
                    Kirim Respon
                  </Button>
                </div>
              </div>
            </div>
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
      return 'Completed';
    default:
      return 'Pending';
  }
}
