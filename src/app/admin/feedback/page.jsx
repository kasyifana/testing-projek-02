'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { MessageSquare, Clock, CheckCircle, AlertTriangle } from "lucide-react";

// Dummy data
const FEEDBACK_DATA = [
  {
    id: 1,
    title: "Kerusakan Fasilitas Lab Komputer",
    category: "Fasilitas",
    status: "In Progress",
    urgency: "High",
    description: "Beberapa komputer tidak dapat menyala dan koneksi internet terputus",
    submittedBy: "Mahasiswa A",
    submittedAt: "2024-01-15 10:30",
    estimatedTime: "3 hari",
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
    title: "Masalah Nilai UAS",
    category: "Akademik",
    status: "Pending",
    urgency: "Medium",
    description: "Nilai UAS belum keluar padahal sudah lewat batas waktu",
    submittedBy: "Mahasiswa B",
    submittedAt: "2024-01-14 09:15",
    estimatedTime: "5 hari",
    responses: []
  }
];

export default function FeedbackPage() {
  const [selectedFeedback, setSelectedFeedback] = useState(null);
  const [newResponse, setNewResponse] = useState('');

  const handleSubmitResponse = (feedbackId) => {
    // Handle response submission logic here
    console.log('Response submitted:', newResponse);
    setNewResponse('');
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Feedback</h1>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Status</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Selesai</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-4">
        {FEEDBACK_DATA.map((feedback) => (
          <Card key={feedback.id} className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-semibold">{feedback.title}</h3>
                <div className="flex gap-2 mt-2">
                  <span className="text-sm text-gray-500">
                    Oleh: {feedback.submittedBy}
                  </span>
                  <span className="text-sm text-gray-500">
                    • {feedback.submittedAt}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <StatusBadge status={feedback.status} />
                <UrgencyBadge urgency={feedback.urgency} />
              </div>
            </div>

            <p className="text-gray-600 mb-4">{feedback.description}</p>

            <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
              <Clock className="w-4 h-4" />
              <span>Estimasi Penyelesaian: {feedback.estimatedTime}</span>
            </div>

            {/* Response Section */}
            <div className="border-t pt-4 mt-4">
              <h4 className="font-semibold mb-2">Riwayat Respon</h4>
              <div className="space-y-3 mb-4">
                {feedback.responses.map((response, idx) => (
                  <div key={idx} className="bg-gray-50 p-3 rounded-lg">
                    <p className="text-sm">{response.message}</p>
                    <div className="flex gap-2 mt-2 text-xs text-gray-500">
                      <span>{response.author}</span>
                      <span>•</span>
                      <span>{response.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="space-y-2">
                <Textarea 
                  placeholder="Tulis respon..." 
                  value={newResponse}
                  onChange={(e) => setNewResponse(e.target.value)}
                />
                <div className="flex justify-between items-center">
                  <Select defaultValue="3">
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Estimasi waktu" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hari</SelectItem>
                      <SelectItem value="3">3 hari</SelectItem>
                      <SelectItem value="7">1 minggu</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button 
                    onClick={() => handleSubmitResponse(feedback.id)}
                    className="ml-2"
                  >
                    Kirim Respon
                  </Button>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
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
