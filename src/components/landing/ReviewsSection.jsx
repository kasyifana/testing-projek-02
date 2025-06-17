import Image from 'next/image';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Quote, Star, Users } from 'lucide-react';

const reviews = [
  {
    name: 'Haryo Satrio',
    initials: 'HS',
    avatarUrl: 'https://picsum.photos/id/1005/100/100',
    role: 'Mahasiswa Kimia Murni',
    text: 'Lapor Kampus sangat membantu! Masalah fasilitas di lab komputer cepat ditanggapi setelah saya laporkan melalui platform ini. Prosesnya juga mudah.',
    rating: 5,
  },
  {
    name: 'Anita Putri',
    initials: 'AP',
    avatarUrl: 'https://picsum.photos/id/1012/100/100',
    role: 'Mahasiswi Ilmu Komunikasi',
    text: 'Fitur anonimnya membuat saya merasa aman untuk melaporkan isu sensitif. Respon dari pihak kampus juga cukup cepat. Recommended!',
    rating: 4,
  },
  {
    name: 'Rizky Ardiansyah',
    initials: 'RA',
    role: 'Mahasiswa Ekonomi',
    text: 'Akhirnya ada platform yang benar-benar menjadi jembatan antara mahasiswa dan pihak rektorat. Sangat berguna untuk perbaikan kampus.',
    rating: 5,
  },
];

export function ReviewsSection() {
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {reviews.map((review, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col p-2">
              <CardHeader className="relative pb-6">
                <Quote className="absolute top-4 right-4 h-10 w-10 text-primary/20" />
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16 border-2 border-primary">
                    {review.avatarUrl && <AvatarImage src={review.avatarUrl} alt={review.name} data-ai-hint="portrait person" />}
                    <AvatarFallback className="bg-primary text-primary-foreground text-xl">{review.initials}</AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold text-foreground">{review.name}</h3>
                    <p className="text-sm text-muted-foreground">{review.role}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-grow px-6">
                <p className="text-md text-muted-foreground leading-relaxed italic">"{review.text}"</p>
              </CardContent>
              <CardFooter className="px-6">
                <div className="flex items-center">
                  {Array(5).fill(0).map((_, i) => (
                    <Star
                      key={i}
                      className={`h-5 w-5 ${i < review.rating ? 'text-accent fill-accent' : 'text-muted-foreground/50'}`}
                    />
                  ))}
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
