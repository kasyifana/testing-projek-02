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
  { title: 'Manajemen Laporan', href: '/admin/reports', icon: FileText },
  { title: 'Peringatan Sistem', href: '/admin/warnings', icon: AlertCircle },
  { title: 'Audit Log', href: '/admin/audit', icon: History },
  { title: 'Manajemen User', href: '/admin/users', icon: Users },
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
    <div className="min-h-screen bg-blue-50 relative">
      {/* Mobile sidebar toggle/burger button - visible only on mobile */}
      <button
        onClick={() => setSidebarOpen(!isSidebarOpen)}
        className="fixed top-4 left-4 z-50 p-2 rounded-lg bg-white shadow-md border md:hidden"
        aria-label="Toggle menu"
      >
        <Menu className="w-5 h-5" />
      </button>

      {/* Mobile overlay when sidebar is open */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-30 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar - hidden by default on mobile, shown when toggled */}
      <aside 
        className={`fixed left-0 top-0 z-40 h-screen w-64 transform transition-transform duration-300 ease-in-out overflow-x-hidden
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}
      >
        <div className="h-full bg-gray-50 border-r flex flex-col overflow-x-hidden">
          

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
          <nav className="flex-1 p-4 space-y-1 overflow-y-auto overflow-x-hidden">
            {sidebarLinks.map((link) => {
              const Icon = link.icon;
              const isActive = activeLink === link.href;
              return (
                <button
                  key={link.href}
                  onClick={() => handleNavigation(link.href)}
                  className={`flex items-center w-full p-3 transition-colors ${
                    isActive 
                      ? 'bg-blue-100 text-black font-medium rounded-lg mx-1' 
                      : 'hover:bg-blue-50 hover:rounded-lg hover:mx-1'
                  }`}
                >
                  <Icon className={`w-5 h-5 mr-3 ${isActive ? 'text-blue-600' : ''}`} />
                  <span>{link.title}</span>
                </button>
              );
            })}
          </nav>

          {/* Logout button */}
          <div className="p-4 border-t overflow-x-hidden">
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

      {/* Main content - adjust margin based on sidebar visibility */}
      <main className={`min-h-screen transition-all duration-300 ${
        isSidebarOpen ? 'md:ml-64' : 'ml-0 md:ml-64'
      }`}>
        <div className="container mx-auto p-4 md:p-6 max-w-7xl">
          <div className="bg-white rounded-xl shadow-sm border p-4 md:p-6 mt-12 md:mt-0">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
