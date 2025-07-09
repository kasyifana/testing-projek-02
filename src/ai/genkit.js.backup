'use client';

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Read API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_GEMINI_API_KEY;

if (!apiKey) {
  console.error('NEXT_PUBLIC_GEMINI_API_KEY is not defined in environment variables.');
}

// Initialize the Google Generative AI
const genAI = new GoogleGenerativeAI(apiKey);

// Configure safety settings
const safetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

// Instruksi format output untuk memastikan jawaban terstruktur dengan baik dan memiliki penekanan
const FORMAT_INSTRUCTION = `
Saat memberikan jawaban, gunakan format yang mudah dibaca:
1. Pisahkan setiap paragraf dengan baris kosong
2. Gunakan baris baru untuk daftar poin-poin
3. Jika memberikan langkah-langkah, berikan nomor dan pisahkan dengan baris baru
4. Jika ada beberapa kategori atau opsi, kelompokkan dan beri judul untuk setiap bagian
5. Gunakan spasi dan pemformatan untuk memudahkan pembacaan
6. Gunakan format **teks** untuk memberikan penekanan (bold) pada kata atau frasa penting

Contoh format jawaban yang baik:

Berikut adalah kategori aduan yang dapat dilaporkan:

- **Fasilitas rusak** (kursi, meja, AC)
- **Kebersihan lingkungan**
- **Masalah keamanan**
- **Pelayanan administrasi**

Proses pelaporan meliputi:

1. **Pilih kategori aduan**
2. **Isi detail lokasi** dan waktu kejadian
3. Unggah **bukti foto** (opsional)
4. Kirim laporan

Ingat untuk selalu memberikan **penekanan** pada informasi penting atau kata kunci dengan menggunakan format **teks penting**.
`;

// Knowledge about laporan kampus untuk konteks
const kampusKnowledge = {
  jenis_aduan: [
    "Fasilitas rusak (kursi, meja, AC, proyektor, toilet)",
    "Kebersihan lingkungan kampus",
    "Masalah keamanan kampus",
    "Pelayanan administrasi yang tidak memuaskan",
    "Kasus pelecehan atau diskriminasi",
    "Masalah akademik (jadwal kuliah, nilai, dsb)",
    "Ketersediaan internet/WiFi",
    "Ketersediaan parkir",
    "Kualitas makanan di kantin"
  ],
  alur_pelaporan: [
    "1. Pengguna melaporkan masalah melalui aplikasi",
    "2. Admin menerima dan mereview laporan",
    "3. Laporan diteruskan ke departemen terkait",
    "4. Departemen menindaklanjuti laporan",
    "5. Pengguna mendapatkan update status penanganan",
    "6. Laporan ditutup setelah diselesaikan"
  ],
  informasi_penting: [
    "Semua laporan akan ditangani dalam 1-3 hari kerja",
    "Laporan anonim diperbolehkan untuk kasus sensitif",
    "Bukti foto sangat membantu percepatan penanganan masalah",
    "Laporan dapat ditracking melalui menu 'History'"
  ]
};

// Function to format response text with proper line breaks and markdown-like formatting
const formatResponseText = (text) => {
  // Replace single newlines with double newlines for better spacing
  let formattedText = text.replace(/\n(?!\n)/g, '\n\n');
  
  // Ensure lists are properly formatted with line breaks before list items
  formattedText = formattedText.replace(/([.:])(\s*)-\s*/g, '$1\n\n- ');
  
  // Add extra line break after numbered items
  // formattedText = formattedText.replace(/(\d+\..*?)(?=\n\d+\.|\n\n|\n$|$)/g, '$1\n');
  
  // Ensure proper spacing after headers (text followed by colon)
  // formattedText = formattedText.replace(/(.*?):\s*(?=\w)/g, '$1:\n\n');
  
  // Ensure dash/bullet lists are properly spaced
  formattedText = formattedText.replace(/(\n- .*?)(?=\n(?!-)|\n\n|$)/g, '$1\n');
  
  // Fix any excessive blank lines (more than 2)
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  
  // Make sure numbered items in lists are properly displayed
  formattedText = formattedText.replace(/(\n\d+\.\s+)/g, '\n\n$1');
  
  // Konversi markdown bold (**text**) ke HTML <strong> tags
  // Pertama, tandai lokasi teks bold dengan placeholder khusus
  const boldTexts = [];
  formattedText = formattedText.replace(/\*\*(.*?)\*\*/g, (match, content) => {
    boldTexts.push(content);
    return `__BOLD_${boldTexts.length - 1}__`;
  });
  
  // Escape HTML untuk mencegah XSS
  formattedText = formattedText
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
  
  // Kembalikan teks bold yang telah dienkapsulasi dalam tag strong
  formattedText = formattedText.replace(/__BOLD_(\d+)__/g, (match, index) => {
    return `<strong>${boldTexts[parseInt(index)]}</strong>`;
  });
  
  return formattedText;
};

// Create a reusable chat session
export const createChatSession = async (history = [], systemInstruction = '') => {
  try {
    // Enrich system instruction with our internal knowledge base and format instructions
    const enhancedInstruction = systemInstruction + `\n\n${FORMAT_INSTRUCTION}\n\nBerikut adalah informasi tambahan yang perlu kamu ketahui:
    
Jenis aduan yang dapat dilaporkan: 
${kampusKnowledge.jenis_aduan.map(item => `- ${item}`).join("\n")}

Alur pelaporan:
${kampusKnowledge.alur_pelaporan.join("\n")}

Informasi penting:
${kampusKnowledge.informasi_penting.map(item => `- ${item}`).join("\n")}

Jika ditanya tentang cara melaporkan masalah, tolong bantu pengguna dengan menjelaskan:
1. Jenis masalah yang mereka alami (dari kategori di atas)
2. Lokasi masalah dengan detail
3. Kapan masalah terjadi
4. Deskripsi singkat tentang masalahnya
5. Mengunggah foto jika relevan
6. Memberikan tingkat urgensi masalah

Hindarkan membuat janji yang tidak dapat ditepati dan selalu beri tahu pengguna bahwa laporan mereka akan ditangani sesuai dengan alur proses yang ada.

Berilah **penekanan (bold)** pada:
1. Nama kategori aduan
2. Istilah penting seperti "lokasi", "waktu", "deskripsi", "bukti foto"
3. Tahapan kunci dalam proses pelaporan
4. Nama-nama menu atau fitur aplikasi
5. Kata kunci dalam instruksi atau saran

Format bold akan membantu pengguna dengan cepat mengidentifikasi informasi penting dalam jawabanmu.
    `;

    // Get the generative model (Gemini)
    const model = genAI.getGenerativeModel({
      model: 'gemini-1.5-flash',
      systemInstruction: enhancedInstruction,
      safetySettings,
      generationConfig: {
        temperature: 0.7, // Sedikit kreativitas untuk keramahan
        topP: 0.95,
        topK: 40,
      }
    });

    // Create a chat session
    const chat = model.startChat({
      history: history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });

    return {
      sendMessage: async (message) => {
        try {
          const result = await chat.sendMessage(message);
          const response = await result.response;
          const rawText = response.text();
          
          // Format the response text for better readability
          return formatResponseText(rawText);
        } catch (error) {
          console.error("Error sending message to Gemini API:", error);
          throw error;
        }
      }
    };
  } catch (error) {
    console.error("Error creating chat session:", error);
    throw error;
  }
};
