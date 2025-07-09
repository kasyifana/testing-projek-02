'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { LogIn } from 'lucide-react';
import { LoginDialog } from '@/components/auth/LoginDialog';
import Lottie from 'lottie-react';
import { motion } from 'framer-motion';

// Custom Typing Effect Component for Multiple Words
function TypingEffect({ words = [], speed = 100, delay = 0, loop = true }) {
  const [displayText, setDisplayText] = useState('');
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isWaiting, setIsWaiting] = useState(false);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);

  useEffect(() => {
    if (!words || words.length === 0) return;

    const currentWord = words[currentWordIndex];

    const timeout = setTimeout(() => {
      if (isWaiting) {
        setIsWaiting(false);
        if (loop) {
          setIsDeleting(true);
        }
        return;
      }

      if (!isDeleting && currentIndex < currentWord.length) {
        // Typing
        setDisplayText(currentWord.slice(0, currentIndex + 1));
        setCurrentIndex(currentIndex + 1);
      } else if (isDeleting && currentIndex > 0) {
        // Deleting
        setDisplayText(currentWord.slice(0, currentIndex - 1));
        setCurrentIndex(currentIndex - 1);
      } else if (!isDeleting && currentIndex === currentWord.length) {
        // Finished typing, wait before deleting
        if (loop) {
          setIsWaiting(true);
        }
      } else if (isDeleting && currentIndex === 0) {
        // Finished deleting, move to next word and start typing again
        setIsDeleting(false);
        setCurrentWordIndex((prevIndex) => (prevIndex + 1) % words.length);
      }
    }, isWaiting ? 2000 : isDeleting ? speed / 2 : speed);

    return () => clearTimeout(timeout);
  }, [words, speed, currentIndex, isDeleting, isWaiting, loop, currentWordIndex]);

  return (
    <span>
      {displayText}
      <span className="animate-pulse">|</span>
    </span>
  );
}

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
      <div className="container relative z-10 mx-auto px-6 md:px-8">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div className="text-center md:text-left md:w-1/2 pl-2 md:pl-4">
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
              Sampaikan Aspirasi, Wujudkan Kampus Ideal. <span className="text-accent font-semibold">
                <TypingEffect 
                  words={["Cepat", "Efektif", "Gratis"]} 
                  speed={60} 
                  delay={250} 
                  loop={true} 
                />
              </span>
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
              className="mt-10 flex flex-col sm:flex-row justify-center md:justify-start gap-4"
            >
              <Button variant="accent" size="lg" onClick={() => setIsLoginOpen(true)}>
                <LogIn className="mr-2 h-5 w-5" />
                Login Sekarang
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link href="#visi-misi">Pelajari Lebih Lanjut</Link>
              </Button>
            </motion.div>
          </div>

          <div className={`md:w-2/5 ${isMobile ? 'mt-10' : ''}`}>
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

