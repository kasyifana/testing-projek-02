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
    try {
      const response = await fetch('http://localhost/testing-projek-02-master/src/php/auth/login.php', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: data.email, password: data.password }),
      });
      const result = await response.json();
      if (result.success) {
        localStorage.setItem('isLoggedIn', 'true');
        localStorage.setItem('userName', result.user.full_name || result.user.email.split('@')[0]);
        localStorage.setItem('userRole', result.user.role);
        toast({
          title: 'Login Berhasil!',
          description: 'Anda berhasil masuk ke akun Anda.',
          variant: 'default',
        });
        window.dispatchEvent(new Event('storage'));
        onClose();
        form.reset();
        if (result.user.role === 'admin') {
          router.push('/admin/dashboard');
        } else {
          router.push('/user/dashboard');
        }
      } else {
        setShake(true);
        setTimeout(() => setShake(false), 600); // Reset shake after animation
        let errorMsg = 'Email atau password salah.';
        if (result.error === 'not_found') {
          errorMsg = 'Email atau password tidak ditemukan.';
        }
        setLoginError(errorMsg);
        toast({
          title: 'Login Gagal',
          description: errorMsg,
          variant: 'destructive',
        });
      }
    } catch (error) {
      setShake(true);
      setTimeout(() => setShake(false), 600);
      setLoginError('Tidak dapat terhubung ke server.');
      toast({
        title: 'Terjadi Kesalahan',
        description: 'Tidak dapat terhubung ke server.',
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
