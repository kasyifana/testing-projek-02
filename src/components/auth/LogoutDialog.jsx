'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { LogOut } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import Lottie from 'lottie-react';

// Renamed to better reflect its purpose - it's not actually a dialog
export function useLogoutHandler() {
  const router = useRouter();
  const { toast } = useToast();
  const [logoutAnimation, setLogoutAnimation] = useState(null);

  useEffect(() => {
    // Fetch the Lottie animation data
    fetch('https://assets5.lottiefiles.com/private_files/lf30_ulp9xiqw.json')
      .then(response => response.json())
      .then(data => {
        setLogoutAnimation(data);
      })
      .catch(error => {
        console.error("Failed to load animation:", error);
      });
  }, []);

  const handleLogout = async () => {
    // Ambil token dari localStorage
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    
    // Attempt to log out on the server, but don't wait for completion or let errors block the process
    if (token) {
      // First try the proxy endpoint (which might handle errors better)
      fetch('/api/proxy?endpoint=logout', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json',
        },
        // Don't use await - we don't want errors to stop the local logout
      }).catch(error => {
        // Silently catch - we'll proceed with local logout regardless
        console.log('Proxy logout error (continuing with local logout):', error);
      });
      
      // Also try the direct endpoint as a backup, but with a timeout to prevent hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3000); // 3-second timeout
      
      try {
        fetch('https://laravel.kasyifana.my.id/api/logout', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
          signal: controller.signal,
          // No credentials include to avoid CORS issues
        }).catch(() => {
          // Ignore errors from direct API call
        }).finally(() => {
          clearTimeout(timeoutId);
        });
      } catch (e) {
        // Ignore errors completely
      }
    }
    
    // Always clear local storage data regardless of API response
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
      localStorage.removeItem('userEmail');
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      localStorage.removeItem('tokenExpiration');
      localStorage.removeItem('loginTime');
      localStorage.removeItem('user_id');
      localStorage.removeItem('readNotifications');
    }

    // Show toast notification with Lottie animation
    toast({
      title: 'Logout Berhasil',
      description: 'Anda telah berhasil keluar dari akun',
      action: logoutAnimation ? (
        <div className="w-20 h-20 mx-auto">
          <Lottie
            animationData={logoutAnimation}
            loop={true}
            autoplay={true}
          />
        </div>
      ) : (
        <div className="w-20 h-20 mx-auto flex items-center justify-center">
          <LogOut className="h-10 w-10 text-green-500" />
        </div>
      ),
    });

    router.push('/'); // Redirect to login page after logout
    return true; // Return success status
  };

  return { handleLogout };
}

// Export the LogoutButton component for convenience
export function LogoutButton({ className, size = "sm", variant = "outline", onClick }) {
  const { handleLogout } = useLogoutHandler();
  
  const onLogoutClick = () => {
    handleLogout();
    if (onClick) onClick();
  };
  
  return (
    <button 
      onClick={onLogoutClick}
      className={`flex items-center ${className}`}
      size={size}
      variant={variant}
    >
      <LogOut className="mr-2 h-4 w-4" />
      Logout
    </button>
  );
}
