'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useState } from 'react';
import { Home, FileText, History, Bell, User, Book, HelpCircle, Star, LogOut, X } from 'lucide-react';

export default function UserLayout({ children }) {
  const pathname = usePathname();
  const [showNotifications, setShowNotifications] = useState(false);

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
  };

  const NavLink = ({ item }) => (
    <Link
      href={item.path}
      className={`flex items-center px-6 py-3 text-base transition-colors ${
        pathname === item.path
          ? 'bg-primary text-white font-medium'
          : 'text-gray-600 hover:bg-gray-50 hover:text-primary'
      }`}
    >
      <item.icon className="h-5 w-5 mr-3" />
      <span>{item.label}</span>
    </Link>
  );

  // Mock notifications data (replace with real data in production)
  const notifications = [
    { id: 1, title: "Laporan Anda telah diproses", time: "5 menit yang lalu", read: false },
    { id: 2, title: "Tanggapan baru pada laporan Anda", time: "1 jam yang lalu", read: false },
    { id: 3, title: "Status laporan Anda telah diubah", time: "1 hari yang lalu", read: true },
  ];

  // Header component with profile and dropdown notifications
  const Header = () => (
    <header className="bg-white shadow-sm h-16 flex items-center justify-end px-8">
      <div className="flex items-center space-x-4">
        <div className="relative">
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
        
        <Link 
          href="/user/profile"
          className={`flex items-center space-x-2 p-2 rounded-full ${pathname === '/user/profile' ? 'bg-gray-100' : 'hover:bg-gray-50'}`}
        >
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <User className="h-5 w-5 text-white" />
          </div>
          <span className="font-medium text-gray-700">Profil</span>
        </Link>
      </div>
    </header>
  );

  return (
    <div className="flex min-h-screen bg-gray-100">
      <aside className="w-72 bg-white shadow-md flex flex-col justify-between">
        <nav className="flex flex-col gap-y-6 pt-6">
          <div>
            <div className="px-6 py-2">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
                Laporan
              </p>
            </div>
            {menuGroups.laporan.map((item) => (
              <NavLink key={item.path} item={item} />
            ))}
          </div>

          <div>
            <div className="px-6 py-2">
              <p className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
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
            onClick={() => window.location.href = '/'}
            className="flex items-center w-full px-6 py-3 text-base text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="h-5 w-5 mr-3" />
            <span>Keluar</span>
          </button>
        </div>
      </aside>
      <div className="flex-1 flex flex-col">
        <Header />
        <main className="flex-1 p-10">{children}</main>
      </div>
    </div>
  );
}
