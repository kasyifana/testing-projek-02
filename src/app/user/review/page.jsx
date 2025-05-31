'use client';

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from 'lucide-react';

const DUMMY_REVIEWS = [
  {
    id: 1,
    user: "Ahmad S.",
    rating: 5,
    comment: "Sangat membantu dalam melaporkan masalah fasilitas kampus.",
    date: "2024-01-15"
  },
  {
    id: 2,
    user: "Sarah K.",
    rating: 4,
    comment: "Respon cepat dari admin, tapi UI bisa ditingkatkan.",
    date: "2024-01-10"
  }
];

export default function Review() {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");

  const handleStarClick = (value) => {
    setRating(value);
  };

  const handleCommentChange = (e) => {
    setComment(e.target.value);
  };

  const handleSubmit = () => {
    if (rating === 0) {
      alert("Silakan berikan rating terlebih dahulu");
      return;
    }

    // Prepare data for submission
    const reviewData = {
      rating,
      comment,
      date: new Date().toISOString().split('T')[0]
    };

    console.log("Review submitted:", reviewData);
    // Here you would send the data to your API endpoint
    
    // Reset form
    setRating(0);
    setComment("");
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Review Sistem</h1>

      <Card className="p-6">
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
          <Button onClick={handleSubmit}>Kirim Review</Button>
        </div>
      </Card>

      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Review Terbaru</h2>
        {DUMMY_REVIEWS.map((review) => (
          <Card key={review.id} className="p-4">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium">{review.user}</p>
                <div className="flex gap-1 my-1">
                  {[...Array(review.rating)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 text-yellow-400" fill="currentColor" />
                  ))}
                </div>
                <p className="text-gray-600">{review.comment}</p>
              </div>
              <span className="text-sm text-gray-400">{review.date}</span>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
