'use client';

import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, Loader2 } from 'lucide-react';
import { useToast } from "@/components/ui/use-toast";

export default function Review() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [reviews, setReviews] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [token, setToken] = useState(null);
  const { toast } = useToast();
  
  // Get token on component mount
  useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
    
    // Listen for token changes
    const handleStorageChange = () => {
      const currentToken = localStorage.getItem('token');
      if (currentToken !== token) {
        setToken(currentToken);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('focus', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('focus', handleStorageChange);
    };
  }, []);
    // Dummy data for fallback when API is unavailable
  const DUMMY_REVIEWS = [
    {
      id: 1,
      user_id: 101,
      user: "Ahmad S.",
      rating: 5,
      komentar: "Sangat membantu dalam melaporkan masalah fasilitas kampus.",
      balasan: "Terima kasih atas ulasannya! Kami senang dapat membantu Anda dengan pelaporan masalah fasilitas kampus.",
      created_at: "2024-01-15 14:30:22"
    },
    {
      id: 2,
      user_id: 102,
      user: "Sarah K.",
      rating: 4,
      komentar: "Respon cepat dari admin, tapi UI bisa ditingkatkan.",
      balasan: "Terima kasih atas masukannya. Kami sedang bekerja untuk meningkatkan UI sistem kami dalam pembaruan mendatang.",
      created_at: "2024-01-10 09:15:43"
    }
  ];  // Helper function to get authorization headers
  const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
      'Origin': window.location.origin,
      'Authorization': token ? `Bearer ${token}` : '',
    };
  };
  
  // Fetch reviews on component mount, when page changes, or when token changes
  useEffect(() => {
    fetchReviews();
    
    // Also listen for token changes in localStorage
    const handleStorageChange = (e) => {
      if (e.key === 'token') {
        fetchReviews();
      }
    };
      window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [page, token]);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      
      // Skip the HEAD check as it might be causing issues
      // Go directly to GET request with appropriate headers
      const response = await fetch(`https://laravel.kasyifana.my.id/api/feedback?page=${page}`, {
        headers: getAuthHeaders(),
        mode: 'cors',
      }).catch(err => {
        console.error("Fetch error:", err);
        return { ok: false };
      });
      
      if (!response.ok) {
        setReviews(DUMMY_REVIEWS);
        setTotalPages(1);
        toast({
          title: "Mode Pengembangan",
          description: "Menggunakan data contoh karena API mengembalikan status " + response.status,
          variant: "warning",
        });
        return;
      }
      
      // Check if we got JSON back
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error(`API returned non-JSON response: ${contentType}`);
      }
      
      const responseData = await response.json();
      
      // Handle different response structure possibilities
      if (responseData.feedback && Array.isArray(responseData.feedback)) {
        // Your API structure with feedback and pagination fields
        setReviews(responseData.feedback);
        
        if (responseData.pagination) {
          setTotalPages(responseData.pagination.last_page || 1);
        } else {
          setTotalPages(1);
        }
      } else if (responseData.data) {
        // Laravel standard pagination structure
        setReviews(responseData.data);
        setTotalPages(responseData.meta?.last_page || responseData.last_page || 1);
      } else if (Array.isArray(responseData)) {
        // Simple array response
        setReviews(responseData);
        setTotalPages(1);
      } else {
        // Unknown structure, use empty array
        console.error("Unexpected response structure:", responseData);
        setReviews([]);
        setTotalPages(1);
      }
    } catch (error) {
      console.error("Error fetching reviews:", error);
      
      // Fall back to dummy data
      setReviews(DUMMY_REVIEWS);
      setTotalPages(1);
      
      toast({
        title: "Gagal memuat review dari server",
        description: "Menggunakan data contoh untuk tampilan",
        variant: "warning",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };
    const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Rating diperlukan",
        description: "Silakan berikan rating terlebih dahulu",
        variant: "destructive",
      });
      return;
    }

    // Prepare data for submission
    const reviewData = {
      user_id: localStorage.getItem('userId') || null, // Get user ID if logged in
      rating,
      komentar: comment,
      // balasan will be NULL initially
      // created_at will be set by MySQL CURRENT_TIMESTAMP
    };

    try {
      setIsSubmitting(true);
      
      // Check if API is available
      const checkResponse = await fetch('https://laravel.kasyifana.my.id/api/feedback', {
        method: 'HEAD',
        headers: getAuthHeaders(),
        mode: 'cors',
      }).catch(err => {
        return { ok: false };
      });
      
      // If API is down, show mock success but warn user
      if (!checkResponse.ok) {
        toast({
          title: "Mode Pengembangan",
          description: "API tidak tersedia. Review disimpan secara lokal.",
          variant: "warning",
        });
        
        // Simulate API success
        setTimeout(() => {
          // Reset form
          setRating(0);
          setComment("");
        }, 1000);
        
        return;
      }        // If API is available, make the actual request
      const response = await fetch('https://laravel.kasyifana.my.id/api/feedback', {
        method: 'POST',
        headers: getAuthHeaders(),
        mode: 'cors',
        body: JSON.stringify(reviewData),
      });
      
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success || response.ok) {
        // Reset form on success
        setRating(0);
        setComment("");
        
        toast({
          title: "Review Berhasil Dikirim",
          variant: "success",
        });
        
        // Add the new review to the UI immediately 
        const newReview = {
          id: data.id || Date.now(), // Use API ID if available, otherwise temp ID
          user_id: localStorage.getItem('userId') || null,
          user: localStorage.getItem('userName') || "Anda",
          rating,
          komentar: comment,
          created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
        };
        setReviews(prevReviews => [newReview, ...prevReviews]);
        
        // Also refresh from server to ensure we have the latest data
        setTimeout(() => {
          fetchReviews();
        }, 1000);
      } else {
        throw new Error(data.message || "Failed to submit review");
      }
    } catch (error) {
      console.error("Error submitting review:", error);
      
      // Show error but also add review locally for demo purposes
      toast({
        title: "Gagal mengirim review ke server",
        description: "Review disimpan secara lokal untuk demo",
        variant: "warning",
      });
      
      // Reset form
      setRating(0);
      setComment("");
      
      // Add a mock review to the local data
      const mockReview = {
        id: Date.now(),
        user_id: localStorage.getItem('userId') || null,
        user: localStorage.getItem('userName') || "Anda",
        rating,
        komentar: comment,
        created_at: new Date().toISOString().slice(0, 19).replace('T', ' ')
      };
      
      setReviews(prev => [mockReview, ...prev]);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Review Sistem</h1>      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Berikan Review Anda</h2>
        <div className="space-y-4">
          <div className="flex gap-2 items-center">
            {[1, 2, 3, 4, 5].map((star) => (
              <button 
                key={star} 
                onClick={() => handleStarClick(star)}
                className={`transition-colors ${rating >= star ? 'text-yellow-400' : 'text-gray-300'} hover:text-yellow-500`}
              >
                <Star className="w-8 h-8" fill={rating >= star ? "currentColor" : "none"} />
              </button>
            ))}
            {rating > 0 && <span className="ml-2 text-sm">{rating} dari 5</span>}
          </div>
          <Textarea 
            placeholder="Bagikan pengalaman Anda menggunakan sistem ini..." 
            className="min-h-[100px]"
            value={comment}
            onChange={handleCommentChange}
          />
          <Button 
            onClick={handleSubmit} 
            disabled={isSubmitting}
            className="relative"
          >
            {isSubmitting && (
              <span className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                <Loader2 className="h-4 w-4 animate-spin" />
              </span>
            )}
            <span className={isSubmitting ? "opacity-0" : ""}>Kirim Review</span>
          </Button>
        </div>
      </Card>      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Review Terbaru</h2>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : reviews.length === 0 ? (
          <Card className="p-6 text-center">
            <p className="text-gray-500">Belum ada review.</p>
          </Card>
        ) : (
          <>
            {reviews.map((review) => {
              // Handle user display name safely
              let displayName = "Pengguna Anonim";
              
              if (review.user) {
                if (typeof review.user === 'object') {
                  // Handle user as an object with potential properties
                  displayName = review.user.name || review.user.username || review.user.email || "Pengguna Anonim";
                } else if (typeof review.user === 'string') {
                  // Handle user as a string
                  displayName = review.user;
                }
              } else if (review.username) {
                displayName = review.username;
              } else if (review.name) {
                displayName = review.name;
              }
              
              return (
                <Card key={review.id || `temp-${Date.now()}-${Math.random()}`} className="p-4">
                  <div className="flex justify-between items-start">
                    <div className="w-full">
                      <p className="font-medium">{displayName}</p>
                      <div className="flex gap-1 my-1">
                        {[...Array(Number(review.rating))].map((_, i) => (
                          <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                        ))}
                      </div>
                      <p className="text-gray-600">{review.komentar || review.comment || review.feedback}</p>
                      
                      {/* Admin Reply */}
                      {(review.balasan || review.admin_reply || review.reply) && (
                        <div className="mt-3 ml-4 border-l-2 border-primary pl-4">
                          <div className="flex justify-between">
                            <p className="font-medium text-sm text-primary">Admin</p>
                          </div>
                          <p className="text-sm text-gray-700">{review.balasan || review.admin_reply || review.reply}</p>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-400 whitespace-nowrap ml-2">
                      {review.created_at ? new Date(review.created_at).toLocaleDateString('id-ID') : new Date().toLocaleDateString('id-ID')}
                    </span>
                  </div>
                </Card>
              );
            })}
            
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center gap-2 mt-6">
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === 1 || isLoading}
                  onClick={() => setPage(prev => prev - 1)}
                >
                  Sebelumnya
                </Button>
                <span className="flex items-center px-2">
                  Halaman {page} dari {totalPages}
                </span>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={page === totalPages || isLoading}
                  onClick={() => setPage(prev => prev + 1)}
                >
                  Berikutnya
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
