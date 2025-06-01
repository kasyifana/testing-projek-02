'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Dummy user data (this would come from a real API/auth context in production)
export const DUMMY_USER = {
  id: 'USR-12345',
  username: 'user_pelapor123',
  name: 'User Biasa',
  email: 'tes@gmail.com',
  phone: '081234567890',
  joinDate: '01 January 2024'
};

export default function ProfilePage() {
  const router = useRouter();
  
  // Redirect to dashboard since profile is now handled in the header popup
  useEffect(() => {
    router.push('/user/dashboard');
  }, [router]);

  return (
    <div className="text-center py-10">
      <p>Redirecting to dashboard...</p>
    </div>
  );
}
