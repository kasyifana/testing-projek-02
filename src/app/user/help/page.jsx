'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MessageSquare, Phone, Mail } from 'lucide-react';
import { ChatBot } from "@/components/ai-chatbot";
import { useEffect } from 'react';

export default function Help() {
  // Add global styles to override any hover effects
  useEffect(() => {
    // Create a style element
    const style = document.createElement('style');
    style.innerHTML = `
      .ai-chatbot-card,
      .ai-chatbot-card *,
      .chatbot-container,
      .chatbot-container * {
        transition: none !important;
        transform: none !important;
        animation: none !important;
        scale: none !important;
      }
      .ai-chatbot-card:hover,
      .ai-chatbot-card *:hover,
      .chatbot-container:hover,
      .chatbot-container *:hover {
        transform: none !important;
        box-shadow: inherit !important;
        scale: 1 !important;
      }
    `;
    // Add the style to the document head
    document.head.appendChild(style);

    // Clean up on component unmount
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Hubungi Admin</h1>

      <Card className="p-6 ai-chatbot-card" style={{transform: 'none', transition: 'none'}}>
        <h2 className="text-xl font-semibold mb-4">Tanya AI</h2>
        <div className="chatbot-container" style={{transform: 'none', transition: 'none'}}>
          <ChatBot />
        </div>
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
