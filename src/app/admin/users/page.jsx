'use client';

import { useState } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Users } from "lucide-react";
import { PERMISSIONS, ROLES } from '@/lib/permissions';

const DUMMY_USERS = [
  {
    id: 1,
    name: 'Admin Utama',
    email: 'admin@gmail.com',
    role: 'SUPER_ADMIN',
    lastActive: '2024-01-15 10:00'
  },
  {
    id: 2,
    name: 'Admin Moderator',
    email: 'mod@gmail.com',
    role: 'MODERATOR',
    lastActive: '2024-01-15 09:30'
  }
];

export default function UserManagement() {
  const [selectedUser, setSelectedUser] = useState(null);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen User</h1>
        <Button className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Tambah Admin
        </Button>
      </div>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nama</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Permissions</TableHead>
              <TableHead>Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_USERS.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.name}</TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>
                  <Badge variant={user.role === 'SUPER_ADMIN' ? 'default' : 'secondary'}>
                    {ROLES[user.role].label}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1 flex-wrap">
                    {ROLES[user.role].permissions.map((permission) => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  <Dialog>
                    <DialogTrigger asChild>
                      <Button 
                        variant="outline" 
                        size="sm"
                        className="flex items-center gap-2"
                        onClick={() => setSelectedUser(user)}
                      >
                        Edit Permissions
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle>Edit Permissions - {user.name}</DialogTitle>
                      </DialogHeader>
                      <div className="py-4">
                        {Object.entries(PERMISSIONS).map(([key, value]) => (
                          <div key={key} className="flex items-center justify-between py-2">
                            <div>
                              <p className="font-medium">{value}</p>
                              <p className="text-sm text-gray-500">
                                {getPermissionDescription(value)}
                              </p>
                            </div>
                            <Switch
                              checked={ROLES[user.role].permissions.includes(value)}
                              disabled={user.role === 'SUPER_ADMIN'}
                            />
                          </div>
                        ))}
                      </div>
                    </DialogContent>
                  </Dialog>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}

function getPermissionDescription(permission) {
  switch (permission) {
    case PERMISSIONS.VIEW_ALL_REPORTS:
      return 'Dapat melihat semua laporan dalam sistem';
    case PERMISSIONS.HANDLE_SENSITIVE_REPORTS:
      return 'Dapat menangani laporan sensitif/penting';
    case PERMISSIONS.MANAGE_USERS:
      return 'Dapat mengelola user dan permission';
    default:
      return '';
  }
}
