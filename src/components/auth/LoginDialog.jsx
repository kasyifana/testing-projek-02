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

  function onSubmit(data) {
    // Determine if the user is admin based on email
    const isAdmin = data.email.toLowerCase().includes('admin');
    const userRole = isAdmin ? 'admin' : 'user';
    
    // Simulate login success
    localStorage.setItem('isLoggedIn', 'true');
    localStorage.setItem('userName', data.email.split('@')[0]);
    localStorage.setItem('userRole', userRole);
    
    toast({
      title: 'Login Berhasil!',
      description: 'Anda berhasil masuk ke akun Anda.',
      variant: 'default',
    });
    
    // Trigger storage event for other tabs
    window.dispatchEvent(new Event('storage'));
    
    onClose();
    form.reset();
    
    // Redirect based on user role to the appropriate layout
    if (isAdmin) {
      router.push('/admin/dashboard'); // This will be handled by admin/layout.jsx
    } else {
      router.push('/user/dashboard'); // This will be handled by user/layout.jsx
    }
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
                      <Input type="email" placeholder="contoh@email.com" {...field} className="pl-10" />
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
                      <Input type="password" placeholder="••••••••" {...field} className="pl-10" />
                    </div>
                  </FormControl>
                  <FormMessage />
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
