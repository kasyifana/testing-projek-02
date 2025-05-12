'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Menu, LogIn, LogOut } from 'lucide-react';
import { LaporKampusLogo } from '@/components/icons/LaporKampusLogo';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LoginDialog } from '@/components/auth/LoginDialog';

const navItems = [
  { label: 'Visi & Misi', href: '#visi-misi' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Ulasan', href: '#ulasan' },
];

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // This effect runs only on the client-side
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      const storedUserName = localStorage.getItem('userName') || '';
      setIsLoggedIn(loggedInStatus);
      setUserName(storedUserName);
    }
  }, []);

  // Listen for storage changes to update navbar if login happens in another tab
  useEffect(() => {
    const handleStorageChange = () => {
      if (typeof window !== 'undefined') {
        const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
        const storedUserName = localStorage.getItem('userName') || '';
        setIsLoggedIn(loggedInStatus);
        setUserName(storedUserName);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    // Check on focus as well, as 'storage' event might not fire for same tab
    window.addEventListener('focus', handleStorageChange); 

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);


  const handleLogout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
    }
    setIsLoggedIn(false);
    setUserName('');
    router.push('/login'); // Redirect to login page after logout
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 max-w-screen-2xl items-center justify-between">
        <Link href="/" className="flex items-center gap-2 text-primary">
          <LaporKampusLogo width={40} height={40} />
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
          {isLoggedIn && (
            <Link
              href="/lapor"
              className="transition-colors hover:text-primary font-semibold text-accent"
            >
              Buat Laporan
            </Link>
          )}
        </nav>

        <div className="flex items-center space-x-4 mx-6">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Halo, {userName}!
              </span>
              <Button variant="outline" size="sm" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <Button 
              onClick={() => setShowLoginDialog(true)} 
              variant="accent" 
              size="sm"
            >
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
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
                   <LaporKampusLogo width={40} height={40} />
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
                {isLoggedIn && (
                    <Link
                        href="/lapor"
                        className="transition-colors hover:text-primary font-semibold text-accent"
                    >
                        Buat Laporan
                    </Link>
                )}
                {isLoggedIn ? (
                  <Button variant="outline" size="lg" onClick={handleLogout} className="mt-4">
                      <LogOut className="mr-2 h-5 w-5" />
                      Logout
                  </Button>
                ) : (
                  <Button 
                    onClick={() => setShowLoginDialog(true)} 
                    variant="accent" 
                    size="lg" 
                    className="mt-4"
                  >
                    <LogIn className="mr-2 h-5 w-5" />
                    Login
                  </Button>
                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>
      <LoginDialog 
        isOpen={showLoginDialog} 
        onClose={() => setShowLoginDialog(false)} 
      />
    </header>
  );
}
