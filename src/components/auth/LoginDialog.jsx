'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { useRouter } from 'next/navigation';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Mail, Lock, LogIn, X } from 'lucide-react';
import React, { useState } from 'react';

// Helper function untuk cek token validity
const isTokenValid = () => {
  const token = localStorage.getItem('token');
  const expiration = localStorage.getItem('tokenExpiration');
  
  console.log('Token validation check:', {
    hasToken: !!token,
    tokenLength: token ? token.length : 0,
    hasExpiration: !!expiration,
    expiration: expiration
  });
  
  if (!token) {
    console.log('No token found');
    return false;
  }
  
  // If no expiration is set, assume token is still valid
  // This handles cases where token was saved but expiration wasn't set properly
  if (!expiration) {
    console.log('No expiration found, assuming token is valid');
    return true;
  }
  
  const now = new Date();
  const expirationDate = new Date(expiration);
  
  console.log('Expiration check:', {
    now: now.toISOString(),
    expiration: expirationDate.toISOString(),
    isValid: now < expirationDate
  });
  
  return now < expirationDate;
};

// Helper function untuk clear token dan data terkait
const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiration');
  localStorage.removeItem('loginTime');
  localStorage.removeItem('user');
  localStorage.removeItem('isLoggedIn');
  localStorage.removeItem('userName');
  localStorage.removeItem('userEmail');
  console.log('Auth data cleared from localStorage');
};

// Export helper functions untuk digunakan di komponen lain
export { isTokenValid, clearAuthData };

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

