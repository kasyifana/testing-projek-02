'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';
import { 
  LayoutDashboard, 
  ClipboardCheck,
  FileText, 
  MessageSquare,
  AlertCircle,
  History,
  Users, 
  Settings,
  LogOut,
  Menu,
  User
} from 'lucide-react';
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const sidebarLinks = [
  { title: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
  { title: 'Manajemen User', href: '/admin/users', icon: Users },
  { title: 'Manajemen Laporan', href: '/admin/reports', icon: FileText },
  { title: 'Peringatan Sistem', href: '/admin/warnings', icon: AlertCircle },
  { title: 'Audit Log', href: '/admin/audit', icon: History },
  { title: 'Feedback', href: '/admin/feedback', icon: MessageSquare },
  { title: 'Pengaturan', href: '/admin/settings', icon: Settings },
];

export default function AdminLayout({ children }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [activeLink, setActiveLink] = useState(pathname);

  useEffect(() => {
    setActiveLink(pathname);
  }, [pathname]);

  const handleNavigation = (href) => {
    setActiveLink(href);
    router.push(href);
  };

  const handleLogout = () => {
    // Clear any stored session/tokens
    localStorage.removeItem('adminSession');
    sessionStorage.removeItem('adminSession');
    
    // Redirect to home page
    window.location.href = '/';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile sidebar toggle */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border md:hidden"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-200 ease-in-out ${
        isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
      } md:translate-x-0`}>
        <div className="h-full bg-white border-r flex flex-col">
          {/* Brand */}
          <div className="flex items-center gap-2 p-6 border-b">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="text-white font-bold">A</span>
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Admin Panel
            </h2>
          </div>

          {/* User Profile */}
          <div className="p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback>AD</AvatarFallback>
              </Avatar>
              <div>
                <p className="font-medium">Admin</p>
                <p className="text-sm text-gray-500">admin@gmail.com</p>
              </div>
            </div>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeLink === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link.href)}
                  className={`flex items-center w-full p-3 rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary/10 text-primary hover:bg-primary/15' 
                      : 'hover:bg-gray-100'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-primary' : ''}`} />
                  <span>{link.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t">
            <button
              onClick={handleLogout}
              className="flex items-center w-full p-3 rounded-lg hover:bg-red-50 text-red-600 transition-colors"
            >
              <LogOut className="w-5 h-5 mr-3" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className={`min-h-screen transition-all duration-200 ${
        isSidebarOpen ? 'md:ml-64' : ''
      }`}>
        <div className="container mx-auto p-6 max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm border p-6">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
