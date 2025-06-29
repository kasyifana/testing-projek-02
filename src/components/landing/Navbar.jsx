import { useState, useEffect } from 'react';
import { LogIn, LogOut, UserPlus, Menu } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { LaporKampusLogo } from '@/components/icons/LaporKampusLogo';
import { Sheet, SheetTrigger, SheetContent } from '@/components/ui/sheet';
import { LoginDialog } from '@/components/auth/LoginDialog';
import { RegisterDialog } from '@/components/auth/RegisterDialog';
import { useLogoutHandler } from '@/components/auth/LogoutDialog';

const navItems = [
  { label: 'Visi & Misi', href: '#visi-misi' },
  { label: 'Cara Kerja', href: '#cara-kerja' },
  { label: 'Ulasan', href: '#ulasan' },
];

export function Navbar() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userName, setUserName] = useState('');
  const [showLoginDialog, setShowLoginDialog] = useState(false);
  const [showRegisterDialog, setShowRegisterDialog] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const { handleLogout } = useLogoutHandler();

  useEffect(() => {
    const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
    const storedUserName = localStorage.getItem('userName') || '';
    setIsLoggedIn(loggedInStatus);
    setUserName(storedUserName);
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 10) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);
    // Initialize on first render
    handleScroll();
    
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      const storedUserName = localStorage.getItem('userName') || '';
      setIsLoggedIn(loggedInStatus);
      setUserName(storedUserName);
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);

    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);

  const onLogout = () => {
    const success = handleLogout();
    if (success) {
      setIsLoggedIn(false);
      setUserName('');
    }
  };

  return (
    <header className={`sticky top-0 z-50 w-full transition-all duration-300 ${isScrolled ? 'bg-white border-b shadow-md' : 'bg-transparent'}`}>
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo dan Nav */}
        <div className="flex items-center">
          <Link href="/" className="flex items-center gap-2 text-primary">
            <LaporKampusLogo width={40} height={40} />
            <span className="font-bold text-xl hidden sm:inline-block">Lapor Kampus</span>
          </Link>          <nav className="hidden md:flex items-center space-x-6 text-sm font-medium ml-10">
            {navItems.map((item) => (
              <Link 
                key={item.label} 
                href={item.href} 
                className={`transition-colors ${isScrolled ? 'hover:text-primary' : 'text-gray-800 font-semibold hover:text-primary'}`}
              >
                {item.label}
              </Link>
            ))}            {isLoggedIn && (
              <Link href="/user/dashboard" className="text-accent font-semibold hover:text-primary">
                Dashboard
              </Link>
            )}
          </nav>
        </div>

        {/* Tombol Auth */}
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <>
              <span className="text-sm text-muted-foreground hidden sm:inline-block">
                Halo, {userName}!
              </span>
              <Button variant="outline" size="sm" onClick={onLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button
                onClick={() => setShowLoginDialog(true)}
                variant="outline"
                size="sm"
                className="text-primary border-primary hover:bg-primary hover:text-white"
              >
                <LogIn className="mr-2 h-4 w-4" />
                Login
              </Button>              
			  <Button
                onClick={() => setShowRegisterDialog(true)}
                variant="accent"
                size="sm"
              >
                <UserPlus className="w-4 h-4" />
                Register
              </Button>
            </>
          )}

          {/* Menu Mobile */}
          <Sheet>            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="md:hidden">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>            <SheetContent side="right">
              <nav className="grid gap-6 text-lg font-medium mt-8">
                <Link href="/" className="flex items-center gap-2 text-lg font-semibold mb-4 text-primary">
                  <LaporKampusLogo width={40} height={40} />
                  <span>Lapor Kampus</span>
                </Link>
                {navItems.map((item) => (
                  <Link key={item.label} href={item.href} className="hover:text-primary">
                    {item.label}
                  </Link>
                ))}
                {isLoggedIn && (
                  <Link href="/lapor" className="text-accent font-semibold hover:text-primary">
                    Buat Laporan
                  </Link>
                )}
                {isLoggedIn ? (
                  <Button variant="outline" size="lg" onClick={onLogout} className="mt-4">
                    <LogOut className="mr-2 h-5 w-5" />
                    Logout
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={() => setShowLoginDialog(true)}
                      variant="accent"
                      size="lg"
                      className="mt-4"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      Login
                    </Button>                    <Button
                      onClick={() => setShowRegisterDialog(true)}
                      variant="accent"
                      size="lg"
                      className="mt-4"
                    >
                      <UserPlus className="w-4 h-4" />
                      Register
                    </Button>
                  </>                )}
              </nav>
            </SheetContent>
          </Sheet>
        </div>
      </div>

      {/* Modals */}
      <LoginDialog
        isOpen={showLoginDialog}
        onClose={() => setShowLoginDialog(false)}
        onRegisterClick={() => {
          setShowLoginDialog(false);
          setShowRegisterDialog(true);
        }}
      />
      <RegisterDialog
        isOpen={showRegisterDialog}
        onClose={() => setShowRegisterDialog(false)}
      />
    </header>
  );
}
