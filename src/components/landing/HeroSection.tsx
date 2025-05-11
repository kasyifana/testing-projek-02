import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export function HeroSection() {
  return (
    <section id="hero" className="relative w-full py-20 md:py-32 bg-card text-card-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-5">
         <Image
            src="https://picsum.photos/1920/1080"
            alt="Abstract background"
            layout="fill"
            objectFit="cover"
            className="filter "
            data-ai-hint="abstract texture"
          />
      </div>
      <div className="container relative z-10 mx-auto px-4 text-center">
        <h1 className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary">
          Lapor Kampus
        </h1>
        <p className="mt-6 max-w-3xl mx-auto text-lg sm:text-xl md:text-2xl text-foreground">
          Sampaikan Aspirasi, Wujudkan Kampus Ideal.
        </p>
        <p className="mt-4 max-w-2xl mx-auto text-md sm:text-lg text-muted-foreground">
          Platform partisipasi mahasiswa untuk melaporkan berbagai isu dan permasalahan di lingkungan kampus secara mudah, aman, dan transparan.
        </p>
        <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
          <Button variant="accent" size="lg" asChild>
            <Link href="#cara-kerja">Laporkan Masalah</Link>
          </Button>
          <Button variant="outline" size="lg" asChild>
            <Link href="#visi-misi">Pelajari Lebih Lanjut</Link>
          </Button>
        </div>
      </div>
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}
