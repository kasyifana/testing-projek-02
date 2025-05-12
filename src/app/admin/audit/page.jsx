'use client';

import { Card } from "@/components/ui/card";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";

const DUMMY_LOGS = [
  {
    id: 1,
    action: "Login",
    user: "Admin",
    timestamp: "2024-01-15 09:00:00",
    details: "Login berhasil"
  },
  {
    id: 2,
    action: "Update Status Laporan",
    user: "Admin",
    timestamp: "2024-01-15 09:15:00",
    details: "Mengubah status laporan #123 menjadi 'In Progress'"
  },
  // Add more dummy data
];

export default function AuditLog() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Audit Log</h1>

      <Card>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Details</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {DUMMY_LOGS.map((log) => (
              <TableRow key={log.id}>
                <TableCell className="font-mono">{log.timestamp}</TableCell>
                <TableCell>{log.user}</TableCell>
                <TableCell>{log.action}</TableCell>
                <TableCell>{log.details}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </Card>
    </div>
  );
}
