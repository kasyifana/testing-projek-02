'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const [autoResponse, setAutoResponse] = useState(false);
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [autoResponseTemplate, setAutoResponseTemplate] = useState("Terima kasih atas feedback Anda. Kami akan meninjau dan merespons secepatnya.");
  const { toast } = useToast();

  // Load settings from localStorage on component mount
  useEffect(() => {
    const savedAutoResponse = localStorage.getItem('autoResponseEnabled');
    const savedTemplate = localStorage.getItem('autoResponseTemplate');
    const savedEmailNotifications = localStorage.getItem('emailNotifications');
    
    if (savedAutoResponse !== null) {
      setAutoResponse(JSON.parse(savedAutoResponse));
    }
    if (savedTemplate) {
      setAutoResponseTemplate(savedTemplate);
    }
    if (savedEmailNotifications !== null) {
      setEmailNotifications(JSON.parse(savedEmailNotifications));
    }
  }, []);

  // Save auto response setting to localStorage
  const handleAutoResponseChange = (checked) => {
    setAutoResponse(checked);
    localStorage.setItem('autoResponseEnabled', JSON.stringify(checked));
    
    toast({
      title: checked ? "Auto Response Diaktifkan" : "Auto Response Dinonaktifkan",
      description: checked ? "Feedback baru akan dijawab otomatis dengan AI" : "Auto response telah dimatikan",
      variant: "success",
    });
  };

  // Save email notifications setting
  const handleEmailNotificationsChange = (checked) => {
    setEmailNotifications(checked);
    localStorage.setItem('emailNotifications', JSON.stringify(checked));
  };

  // Save template
  const handleSaveTemplate = () => {
    localStorage.setItem('autoResponseTemplate', autoResponseTemplate);
    toast({
      title: "Template Tersimpan",
      description: "Template balasan otomatis telah diperbarui",
      variant: "success",
    });
  };

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Pengaturan</h1>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Profil Admin</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">Nama</label>
            <Input defaultValue="Admin Kemahasiswaan" />
          </div>
          <div>
            <label className="text-sm font-medium">Email</label>
            <Input defaultValue="admin@gmail.com" />
          </div>
          <Button>Simpan Perubahan</Button>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Notifikasi</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Email Notifikasi</p>
              <p className="text-sm text-gray-500">Terima notifikasi via email</p>
            </div>
            <Switch 
              checked={emailNotifications}
              onCheckedChange={handleEmailNotificationsChange}
            />
          </div>
        </div>
      </Card>

      <Card className="p-6">
        <h2 className="text-xl font-semibold mb-4">Feedback</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Auto Response Feedback</p>
              <p className="text-sm text-gray-500">Kirim balasan otomatis untuk feedback yang masuk</p>
            </div>
            <Switch 
              checked={autoResponse}
              onCheckedChange={handleAutoResponseChange}
            />
          </div>
          
          {autoResponse && (
            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <label className="text-sm font-medium mb-2 block">Template Balasan Otomatis</label>
              <textarea 
                className="w-full p-2 border rounded-md resize-none"
                rows="3"
                placeholder="Terima kasih atas feedback Anda. Kami akan meninjau dan merespons secepatnya."
                value={autoResponseTemplate}
                onChange={(e) => setAutoResponseTemplate(e.target.value)}
              />
              <Button size="sm" className="mt-2" onClick={handleSaveTemplate}>
                Simpan Template
              </Button>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