export function LoginDialog({ isOpen, onClose, onRegisterClick }) {
  const { toast } = useToast();
  const router = useRouter();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });
  const [shake, setShake] = useState(false);
  const [loginError, setLoginError] = useState('');
  async function onSubmit(data) {
    setLoginError('');
    
    // Clear any existing auth data sebelum login baru
    clearAuthData();
      try {
      console.log('Attempting login with:', { email: data.email, password: '[REDACTED]' });
      
      const response = await fetch('https://laravel.kasyifana.my.id/api/login', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ email: data.email, password: data.password }),
        credentials: 'same-origin',
        mode: 'cors',
      });
      
      console.log('Response status:', response.status);
      console.log('Response ok:', response.ok);
      
      const result = await response.json();
      console.log('Login response:', result);
      console.log('Login response structure:', {
        hasToken: 'token' in result,
        hasAccessToken: 'access_token' in result,
        hasData: 'data' in result,
        hasSuccess: 'success' in result,
        hasUser: 'user' in result,
        tokenValue: result.token ? `${result.token.substring(0, 20)}...` : null,
        accessTokenValue: result.access_token ? `${result.access_token.substring(0, 20)}...` : null,
        allKeys: Object.keys(result),
        responseStatus: response.status
      });

      // Handle different token response formats - prioritize the most common ones first
      let token = null;
      if (result.token) {
        token = result.token;
        console.log('✅ Token found in result.token');
      } else if (result.access_token) {
        token = result.access_token;
        console.log('✅ Token found in result.access_token');
      } else if (result.data && result.data.token) {
        token = result.data.token;
        console.log('✅ Token found in result.data.token');
      } else if (result.data && result.data.access_token) {
        token = result.data.access_token;
        console.log('✅ Token found in result.data.access_token');
      } else {
        console.log('❌ No token found in any expected location');
      }

      console.log('Final extracted token:', token ? `${token.substring(0, 20)}...` : 'null');      // Check if login was successful and we have either a token or success flag
      if (response.ok && (token || result.success)) {
        console.log('🎉 Login successful!');
        
        // Save token if available
        if (token) {
          console.log('💾 Saving token to localStorage...');
          localStorage.setItem('token', token);
          
          // Simpan timestamp login untuk tracking session
          localStorage.setItem('loginTime', new Date().toISOString());
          
          // Optional: Set token expiration (misal 24 jam dari sekarang)
          if (result.expires_in) {
            const expirationTime = new Date(Date.now() + (result.expires_in * 1000));
            localStorage.setItem('tokenExpiration', expirationTime.toISOString());
          } else {
            // Default 24 jam jika tidak ada info expiration
            const expirationTime = new Date(Date.now() + (24 * 60 * 60 * 1000));
            localStorage.setItem('tokenExpiration', expirationTime.toISOString());
          }
          
          console.log('✅ Token saved successfully');
        } else {
          console.log('⚠️ No token provided by API, but login was successful');
        }        
        // Always set isLoggedIn when we have a successful login and token
        console.log('💾 Setting login status...');
        localStorage.setItem('isLoggedIn', 'true');
        
        // Simpan data user jika ada
        if (result.user) {
          // Simpan data user jika ada
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('userName', result.user.name || result.user.full_name || result.user.email);
          localStorage.setItem('userEmail', result.user.email);
        } else if (result.data && result.data.user) {
          // Simpan data user dari result.data jika ada
          localStorage.setItem('user', JSON.stringify(result.data.user));
          localStorage.setItem('userName', result.data.user.name || result.data.user.full_name || result.data.user.email);
          localStorage.setItem('userEmail', result.data.user.email);
        } else {
          // Fetch user profile jika tidak ada user di response login
          try {
            const profileResponse = await fetch('https://laravel.kasyifana.my.id/api/profile', {
              method: 'GET',
              headers: {
                'Authorization': `Bearer ${token}`,
                'Accept': 'application/json',
                'Content-Type': 'application/json',
              },
            });
            if (profileResponse.ok) {
              const profileResult = await profileResponse.json();
              const userProfile = profileResult.user || profileResult;
              localStorage.setItem('user', JSON.stringify(userProfile));
              localStorage.setItem('userName', userProfile.name || userProfile.full_name || userProfile.email);
              localStorage.setItem('userEmail', userProfile.email);
              result.user = userProfile;
            } else {
              localStorage.setItem('userName', 'User');
              localStorage.setItem('userEmail', 'user@example.com');
            }
          } catch (profileError) {
            localStorage.setItem('userName', 'User');
            localStorage.setItem('userEmail', 'user@example.com');
          }
        }
        
        // Verify everything was saved
        const verification = {
          token: !!localStorage.getItem('token'),
          user: !!localStorage.getItem('user'),
          isLoggedIn: localStorage.getItem('isLoggedIn'),
          userName: localStorage.getItem('userName'),
          userEmail: localStorage.getItem('userEmail')
        };
        console.log('🔍 Post-save verification:', verification);
        console.log('Token saved to localStorage:', {
          token: token ? token.substring(0, 20) + '...' : 'No token', // Log partial token for security
          loginTime: localStorage.getItem('loginTime'),
          expiration: localStorage.getItem('tokenExpiration')
        });
        
        // Verify token was actually saved
        const savedToken = localStorage.getItem('token');
        console.log('Verification - token saved successfully:', !!savedToken);
        
        toast({
          title: 'Login Berhasil!',
          description: 'Anda berhasil masuk ke akun Anda.',
          variant: 'default',
        }); 
        
        // Trigger storage event untuk update navbar
        window.dispatchEvent(new Event('storage'));
        onClose();
        form.reset();
        
        // Debug logging
        console.log('Login successful. Full response:', result);
        console.log('User data from API:', result.user);          // Redirect dengan delay untuk memastikan localStorage tersimpan
        setTimeout(() => {
          // Verify token is still there before redirect
          const tokenCheck = localStorage.getItem('token');
          console.log('Pre-redirect token check:', !!tokenCheck);
            // Safe check untuk user dan admin status
          let isAdmin = false;
          let userData = null;
          
          console.log('🔍 Starting admin check process...');
          console.log('Full result object:', JSON.stringify(result, null, 2));
          
          // Get user data from different possible locations
          if (result.user) {
            userData = result.user;
            console.log('✅ User data found in result.user');
          } else if (result.data && result.data.user) {
            userData = result.data.user;
            console.log('✅ User data found in result.data.user');
          } else {
            console.log('❌ No user data found in expected locations');
            console.log('Available keys in result:', Object.keys(result));
          }
          
          if (userData) {
            console.log('📋 User data for admin check:', JSON.stringify(userData, null, 2));
            
            // Debug setiap kondisi admin check
            const checks = {
              'is_admin === 1': userData.is_admin === 1,
              'is_admin === true': userData.is_admin === true,
              'is_admin === "1"': userData.is_admin === '1',
              'role === "admin"': userData.role === 'admin',
              'role === "administrator"': userData.role === 'administrator',
              'email includes admin': userData.email && userData.email.includes('admin')
            };
            
            console.log('🔍 Individual admin checks:', checks);
            
            // Cek berbagai kemungkinan field admin
            isAdmin = userData.is_admin === 1 || 
                     userData.is_admin === true || 
                     userData.is_admin === '1' ||
                     userData.role === 'admin' ||
                     userData.role === 'administrator' ||
                     (userData.email && userData.email.includes('admin'));
            
            console.log('Admin check details:');
            console.log('- is_admin field:', userData.is_admin);
            console.log('- is_admin type:', typeof userData.is_admin);
            console.log('- is_admin value (strict):', userData.is_admin);
            console.log('- is_admin === true:', userData.is_admin === true);
            console.log('- role field:', userData.role);
            console.log('- email field:', userData.email);
            console.log('- final isAdmin result:', isAdmin);
            console.log('🎯 FINAL ADMIN STATUS:', isAdmin ? 'ADMIN' : 'USER');
          } else {
            console.log('❌ No user data available for admin check - defaulting to user dashboard');
          }
            if (isAdmin) {
            console.log('� REDIRECTING TO ADMIN DASHBOARD');
            console.log('✅ Admin user detected, redirecting to admin dashboard');
            console.log('🔗 Redirecting to: /admin/dashboard');
            router.push('/admin/dashboard');
          } else {
            console.log('� REDIRECTING TO USER DASHBOARD');
            console.log('�👤 Regular user detected, redirecting to user dashboard');
            console.log('🔗 Redirecting to: /user/dashboard');
            router.push('/user/dashboard');
          }
        }, 500); // Increased delay to ensure localStorage is fully written
      } else if (result.success) {
        // Handle case where token might not be present but login is successful
        console.log('Login successful but no token found:', result);
        
        // Still save user data if available
        if (result.user) {
          localStorage.setItem('user', JSON.stringify(result.user));
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('userName', result.user.name || result.user.full_name || result.user.email);
          localStorage.setItem('userEmail', result.user.email);
        }
        
        toast({
          title: 'Login Berhasil!',
          description: 'Anda berhasil masuk ke akun Anda.',
          variant: 'default',
        });
        
        window.dispatchEvent(new Event('storage'));
        onClose();
        form.reset();        setTimeout(() => {
          let isAdmin = false;
          let userData = null;
          
          console.log('🔍 Starting admin check process (success branch)...');
          console.log('Full result object:', JSON.stringify(result, null, 2));
          
          // Get user data from different possible locations
          if (result.user) {
            userData = result.user;
            console.log('✅ User data found in result.user (success branch)');
          } else if (result.data && result.data.user) {
            userData = result.data.user;
            console.log('✅ User data found in result.data.user (success branch)');
          } else {
            console.log('❌ No user data found in expected locations (success branch)');
            console.log('Available keys in result:', Object.keys(result));
          }
          
          if (userData) {
            console.log('📋 User data for admin check (success branch):', JSON.stringify(userData, null, 2));
            
            // Debug setiap kondisi admin check
            const checks = {
              'is_admin === true': userData.is_admin === true
            };
            
            console.log('🔍 Individual admin checks (success branch):', checks);
            
            // Cek berbagai kemungkinan field admin
            isAdmin = userData.is_admin === true || 
                    //  userData.is_admin === '1' ||
                    //  userData.role === 'admin' ||
                    //  userData.role === 'administrator' ||
                    //  (userData.email && userData.email.includes('admin'));
            
            console.log('Admin check details (success branch):');
            console.log('- is_admin field:', userData.is_admin);
            console.log('- is_admin type:', typeof userData.is_admin);
            console.log('- is_admin value (strict):', userData.is_admin);
            console.log('- is_admin === true:', userData.is_admin === true);
            console.log('- role field:', userData.role);
            console.log('- email field:', userData.email);
            console.log('- final isAdmin result:', isAdmin);
            console.log('🎯 FINAL ADMIN STATUS (success branch):', isAdmin ? 'ADMIN' : 'USER');
          } else {
            console.log('❌ No user data available for admin check - defaulting to user dashboard (success branch)');
          }
            if (isAdmin) {
            console.log('🚀 REDIRECTING TO ADMIN DASHBOARD (success branch)');
            console.log('✅ Admin user detected (success branch), redirecting to admin dashboard');
            console.log('🔗 Redirecting to: /admin/dashboard');
            router.push('/admin/dashboard');
          } else {
            console.log('� REDIRECTING TO USER DASHBOARD (success branch)');
            console.log('�👤 Regular user detected (success branch), redirecting to user dashboard');
            console.log('🔗 Redirecting to: /user/dashboard');
            router.push('/user/dashboard');
          }
        }, 500);} else {
        // Clear any existing auth data on login failure
        clearAuthData();
        
        setShake(true);
        setTimeout(() => setShake(false), 600); // Reset shake after animation
        
        // More detailed error handling
        let errorMsg = 'Login gagal. Silakan coba lagi.';
        
        if (result.message) {
          errorMsg = result.message;
        } else if (result.error) {
          errorMsg = result.error;
        } else if (result.errors) {
          // Handle validation errors
          errorMsg = typeof result.errors === 'string' ? result.errors : 'Validation error';
        }
        
        console.log('Login failed:', result);
        setLoginError(errorMsg);
        toast({
          title: 'Login Gagal',
          description: errorMsg,
          variant: 'destructive',
        });
      }    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      
      console.error('Login error:', error);
      
      let errorMsg = 'Tidak dapat terhubung ke server.';
      
      if (error.name === 'TypeError' && error.message.includes('fetch')) {
        errorMsg = 'Tidak dapat terhubung ke Laravel API. Pastikan server berjalan di https://laravel.kasyifana.my.id';
      } else if (error.message) {
        errorMsg = error.message;
      }
      
      setLoginError(errorMsg);
      toast({
        title: 'Terjadi Kesalahan',
        description: errorMsg,
        variant: 'destructive',
      });
    }
  }

  // Reset loginError saat user mengetik ulang
  function handleInputChange(field) {
    return (e) => {
      form.setValue(field, e.target.value);
      setLoginError('');
    };
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </button>
        
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">Login</DialogTitle>
          <DialogDescription className="text-center">
            Masukkan email dan password untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="email" placeholder="contoh@email.com" {...field} onChange={handleInputChange('email')} className={`pl-10 ${shake ? 'animate-shake border-red-500' : ''}`} />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input type="password" placeholder="••••••••" {...field} onChange={handleInputChange('password')} className={`pl-10 ${shake ? 'animate-shake border-red-500' : ''}`} />
                    </div>
                  </FormControl>
                  <FormMessage />
                  {loginError && (
                    <p className="text-xs text-red-500 mt-1">{loginError}</p>
                  )}
                </FormItem>
              )}
            />
            
            <Button type="submit" className="w-full" variant="accent">
              <LogIn className="mr-2 h-5 w-5" /> Login
            </Button>
          </form>
        </Form>
        
        <div className="mt-4 text-center text-sm">
          <p className="text-muted-foreground">
            Belum memiliki akun?{' '}
            <button 
              onClick={onRegisterClick}
              className="text-primary font-medium hover:underline"
            >
              Silahkan register
            </button>
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Tambahkan animasi shake di global CSS (misal: src/app/globals.css):
// .animate-shake {
//   animation: shake 0.4s cubic-bezier(.36,.07,.19,.97) both;
// }
// @keyframes shake {
//   10%, 90% { transform: translateX(-1px); }
//   20%, 80% { transform: translateX(2px); }
//   30%, 50%, 70% { transform: translateX(-4px); }
//   40%, 60% { transform: translateX(4px); }
// }
