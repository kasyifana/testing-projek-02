'use client';

import { useState } from 'react';
import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { VisionMissionSection } from '@/components/landing/VisionMissionSection';
import { StepsSection } from '@/components/landing/StepsSection';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
import { Footer } from '@/components/landing/Footer';
import { LoginDialog } from '@/components/auth/LoginDialog';

export default function Home() {
  const [isLoginOpen, setIsLoginOpen] = useState(false);

  return (
    <div className="flex flex-col min-h-screen">
      <Navbar onLoginClick={() => setIsLoginOpen(true)} />
      <main className="flex-grow">
        <HeroSection />
        <VisionMissionSection />
        <StepsSection />
        <ReviewsSection />
      </main>
      <LoginDialog isOpen={isLoginOpen} onClose={() => setIsLoginOpen(false)} />
      <Footer />
    </div>
  );
}
