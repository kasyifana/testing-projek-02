import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { FilePenLine, ShieldCheck, SendHorizonal, Activity, Workflow } from 'lucide-react';


const steps = [
  {
    icon: <FilePenLine className="h-10 w-10 text-accent" />,
    title: 'Buat Laporan',
    description: 'Isi formulir laporan dengan detail masalah yang kamu temukan di lingkungan kampus.',
  },
  {
    icon: <ShieldCheck className="h-10 w-10 text-accent" />,
    title: 'Verifikasi Laporan',
    description: 'Tim kami akan memverifikasi laporanmu untuk memastikan validitas dan kelengkapan informasi.',
  },
  {
    icon: <SendHorizonal className="h-10 w-10 text-accent" />,
    title: 'Tindak Lanjut',
    description: 'Laporan diteruskan ke pihak berwenang di kampus untuk diproses dan ditindaklanjuti.',
  },
  {
    icon: <Activity className="h-10 w-10 text-accent" />,
    title: 'Pantau Progres',
    description: 'Kamu bisa memantau status dan progres penyelesaian laporanmu melalui platform.',
  },
];

export function StepsSection() {
  return (
    <section id="cara-kerja" className="py-16 sm:py-24 bg-secondary">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <Workflow className="h-12 w-12 mx-auto mb-4 text-primary" />
          <h2 className="text-3xl sm:text-4xl font-bold text-primary">
            Bagaimana Cara Kerja Lapor Kampus?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
            Laporkan masalah di kampusmu dengan mudah melalui beberapa langkah sederhana.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <Card key={index} className="shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
              <CardHeader className="items-center text-center">
                <div className="p-4 bg-accent/10 rounded-full mb-4">
                  {step.icon}
                </div>
                <CardTitle className="text-xl text-primary">{step.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center flex-grow">
                <CardDescription className="text-md leading-relaxed">{step.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
