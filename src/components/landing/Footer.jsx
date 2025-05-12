import Link from 'next/link';
import { MessageSquareWarning, Facebook, Twitter, Instagram } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-secondary text-secondary-foreground border-t">
      <div className="container mx-auto px-4 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4 text-primary">
              <MessageSquareWarning className="h-8 w-8" />
              <span className="text-2xl font-bold">Lapor Kampus</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              Sampaikan aspirasi, wujudkan kampus ideal. Platform partisipasi mahasiswa untuk kampus yang lebih baik.
            </p>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Tautan Cepat</h3>
            <ul className="space-y-2">
              <li><Link href="#hero" className="hover:text-primary transition-colors text-sm">Beranda</Link></li>
              <li><Link href="#visi-misi" className="hover:text-primary transition-colors text-sm">Visi & Misi</Link></li>
              <li><Link href="#cara-kerja" className="hover:text-primary transition-colors text-sm">Cara Kerja</Link></li>
              <li><Link href="#ulasan" className="hover:text-primary transition-colors text-sm">Ulasan</Link></li>
            </ul>
          </div>
          <div>
            <h3 className="text-lg font-semibold text-foreground mb-4">Ikuti Kami</h3>
            <div className="flex space-x-4">
              <Link href="#" aria-label="Facebook" className="text-muted-foreground hover:text-primary transition-colors">
                <Facebook className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Twitter" className="text-muted-foreground hover:text-primary transition-colors">
                <Twitter className="h-6 w-6" />
              </Link>
              <Link href="#" aria-label="Instagram" className="text-muted-foreground hover:text-primary transition-colors">
                <Instagram className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </div>
        <div className="mt-8 pt-8 border-t border-border text-center text-sm text-muted-foreground">
          <p>&copy; {currentYear} Lapor Kampus. Semua Hak Dilindungi Undang-Undang.</p>
        </div>
      </div>
    </footer>
  );
}
