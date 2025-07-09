'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Quote, Star, Users, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';

// Dummy data sebagai fallback
const DUMMY_REVIEWS_DATA = [
  {
    id: 1,
    name: 'Haryo Satrio',
    initials: 'HS',
    avatarUrl: null,
    createdAt: '15 Januari 2024',
    text: 'Lapor Kampus sangat membantu! Masalah fasilitas di lab komputer cepat ditanggapi setelah saya laporkan melalui platform ini. Prosesnya juga mudah.',
    rating: 5,
  },
  {
    id: 2,
    name: 'Anita Putri',
    initials: 'AP',
    avatarUrl: null,
    createdAt: '12 Januari 2024',
    text: 'Fitur anonimnya membuat saya merasa aman untuk melaporkan isu sensitif. Respon dari pihak kampus juga cukup cepat. Recommended!',
    rating: 4,
  },
  {
    id: 3,
    name: 'Rizky Ardiansyah',
    initials: 'RA',
    createdAt: '10 Januari 2024',
    text: 'Akhirnya ada platform yang benar-benar menjadi jembatan antara mahasiswa dan pihak rektorat. Sangat berguna untuk perbaikan kampus.',
    rating: 5,
  },
];

export function ReviewsSection() {
  const [reviews, setReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  const itemsPerView = 3;
  const maxIndex = Math.max(0, reviews.length - itemsPerView);

  const nextSlide = () => {
    if (reviews.length > itemsPerView) {
      setCurrentIndex((prev) => (prev >= maxIndex ? 0 : prev + 1));
    }
  };

  const prevSlide = () => {
    if (reviews.length > itemsPerView) {
      setCurrentIndex((prev) => (prev <= 0 ? maxIndex : prev - 1));
    }
  };

  // Reset currentIndex jika melewati batas
  useEffect(() => {
    if (currentIndex > maxIndex) {
      setCurrentIndex(0);
    }
  }, [reviews.length, currentIndex, maxIndex]);

  // Helper function untuk mendapatkan headers (tanpa auth untuk public endpoint)
  const getHeaders = () => {
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    };
  };

  // Fetch reviews data
  useEffect(() => {
    fetchReviewsData();
  }, []);
  
  const fetchReviewsData = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://127.0.0.1:8000/api/feedback', {
        headers: getHeaders(),
        method: 'GET'
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Debug logging untuk melihat struktur data
      console.log('Full API Response:', data);
      
      // Handle berbagai format respons
      let reviewsData = [];
      
      if (data.feedback && Array.isArray(data.feedback)) {
        reviewsData = data.feedback;
      } else if (data.reviews && Array.isArray(data.reviews)) {
        reviewsData = data.reviews;
      } else if (data.data && Array.isArray(data.data)) {
        reviewsData = data.data;
      } else if (Array.isArray(data)) {
        reviewsData = data;
      }
      
      console.log('Reviews data before filtering:', reviewsData);
      
      // Tidak perlu filter yang ketat, ambil semua feedback
      const selectedReviews = reviewsData
        .filter(review => {
          const text = review.komentar || review.text || review.comment || '';
          return text && text.trim().length > 5; // Minimal ada komentar
        })
        .slice(0, 9); // Ambil maksimal 9 review untuk carousel
      
      // Transform data untuk memastikan format yang konsisten
      const transformedReviews = selectedReviews.map((review, index) => {
        // Struktur data: feedback.user.name (bukan feedback.name langsung)
        const userName = review.user?.name || review.name || `User ${review.id}` || generateRandomName();
        const userInitials = getInitials(userName);
        
        console.log(`Review ${index}:`, {
          id: review.id,
          user: review.user,
          userName: userName,
          komentar: review.komentar,
          extractedName: userName,
          extractedInitials: userInitials
        });
        
        return {
          id: review.id,
          name: userName,
          initials: userInitials,
          avatarUrl: null,
          createdAt: review.created_at || review.submittedAt || new Date().toLocaleDateString('id-ID'),
          text: review.komentar || review.text || review.comment || '',
          rating: review.rating || Math.floor(Math.random() * 2) + 4,
        };
      });
      
      console.log('Reviews data fetched:', transformedReviews);
      setReviews(transformedReviews);
    } catch (error) {
      console.error('Error fetching reviews data:', error);
      // Gunakan dummy data jika API tidak tersedia
      setReviews(DUMMY_REVIEWS_DATA);
    } finally {
      setIsLoading(false);
    }
  };

  // Helper function untuk generate initials dari nama
  const getInitials = (name) => {
    if (!name) return 'PA';
    return name
      .split(' ')
      .map(word => word.charAt(0))
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Helper function untuk generate nama random jika tidak ada
  const generateRandomName = () => {
    const names = [
      'Andi Pratama', 'Sari Dewi', 'Budi Santoso', 'Maya Sari', 'Rizki Ahmad',
      'Nina Wulandari', 'Doni Setiawan', 'Fitri Rahayu', 'Agus Prasetyo', 'Lina Permata'
    ];
    return names[Math.floor(Math.random() * names.length)];
  };

  // Helper function untuk format tanggal
  const formatDate = (dateString) => {
    if (!dateString) return new Date().toLocaleDateString('id-ID');
    
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch (error) {
      return dateString;
    }
  };
  return (
    <section id="ulasan" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <div className="text-center mb-16">
          <Users className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">
            Apa Kata Mereka?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Dengarkan pengalaman mahasiswa lain yang telah menggunakan Lapor Kampus.
          </p>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-6 text-center max-w-2xl mx-auto">
            <p className="text-muted-foreground">Belum ada ulasan tersedia.</p>
          </Card>
        ) : (
          <div className="relative">
            {/* Navigation Buttons - hanya tampil jika ada lebih dari 3 review */}
            {reviews.length > itemsPerView && (
              <div className="flex justify-between items-center mb-6">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={prevSlide}
                  className="rounded-full"
                >
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                
                <div className="flex space-x-2">
                  {reviews.length > itemsPerView && Array.from({ length: reviews.length - itemsPerView + 1 }).map((_, index) => (
                    <button
                      key={index}
                      onClick={() => setCurrentIndex(index)}
                      className={`w-2 h-2 rounded-full transition-colors ${
                        currentIndex === index 
                          ? 'bg-primary' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
                
                <Button
                  variant="outline"
                  size="icon"
                  onClick={nextSlide}
                  className="rounded-full"
                >
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            )}

            {/* Carousel Container */}
            <div className="overflow-hidden">
              {reviews.length <= itemsPerView ? (
                // Static display untuk 3 review atau kurang
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {reviews.map((review, index) => (
                    <Card key={review.id || index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                      <CardHeader className="relative pb-6">
                        <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                        <div className="flex items-center space-x-3">
                          <Avatar className="h-12 w-12 border-2 border-primary">
                            <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                              {review.initials}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <h3 className="text-base font-semibold text-foreground">{review.name}</h3>
                            <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="flex-grow px-6">
                        <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">"{review.text}"</p>
                      </CardContent>
                      <CardFooter className="px-6">
                        <div className="flex items-center">
                          {Array(5).fill(0).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
                            />
                          ))}
                        </div>
                      </CardFooter>
                    </Card>
                  ))}
                </div>
              ) : (
                // Carousel untuk lebih dari 3 review - window 3 card overlap
                <div className="relative overflow-hidden">
                  <div 
                    className="flex transition-transform duration-300 ease-in-out"
                    style={{ 
                      transform: `translateX(-${currentIndex * (100 / itemsPerView)}%)`,
                    }}
                  >
                    {reviews.map((review, index) => (
                      <div 
                        key={review.id || index} 
                        className="flex-shrink-0"
                        style={{ width: `${100 / itemsPerView}%` }}
                      >
                        <div className="px-2">
                          <Card className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col h-full">
                            <CardHeader className="relative pb-6">
                              <Quote className="absolute top-4 right-4 h-8 w-8 text-primary/20" />
                              <div className="flex items-center space-x-3">
                                <Avatar className="h-12 w-12 border-2 border-primary">
                                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                                    {review.initials}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <h3 className="text-base font-semibold text-foreground">{review.name}</h3>
                                  <p className="text-xs text-muted-foreground">{formatDate(review.createdAt)}</p>
                                </div>
                              </div>
                            </CardHeader>
                            <CardContent className="flex-grow px-6">
                              <p className="text-sm text-muted-foreground leading-relaxed italic line-clamp-4">"{review.text}"</p>
                            </CardContent>
                            <CardFooter className="px-6">
                              <div className="flex items-center">
                                {Array(5).fill(0).map((_, i) => (
                                  <Star
                                    key={i}
                                    className={`h-4 w-4 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
                                  />
                                ))}
                              </div>
                            </CardFooter>
                          </Card>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
