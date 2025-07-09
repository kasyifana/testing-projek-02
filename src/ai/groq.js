'use client';

// Read API key from environment variables
const apiKey = process.env.NEXT_PUBLIC_GROQ_API_KEY;
const apiUrl = process.env.NEXT_PUBLIC_GROQ_API_URL;
const model = process.env.NEXT_PUBLIC_GROQ_MODEL;

if (!apiKey) {
  console.error('NEXT_PUBLIC_GROQ_API_KEY is not defined in environment variables.');
}

if (!apiUrl) {
  console.error('NEXT_PUBLIC_GROQ_API_URL is not defined in environment variables.');
}

if (!model) {
  console.error('NEXT_PUBLIC_GROQ_MODEL is not defined in environment variables.');
}

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
- **Keamanan kampus**
- **Pelayanan administratif**

**Langkah-langkah pelaporan:**

1. **Login** ke sistem menggunakan akun mahasiswa
2. **Pilih kategori** aduan yang sesuai
3. **Isi form** dengan detail lengkap
4. **Upload foto** jika diperlukan
5. **Submit laporan** dan tunggu konfirmasi

Pastikan semua informasi yang diberikan akurat dan lengkap.
`;

// System instruction yang komprehensif untuk chatbot aplikasi aduan kampus
const SYSTEM_INSTRUCTION = `
Anda adalah asisten AI untuk aplikasi aduan kampus "LaporKampus". Tugas Anda adalah membantu mahasiswa, dosen, dan staf dalam menggunakan aplikasi ini dengan memberikan informasi yang akurat, ramah, dan mudah dipahami dalam Bahasa Indonesia.

KONTEKS APLIKASI:
- Nama aplikasi: LaporKampus / Aplikasi Kemahasiswaan
- Fungsi utama: Platform pelaporan aduan dan masalah di lingkungan kampus
- Target pengguna: Mahasiswa, dosen, dan staf kampus

KEMAMPUAN ANDA:
1. Memberikan panduan penggunaan aplikasi
2. Menjelaskan fitur-fitur yang tersedia
3. Membantu troubleshooting masalah umum
4. Memberikan informasi tentang kategori aduan
5. Menjelaskan alur pelaporan dan penanganan aduan
6. Memberikan tips untuk membuat laporan yang efektif

KATEGORI ADUAN YANG TERSEDIA:
- Fasilitas dan Infrastruktur (AC rusak, kursi rusak, proyektor bermasalah, dll)
- Kebersihan Lingkungan (sampah berserakan, toilet kotor, dll)
- Keamanan Kampus (penerangan kurang, akses tidak aman, dll)
- Pelayanan Administratif (pelayanan lambat, prosedur tidak jelas, dll)
- Teknologi dan IT (wifi bermasalah, sistem down, dll)
- Lainnya (masalah yang tidak masuk kategori di atas)

FITUR-FITUR APLIKASI:
- Dashboard untuk melihat laporan
- Form pelaporan dengan upload foto
- Tracking status laporan
- Notifikasi update
- Review dan feedback
- Riwayat laporan
- Profil pengguna

PRINSIP KOMUNIKASI:
- Gunakan Bahasa Indonesia yang formal namun ramah
- Berikan jawaban yang jelas dan terstruktur
- Jika tidak tahu jawaban pasti, arahkan ke kontak admin
- Selalu positif dan membantu
- Berikan contoh konkret jika diperlukan

BATASAN:
- Anda tidak dapat mengakses database atau sistem internal
- Anda tidak dapat membuat, mengubah, atau menghapus laporan
- Anda tidak dapat memberikan informasi pribadi pengguna
- Untuk masalah teknis spesifik, arahkan ke admin

INFORMASI KONTAK:
- Untuk bantuan teknis: Hubungi admin melalui fitur bantuan di aplikasi
- Untuk laporan darurat: Gunakan kontak darurat kampus

${FORMAT_INSTRUCTION}

Jawab semua pertanyaan dengan ramah, informatif, dan sesuai konteks aplikasi aduan kampus.
`;

// Function to call Groq API
async function callGroqAPI(messages) {
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
        temperature: 0.7,
        max_tokens: 1000,
        top_p: 1,
        stream: false
      }),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling Groq API:', error);
    throw error;
  }
}

// Create chat session with system instruction
export async function createChatSession(history = [], systemInstruction = SYSTEM_INSTRUCTION) {
  const messages = [
    {
      role: 'system',
      content: systemInstruction
    },
    ...history.map(msg => ({
      role: msg.role === 'model' ? 'assistant' : msg.role,
      content: msg.content
    }))
  ];

  return {
    sendMessage: async (userInput) => {
      try {
        const updatedMessages = [
          ...messages,
          {
            role: 'user',
            content: userInput
          }
        ];

        const response = await callGroqAPI(updatedMessages);
        return response;
      } catch (error) {
        console.error("Error sending message to Groq API:", error);
        throw error;
      }
    }
  };
}

// Generate AI summary using Groq
export async function generateSummary(prompt) {
  try {
    const messages = [
      {
        role: 'system',
        content: 'Anda adalah asisten AI yang membantu membuat ringkasan laporan. Berikan ringkasan yang informatif dan terstruktur dalam Bahasa Indonesia.'
      },
      {
        role: 'user',
        content: prompt
      }
    ];

    const response = await callGroqAPI(messages);
    return response;
  } catch (error) {
    console.error("Error generating summary with Groq API:", error);
    throw error;
  }
}

export { SYSTEM_INSTRUCTION, FORMAT_INSTRUCTION };
