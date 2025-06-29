'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, Clock, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { isTokenValid, clearAuthData } from "@/components/auth/LoginDialog";

export default function Dashboard() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState([
    { label: 'Pending', count: 0, icon: Clock, color: 'text-yellow-500' },
    { label: 'In Progress', count: 0, icon: AlertCircle, color: 'text-blue-500' },
    { label: 'Selesai', count: 0, icon: CheckCircle, color: 'text-green-500' },
  ]);
  const [fetchError, setFetchError] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Auth check effect
  useEffect(() => {
    const checkAuth = () => {
      console.log('Checking authentication for user dashboard...');
      
      // Debug: Check all auth-related localStorage items
      const allAuthData = {
        token: localStorage.getItem('token'),
        tokenExpiration: localStorage.getItem('tokenExpiration'),
        loginTime: localStorage.getItem('loginTime'),
        user: localStorage.getItem('user'),
        isLoggedIn: localStorage.getItem('isLoggedIn'),
        userName: localStorage.getItem('userName'),
        userEmail: localStorage.getItem('userEmail')
      };
      
      console.log('All auth data in localStorage:', {
        ...allAuthData,
        token: allAuthData.token ? `${allAuthData.token.substring(0, 20)}...` : null // Log partial token for security
      });
        // First check if token is valid using our helper function
      const tokenValidityResult = isTokenValid();
      console.log('Token validity result:', tokenValidityResult);
      
      if (!tokenValidityResult) {
        // Double-check: if token exists but validity check failed, 
        // it might be an expiration issue, so check manually
        const token = localStorage.getItem('token');
        if (token) {
          console.log('Token exists but validity check failed, checking manually...');
          const expiration = localStorage.getItem('tokenExpiration');
          
          if (!expiration) {
            console.log('No expiration set, assuming token is valid for now');
            // Continue with auth check instead of redirecting
          } else {
            const now = new Date();
            const expirationDate = new Date(expiration);
            if (now >= expirationDate) {
              console.log('Token is actually expired, clearing auth data and redirecting to home');
              clearAuthData();
              router.push('/');
              return;
            } else {
              console.log('Token is not expired, continuing...');
            }
          }
        } else {
          console.log('No token found, clearing auth data and redirecting to home');
          clearAuthData();
          router.push('/');
          return;
        }
      }

      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';      console.log('Auth check results:', {
        hasToken: !!token,
        hasUser: !!user,
        isLoggedIn,
        tokenLength: token ? token.length : 0
      });

      // Check if we have token and login status (user data can be fetched later from profile API)
      if (!token || !isLoggedIn) {
        console.log('Not authenticated (no token or not logged in), redirecting to home');
        clearAuthData(); // Clear any partial auth data
        router.push('/');
        return;
      }

      // If we have token and login status, we can proceed even without user data
      // The layout will fetch user data from the profile API
      if (user) {
        try {
          const userData = JSON.parse(user);
          console.log('User data in user dashboard:', userData);
          
          // Check if user is admin (should redirect admin to admin dashboard)
          const isAdmin = userData.is_admin === 1 || 
                          userData.is_admin === true || 
                          userData.role === 'admin' ||
                          userData.role === 'administrator';
          
          if (isAdmin) {
            console.log('Admin user detected, redirecting to admin dashboard');
            router.push('/admin/dashboard');
            return;
          }

          console.log('User authorized for user dashboard');
          setIsAuthorized(true);
        } catch (error) {
          console.error('Error parsing user data:', error);
          // Don't redirect on user data parse error if we have valid token
          console.log('User data parse failed, but token is valid - allowing access');
          setIsAuthorized(true);
        }
      } else {
        console.log('No user data found, but token is valid - allowing access (profile will be fetched by layout)');
        setIsAuthorized(true);
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [router]);

  // Fetch reports effect
  useEffect(() => {
    if (isAuthorized) {
      fetchReports();
    }
  }, [isAuthorized]);

  // Function to fetch reports from the API
  const fetchReports = async () => {
    try {
      setIsRefreshing(true);
      // Get token from local storage
      const token = localStorage.getItem('token');
      if (!token) {
        console.warn('No token found in localStorage. User may need to log in.');
        return;
      }
      
      // Get user ID from local storage
      const userId = localStorage.getItem('user_id');
      const user = localStorage.getItem('user');
      let userIdToFetch = userId;
      
      // If user_id is not directly available, try to get it from the user object
      if (!userIdToFetch && user) {
        try {
          const userData = JSON.parse(user);
          userIdToFetch = userData.id;
        } catch (error) {
          console.error('Error parsing user data to get ID:', error);
        }
      }
      
      if (!userIdToFetch) {
        console.warn('Could not determine user ID. Trying to fetch user-specific reports may fail.');
      }
      
      console.log('Fetching reports for user ID:', userIdToFetch);
      
      // The Laravel API doesn't have a /laporan/user/{id} endpoint consistently available
      // Instead, we'll query all reports and filter by user_id on the client
      const apiUrl = '/api/proxy?endpoint=laporan';
      
      const response = await fetch(apiUrl, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (!response.ok) {
        throw new Error(`Server responded with status: ${response.status}`);
      }
      
      // Safely handle JSON parsing
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
      } else if (data.reports && Array.isArray(data.reports)) {
        reportData = data.reports;
      } else {
        console.warn('Unexpected API response format:', data);
        // Try to extract data from various common formats
        if (typeof data === 'object' && data !== null) {
          // If data is an object, check common fields
          const possibleDataFields = Object.keys(data).filter(key => 
            Array.isArray(data[key]) && data[key].length > 0 && 
            typeof data[key][0] === 'object'
          );
          
          if (possibleDataFields.length > 0) {
            reportData = data[possibleDataFields[0]];
            console.log('Found data in field:', possibleDataFields[0]);
          } else {
            // If no arrays found, look for objects with report-like properties
            if (data.judul || data.title || data.id) {
              reportData = [data]; // Single report object
              console.log('Found a single report object');
            }
          }
        }
      }
      
      console.log('Processed report data:', reportData);
      
      // Filter reports for the current user
      let userReports = reportData;
      
      // Only filter if we have a user ID
      if (userIdToFetch) {
        userReports = reportData.filter(report => {
          // Only process actual objects
          if (!report || typeof report !== 'object') return false;
          
          // Handle different field naming conventions
          const reportUserId = report.user_id || report.userId || report.pengguna_id;
          
          // Compare as strings to avoid type mismatches
          return String(reportUserId) === String(userIdToFetch);
        });
        
        console.log(`Filtered ${userReports.length} reports for user ID ${userIdToFetch} out of ${reportData.length} total reports`);
      } else {
        console.warn('No user ID available for filtering, showing all reports');
      }
      
      // Ensure each report has a unique id or generate one if missing
      const reportsWithIds = userReports.map((report, index) => {
        if (!report.id) {
          return { ...report, id: `generated-${index}` };
        }
        return report;
      });
      
      // Sort reports by date (newest first)
      reportsWithIds.sort((a, b) => {
        const dateA = new Date(a.tanggal_lapor);
        const dateB = new Date(b.tanggal_lapor);
        return dateB - dateA;
      });
      
      setReports(reportsWithIds);
      
      // Calculate statistics based on report status
      calculateStats(reportsWithIds);
      setFetchError(null);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setFetchError(error.message);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Calculate statistics from reports
  const calculateStats = (reportData) => {
    const statusCounts = {
      'Pending': 0,
      'In Progress': 0,
      'Selesai': 0
    };
    
    // Count reports by status
    reportData.forEach(report => {
      const status = report.status || 'Pending';
      
      // Check if this status is one we're tracking
      if (statusCounts.hasOwnProperty(status)) {
        statusCounts[status]++;
      } else {
        // For any unrecognized status values, default to Pending
        console.log(`Unrecognized status "${status}" defaulting to Pending`);
        statusCounts['Pending']++;
      }
    });
    
    // Update stats state with the counts
    setStats([
      { label: 'Pending', count: statusCounts['Pending'], icon: Clock, color: 'text-yellow-500' },
      { label: 'In Progress', count: statusCounts['In Progress'], icon: AlertCircle, color: 'text-blue-500' },
      { label: 'Selesai', count: statusCounts['Selesai'], icon: CheckCircle, color: 'text-green-500' },
    ]);
  };

  // Format date for display (DD MMM YYYY)
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    if (isNaN(date)) return dateString;
    
    // Indonesian month names
    const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                        'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    
    return `${date.getDate()} ${monthNames[date.getMonth()]} ${date.getFullYear()}`;
  };

  // Map API status to display status
  const mapStatusToUI = (status) => {
    const statusMap = {
      'Pending': { label: 'Pending', icon: Clock, color: 'bg-yellow-100 text-yellow-600' },
      'In Progress': { label: 'In Progress', icon: AlertCircle, color: 'bg-blue-100 text-blue-600' },
      'Selesai': { label: 'Selesai', icon: CheckCircle, color: 'bg-green-100 text-green-600' }
    };
    
    return statusMap[status] || { 
      label: status, 
      icon: Clock, 
      color: 'bg-gray-100 text-gray-600' 
    };
  };

  // Provide Indonesian translation for the status labels
  const getStatusIndonesian = (statusEn) => {
    const translations = {
      'Pending': 'Menunggu',
      'In Progress': 'Diproses',
      'Selesai': 'Selesai'
    };
    
    return translations[statusEn] || statusEn;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!isAuthorized) {
    return null; // Will redirect, so don't render anything
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Beranda Pelapor</h1>
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            size="sm" 
            className="flex items-center gap-1"
            onClick={fetchReports}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            Perbarui
          </Button>
          <Link href="/user/create-report">
            <Button variant="accent" className="flex items-center gap-2">
              <PlusCircle className="h-5 w-5" />
              Buat Laporan Baru
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Card key={stat.label} className="p-4">
            <stat.icon className={`h-8 w-8 ${stat.color}`} />
            <p className="mt-2 text-2xl font-bold">{stat.count}</p>
            <p className="text-gray-600">{getStatusIndonesian(stat.label)}</p>
          </Card>
        ))}
      </div>

      <Card className="p-4">
        <h2 className="text-xl font-semibold mb-4">Progres Laporan</h2>
        {fetchError ? (
          <div className="p-4 bg-red-50 rounded-md text-red-600 mb-4">
            <p className="font-medium">Gagal memuat data laporan</p>
            <p className="text-sm">{fetchError}</p>
            <Button 
              variant="outline" 
              size="sm"
              className="mt-2"
              onClick={fetchReports}
            >
              Coba Lagi
            </Button>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center p-6 border border-dashed rounded-lg">
            <p className="text-gray-500 mb-2">Belum ada laporan</p>
            <Link href="/user/create-report">
              <Button variant="outline" size="sm">
                Buat Laporan Baru
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {reports.slice(0, 5).map((report) => {
              const statusUI = mapStatusToUI(report.status || 'Pending');
              return (
                <div key={report.id} className="flex items-center justify-between border-b pb-4 last:border-0">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-500">
                        {report.id ? `LP-${report.id}` : 'LP-' + Math.floor(Math.random() * 10000)}
                      </span>
                      <span className="text-xs text-gray-400">•</span>
                      <span className="text-sm text-gray-500">
                        {formatDate(report.tanggal_lapor)}
                      </span>
                    </div>
                    <h3 className="font-medium mt-1">{report.judul}</h3>
                  </div>
                  <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full ${statusUI.color}`}>
                    <statusUI.icon className="h-4 w-4" />
                    <span className="text-sm font-medium">{getStatusIndonesian(statusUI.label)}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div className="mt-4 text-center">
          <Link href="/user/history">
            <Button variant="link" className="text-primary">
              Lihat Semua Laporan
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
