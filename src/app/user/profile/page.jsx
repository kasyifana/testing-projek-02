'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Redirect to dashboard since profile is now handled in the header popup
  useEffect(() => {
    router.push('/user/dashboard');
  }, [router]);  useEffect(() => {
    // Fetch user profile data from PHP backend
    fetch('http://localhost/testing-projek-02-master/src/php/user_profile.php', {
      method: 'GET',
      credentials: 'same-origin', // Use same-origin for local PHP session handling
      headers: { 'Accept': 'application/json' }
    }).then(res => res.json())
      .then(data => {
        if (data.success && data.user) {
          setUser(data.user);
        } else {
          setError(data.message || 'Gagal mengambil data user.');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Gagal terhubung ke server.');
        setLoading(false);
      });
  }, []);

  if (loading) return <div className="text-center py-10">Memuat data profil...</div>;
  if (error) return <div className="text-center py-10 text-red-500">{error}</div>;
  if (!user) return null;

  return (
    <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8 mt-10">
      <h1 className="text-2xl font-bold mb-4">Profil Pengguna</h1>
      <div className="mb-2"><b>Nama:</b> {user.full_name}</div>
      <div className="mb-2"><b>Email:</b> {user.email}</div>
      <div className="mb-2"><b>Role:</b> {user.role}</div>
      {user.program_studi_code && (
        <div className="mb-2"><b>Program Studi:</b> {user.program_studi_code}</div>
      )}
      <div className="mb-2"><b>ID:</b> {user.id}</div>
    </div>
  );
}
