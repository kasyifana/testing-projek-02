import { Navbar } from '@/components/landing/Navbar';
import { HeroSection } from '@/components/landing/HeroSection';
import { VisionMissionSection } from '@/components/landing/VisionMissionSection';
import { StepsSection } from '@/components/landing/StepsSection';
import { ReviewsSection } from '@/components/landing/ReviewsSection';
import { Footer } from '@/components/landing/Footer';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        <HeroSection />
        <VisionMissionSection />
        <StepsSection />
        <ReviewsSection />
      </main>
      <Footer />
    </div>
  );
}
