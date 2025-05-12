'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Upload } from 'lucide-react';

const categories = [
  { value: 'fasilitas', label: 'Fasilitas' },
  { value: 'kekerasan', label: 'Kekerasan' },
  { value: 'akademik', label: 'Akademik' },
  { value: 'lainnya', label: 'Lainnya' }
];

const priorities = [
  { value: 'urgent', label: 'Mendesak' },
  { value: 'normal', label: 'Biasa' },
  { value: 'info', label: 'Laporan Informasi' }
];

export default function CreateReport() {
  const [isAnonymous, setIsAnonymous] = useState(false);

  return (
    <div className="max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Buat Laporan Baru</h1>
      
      <Card className="p-6 space-y-6">
        <div className="space-y-4">
          <div>
            <Label>Judul Laporan</Label>
            <Input placeholder="Masukkan judul laporan" />
          </div>

          <div>
            <Label>Kategori</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((category) => (
                  <SelectItem key={category.value} value={category.value}>
                    {category.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Deskripsi</Label>
            <Textarea placeholder="Jelaskan detail laporan Anda" className="min-h-[150px]" />
          </div>

          <div>
            <Label>Prioritas</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Pilih prioritas" />
              </SelectTrigger>
              <SelectContent>
                {priorities.map((priority) => (
                  <SelectItem key={priority.value} value={priority.value}>
                    {priority.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Lampiran</Label>
            <div className="border-2 border-dashed rounded-lg p-4 text-center">
              <Button variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Upload File
              </Button>
              <p className="text-sm text-gray-500 mt-2">
                Mendukung: JPG, PNG, PDF, MP4 (Max. 10MB)
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="anonymous"
              checked={isAnonymous}
              onCheckedChange={setIsAnonymous}
            />
            <Label htmlFor="anonymous">Sembunyikan identitas saya</Label>
          </div>

          <Button className="w-full" variant="accent">
            Kirim Laporan
          </Button>
        </div>
      </Card>
    </div>
  );
}
