'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { ChatBot } from "@/components/ai-chatbot";

export default function Help() {
  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Hubungi Admin</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Tanya AI</h2>
        <ChatBot />
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Kirim Pesan</h2>
          <form className="space-y-4">
            <div>
              <Label>Subjek</Label>
              <Input placeholder="Masukkan subjek pesan" />
            </div>
            <div>
              <Label>Pesan</Label>
              <Textarea 
                placeholder="Tuliskan pesan Anda..." 
                className="min-h-[150px]"
              />
            </div>
            <Button className="w-full">
              <MessageSquare className="w-4 h-4 mr-2" />
              Kirim Pesan
            </Button>
          </form>
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">Kontak Langsung</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <Phone className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Telepon</p>
                <p className="text-gray-600">+62 123 4567 890</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="w-5 h-5 text-primary" />
              <div>
                <p className="font-medium">Email</p>
                <p className="text-gray-600">admin@kampus.ac.id</p>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
