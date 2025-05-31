'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import Lottie from 'lottie-react';
import { InfoBoxes } from './InfoBoxes';
import { motion } from 'framer-motion';

export function HeroSection() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [animationData, setAnimationData] = useState(null);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);

    // Fetch Lottie animation data from a CDN
    fetch('https://lottie.host/70b587ba-d4e7-455d-8df6-2730fc94983c/OlB6lUYy1i.json')
      .then((response) => response.json())
      .then((data) => setAnimationData(data))
      .catch((error) => console.error('Error loading animation:', error));

    return () => {
      window.removeEventListener('resize', checkMobile);
    };
  }, []);

  return (
    <section id="hero" className="relative w-full py-20 md:py-32 bg-card text-card-foreground overflow-hidden">
      <div className="absolute inset-0 opacity-15">
        <Image
          src="https://picsum.photos/1920/1080"
          alt="Abstract background"
          layout="fill"
          objectFit="cover"
          className="filter "
          data-ai-hint="abstract texture"
        />
      </div>
      <div className="container relative z-10 mx-auto px-6 md:px-10">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left md:w-1/2 pl-0 md:pl-4 lg:pl-8">
            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="text-4xl font-bold tracking-tight sm:text-5xl md:text-6xl lg:text-7xl text-primary"
            >
              Lapor Kampus
            </motion.h1>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mt-6 max-w-3xl mx-auto md:mx-0 text-lg sm:text-xl md:text-2xl text-foreground"
            >
              Sampaikan Aspirasi, Wujudkan Kampus Ideal.
            </motion.p>
            
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-4 max-w-2xl mx-auto md:mx-0 text-md sm:text-lg text-muted-foreground"
            >
              Platform partisipasi mahasiswa untuk melaporkan berbagai isu dan permasalahan di lingkungan kampus secara mudah, aman, dan transparan.
            </motion.p>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4 md:pl-2"
            >
              <Button variant="accent" size="lg" onClick={() => setIsLoginOpen(true)}>
                <LogIn className="mr-2 h-5 w-5" />
                Login Sekarang
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#visi-misi">Pelajari Lebih Lanjut</Link>
              </Button>
            </motion.div>

            {/* Add the InfoBoxes component here */}
            <InfoBoxes />
          </div>

          <div className={`md:w-2/5 ${isMobile ? 'mt-10' : ''} md:pr-4 lg:pr-8`}>
            {animationData && (
              <Lottie
                animationData={animationData}
                loop={true}
                className="w-full h-auto max-h-[400px]"
              />
            )}
          </div>
        </div>
      </div>
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent" />
    </section>
  );
}

