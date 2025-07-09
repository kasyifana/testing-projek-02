# Proyek LaporKampus (Frontend)

LaporKampus adalah sebuah platform pelaporan digital yang dirancang untuk lingkungan kampus. Aplikasi ini memungkinkan mahasiswa dan staf untuk melaporkan berbagai insiden atau memberikan masukan secara efisien. Proyek ini adalah **frontend** yang dibangun dengan Next.js.

**Penting:** Backend untuk proyek ini dikelola dalam repository terpisah yang menggunakan **Laravel**. Repository ini hanya berisi frontend yang mengonsumsi API dari backend tersebut.

## Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Arsitektur Backend](#arsitektur-backend)
- [Prasyarat](#prasyarat)
- [Panduan Instalasi & Konfigurasi](#panduan-instalasi--konfigurasi)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Endpoint API](#endpoint-api)

## Teknologi yang Digunakan

- **Frontend**: [Next.js](https://nextjs.org/) (React Framework)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Fitur AI**: Menggunakan layanan dari [Groq](https://groq.com/) dan [Novita AI](https://novita.ai/) untuk pemrosesan teks.

## Arsitektur Backend

Aplikasi ini menggunakan backend **Laravel** yang berjalan secara terpisah. Semua logika bisnis, manajemen database, dan otentikasi ditangani oleh backend. Frontend (proyek ini) berkomunikasi dengan backend melalui API RESTful.

Pastikan Anda telah menjalankan server backend Laravel sebelum memulai aplikasi frontend ini.

## Prasyarat

Pastikan perangkat Anda telah terinstal perangkat lunak berikut:

- [Node.js](https://nodejs.org/en) (v18.x atau lebih baru)
- [NPM](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)
- [Git](https://git-scm.com/)

## Panduan Instalasi & Konfigurasi

Ikuti langkah-langkah berikut untuk menyiapkan proyek di lingkungan pengembangan lokal Anda.

1.  **Clone Repository**: Clone repository ini ke direktori lokal Anda.

    ```bash
    git clone https://github.com/username/testing-projek-02-master.git
    cd testing-projek-02-master
    ```
    *(Ganti `https://github.com/username/testing-projek-02-master.git` dengan URL repository Anda)*

2.  **Instal Dependensi**: Buka terminal di root direktori proyek dan jalankan perintah berikut:

    ```bash
    npm install
    ```

3.  **Buat File Environment**: Buat file baru bernama `.env.local` di root direktori proyek. Salin konten dari contoh di bawah ini dan sesuaikan nilainya.

    ```env
    # URL base untuk API backend Laravel
    NEXT_PUBLIC_API_BASE_URL=http://localhost:8000/api

    # Kunci API untuk layanan AI (opsional)
    GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    NOVITA_AI_API_KEY=nk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

    - Sesuaikan `NEXT_PUBLIC_API_BASE_URL` dengan URL tempat backend Laravel Anda berjalan.
    - Dapatkan kunci API dari website [Groq](https://console.groq.com/keys) dan [Novita AI](https://novita.ai/) jika Anda ingin menggunakan fitur AI.

## Menjalankan Aplikasi

1.  **Pastikan Server Backend Aktif**: Pastikan server backend Laravel Anda sudah berjalan.

2.  **Jalankan Server Frontend**: Buka terminal di root direktori proyek dan jalankan perintah berikut untuk memulai server pengembangan Next.js.

    ```bash
    npm run dev
    ```

3.  **Buka Aplikasi**: Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000).

## Struktur Proyek

```
/

├── public/             # Aset statis (gambar, logo)
├── src/
│   ├── app/            # Halaman dan routing utama Next.js
│   │   ├── api/        # Rute API Next.js (digunakan untuk proxy atau fungsi serverless)
│   │   ├── admin/      # Halaman-halaman untuk panel admin
│   │   └── user/       # Halaman-halaman untuk panel pengguna
│   ├── components/     # Komponen React yang dapat digunakan kembali
│   ├── hooks/          # Custom hooks React
│   └── lib/            # Fungsi utilitas dan service (termasuk pemanggil API)
├── next.config.js      # Konfigurasi Next.js
└── package.json        # Dependensi dan skrip proyek Node.js
```

## Endpoint API

Semua endpoint API disediakan oleh backend Laravel yang berjalan terpisah. Frontend ini melakukan pemanggilan (request) ke URL yang dikonfigurasi di `NEXT_PUBLIC_API_BASE_URL`.

Contoh endpoint yang dipanggil:

-   `GET /laporan`: Mengambil semua data laporan.
-   `POST /laporan`: Membuat laporan baru.
-   `GET /laporan/{id}`: Mengambil detail laporan berdasarkan ID.