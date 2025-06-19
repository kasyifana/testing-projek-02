-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jun 18, 2025 at 05:30 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `lapor_kampus`
--

-- --------------------------------------------------------

--
-- Table structure for table `program_studi`
--

CREATE TABLE `program_studi` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `code` varchar(50) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Dumping data for table `program_studi`
--

INSERT INTO `program_studi` (`id`, `code`, `name`) VALUES
(1, 'd3_analisis_kimia', 'Analisis Kimia D3'),
(2, 'st_akuntansi_perpajakan', 'Akuntansi Perpajakan Terapan'),
(3, 'st_analisis_keuangan', 'Analisis Keuangan Terapan'),
(4, 'st_bisnis_digital', 'Bisnis Digital Terapan'),
(5, 's1_akuntansi', 'Akuntansi S1'),
(6, 's1_arsitektur', 'Arsitektur S1'),
(7, 's1_ekonomi_islam', 'Ekonomi Islam S1'),
(8, 's1_ekonomi_pembangunan', 'Ekonomi Pembangunan S1'),
(9, 's1_farmasi', 'Farmasi S1'),
(10, 's1_hubungan_internasional', 'Hubungan Internasional S1'),
(11, 's1_hukum_keluarga', 'Hukum Keluarga/Ahwal Syakhshiyah S1'),
(12, 's1_hukum', 'Hukum S1'),
(13, 's1_hukum_bisnis', 'Hukum Bisnis S1'),
(14, 's1_ilmu_komunikasi', 'Ilmu Komunikasi S1'),
(15, 's1_kedokteran', 'Kedokteran S1'),
(16, 's1_informatika', 'Informatika S1'),
(17, 's1_manajemen', 'Manajemen S1'),
(18, 's1_pendidikan_agama_islam', 'Pendidikan Agama Islam S1'),
(19, 's1_pendidikan_bahasa_inggris', 'Pendidikan Bahasa Inggris S1'),
(20, 's1_pendidikan_kimia', 'Pendidikan Kimia S1'),
(21, 's1_psikologi', 'Psikologi S1'),
(22, 's1_kimia', 'Kimia S1'),
(23, 's1_statistika', 'Statistika S1'),
(24, 's1_rekayasa_tekstil', 'Rekayasa Tekstil S1'),
(25, 's1_manajemen_rekayasa', 'Manajemen Rekayasa S1'),
(26, 's1_teknik_elektro', 'Teknik Elektro S1'),
(27, 's1_teknik_industri', 'Teknik Industri S1'),
(28, 's1_teknik_kimia', 'Teknik Kimia S1'),
(29, 's1_teknik_lingkungan', 'Teknik Lingkungan S1'),
(30, 's1_teknik_mesin', 'Teknik Mesin S1'),
(31, 's1_teknik_sipil', 'Teknik Sipil S1'),
(32, 's2_akuntansi', 'Akuntansi S2'),
(33, 's2_arsitektur', 'Arsitektur S2'),
(34, 's2_farmasi', 'Farmasi S2'),
(35, 's2_hukum', 'Hukum S2'),
(36, 's2_kenotariatan', 'Kenotariatan S2'),
(37, 's2_manajemen', 'Manajemen S2'),
(38, 's2_ilmu_agama_islam', 'Ilmu Agama Islam S2'),
(39, 's2_ilmu_ekonomi', 'Ilmu Ekonomi S2'),
(40, 's2_statistika', 'Statistika S2'),
(41, 's2_kesehatan_masyarakat', 'Kesehatan Masyarakat S2'),
(42, 's2_informatika', 'Informatika S2'),
(43, 's2_rekayasa_elektro', 'Rekayasa Elektro S2'),
(44, 's2_teknik_industri', 'Teknik Industri S2'),
(45, 's2_teknik_kimia', 'Teknik Kimia S2'),
(46, 's2_teknik_lingkungan', 'Teknik Lingkungan S2'),
(47, 's2_teknik_sipil', 'Teknik Sipil S2'),
(48, 's2_kimia', 'Kimia S2'),
(49, 's2_psikologi', 'Psikologi S2'),
(50, 's2_ilmu_komunikasi', 'Ilmu Komunikasi S2'),
(51, 's3_hukum', 'Hukum S3'),
(52, 's3_hukum_islam', 'Hukum Islam S3'),
(53, 's3_ilmu_ekonomi', 'Ilmu Ekonomi S3'),
(54, 's3_manajemen', 'Manajemen S3'),
(55, 's3_teknik_sipil', 'Teknik Sipil S3'),
(56, 's3_rekayasa_industri', 'Rekayasa Industri S3'),
(57, 'prof_arsitek', 'Arsitek Profesi'),
(58, 'prof_dokter', 'Dokter Profesi'),
(59, 'prof_apoteker', 'Apoteker Profesi'),
(60, 'prof_psikologi', 'Psikologi Profesi');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `program_studi`
--
ALTER TABLE `program_studi`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `code` (`code`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `program_studi`
--
ALTER TABLE `program_studi`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=61;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
