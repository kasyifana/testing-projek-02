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
    // Hapus session di server
    await fetch('/testing-projek-02-master/src/php/auth/logout.php', { method: 'POST', credentials: 'include' });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('isLoggedIn');
      localStorage.removeItem('userName');
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
