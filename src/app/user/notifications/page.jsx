'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Bell, MessageCircle, RefreshCw, Loader2, AlertCircle } from 'lucide-react';
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";

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

const getNotificationType = (oldStatus, newStatus) => {
  if (newStatus === 'Ditanggapi' || newStatus === 'Selesai') {
    return 'response';
  }
  return 'status';
};

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

export default function Notifications() {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);

  // Fetch user ID from local storage
  useEffect(() => {
    const storedUserId = localStorage.getItem('user_id');
    if (storedUserId) {
      console.log('Found user ID in localStorage:', storedUserId);
      setUserId(storedUserId);
    } else {
      console.warn('No user ID found in localStorage');
      // Try to fetch user profile to get ID
      fetchUserProfile();
    }
  }, []);

  // Fetch user profile if userId not in localStorage
  const fetchUserProfile = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage. User may need to log in.');
        setError('Silakan login terlebih dahulu untuk melihat notifikasi');
        setLoading(false);
        return;
      }
      
      const response = await fetch('/api/proxy?endpoint=profile', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.ok) {
        const userData = await response.json();
        console.log('User profile loaded:', userData);
        
        // Extract user ID from the response
        let foundUserId = null;
        
        // Check common API response structures for user ID
        if (userData.id) {
          foundUserId = userData.id;
        } else if (userData.user && userData.user.id) {
          foundUserId = userData.user.id;
        } else if (userData.data && userData.data.id) {
          foundUserId = userData.data.id;
        } else if (userData.data && userData.data.user && userData.data.user.id) {
          foundUserId = userData.data.user.id;
        }
        
        if (foundUserId) {
          console.log('✅ Found user ID:', foundUserId);
          setUserId(foundUserId);
          localStorage.setItem('user_id', foundUserId.toString());
          
          // Now fetch reports with the user ID
          fetchReports(foundUserId);
        } else {
          console.error('Could not find user ID in profile response');
          setError('Tidak dapat menemukan ID pengguna. Silakan login kembali.');
          setLoading(false);
        }
      } else {
        console.error('Failed to load user profile:', response.status);
        setError('Gagal memuat profil pengguna. Silakan login kembali.');
        setLoading(false);
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      setError('Terjadi kesalahan saat memuat profil pengguna');
      setLoading(false);
    }
  };

  // Fetch reports once we have the user ID
  useEffect(() => {
    if (userId) {
      fetchReports(userId);
    }
  }, [userId]);

  const fetchReports = async (id) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      
      if (!token) {
        throw new Error('Token tidak ditemukan');
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
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      // Parse the JSON response
      let data;
      try {
        data = await response.json();
        console.log('Reports fetched successfully:', data);
      } catch (jsonError) {
        console.error('Failed to parse JSON response:', jsonError);
        throw new Error('Failed to parse server response');
      }
      
      // Handle different API response formats
      let reportData = [];
      if (Array.isArray(data)) {
        reportData = data;
      } else if (data.data && Array.isArray(data.data)) {
        reportData = data.data;
      } else {
        console.warn('Unexpected API response format:', data);
        // Try to extract data from various common formats
        if (typeof data === 'object' && data !== null) {
          const possibleDataFields = Object.keys(data).filter(key => 
            Array.isArray(data[key]) && data[key].length > 0 && 
            typeof data[key][0] === 'object'
          );
          
          if (possibleDataFields.length > 0) {
            reportData = data[possibleDataFields[0]];
            console.log('Found data in field:', possibleDataFields[0]);
          } else {
            if (data.judul || data.title || data.id) {
              reportData = [data]; // Single report object
              console.log('Found a single report object');
            }
          }
        }
      }
      
      // Filter reports for the current user
      const userReports = reportData.filter(report => {
        if (!report || typeof report !== 'object') return false;
        const reportUserId = report.user_id || report.userId || report.pengguna_id;
        return String(reportUserId) === String(id);
      });
      
      console.log(`Filtered ${userReports.length} reports for user ID ${id}`);
      
      // Generate notifications from reports
      const notifs = userReports
        .filter(report => report.status !== 'Pending') // Only reports with non-pending status
        .map((report, index) => {
          const type = getNotificationType(null, report.status);
          const title = getNotificationTitle(report.status);
          const message = `Laporan "${report.judul}" status: ${report.status}`;
          const time = report.updated_at || report.tanggal_lapor;
          
          return {
            id: report.id || `notif-${index}-${Date.now()}`, // Ensure unique ID even if report.id is missing
            type,
            title,
            message,
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
      
      setNotifications(notifs);
      setError(null);
    } catch (error) {
      console.error('Error fetching reports for notifications:', error);
      setError(`Gagal mengambil data notifikasi: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    if (userId) {
      fetchReports(userId);
    } else {
      fetchUserProfile();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <button 
          className="text-primary hover:text-primary/80" 
          onClick={handleRefresh}
          disabled={loading}
        >
          {loading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <RefreshCw className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Error alert */}
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {/* Loading state */}
      {loading && (
        <div className="flex flex-col items-center justify-center py-10">
          <Loader2 className="h-10 w-10 animate-spin text-primary mb-4" />
          <p className="text-muted-foreground">Memuat notifikasi...</p>
        </div>
      )}
      
      {/* Empty state */}
      {!loading && !error && notifications.length === 0 && (
        <div className="text-center py-10 border rounded-lg bg-muted/30">
          <p className="text-muted-foreground">Belum ada notifikasi untuk Anda</p>
        </div>
      )}

      {/* Notifications list */}
      {!loading && !error && notifications.length > 0 && (
        <div className="space-y-4">
          {notifications.map((notification) => (
            <Card
              key={notification.id}
              className={`p-4 ${!notification.read ? 'bg-primary/5' : ''}`}
            >
              <div className="flex gap-4">
                {notification.type === 'response' ? (
                  <MessageCircle className="h-6 w-6 text-blue-500" />
                ) : (
                  <Bell className="h-6 w-6 text-yellow-500" />
                )}
                
                <div className="flex-1">
                  <h3 className="font-semibold">{notification.title}</h3>
                  <p className="text-gray-600">{notification.message}</p>
                  <p className="text-sm text-gray-400 mt-2">{notification.time}</p>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
