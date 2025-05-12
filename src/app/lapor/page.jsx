
'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Navbar } from '@/components/landing/Navbar';
import { Footer } from '@/components/landing/Footer';
import { useToast } from '@/hooks/use-toast';
import { Paperclip, Send, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

const reportSchema = z.object({
  title: z
    .string()
    .min(5, { message: 'Judul laporan minimal 5 karakter.' })
    .max(100, { message: 'Judul laporan maksimal 100 karakter.' }),
  description: z
    .string()
    .min(20, { message: 'Deskripsi laporan minimal 20 karakter.' })
    .max(1000, { message: 'Deskripsi laporan maksimal 1000 karakter.' }),
  category: z.string({ required_error: 'Kategori laporan harus dipilih.' }),
  location: z
    .string()
    .min(5, { message: 'Lokasi minimal 5 karakter.' })
    .max(100, { message: 'Lokasi maksimal 100 karakter.' }),
  image: z
    .custom() 
    .refine((files) => files === undefined || files === null || files.length === 0 || (files?.[0]?.size || 0) <= 5 * 1024 * 1024, {
      message: 'Ukuran gambar maksimal 5MB.',
    })
    .refine((files) => files === undefined || files === null || files.length === 0 || ['image/jpeg', 'image/png', 'image/gif', 'image/webp'].includes(files?.[0]?.type || ''), {
      message: 'Format gambar tidak valid (hanya JPEG, PNG, GIF, WebP).',
    })
    .optional(),
});


const problemCategories = [
  { value: 'fasilitas_rusak', label: 'Fasilitas Rusak/Tidak Berfungsi' },
  { value: 'fasilitas_kurang', label: 'Kekurangan Fasilitas' },
  { value: 'akademik_dosen', label: 'Masalah Terkait Dosen/Pengajaran' },
  { value: 'akademik_jadwal', label: 'Masalah Jadwal Kuliah/Ujian' },
  { value: 'akademik_kurikulum', label: 'Masalah Kurikulum/Mata Kuliah' },
  { value: 'keamanan_pencurian', label: 'Kehilangan/Pencurian Barang' },
  { value: 'keamanan_pelecehan', label: 'Pelecehan/Kekerasan' },
  { value: 'keamanan_lingkungan', label: 'Lingkungan Tidak Aman' },
  { value: 'kebersihan_sampah', label: 'Sampah Berserakan/Tidak Terurus' },
  { value: 'kebersihan_toilet', label: 'Toilet Kotor/Tidak Layak' },
  { value: 'parkir', label: 'Masalah Parkir Kendaraan' },
  { value: 'layanan_administrasi', label: 'Layanan Administrasi Kampus' },
  { value: 'lainnya', label: 'Lainnya' },
];

export default function LaporPage() {
  const { toast } = useToast();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedInStatus = localStorage.getItem('isLoggedIn') === 'true';
      if (!loggedInStatus) {
        toast({
          title: 'Akses Ditolak',
          description: 'Anda harus login untuk membuat laporan.',
          variant: 'destructive',
        });
        router.push('/login');
      } else {
        setIsAuthenticated(true);
      }
      setIsLoading(false);
    }
  }, [router, toast]);

  const form = useForm({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: '',
      description: '',
      location: '',
      category: undefined,
      image: undefined,
    },
  });

  function onSubmit(data) {
    console.log(data);
    toast({
      title: 'Laporan Terkirim!',
      description: 'Terima kasih atas laporan Anda. Kami akan segera menindaklanjutinya.',
      variant: 'default',
    });
    form.reset();
  }

  if (isLoading) {
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
        <p className="text-muted-foreground">Memeriksa status login Anda...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    // This case should ideally be handled by the redirect, but as a fallback:
    return (
      <div className="flex flex-col min-h-screen items-center justify-center">
        <p className="text-destructive">Anda tidak diautentikasi.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow container mx-auto px-4 py-12">
        <Card className="max-w-2xl mx-auto shadow-xl">
          <CardHeader className="text-center">
            <CardTitle className="text-3xl font-bold text-primary">Buat Laporan Baru</CardTitle>
            <CardDescription className="text-md text-muted-foreground">
              Sampaikan detail masalah yang Anda temukan di lingkungan kampus.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Judul Laporan</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Keran air di toilet lantai 3 rusak" {...field} />
                      </FormControl>
                      <FormDescription>
                        Berikan judul yang singkat dan jelas mengenai masalah Anda.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Kategori Masalah</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Pilih kategori masalah" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {problemCategories.map((cat) => (
                            <SelectItem key={cat.value} value={cat.value}>
                              {cat.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormDescription>
                        Pilih kategori yang paling sesuai dengan masalah Anda.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Lokasi Kejadian/Masalah</FormLabel>
                      <FormControl>
                        <Input placeholder="Contoh: Gedung A, Lantai 2, Ruang Kelas A201" {...field} />
                      </FormControl>
                       <FormDescription>
                        Sebutkan lokasi spesifik tempat masalah terjadi.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Deskripsi Lengkap</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Jelaskan detail masalah yang Anda temukan, kronologi kejadian (jika ada), dan dampak yang ditimbulkan."
                          className="resize-y min-h-[120px]"
                          {...field}
                        />
                      </FormControl>
                       <FormDescription>
                        Berikan deskripsi yang detail agar kami dapat memahami masalah dengan baik.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="image"
                  render={({ field: { onChange, value, ...rest } }) => (
                    <FormItem>
                      <FormLabel className="text-lg">Lampirkan Gambar (Opsional)</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Input
                            id="image"
                            type="file"
                            accept="image/jpeg,image/png,image/gif,image/webp"
                            className="pl-12 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
                            onChange={(e) => {
                              if (e.target.files) {
                                onChange(e.target.files);
                              }
                            }}
                            {...rest}
                          />
                          <Paperclip className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        </div>
                      </FormControl>
                       <FormDescription>
                        Unggah gambar bukti jika ada (maks. 5MB, format: JPG, PNG, GIF, WebP).
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" className="w-full" size="lg" variant="accent">
                  <Send className="mr-2 h-5 w-5" /> Kirim Laporan
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
