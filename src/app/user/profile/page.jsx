'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
