'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Send, Loader2 } from 'lucide-react';
import { createChatSession } from '@/ai/groq';

// Konstanta untuk instruksi sistem yang mendefinisikan persona dan tugas chatbot
const SYSTEM_INSTRUCTION = `
Kamu adalah asisten virtual untuk aplikasi LaporKampus, sebuah platform untuk melaporkan aduan atau keluhan di lingkungan kampus.
Peranmu:
1. Membantu mahasiswa, dosen, atau staf untuk melaporkan aduan dengan jelas dan terstruktur
2. Memberikan informasi tentang jenis-jenis aduan yang bisa dilaporkan
3. Menjelaskan proses pelaporan dan alur tindak lanjut aduan
4. Memastikan pelapor memberikan informasi yang cukup: lokasi, waktu kejadian, deskripsi masalah, bukti foto (jika ada)
5. Menawarkan bantuan untuk kategori masalah: fasilitas rusak, kebersihan, keamanan, pelayanan administrasi, pelecehan/diskriminasi, akademik
6. Menjawab pertanyaan umum tentang platform LaporKampus
7. Tetap bersikap sopan, empatik, dan profesional

Panduan komunikasi:
- Gunakan bahasa yang ramah dan tidak menghakimi
- Tunjukkan empati terhadap masalah yang dilaporkan
- Dorong pelapor untuk memberikan detail yang cukup
- Jawab dengan informasi faktual dan akurat
- Tanyakan informasi tambahan jika laporan tidak jelas
`;

export function ChatBot() {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([
    { role: 'model', content: 'Halo! Saya asisten LaporKampus yang siap membantu Anda melaporkan aduan atau keluhan di lingkungan kampus. Apa yang bisa saya bantu hari ini?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef(null);

  // Fungsi untuk scroll ke pesan terbaru
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Efek untuk scroll otomatis saat pesan bertambah
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!input.trim() || isLoading) return;
    
    // Add user message
    const userMessage = { role: 'user', content: input };
    const updatedMessages = [
      ...messages,
      userMessage
    ];
    
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);
    
    try {
      // Selalu gunakan system instruction yang sudah didefinisikan
      const historyForAPI = updatedMessages.slice(1); // Hilangkan pesan pembuka
      
      // Create a chat session with our detailed system instruction
      const chat = await createChatSession(historyForAPI, SYSTEM_INSTRUCTION);
      
      // Send message and get response
      const aiResponse = await chat.sendMessage(input);
      
      // Update messages with AI response
      setMessages([
        ...updatedMessages,
        { role: 'model', content: aiResponse }
      ]);
    } catch (error) {
      console.error('Error communicating with Groq API:', error);
      setMessages([
        ...updatedMessages,
        { 
          role: 'model', 
          content: 'Maaf, terjadi kesalahan dalam sistem. Silakan coba lagi nanti atau hubungi admin melalui email yang tersedia di halaman kontak.' 
        }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  // Contoh pertanyaan yang dapat digunakan
  const exampleQuestions = [
    "Bagaimana cara melaporkan fasilitas rusak?",
    "Berapa lama laporan akan ditanggapi?",
    "Apa saja kategori aduan yang tersedia?",
    "Bagaimana alur pelaporan aduan?"
  ];
  return (
    <div className="flex flex-col space-y-4">
      <div className="bg-slate-100 rounded-lg p-4 h-[350px] overflow-y-auto flex flex-col space-y-4 scroll-smooth">
        {messages.map((message, index) => (
          <div 
            key={index}
            className={`p-3 rounded-lg max-w-[80%] ${
              message.role === 'user' 
                ? 'bg-primary text-white self-end' 
                : 'bg-white border self-start'
            }`}
          >            {message.role === 'model' ? (
              <div 
                className="whitespace-pre-wrap chat-message"
                style={{
                  lineHeight: '1.5',
                  letterSpacing: '0.01em'
                }}
                dangerouslySetInnerHTML={{ __html: message.content }}
              />
            ) : (
              message.content
            )}
          </div>
        ))}
        {isLoading && (
          <div className="bg-white border p-3 rounded-lg self-start flex items-center space-x-2">
            <Loader2 className="h-4 w-4 animate-spin" />
            <span>AI sedang menjawab...</span>
          </div>
        )}
        <div ref={messagesEndRef} /> {/* Scroll target */}
      </div>
      
      <div className="space-y-3">
        <div className="text-sm text-gray-500">
          <p>Contoh pertanyaan:</p>
          <div className="mt-1 flex flex-wrap gap-2">
            {exampleQuestions.map((question, index) => (
              <button 
                key={index}
                onClick={() => setInput(question)}
                className="text-xs bg-slate-100 hover:bg-slate-200 rounded px-2 py-1 transition-colors"
              >
                {question}
              </button>
            ))}
          </div>
        </div>
      
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ketik pertanyaan Anda di sini..."
            className="flex-1"
            disabled={isLoading}
          />
          <Button type="submit" disabled={isLoading || !input.trim()}>
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
          </Button>
        </form>
      </div>
    </div>
  );
}
