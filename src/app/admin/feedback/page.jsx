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
import { useToast } from "@/hooks/use-toast";
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
  const [autoResponseEnabled, setAutoResponseEnabled] = useState(false);
  const [autoResponseTemplate, setAutoResponseTemplate] = useState("");
  const [autoResponseQueue, setAutoResponseQueue] = useState([]); // Queue untuk auto response
  const [processingAutoResponse, setProcessingAutoResponse] = useState(false);
  const { toast } = useToast();

  // Load auto response settings from localStorage
  useEffect(() => {
    const savedAutoResponse = localStorage.getItem('autoResponseEnabled');
    const savedTemplate = localStorage.getItem('autoResponseTemplate');
    
    if (savedAutoResponse !== null) {
      setAutoResponseEnabled(JSON.parse(savedAutoResponse));
    }
    if (savedTemplate) {
      setAutoResponseTemplate(savedTemplate);
    }
  }, []);
  
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
  }, [statusFilter, autoResponseEnabled]);

  // Auto respond to new feedback without responses
  const autoRespondToFeedback = async (feedback) => {
    if (!autoResponseEnabled || feedback.balasan) return;
    
    try {
      let aiResponse = '';
      
      // Try to generate AI response first
      if (autoResponseTemplate) {
        try {
          const prompt = `
            Kamu adalah admin dari platform LaporKampus yang bertugas memberikan balasan untuk feedback dari pengguna.
            
            Gunakan template berikut sebagai panduan, tapi sesuaikan dengan konteks feedback:
            "${autoResponseTemplate}"
            
            Berikut adalah detail feedback:
            - Judul: ${feedback.title || 'Tidak ada judul'}
            - Deskripsi: ${feedback.komentar || feedback.description || 'Tidak ada deskripsi'}
            - Dari: Pengguna #${feedback.user_id || 'Anonim'}
            
            Berikan balasan yang sopan, profesional, dan menunjukkan empati.
            Respon harus dalam Bahasa Indonesia.
            Jangan melebihi 5 kalimat.
            Sesuaikan dengan konteks feedback yang diberikan.
          `;

          const chatSession = await createChatSession();
          aiResponse = await chatSession.sendMessage(prompt);
        } catch (error) {
          console.error('Error generating AI response:', error);
          
          // Check if it's a rate limit error
          if (error.message.includes('429') || error.message.includes('rate limit')) {
            toast({
              title: "Rate Limit AI Tercapai",
              description: "Menggunakan template default untuk balasan otomatis",
              variant: "destructive",
            });
          }
          
          // Fallback to template if AI fails
          aiResponse = autoResponseTemplate;
        }
      } else {
        // Use default template if no custom template is set
        aiResponse = "Terima kasih atas feedback Anda. Kami akan meninjau dan merespons secepatnya.";
      }

      // Send the auto response
      const response = await fetch(`https://laravel.kasyifana.my.id/api/admin/feedback/${feedback.id}/reply`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          balasan: aiResponse
        }),
      });

      if (response.ok) {
        console.log(`Auto response sent for feedback ${feedback.id}`);
        
        // Update local state
        setFeedbackData(prev => prev.map(item => 
          item.id === feedback.id 
            ? { ...item, balasan: aiResponse, updated_at: new Date().toISOString() }
            : item
        ));
        
        toast({
          title: "Balasan Otomatis Terkirim",
          description: `Feedback "${feedback.title}" telah dijawab otomatis`,
          variant: "success",
        });
      }
    } catch (error) {
      console.error('Error sending auto response:', error);
      toast({
        title: "Gagal Mengirim Balasan Otomatis",
        description: "Silakan coba lagi nanti atau balas manual",
        variant: "destructive",
      });
    }
  };

  // Process auto response queue with rate limiting
  const processAutoResponseQueue = async (feedbackList) => {
    if (processingAutoResponse || !autoResponseEnabled) return;
    
    const unrespondedFeedback = feedbackList.filter(feedback => !feedback.balasan);
    if (unrespondedFeedback.length === 0) return;
    
    setProcessingAutoResponse(true);
    
    try {
      for (let i = 0; i < unrespondedFeedback.length; i++) {
        const feedback = unrespondedFeedback[i];
        
        // Add delay between requests to avoid rate limiting
        if (i > 0) {
          await new Promise(resolve => setTimeout(resolve, 3000)); // 3 second delay
        }
        
        await autoRespondToFeedback(feedback);
      }
    } catch (error) {
      console.error('Error processing auto response queue:', error);
    } finally {
      setProcessingAutoResponse(false);
    }
  };
  
  const fetchFeedbackData = async () => {
    setIsLoading(true);
    try {
      let url = 'https://laravel.kasyifana.my.id/api/admin/feedback';
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
      
      // Auto respond to feedback without responses if auto response is enabled
      if (autoResponseEnabled) {
        // Use the new queue processing function with rate limiting
        processAutoResponseQueue(feedbacks);
      }
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
      
      // Check if it's a rate limit error
      if (error.message.includes('429') || error.message.includes('rate limit')) {
        toast({
          title: "Rate Limit AI Tercapai",
          description: "Silakan tunggu beberapa menit sebelum mencoba lagi atau gunakan template manual",
          variant: "destructive",
        });
        
        // Provide fallback template
        const fallbackTemplate = autoResponseTemplate || "Terima kasih atas feedback Anda. Kami akan meninjau dan merespons secepatnya.";
        setResponseValues(prev => ({
          ...prev,
          [feedback.id]: fallbackTemplate
        }));
      } else {
        toast({
          title: "Gagal membuat balasan AI",
          description: "Silakan coba lagi nanti atau buat balasan manual",
          variant: "destructive",
        });
      }
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
      const response = await fetch(`https://laravel.kasyifana.my.id/api/admin/feedback/${feedbackId}/reply`, {
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
      const response = await fetch(`https://laravel.kasyifana.my.id/api/admin/feedback/${deletingId}`, {
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
        <div>
          <h1 className="text-3xl font-bold">Manajemen Feedback</h1>
          {autoResponseEnabled && (
            <div className="flex items-center gap-2 mt-2">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-600 font-medium">
                Auto Response Aktif
                {processingAutoResponse && " - Sedang Memproses..."}
              </span>
            </div>
          )}
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
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
                  <div className="space-y-2">
                    {/* Show auto response status */}
                    {!feedback.balasan && autoResponseEnabled && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                        <div className="flex items-center gap-2">
                          <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                          <span className="text-sm text-blue-700">
                            {processingAutoResponse 
                              ? "Sedang memproses balasan otomatis..." 
                              : "Auto Response akan menjawab feedback ini secara otomatis"}
                          </span>
                        </div>
                      </div>
                    )}
                    
                    <Textarea 
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
