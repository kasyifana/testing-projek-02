'use client';

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CheckCircle, XCircle } from "lucide-react";

export default function ReviewAI() {
  const reviews = [
    {
      id: 1,
      title: "Analisis Sentimen Media Sosial",
      student: "John Doe",
      date: "2024-01-15",
      status: "pending",
      description: "Penelitian tentang analisis sentimen di Twitter menggunakan AI"
    },
    {
      id: 2,
      title: "Sistem Rekomendasi Mata Kuliah",
      student: "Jane Smith",
      date: "2024-01-14",
      status: "approved",
      description: "AI untuk merekomendasikan mata kuliah berdasarkan minat mahasiswa"
    }
  ];

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Review AI Proposals</h1>
      
      <div className="grid gap-4">
        {reviews.map((review) => (
          <Card key={review.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-xl font-semibold">{review.title}</h3>
                <p className="text-gray-500">Oleh: {review.student}</p>
                <p className="text-sm text-gray-400 mt-1">Diajukan: {review.date}</p>
                <p className="mt-2">{review.description}</p>
              </div>
              <Badge variant={review.status === 'approved' ? 'success' : 'warning'}>
                {review.status === 'approved' ? 'Disetujui' : 'Pending'}
              </Badge>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Button variant="outline" className="flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                Setujui
              </Button>
              <Button variant="outline" className="flex items-center gap-2 text-red-600">
                <XCircle className="w-4 h-4" />
                Tolak
              </Button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
