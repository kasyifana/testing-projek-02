'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";

export default function Settings() {
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
            <Switch defaultChecked />
          </div>
        </div>
      </Card>
    </div>
  );
}
