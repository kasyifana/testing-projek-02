'use client';

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UserCircle, Mail, Phone, Trash } from 'lucide-react';

const DUMMY_USER = {
  name: 'User Biasa',
  email: 'tes@gmail.com',
  phone: '081234567890',
  joinDate: '01 January 2024'
};

export default function Profile() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">Profil & Privasi</h1>

      <Card className="p-6 space-y-6">
        <div className="flex items-center gap-4 pb-6 border-b">
          <UserCircle className="w-20 h-20 text-gray-400" />
          <div>
            <h2 className="text-xl font-semibold">{DUMMY_USER.name}</h2>
            <p className="text-gray-500">Bergabung sejak {DUMMY_USER.joinDate}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label>Nama Lengkap</Label>
            <Input defaultValue={DUMMY_USER.name} />
          </div>
          
          <div>
            <Label>Email</Label>
            <Input defaultValue={DUMMY_USER.email} type="email" />
          </div>
          
          <div>
            <Label>Nomor Telepon</Label>
            <Input defaultValue={DUMMY_USER.phone} />
          </div>

          <Button className="w-full">Simpan Perubahan</Button>
        </div>

        <div className="pt-6 border-t">
          <Button variant="destructive" className="w-full">
            <Trash className="w-4 h-4 mr-2" />
            Hapus Akun
          </Button>
        </div>
      </Card>
    </div>
  );
}
