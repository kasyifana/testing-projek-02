
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { LogIn, Mail, Lock } from 'lucide-react';
import { useRouter } from 'next/navigation'; // Import useRouter

const loginSchema = z.object({
  email: z.string().email({ message: 'Format email tidak valid.' }),
  password: z.string().min(6, { message: 'Password minimal 6 karakter.' }),
});

const DUMMY_USERS = [
  { email: 'user@example.com', password: 'password123', name: 'User Biasa' },
  { email: 'admin@example.com', password: 'adminpassword', name: 'Admin Kampus' },
];

export default function LoginPage() {
  const { toast } = useToast();
  const router = useRouter(); // Initialize useRouter
  const form = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
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
      // Redirect to home page after successful login
      router.push('/'); 
    } else {
      toast({
        title: 'Login Gagal',
        description: 'Email atau password yang Anda masukkan salah.',
        variant: 'destructive',
      });
    }
    // Optionally reset form, or not, depending on UX preference
    // form.reset(); 
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12 flex items-center justify-center">
        <Card className="w-full max-w-md shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Login Akun</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Masukkan email dan password Anda untuk melanjutkan.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Email</FormLabel>
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
                      <FormLabel className="text-lg">Password</FormLabel>
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
                
                <Button type="submit" className="w-full" size="lg" variant="accent">
                  <LogIn className="mr-2 h-5 w-5" /> Login
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
