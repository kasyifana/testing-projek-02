# Proyek LaporKampus

LaporKampus adalah sebuah platform pelaporan digital yang dirancang untuk lingkungan kampus. Aplikasi ini memungkinkan mahasiswa dan staf untuk melaporkan berbagai insiden atau memberikan masukan secara efisien. Proyek ini dibangun dengan Next.js untuk frontend dan PHP untuk backend API.

## Daftar Isi

- [Teknologi yang Digunakan](#teknologi-yang-digunakan)
- [Prasyarat](#prasyarat)
- [Panduan Instalasi & Konfigurasi](#panduan-instalasi--konfigurasi)
  - [1. Clone Repository](#1-clone-repository)
  - [2. Konfigurasi Backend (PHP & Database)](#2-konfigurasi-backend-php--database)
  - [3. Konfigurasi Frontend (Next.js)](#3-konfigurasi-frontend-nextjs)
- [Menjalankan Aplikasi](#menjalankan-aplikasi)
- [Struktur Proyek](#struktur-proyek)
- [Endpoint API](#endpoint-api)

## Teknologi yang Digunakan

- **Frontend**: [Next.js](https://nextjs.org/) (React Framework)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Backend**: PHP (Native)
- **Web Server**: Apache (direkomendasikan via [XAMPP](https://www.apachefriends.org/index.html))
- **Database**: MySQL
- **Fitur AI**: Menggunakan layanan dari [Groq](https://groq.com/) dan [Novita AI](https://novita.ai/) untuk pemrosesan teks.

## Prasyarat

Pastikan perangkat Anda telah terinstal perangkat lunak berikut:

- [Node.js](https://nodejs.org/en) (v18.x atau lebih baru)
- [NPM](https://www.npmjs.com/) (biasanya terinstal bersama Node.js)
- [Git](https://git-scm.com/)
- [XAMPP](https://www.apachefriends.org/index.html) (atau web server sejenis seperti WAMP, MAMP)

## Panduan Instalasi & Konfigurasi

Ikuti langkah-langkah berikut untuk menyiapkan proyek di lingkungan pengembangan lokal Anda.

### 1. Clone Repository

Buka terminal Anda dan clone repository ini ke dalam direktori `htdocs` XAMPP Anda.

```bash
cd C:\xampp\htdocs
git clone https://github.com/username/testing-projek-02-master.git
cd testing-projek-02-master
```
*(Ganti `https://github.com/username/testing-projek-02-master.git` dengan URL repository Anda)*

### 2. Konfigurasi Backend (PHP & Database)

Backend aplikasi ini berjalan pada Apache dan MySQL yang disediakan oleh XAMPP.

1.  **Jalankan XAMPP**: Buka XAMPP Control Panel dan jalankan modul **Apache** dan **MySQL**.

2.  **Buat Database**:
    - Buka `phpMyAdmin` (biasanya di `http://localhost/phpmyadmin`).
    - Buat database baru, misalnya dengan nama `db_lapor_kampus`.

3.  **Import Skema Database**:
    - Pilih database `db_lapor_kampus` yang baru saja dibuat.
    - Klik tab `Import`.
    - Impor file-file `.sql` yang ada di direktori `assets/db/` satu per satu. Urutan yang disarankan: `users.sql`, `program_studi.sql`, lalu sisanya.

4.  **Konfigurasi Koneksi Database**:
    - Buka file `php-backend/api/config/database.php`.
    - Sesuaikan konfigurasi berikut dengan pengaturan database Anda.

    ```php
    <?php
    $host = "localhost";
    $db_name = "db_lapor_kampus"; // Sesuaikan dengan nama database Anda
    $username = "root"; // Sesuaikan dengan username database Anda
    $password = ""; // Sesuaikan dengan password database Anda
    // ...
    ?>
    ```

### 3. Konfigurasi Frontend (Next.js)

Frontend memerlukan beberapa variabel lingkungan untuk terhubung ke backend dan layanan AI.

1.  **Instal Dependensi**: Buka terminal di root direktori proyek (`C:\xampp\htdocs\testing-projek-02-master`) dan jalankan perintah berikut:

    ```bash
    npm install
    ```

2.  **Buat File Environment**: Buat file baru bernama `.env.local` di root direktori proyek. Salin konten dari contoh di bawah ini ke dalam file tersebut.

    ```env
    # URL base untuk API backend PHP
    NEXT_PUBLIC_API_BASE_URL=http://localhost/testing-projek-02-master/php-backend/api

    # Kunci API untuk layanan AI (opsional, jika ingin menggunakan fiturnya)
    GROQ_API_KEY=gsk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    NOVITA_AI_API_KEY=nk_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
    ```

    - Ganti nilai `NEXT_PUBLIC_API_BASE_URL` jika path ke proyek Anda berbeda.
    - Dapatkan kunci API dari website [Groq](https://console.groq.com/keys) dan [Novita AI](https://novita.ai/) lalu masukkan ke dalam file `.env.local`.

## Menjalankan Aplikasi

1.  **Pastikan Server Backend Aktif**: Pastikan modul **Apache** dan **MySQL** di XAMPP Control Panel sedang berjalan.

2.  **Jalankan Server Frontend**: Buka terminal di root direktori proyek dan jalankan perintah berikut untuk memulai server pengembangan Next.js.

    ```bash
    npm run dev
    ```

3.  **Buka Aplikasi**: Buka browser Anda dan akses [http://localhost:3000](http://localhost:3000).

## Struktur Proyek

```
/
├── php-backend/        # Kode sumber untuk API backend (PHP)
│   └── api/
├── public/             # Aset statis (gambar, logo)
│   └── uploads/        # Direktori untuk file yang di-upload pengguna
├── src/
│   ├── app/            # Halaman dan routing utama Next.js
│   │   ├── api/        # Rute API Next.js (proxy, upload handler)
│   │   ├── admin/      # Halaman-halaman untuk panel admin
│   │   └── user/       # Halaman-halaman untuk panel pengguna
│   ├── components/     # Komponen React yang dapat digunakan kembali
│   ├── hooks/          # Custom hooks React
│   └── lib/            # Fungsi utilitas dan service
├── assets/
│   └── db/             # Skema dan data awal database (.sql)
├── next.config.js      # Konfigurasi Next.js
└── package.json        # Dependensi dan skrip proyek Node.js
```

## Endpoint API

API backend di-handle oleh PHP. Berikut adalah contoh endpoint utama:

-   `GET /laporan`: Mengambil semua data laporan.
-   `POST /laporan`: Membuat laporan baru.
-   `GET /laporan?id={id}`: Mengambil detail laporan berdasarkan ID.

Endpoint ini diakses oleh frontend Next.js melalui URL yang didefinisikan di `NEXT_PUBLIC_API_BASE_URL`.
