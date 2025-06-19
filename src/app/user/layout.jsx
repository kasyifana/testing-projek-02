'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Home, FileText, History, Bell, User, Book, HelpCircle, Star, LogOut, X, UserCircle, Trash, Menu } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogoutHandler } from "@/components/auth/LogoutDialog";

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { handleLogout } = useLogoutHandler();
  const [user, setUser] = useState(null);
  const notificationRef = useRef(null);

  // Mock notifications data (bisa diganti dengan data dari API nanti)
  const notifications = [
    { id: 1, title: "Laporan Anda telah diproses", time: "5 menit yang lalu", read: false },
    { id: 2, title: "Tanggapan baru pada laporan Anda", time: "1 jam yang lalu", read: false },
    { id: 3, title: "Status laporan Anda telah diubah", time: "1 hari yang lalu", read: true },
  ];

  // Close notification when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };  }, []);
    // Fetch user data  
  useEffect(() => {
    // Get user email from localStorage (fallback mechanism)
    const userEmail = localStorage.getItem('userEmail');
    const url = userEmail 
      ? `http://localhost/testing-projek-02-master/src/php/user_profile.php?email=${encodeURIComponent(userEmail)}`
      : 'http://localhost/testing-projek-02-master/src/php/user_profile.php';
    
    fetch(url, {
      method: 'GET',
      credentials: 'same-origin',
      headers: {
        'Accept': 'application/json'
      }
    })
    .then(res => {
      if (!res.ok) throw new Error('Network response was not ok');
      return res.json();
    })    .then(data => {
      if (data.success) {
        setUser(data.user);
      } else if (data.message === "User belum login") {
        // User is not logged in, don't show as error
        console.log('Session info: User not logged in');
        // Optionally redirect to login page if needed
        // window.location.href = '/login';
      } else {
        console.error('Error:', data.message);
      }
    })
    .catch(err => console.error('Failed to fetch user:', err));
  }, []);

  // Check if we're in a mobile viewport
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 1024);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => window.removeEventListener('resize', checkIfMobile);
  }, []);

  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setSidebarOpen(false);
    }
  }, [pathname, isMobile]);

  const menuGroups = {
    laporan: [
      { icon: Home, label: 'Beranda', path: '/user/dashboard' },
      { icon: FileText, label: 'Buat Laporan', path: '/user/create-report' },
      { icon: History, label: 'Riwayat Laporan', path: '/user/history' },
    ],
    akun: [
      { icon: Book, label: 'Panduan', path: '/user/guide' },
      { icon: HelpCircle, label: 'Bantuan', path: '/user/help' },
      { icon: Star, label: 'Review', path: '/user/review' },
    ],
  };  const NavLink = ({ item }) => (
    <Link
      href={item.path}
      className={`flex items-center px-6 py-3 text-base transition-colors ${
        pathname === item.path
          ? 'bg-primary bg-opacity-10 rounded-lg mx-3 font-medium text-black'
          : 'text-gray-600 hover:bg-gray-100 hover:rounded-lg hover:mx-3 hover:text-primary'
      }`}
    >
      {/* Force icon to be visible and properly colored regardless of page styles */}
      <div className="icon-container !visible !block" style={{
        display: 'flex', 
        alignItems: 'center',
        visibility: 'visible',
        opacity: '1',
        pointerEvents: 'auto'
      }}>
        <item.icon 
          className={`h-5 w-5 mr-3 !visible !block ${pathname === item.path ? 'text-primary' : ''}`} 
          style={{
            color: pathname === item.path ? 'var(--primary)' : 'currentColor',
            display: 'block',
            visibility: 'visible',
            opacity: '1',
            pointerEvents: 'auto'
          }} 
        />
      </div>
      <span>{item.label}</span>
    </Link>
  );

  // Profile Popup Component
  const ProfilePopup = () => {
    const handleOutsideClick = (e) => {
      if (e.target.classList.contains('overlay')) {
        setShowProfilePopup(false);
      }
    };

    if (!user) {
      return null; // Don't show popup if no user data
    }

    return (
      <div 
        className="fixed inset-0 bg-black bg-opacity-40 backdrop-blur-sm flex items-center justify-center z-50 overlay" 
        onClick={handleOutsideClick}
      >
        <div className="max-w-2xl w-full mx-4 md:mx-auto" onClick={e => e.stopPropagation()}>
          <Card className="p-6 space-y-6 bg-white">
            <div className="flex items-center justify-between pb-2">
              <h1 className="text-2xl font-bold">Profil & Privasi</h1>
              <button 
                onClick={() => setShowProfilePopup(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="flex items-center gap-4 pb-6 border-b">
              <UserCircle className="w-20 h-20 text-gray-400" />
              <div>
                <h2 className="text-xl font-semibold">{user.full_name}</h2>
                <p className="text-gray-500">ID: {user.id}</p>
                <p className="text-gray-500">Email: {user.email}</p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <Label>Nama Lengkap</Label>
                <Input value={user.full_name} readOnly />
              </div>
              
              <div>
                <Label>Email</Label>
                <Input value={user.email} type="email" readOnly />
              </div>
              
              <div>
                <Label>Role</Label>
                <Input value={user.role} readOnly />
              </div>

              {user.program_studi_code && (
                <div>
                  <Label>Program Studi</Label>
                  <Input value={user.program_studi_code} readOnly />
                </div>
              )}
            </div>

            <div className="pt-6 border-t">
              <Button variant="destructive" className="w-full">
                <Trash className="w-4 h-4 mr-2" />
                Hapus Akun
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  // Header component with profile and dropdown notifications
  const Header = () => (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-4 lg:px-8">
      {isMobile && (
        <button 
          onClick={() => setSidebarOpen(!sidebarOpen)}
          className="p-2 rounded-full hover:bg-gray-50"
        >
          <Menu className="h-6 w-6 text-gray-600" />
        </button>
      )}
      <div className="flex items-center space-x-4 ml-auto">
        <div className="relative" ref={notificationRef}>
          <button 
            onClick={() => setShowNotifications(!showNotifications)}
            className={`p-2 rounded-full ${showNotifications ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
          >
            <Bell className="h-5 w-5 text-gray-600" />
            {notifications.filter(n => !n.read).length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                {notifications.filter(n => !n.read).length}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Notifikasi</h3>
                <button 
                  onClick={() => setShowNotifications(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          // Handle click notification
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-500 mt-1">{notification.time}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    <p>Tidak ada notifikasi</p>
                  </div>
                )}
              </div>
              
              <div className="p-3 border-t text-center">
                <Link 
                  href="/user/notifications" 
                  className="text-sm text-primary hover:text-primary-dark font-medium"
                  onClick={() => setShowNotifications(false)}
                >
                  Lihat Semua Notifikasi
                </Link>
              </div>
            </div>
          )}
        </div>
        
        <button
          onClick={() => setShowProfilePopup(true)}
          className="flex items-center space-x-2 p-2 rounded-lg hover:bg-gray-50"
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <div className="hidden md:block text-left">
            <p className="font-medium text-gray-700 leading-tight">{user?.full_name || '-'}</p>
            <p className="text-xs text-gray-500">{user?.email || '-'}</p>
          </div>
        </button>
      </div>
    </header>
  );
  
  // Handle user logout with animation
  const onUserLogout = () => {
    // Clear any user-specific data if needed
    localStorage.removeItem('userSession');
    sessionStorage.removeItem('userSession');
    
    // Use the shared logout handler that displays the animation
    handleLogout();
  };

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Mobile sidebar overlay */}
      {isMobile && sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Responsive sidebar */}
      <aside 
        className={`${
          isMobile 
            ? `fixed z-40 h-screen w-72 bg-white shadow-md transform transition-transform duration-300 ease-in-out ${
                sidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'fixed h-screen w-72 bg-white shadow-md'
        } flex flex-col justify-between overflow-y-auto`}
      >
        {isMobile && (
          <div className="flex justify-end p-4">
            <button 
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        )}
        
        <nav className="flex flex-col gap-y-6 pt-6">
          <div>
            <div className="px-6 py-2">
              <p className="text-md font-bold text-black uppercase tracking-wider">
                Laporan
              </p>
            </div>
            {menuGroups.laporan.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>

          <div>
            <div className="px-6 py-2">
              <p className="text-md font-bold text-black uppercase tracking-wider">
                Akun
              </p>
            </div>
            {menuGroups.akun.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>
        </nav>
        
        <div className="p-4 border-t">
          <button
            onClick={onUserLogout}
            className="flex items-center w-full px-6 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <div className={`flex-1 flex flex-col ${!isMobile ? 'pl-72' : 'pl-0'}`}>
        <Header />
        <main className="flex-1 p-4 md:p-10">{children}</main>
      </div>
      
      {showProfilePopup && <ProfilePopup />}
    </div>
  );
}
