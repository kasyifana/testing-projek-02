'use client';

import { Card } from "@/components/ui/card";
import { Bell, MessageCircle, RefreshCw } from 'lucide-react';

const DUMMY_NOTIFICATIONS = [
  {
    id: 1,
    type: 'response',
    title: 'Tanggapan baru',
    message: 'Admin telah menanggapi laporan Anda tentang kerusakan AC',
    time: '5 menit yang lalu',
    read: false
  },
  {
    id: 2,
    type: 'status',
    title: 'Status diperbarui',
    message: 'Laporan "Masalah Nilai UTS" telah selesai ditangani',
    time: '1 jam yang lalu',
    read: true
  },
  // Add more notifications as needed
];

export default function Notifications() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Notifikasi</h1>
        <button className="text-primary hover:text-primary/80">
          <RefreshCw className="h-5 w-5" />
        </button>
      </div>

      <div className="space-y-4">
        {DUMMY_NOTIFICATIONS.map((notification) => (
          <Card
            key={notification.id}
            className={`p-4 ${!notification.read ? 'bg-primary/5' : ''}`}
          >
            <div className="flex gap-4">
              {notification.type === 'response' ? (
                <MessageCircle className="h-6 w-6 text-blue-500" />
              ) : (
                <Bell className="h-6 w-6 text-yellow-500" />
              )}
              
              <div className="flex-1">
                <h3 className="font-semibold">{notification.title}</h3>
                <p className="text-gray-600">{notification.message}</p>
                <p className="text-sm text-gray-400 mt-2">{notification.time}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
