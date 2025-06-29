'use client';

import { useState, useEffect } from 'react';
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "@/components/ui/use-toast";
import { 
  Pagination, 
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious
} from "@/components/ui/pagination";
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
  DialogFooter,
  DialogDescription
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  User, 
  Search, 
  Edit, 
  Trash2, 
  Shield, 
  AlertTriangle,
  Loader2,
  ChevronLeft,
  ChevronRight 
} from "lucide-react";
import { PERMISSIONS, ROLES } from '@/lib/permissions';
import { notFound } from 'next/navigation';
import { isTokenValid, clearAuthData } from "@/components/auth/LoginDialog";

export default function UserManagement() {
  // States for API data
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [processingAction, setProcessingAction] = useState(false);
  // Stats for dashboard
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAdmins: 0,
    newUsersThisWeek: 0,
    activeUsers: 0
  });
  const [loadingStats, setLoadingStats] = useState(true);

  // Fetch users from API
  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    
    try {
      if (!isTokenValid()) {
        clearAuthData();
        notFound();
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthData();
        notFound();
        return;
      }
      
      // Construct URL with query parameters for pagination and filtering
      let url = `http://127.0.0.1:8000/api/admin/users?page=${currentPage}&perPage=${itemsPerPage}`;
      if (searchTerm) {
        url += `&search=${encodeURIComponent(searchTerm)}`;
      }
      if (filterRole && filterRole !== 'all') {
        url += `&role=${encodeURIComponent(filterRole)}`;
      }
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearAuthData();
          notFound();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        const data = await response.json();
      console.log('Users data:', data);      
      // Handle different API response formats
      if (data.users && Array.isArray(data.users)) {
        // Format: { users: [...], pagination: {...} }
        setUsers(data.users);
        
        // Handle pagination info in various formats
        if (data.pagination) {
          // Support different property naming conventions
          setCurrentPage(
            data.pagination.currentPage || 
            data.pagination.current_page || 
            1
          );
          setTotalPages(
            data.pagination.totalPages || 
            data.pagination.total_pages || 
            data.pagination.lastPage || 
            data.pagination.last_page || 
            Math.ceil((data.pagination.total || 0) / (data.pagination.perPage || data.pagination.per_page || 10)) ||
            1
          );
          setItemsPerPage(
            data.pagination.perPage || 
            data.pagination.per_page || 
            10
          );
        }
      } else if (data.data) {
        // Format: { data: [...], meta: {...} }
        setUsers(data.data);
        
        // Handle pagination info
        if (data.meta) {
          setCurrentPage(data.meta.current_page || 1);
          setTotalPages(data.meta.last_page || Math.ceil((data.meta.total || 0) / (data.meta.per_page || 10)) || 1);
          setItemsPerPage(data.meta.per_page || 10);
        }
      } else if (Array.isArray(data)) {
        // Format: Direct array of users
        setUsers(data);
      } else {
        console.error('Unexpected API response format:', data);
        throw new Error('Unexpected API response format');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      setError(error.message);
      toast({
        title: "Error",
        description: `Failed to load users: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Toggle admin status
  const toggleAdminStatus = async (userId) => {
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}/toggle-admin`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      // Update user list after successful toggle
      fetchUsers();
      
      toast({
        title: "Success",
        description: "User admin status updated successfully",
      });
    } catch (error) {
      console.error('Error toggling admin status:', error);
      toast({
        title: "Error",
        description: `Failed to update admin status: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    setProcessingAction(true);
    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch(`http://127.0.0.1:8000/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      // Update user list after successful deletion
      fetchUsers();
      
      toast({
        title: "Success",
        description: "User deleted successfully",
      });
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: `Failed to delete user: ${error.message}`,
        variant: "destructive",
      });
    } finally {
      setProcessingAction(false);
      setShowDeleteDialog(false);
    }
  };

  // Fetch dashboard stats
  const fetchStats = async () => {
    setLoadingStats(true);
    
    try {
      if (!isTokenValid()) {
        clearAuthData();
        notFound();
        return;
      }
      
      const token = localStorage.getItem('token');
      if (!token) {
        clearAuthData();
        notFound();
        return;
      }
      
      const response = await fetch('http://127.0.0.1:8000/api/admin/stats', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        mode: 'cors',
      });
      
      if (!response.ok) {
        if (response.status === 401) {
          clearAuthData();
          notFound();
          return;
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
        const data = await response.json();
      console.log('Stats data:', data);
      
      // Extract stats data from various possible response formats
      let statsData = {};
      
      if (data.data && typeof data.data === 'object') {
        statsData = data.data;
      } else if (data.stats && typeof data.stats === 'object') {
        statsData = data.stats;
      } else if (typeof data === 'object') {
        // Assume the object itself contains the stats
        statsData = data;
      }
      
      // Always set stats with fallback values to prevent undefined errors
      setStats({
        totalUsers: statsData.totalUsers || statsData.total_users || 0,
        totalAdmins: statsData.totalAdmins || statsData.total_admins || 0,
        newUsersThisWeek: statsData.newUsersThisWeek || statsData.new_users_this_week || 0,
        activeUsers: statsData.activeUsers || statsData.active_users || 0
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      // We don't show a toast for stats errors to avoid cluttering the UI
    } finally {
      setLoadingStats(false);
    }
  };

  // Handle pagination change
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };
  // Load users and stats on component mount and when dependencies change
  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [currentPage, itemsPerPage, searchTerm, filterRole]);
  
  // Reset to page 1 when search or filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, filterRole]);return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Manajemen User</h1>
        <Button className="flex items-center gap-2">
          <Users className="w-4 h-4" />
          Tambah Admin
        </Button>
      </div>
      
      {/* Stats Dashboard */}      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Users</h3>
          <p className="text-2xl font-bold mt-1">
            {loadingStats ? (
              <span className="animate-pulse">...</span>
            ) : (
              (stats.totalUsers !== undefined && stats.totalUsers !== null) 
                ? stats.totalUsers.toLocaleString() 
                : "0"
            )}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Total Admins</h3>
          <p className="text-2xl font-bold mt-1">
            {loadingStats ? (
              <span className="animate-pulse">...</span>
            ) : (
              (stats.totalAdmins !== undefined && stats.totalAdmins !== null) 
                ? stats.totalAdmins.toLocaleString() 
                : "0"
            )}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">New Users This Week</h3>
          <p className="text-2xl font-bold mt-1">
            {loadingStats ? (
              <span className="animate-pulse">...</span>
            ) : (
              (stats.newUsersThisWeek !== undefined && stats.newUsersThisWeek !== null) 
                ? stats.newUsersThisWeek.toLocaleString() 
                : "0"
            )}
          </p>
        </Card>
        <Card className="p-4">
          <h3 className="text-sm font-medium text-muted-foreground">Active Users</h3>
          <p className="text-2xl font-bold mt-1">
            {loadingStats ? (
              <span className="animate-pulse">...</span>
            ) : (
              (stats.activeUsers !== undefined && stats.activeUsers !== null) 
                ? stats.activeUsers.toLocaleString() 
                : "0"
            )}
          </p>
        </Card>
      </div>

      {/* Search and filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cari nama atau email..."
            className="pl-8"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <div className="w-full sm:w-48">
          <select 
            className="w-full h-10 px-3 rounded-md border border-input bg-background"
            value={filterRole}
            onChange={(e) => setFilterRole(e.target.value)}
          >
            <option value="all">Semua Role</option>
            <option value="admin">Admin</option>
            <option value="user">User</option>
          </select>
        </div>
        <Button onClick={() => fetchUsers()}>
          Refresh
        </Button>
      </div>

      <Card className="overflow-hidden">
        {loading ? (
          <div className="flex justify-center items-center p-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <span className="ml-2">Loading users...</span>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center p-12 text-center">
            <AlertTriangle className="h-12 w-12 text-destructive mb-2" />
            <h3 className="font-semibold text-xl">Error Loading Users</h3>
            <p className="text-muted-foreground">{error}</p>
            <Button onClick={fetchUsers} className="mt-4">Try Again</Button>
          </div>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>ID</TableHead>
                  <TableHead>Nama</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Program Studi</TableHead>
                  <TableHead>Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                      Tidak ada data pengguna yang ditemukan
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell className="font-mono text-sm">{user.id}</TableCell>
                      <TableCell className="font-medium">{user.name || user.full_name}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>
                        <Badge variant={user.is_admin ? 'default' : 'secondary'}>
                          {user.is_admin ? 'Admin' : 'User'}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {user.program_studi_code || '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {/* Toggle Admin Status Button */}
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => toggleAdminStatus(user.id)}
                            disabled={processingAction}
                          >
                            <Shield className="h-3.5 w-3.5" />
                            {user.is_admin ? 'Remove Admin' : 'Make Admin'}
                          </Button>
                          
                          {/* Delete User Button */}
                          <Button
                            variant="destructive"
                            size="sm"
                            className="flex items-center gap-1"
                            onClick={() => {
                              setUserToDelete(user);
                              setShowDeleteDialog(true);
                            }}
                            disabled={processingAction}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>            {/* Pagination UI */}
            {totalPages > 1 && (
              <div className="py-4 border-t">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                        className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                    
                    {/* Generate page numbers */}
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      // Logic for showing correct page numbers when there are many pages
                      let pageNumber;
                      if (totalPages <= 5) {
                        // Less than 5 pages, show all
                        pageNumber = i + 1;
                      } else if (currentPage <= 3) {
                        // Near the start
                        if (i < 4) {
                          pageNumber = i + 1;
                        } else {
                          return (
                            <PaginationItem key="ellipsis-end">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        }
                      } else if (currentPage >= totalPages - 2) {
                        // Near the end
                        if (i === 0) {
                          return (
                            <PaginationItem key="ellipsis-start">
                              <PaginationEllipsis />
                            </PaginationItem>
                          );
                        } else {
                          pageNumber = totalPages - (4 - i);
                        }
                      } else {
                        // Middle
                        if (i === 0) {
                          return (
                            <PaginationItem key="ellipsis-start">
                              <PaginationLink onClick={() => handlePageChange(1)}>
                                1
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else if (i === 4) {
                          return (
                            <PaginationItem key="ellipsis-end">
                              <PaginationLink onClick={() => handlePageChange(totalPages)}>
                                {totalPages}
                              </PaginationLink>
                            </PaginationItem>
                          );
                        } else {
                          pageNumber = currentPage + (i - 2);
                        }
                      }

                      return (
                        <PaginationItem key={pageNumber}>
                          <PaginationLink
                            isActive={currentPage === pageNumber}
                            onClick={() => handlePageChange(pageNumber)}
                          >
                            {pageNumber}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                        className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </Card>

      {/* Delete User Confirmation Dialog */}
      {showDeleteDialog && userToDelete && (
        <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
              <AlertDialogDescription>
                Tindakan ini akan menghapus user <strong>{userToDelete.name || userToDelete.full_name}</strong> secara permanen.
                Data yang sudah dihapus tidak dapat dikembalikan.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel disabled={processingAction}>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                onClick={() => deleteUser(userToDelete.id)}
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                disabled={processingAction}
              >
                {processingAction ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Processing
                  </>
                ) : (
                  'Delete'
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
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
