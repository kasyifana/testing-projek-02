'use client';

import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useState, useEffect, useRef } from 'react';
import { Home, FileText, History, Bell, User, Book, HelpCircle, Star, LogOut, X, UserCircle, Trash, Menu } from 'lucide-react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useLogoutHandler } from "@/components/auth/LogoutDialog";
import { isTokenValid, clearAuthData } from "@/components/auth/LoginDialog";
import { notFound } from 'next/navigation';

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfilePopup, setShowProfilePopup] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { handleLogout } = useLogoutHandler();
  const [user, setUser] = useState(null);
  const notificationRef = useRef(null);
  const [notifications, setNotifications] = useState([]);
  const [notificationLoading, setNotificationLoading] = useState(false);
  const [readNotifications, setReadNotifications] = useState(() => {
    // Load read notification IDs from localStorage if available
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('readNotifications');
      return stored ? JSON.parse(stored) : [];
    }
    return [];
  });

  // Save read notifications to localStorage whenever it changes
  useEffect(() => {
    if (readNotifications.length > 0) {
      localStorage.setItem('readNotifications', JSON.stringify(readNotifications));
    }
  }, [readNotifications]);

  // Mark a notification as read
  const markAsRead = (notificationId) => {
    if (!readNotifications.includes(notificationId)) {
      const updatedReadNotifications = [...readNotifications, notificationId];
      setReadNotifications(updatedReadNotifications);
    }
  };

  // Check if a notification is read
  const isNotificationRead = (notificationId) => {
    return readNotifications.includes(notificationId);
  };

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
    };
  }, []);
  
  // Format timestamp similar to the notifications page
  const formatTimestamp = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffSeconds = Math.floor((now - date) / 1000);
    
    if (diffSeconds < 60) {
      return 'Baru saja';
    } else if (diffSeconds < 3600) {
      const minutes = Math.floor(diffSeconds / 60);
      return `${minutes} menit yang lalu`;
    } else if (diffSeconds < 86400) {
      const hours = Math.floor(diffSeconds / 3600);
      return `${hours} jam yang lalu`;
    } else if (diffSeconds < 604800) {
      const days = Math.floor(diffSeconds / 86400);
      return `${days} hari yang lalu`;
    } else {
      // Format to Indonesian date format
      const options = { year: 'numeric', month: 'long', day: 'numeric' };
      return date.toLocaleDateString('id-ID', options);
    }
  };

  // Get notification title based on status
  const getNotificationTitle = (status) => {
    switch (status) {
      case 'Diproses':
        return 'Laporan sedang diproses';
      case 'Ditanggapi':
        return 'Tanggapan baru';
      case 'Selesai':
        return 'Laporan selesai';
      case 'Ditolak':
        return 'Laporan ditolak';
      default:
        return 'Status diperbarui';
    }
  };

  // Fetch notifications for the user
  const fetchNotifications = async (userId) => {
    if (!userId) return;
    
    try {
      setNotificationLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        console.warn('Token tidak ditemukan untuk fetch notifikasi');
        return;
      }

      const apiUrl = `/api/proxy?endpoint=laporan`;
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        console.error(`Error ${response.status} fetching notifications`);
        return;
      }

      // Parse the JSON response
      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error('Failed to parse notification response:', jsonError);
        return;
      }
      
      // Handle different API response formats
      let reportData = [];
      if (Array.isArray(data)) {
        reportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        reportData = data.data;
      } else if (typeof data === 'object' && data !== null) {
        const possibleDataFields = Object.keys(data).filter(key => 
          Array.isArray(data[key]) && data[key].length > 0 && 
          typeof data[key][0] === 'object'
        );
        
        if (possibleDataFields.length > 0) {
          reportData = data[possibleDataFields[0]];
        } else if (data.judul || data.title || data.id) {
          reportData = [data]; // Single report object
        }
      }
      
      // Filter reports for the current user
      const userReports = reportData.filter(report => {
        if (!report || typeof report !== 'object') return false;
        const reportUserId = report.user_id || report.userId || report.pengguna_id;
        return String(reportUserId) === String(userId);
      });
      
      // Generate notifications from reports
      const notifs = userReports
        .filter(report => report.status !== 'Pending') // Only reports with non-pending status
        .map((report, index) => {
          const title = getNotificationTitle(report.status);
          const message = `Laporan "${report.judul}" status: ${report.status}`;
          const time = report.updated_at || report.tanggal_lapor;
          
          return {
            id: report.id || `notif-${index}-${Date.now()}`,
            title: title,
            message: message,
            time: formatTimestamp(time),
            read: false, // Default to unread
            report
          };
        });
      
      // Sort notifications by time (newest first)
      notifs.sort((a, b) => {
        const dateA = a.report.updated_at || a.report.tanggal_lapor;
        const dateB = b.report.updated_at || b.report.tanggal_lapor;
        return new Date(dateB) - new Date(dateA); 
      });
      
      // Take only the 5 most recent notifications for the dropdown
      const recentNotifs = notifs.slice(0, 5);
      setNotifications(recentNotifs);
      
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setNotificationLoading(false);
    }
  };
  
  // Fetch notifications when user data is available
  useEffect(() => {
    if (user && user.id) {
      fetchNotifications(user.id);
    }
  }, [user]);

  // Fetch user data from external API using Bearer token
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        if (!isTokenValid()) {
          clearAuthData();
          router.push('/');
          return;
        }
        const token = localStorage.getItem('token');
        if (!token) {
          clearAuthData();
          router.push('/');
          return;
        }
        const response = await fetch('http://127.0.0.1:8000/api/profile', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
          mode: 'cors',
        });        if (!response.ok) {
          if (response.status === 401) {
            clearAuthData();
            router.push('/');
            return;
          }
          throw new Error(`HTTP error! status: ${response.status}`);
        }        const data = await response.json();
        console.log('Profile data received:', data);

        // Handle different response formats
        if (data.success && data.user) {
          setUser(data.user);
        } else if (data.data) {
          setUser(data.data);
        } else if (data.user) {
          setUser(data.user);
        } else if (data.success && data.data) {
          setUser(data.data);
        } else if (data.id) {
          // Objek user langsung dikembalikan tanpa wrapping
          setUser({
            id: data.id,
            full_name: data.name, // Menyesuaikan name menjadi full_name
            email: data.email,
            role: data.is_admin ? 'Admin' : 'User',
            program_studi_code: data.program_studi_id?.toString() || null
          });
        } else {
          console.error('Invalid profile response format:', data);
        }

      } catch (error) {
        console.error('Failed to fetch user profile:', error);
        
        // Provide more specific error handling
        if (error.message.includes('fetch')) {
          console.error('Network error - please check connection and server at http://127.0.0.1:8000');
        } else if (error.message.includes('401')) {
          console.error('Authentication failed - token may be expired');
          clearAuthData();
        } else if (error.message.includes('CORS')) {
          console.error('CORS error - please check server configuration');
        }
      }
    };

    fetchUserProfile();
  }, [router]);

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
            {notifications.filter(n => !isNotificationRead(n.id)).length > 0 && (
              <span className="absolute top-0 right-0 h-4 w-4 bg-red-500 rounded-full flex items-center justify-center text-white text-xs">
                {notifications.filter(n => !isNotificationRead(n.id)).length}
              </span>
            )}
          </button>
          
          {/* Notification Dropdown */}
          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="flex items-center justify-between p-4 border-b">
                <h3 className="font-medium">Notifikasi</h3>
                <div className="flex items-center gap-2">
                  {notifications.length > 0 && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        // Mark all notifications as read
                        const allIds = notifications.map(n => n.id);
                        setReadNotifications([...new Set([...readNotifications, ...allIds])]);
                      }}
                      className="text-xs text-primary hover:text-primary-dark mr-2"
                    >
                      Tandai semua dibaca
                    </button>
                  )}
                  <button 
                    onClick={() => setShowNotifications(false)}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              
              <div className="max-h-80 overflow-y-auto">
                {notificationLoading ? (
                  <div className="flex items-center justify-center p-4">
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-primary border-t-transparent"></div>
                    <span className="ml-2 text-sm text-gray-500">Memuat...</span>
                  </div>
                ) : notifications.length > 0 ? (
                  <div className="divide-y divide-gray-100">
                    {notifications.map(notification => (
                      <div 
                        key={notification.id} 
                        className={`p-4 hover:bg-gray-50 cursor-pointer ${!isNotificationRead(notification.id) ? 'bg-blue-50' : ''}`}
                        onClick={() => {
                          // Mark as read when clicked
                          markAsRead(notification.id);
                          
                          // Navigate to history when clicking a notification
                          router.push('/user/history');
                          setShowNotifications(false);
                        }}
                      >
                        <p className="text-sm font-medium text-gray-800">{notification.title}</p>
                        <p className="text-xs text-gray-600">{notification.message}</p>
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
    // Clear all authentication data using helper function
    clearAuthData();
    
    // Clear any additional user-specific data if needed
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
