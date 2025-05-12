import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Goal, ListChecks, Eye } from 'lucide-react';

export function VisionMissionSection() {
  const missions = [
    {
      text: "Menyediakan sarana pelaporan yang mudah diakses, aman, dan mendukung anonimitas bagi mahasiswa.",
      icon: <Eye className="h-6 w-6 text-primary" />
    },
    {
      text: "Memfasilitasi komunikasi yang efektif antara mahasiswa dan pihak kampus terkait isu yang dilaporkan.",
      icon: <Eye className="h-6 w-6 text-primary" />
    },
    {
      text: "Mendorong transparansi dan akuntabilitas dalam penanganan masalah di lingkungan kampus.",
      icon: <Eye className="h-6 w-6 text-primary" />
    },
    {
      text: "Berkontribusi pada perbaikan berkelanjutan kualitas layanan dan fasilitas kampus.",
      icon: <Eye className="h-6 w-6 text-primary" />
    }
  ];

  return (
    <section id="visi-misi" className="py-16 sm:py-24 bg-background">
      <div className="container mx-auto px-6 lg:px-8">
        <h2 className="text-3xl sm:text-4xl font-bold text-center mb-16 text-primary">
          Visi & Misi Kami
        </h2>
        <div className="grid md:grid-cols-2 gap-8 items-start max-w-7xl mx-auto">
          <Card className="shadow-lg p-2">
            <CardHeader className="pb-6">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <Goal className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Visi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <p className="text-lg text-muted-foreground leading-relaxed">
                Menjadi platform terdepan dalam menyalurkan aspirasi mahasiswa untuk mewujudkan lingkungan kampus yang transparan, responsif, dan berkualitas.
              </p>
            </CardContent>
          </Card>
          
          <Card className="shadow-lg p-2">
            <CardHeader className="pb-6">
               <div className="flex items-center gap-3">
                <div className="p-3 bg-primary/10 rounded-full">
                  <ListChecks className="h-8 w-8 text-primary" />
                </div>
                <CardTitle className="text-2xl text-primary">Misi</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="px-6">
              <ul className="space-y-4">
                {missions.map((mission, index) => (
                  <li key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1 p-1 bg-accent/10 rounded-full">
                       {React.cloneElement(mission.icon, {className: "h-5 w-5 text-accent"})}
                    </div>
                    <p className="text-lg text-muted-foreground leading-relaxed">{mission.text}</p>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  );
}
