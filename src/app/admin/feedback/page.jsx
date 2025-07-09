'use client';

import { useState, useEffect } from 'react';
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
import { Loader2, Trash2, Sparkles } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { createChatSession } from "@/ai/groq";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

// Dummy data sebagai fallback
const DUMMY_FEEDBACK_DATA = [
  {
    id: 1,
    title: "Kerusakan Fasilitas Lab Komputer",
    category: "Fasilitas",
    description: "Beberapa komputer tidak dapat menyala dan koneksi internet terputus",
    user_id: 101,
    created_at: "2024-01-15 10:30",
    balasan: "Teknisi sedang melakukan pengecekan. Mohon tunggu update selanjutnya.",
    updated_at: "2024-01-15 11:00",
  },
  {
    id: 2,
    title: "Masalah Nilai UAS",
    category: "Akademik",
    description: "Nilai UAS belum keluar padahal sudah lewat batas waktu",
    user_id: 102,
    created_at: "2024-01-14 09:15",
    balasan: null,
  }
];

export default function FeedbackPage() {
  const [feedbackData, setFeedbackData] = useState([]);
  const [selectedFeedback, setSelectedFeedback] = useState(null); // ID dari feedback yang sedang diedit
  const [responseValues, setResponseValues] = useState({}); // State untuk balasan per feedback
  const [isLoading, setIsLoading] = useState(true); 
  const [statusFilter, setStatusFilter] = useState('all');
  const [deletingId, setDeletingId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReplying, setIsReplying] = useState(false);
  const [generatingAIFor, setGeneratingAIFor] = useState(null); // ID feedback yang sedang di-generate AI
  const { toast } = useToast();
  
  // Helper function untuk mendapatkan authorization header
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };

  // Fetch feedback data
  useEffect(() => {
    fetchFeedbackData();
  }, [statusFilter]);
  
  const fetchFeedbackData = async () => {
    setIsLoading(true);
    try {
      let url = 'http://127.0.0.1:8000/api/admin/feedback';
      if (statusFilter !== 'all') {
        url += `?status=${statusFilter}`;
      }
      
      const response = await fetch(url, {
        headers: getAuthHeaders(),
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
        // Handle berbagai format respons
      let feedbacks = [];
      
      if (data.feedback && Array.isArray(data.feedback)) {
        feedbacks = data.feedback;
      } else if (data.data && Array.isArray(data.data)) {
        feedbacks = data.data;
      } else if (Array.isArray(data)) {
        feedbacks = data;
      }
      
      // Log untuk debugging
      console.log('Feedback data fetched:', feedbacks);
      
      setFeedbackData(feedbacks);
    } catch (error) {
      console.error('Error fetching feedback data:', error);
      toast({
        title: 'Gagal memuat data',
        description: 'Menggunakan data contoh untuk tampilan',
        variant: 'destructive',
      });
      // Gunakan dummy data jika API tidak tersedia
      setFeedbackData(DUMMY_FEEDBACK_DATA);
    } finally {
      setIsLoading(false);
    }
  };  // Generate AI response with Groq
  const handleGenerateAIResponse = async (feedback) => {
    if (!feedback) return;
    
    setGeneratingAIFor(feedback.id);
    
    try {
      // Buat prompt yang membantu AI memberikan balasan yang tepat
      const prompt = `
        Kamu adalah admin dari platform LaporKampus yang bertugas memberikan balasan untuk feedback dari pengguna.
        
        Berikut adalah detail feedback:
        - Judul: ${feedback.title || 'Tidak ada judul'}
        - Deskripsi: ${feedback.komentar || feedback.description || 'Tidak ada deskripsi'}
        - Dari: Pengguna #${feedback.user_id || 'Anonim'}
        
        Berikan balasan yang sopan, profesional, dan menunjukkan empati.
        Respon harus dalam Bahasa Indonesia.
        Jangan melebihi 5 kalimat.
        Hindari memberikan janji spesifik tentang waktu penyelesaian.
        Berterima kasih atas masukan pengguna.
      `;

      // Buat sesi chat
      const chatSession = await createChatSession();
      
      // Kirim prompt ke AI
      const aiResponse = await chatSession.sendMessage(prompt);
      
      // Set response untuk feedback spesifik
      setResponseValues(prev => ({
        ...prev,
        [feedback.id]: aiResponse
      }));
      
      toast({
        title: "Balasan AI berhasil dibuat",
        description: "Anda dapat mengedit balasan sebelum mengirimnya",
        variant: "success",
      });
    } catch (error) {
      console.error('Error generating AI response:', error);
      toast({
        title: "Gagal membuat balasan AI",
        description: "Silakan coba lagi nanti atau buat balasan manual",
        variant: "destructive",
      });
    } finally {
      setGeneratingAIFor(null);
    }
  };  // Fungsi untuk membatalkan edit balasan
  const cancelEdit = () => {
    if (selectedFeedback) {
      // Reset nilai respon untuk feedback yang sedang diedit
      setResponseValues(prev => ({
        ...prev,
        [selectedFeedback]: ''
      }));
    }
    setSelectedFeedback(null);
  };
  const handleSubmitResponse = async (feedbackId) => {
    const responseText = responseValues[feedbackId] || '';
    
    if (!responseText.trim()) {
      toast({
        title: "Respon tidak boleh kosong",
        variant: "destructive",
      });
      return;
    }
    
    setIsReplying(true);
    
    try {
      // Sesuai dengan struktur tabel feedback, kita hanya perlu mengirim balasan
      const response = await fetch(`http://127.0.0.1:8000/api/admin/feedback/${feedbackId}/reply`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          balasan: responseText
        }),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      toast({
        title: selectedFeedback === feedbackId ? "Balasan berhasil diperbarui" : "Respon berhasil dikirim",
        variant: "success",
      });
      
      // Reset form dan selected feedback
      setResponseValues(prev => ({
        ...prev,
        [feedbackId]: ''
      }));
      setSelectedFeedback(null);
      
      // Refresh data
      fetchFeedbackData();
    } catch (error) {
      console.error('Error submitting response:', error);
      toast({
        title: "Gagal " + (selectedFeedback === feedbackId ? "memperbarui balasan" : "mengirim respon"),
        description: "Silakan coba lagi nanti",
        variant: "destructive",
      });
    } finally {
      setIsReplying(false);
    }
  };

  const handleDeleteFeedback = async () => {
    if (!deletingId) return;
    
    setIsDeleting(true);
    
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/admin/feedback/${deletingId}`, {
        method: 'DELETE',
        headers: getAuthHeaders(),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      toast({
        title: "Feedback berhasil dihapus",
        variant: "success", 
      });
      
      // Update lokal data dengan menghapus feedback yang sudah dihapus
      setFeedbackData((prev) => prev.filter(item => item.id !== deletingId));
    } catch (error) {
      console.error('Error deleting feedback:', error);
      toast({
        title: "Gagal menghapus feedback",
        description: "Silakan coba lagi nanti",
        variant: "destructive", 
      });
    } finally {
      setIsDeleting(false);
      setDeletingId(null);
    }
  };  const filteredFeedbackData = statusFilter === 'all' 
    ? feedbackData 
    : feedbackData.filter(feedback => {
        // Filter yang disederhanakan berdasarkan ada/tidaknya balasan
        
        // Jika memilih "Sudah Dibalas"
        if (statusFilter === 'completed') {
          return !!feedback.balasan;
        }
        
        // Jika memilih "Belum Dibalas"
        if (statusFilter === 'not_replied') {
          return !feedback.balasan;
        }
        
        return true;
    });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen Feedback</h1>        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Semua Feedback</SelectItem>
            <SelectItem value="completed">Sudah Dibalas</SelectItem>
            <SelectItem value="not_replied">Belum Dibalas</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>      ) : filteredFeedbackData.length === 0 ? (
        <Card className="p-6 text-center">
          <p className="text-gray-500">Belum ada feedback.</p>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredFeedbackData.map((feedback) => (
            <Card key={feedback.id} className="p-6">
              <div className="flex justify-between items-start mb-4">                <div>
                  <h3 className="text-xl font-semibold">{feedback.title}</h3>
                  <div className="flex gap-2 mt-2">                    <span className="text-sm text-gray-500">
                      Oleh: {(() => {
                        // Dengan skema yang lebih sederhana, user_id mungkin hanya berupa angka
                        if (feedback.user_id) {
                          return `Pengguna #${feedback.user_id}`;
                        }
                        // Berbagai fallback untuk backward compatibility
                        if (feedback.submittedBy) return feedback.submittedBy;
                        if (feedback.user_name) return feedback.user_name;
                        
                        // Handling untuk berbagai format objek user
                        if (feedback.user) {
                          if (typeof feedback.user === 'object' && feedback.user !== null) {
                            return feedback.user.name || feedback.user.username || feedback.user.email || `Pengguna #${feedback.user.id || ''}`;
                          }
                          return feedback.user.toString();
                        }
                        
                        return "Pengguna Anonim";
                      })()}
                    </span>
                    <span className="text-sm text-gray-500">
                      • {feedback.submittedAt || feedback.created_at || new Date().toLocaleDateString()}
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-3">                <div className="flex items-center gap-2">
                    {feedback.balasan ? (
                      <span className="px-3 py-1 rounded-full text-sm bg-green-100 text-green-600">
                        Sudah Dibalas
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full text-sm bg-yellow-100 text-yellow-600">
                        Belum Dibalas
                      </span>
                    )}
                  </div>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => setDeletingId(feedback.id)}
                    title="Hapus Feedback"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>              <p className="text-gray-600 mb-4">
                {feedback.komentar || 'Tidak ada deskripsi'}
              </p>              {/* Response Section */}
              <div className="border-t pt-4 mt-4">
                <h4 className="font-semibold mb-2">Riwayat Respon</h4>
                <div className="space-y-3 mb-4">                  {/* Berdasarkan skema yang diberikan, kita tidak memiliki array responses, hanya kolom balasan */}
                  {feedback.balasan ? (
                    <div className="bg-gray-50 p-3 rounded-lg">                      
                      <p className="text-sm">{feedback.balasan || 'Tidak ada balasan'}</p>
                      <div className="flex justify-between items-center mt-2">
                        <div className="flex gap-2 text-xs text-gray-500">
                          <span>Admin</span>
                          <span>•</span>
                          <span>{feedback.updated_at || feedback.replied_at || new Date().toLocaleDateString()}</span>
                        </div>                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => {
                            // Set response untuk diedit
                            setResponseValues(prev => ({
                              ...prev,
                              [feedback.id]: feedback.balasan || ''
                            }));
                            // Set selected feedback untuk mode edit
                            setSelectedFeedback(feedback.id);
                          }}
                        >
                          Edit Balasan
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-gray-500">Belum ada respon.</p>
                  )}
                </div>
                
                {/* Form respon hanya muncul jika belum ada balasan atau sedang dalam mode edit */}
                {(!feedback.balasan || selectedFeedback === feedback.id) && (
                  <div className="space-y-2">                    <Textarea 
                      placeholder="Tulis respon..." 
                      value={responseValues[feedback.id] || ''}
                      onChange={(e) => setResponseValues(prev => ({
                        ...prev,
                        [feedback.id]: e.target.value
                      }))}
                    />                    <div className="flex justify-between items-center">
                      {selectedFeedback === feedback.id ? (
                        <Button 
                          onClick={cancelEdit}
                          variant="ghost"
                          disabled={isReplying}
                        >
                          Batal
                        </Button>
                      ) : (
                        <Button 
                          onClick={() => handleGenerateAIResponse(feedback)}
                          variant="outline"
                          disabled={generatingAIFor !== null || isReplying}
                          className="gap-1.5"
                        >
                          {generatingAIFor === feedback.id ? (
                            <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              <span>Membuat balasan...</span>
                            </>
                          ) : (
                            <>
                              <Sparkles className="h-4 w-4" />
                              <span>Generate dengan AI</span>
                            </>
                          )}
                        </Button>
                      )}
                      
                      <Button 
                        onClick={() => handleSubmitResponse(feedback.id)}
                        disabled={isReplying}
                      >
                        {isReplying ? (
                          <div className="flex items-center gap-2">
                            <Loader2 className="h-4 w-4 animate-spin" />
                            <span>Mengirim...</span>
                          </div>
                        ) : (
                          <span>{selectedFeedback === feedback.id ? 'Perbarui Balasan' : 'Kirim Respon'}</span>
                        )}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Dialog konfirmasi hapus */}
      <AlertDialog open={!!deletingId} onOpenChange={(open) => !open && setDeletingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Konfirmasi Hapus</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus feedback ini? Tindakan ini tidak dapat dibatalkan.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Batal</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteFeedback} 
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600 text-white"
            >
              {isDeleting ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Menghapus...</span>
                </div>
              ) : (
                <span>Hapus</span>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// Fungsi status badge dan urgency badge telah dihapus karena tidak lagi diperlukan
