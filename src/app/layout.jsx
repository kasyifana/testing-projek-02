import { Geist, Geist_Mono } from 'next/font/google'; // Corrected import name
import './globals.css';
import { Toaster } from "@/components/ui/toaster"; // Added Toaster

const geistSans = Geist({ // Corrected function call
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({ // Corrected function call
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata = {
  title: 'Lapor Kampus',
  description: 'Platform partisipasi mahasiswa untuk melaporkan berbagai isu dan permasalahan di lingkungan kampus',
  icons: {
    icon: '/LogoLaporKampus.png',
    apple: '/LogoLaporKampus.png',
    shortcut: '/LogoLaporKampus.png',
  },
};

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} font-sans antialiased`}>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
