'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { LogIn, Mail, Lock, X } from 'lucide-react';

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

const DUMMY_USERS = [
  { email: 'tes@gmail.com', password: '123123', name: 'User Biasa' },
  { email: 'admin@gmail.com', password: '123123', name: 'Kemahasiswaan' },
];

export function LoginDialog({ isOpen, onClose }) {
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  function onSubmit(data) {
    const foundUser = DUMMY_USERS.find(
      (user) => user.email === data.email && user.password === data.password
    );

    if (foundUser) {
      toast({
        title: 'Login Berhasil!',
        description: `Selamat datang kembali, ${foundUser.name}.`,
        variant: 'default',
      });
      
      // Mengubah pengecekan email admin yang sesuai dengan DUMMY_USERS
      if (foundUser.email === 'admin@gmail.com') {
        window.location.href = '/admin/dashboard';
      }
      
      onClose();
      form.reset();
    } else {
      toast({
        title: 'Login Gagal',
        description: 'Email atau password yang Anda masukkan salah.',
        variant: 'destructive',
      });
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
          <DialogTitle className="text-center text-2xl font-bold">Login Akun</DialogTitle>
          <DialogDescription className="text-center">
            Masukkan email dan password Anda untuk melanjutkan.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Email field */}
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

            {/* Password field */}
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
      </DialogContent>
    </Dialog>
  );
}
