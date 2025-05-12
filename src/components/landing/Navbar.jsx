
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, MessageSquareWarning, LogIn } from 'lucide-react';
import { LaporKampusLogo } from '@/components/icons/LaporKampusLogo';

const navItems = [
  { label: 'Visi & Misi', href: '#visi-misi' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Ulasan', href: '#ulasan' },
];

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <MessageSquareWarning className="h-7 w-7" />
          <span className="font-bold text-xl hidden sm:inline-block">Lapor Kampus</span>
        </Link>

        <nav className="hidden md:flex items-center space-x-6 text-sm font-medium">
          {navItems.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              className="transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center space-x-2">
          <Button variant="accent" size="sm" asChild>
            <Link href="/login">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Link>
          </Button>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary">
                   <MessageSquareWarning className="h-7 w-7" />
                   <span>Lapor Kampus</span>
                </Link>
                {navItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className="transition-colors hover:text-primary"
                  >
                    {item.label}
                  </Link>
                ))}
                 <Button variant="accent" size="lg" asChild className="mt-4">
                    <Link href="/login">
                        <LogIn className="mr-2 h-5 w-5" />
                        Login
                    </Link>
                  </Button>
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

