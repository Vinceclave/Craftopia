import { useState, useMemo } from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Toaster } from '@/components/ui/toaster';
import { 
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue 
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Users, Search, Ban, UserCog, Trash2, Shield, CheckCircle, 
  Loader2, Unlock, AlertCircle, Eye, ChevronLeft, ChevronRight,
  Mail, Calendar, FileText, MessageSquare, Trophy, User,
  Download, FileText as FileTextIcon, Table
} from 'lucide-react';
import { useUsers } from '@/hooks/useUsers';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';

// Import export utilities
import { exportToPDF } from '@/utils/exportToPDF';
import { exportToExcel } from '@/utils/exportToExcel';

interface User {
  user_id: number;
  username: string;
  email: string;
  role: 'admin' | 'user';
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  _count?: {
    posts: number;
    comments: number;
    userChallenges: number;
  };
  profile?: {
    points: number;
  };
}

export default function AdminUsers() {
  const { 
    users, isLoading, error, toggleStatus, updateRole, deleteUser,
    isToggling, isUpdating, isDeleting
  } = useUsers();
  
  const { toast } = useToast();
  const [globalFilter, setGlobalFilter] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });
  
  // Modals state
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [banDialogOpen, setBanDialogOpen] = useState(false);
  const [roleDialogOpen, setRoleDialogOpen] = useState(false);

  // Define columns with proper TypeScript types
  const columns = useMemo<ColumnDef<User>[]>(
    () => [
      {
        accessorKey: 'username',
        header: 'User',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              {row.original.username.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <p className="font-semibold text-[#2B4A2F] font-poppins truncate">
                  {row.original.username}
                </p>
                {row.original.is_email_verified && (
                  <CheckCircle className="w-4 h-4 text-blue-500 flex-shrink-0" />
                )}
              </div>
              <p className="text-sm text-gray-500 font-nunito truncate">{row.original.email}</p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'role',
        header: 'Role',
        cell: ({ row }) => (
          <Badge className={
            row.original.role === 'admin' 
              ? 'bg-purple-100 text-purple-800 border-0' 
              : 'bg-gray-100 text-gray-800 border-0'
          }>
            {row.original.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
            {row.original.role}
          </Badge>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => (
          <Badge className={
            row.original.is_active 
              ? "bg-green-100 text-green-800 border-0" 
              : "bg-red-100 text-red-800 border-0"
          }>
            {row.original.is_active ? (
              <>
                <Unlock className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Ban className="w-3 h-3 mr-1" />
                Banned
              </>
            )}
          </Badge>
        ),
      },
      {
        accessorKey: 'created_at',
        header: 'Joined Date',
        cell: ({ row }) => (
          <div className="text-sm text-gray-500 font-nunito">
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => (
          <div className="flex gap-2">
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleViewDetails(row.original)}
              className="h-9 w-9 p-0 border-[#6CAC73]/20 text-blue-600 hover:bg-blue-50"
              title="View Details"
            >
              <Eye className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => handleOpenBanDialog(row.original)}
              className={`h-9 w-9 p-0 border-[#6CAC73]/20 ${
                !row.original.is_active 
                  ? 'text-green-600 hover:bg-green-50' 
                  : 'text-orange-600 hover:bg-orange-50'
              }`}
              title={row.original.is_active ? 'Ban User' : 'Unban User'}
            >
              {row.original.is_active ? <Ban className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleOpenRoleDialog(row.original)}
              className="h-9 w-9 p-0 border-[#6CAC73]/20 text-purple-600 hover:bg-purple-50"
              title={row.original.role === 'admin' ? 'Demote to User' : 'Promote to Admin'}
            >
              <UserCog className="w-4 h-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => handleOpenDeleteDialog(row.original)}
              className="h-9 w-9 p-0 border-[#6CAC73]/20 text-red-600 hover:bg-red-50"
              title="Delete User"
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        ),
      },
    ],
    []
  );

  // Enhanced search function that searches across all user data
  const filteredData = useMemo(() => {
    return users.filter(user => {
      // Search across multiple fields
      const searchTerm = globalFilter.toLowerCase();
      const matchesSearch = !globalFilter || 
        user.username.toLowerCase().includes(searchTerm) ||
        user.email.toLowerCase().includes(searchTerm) ||
        user.role.toLowerCase().includes(searchTerm) ||
        (user.is_active ? 'active' : 'banned').includes(searchTerm) ||
        new Date(user.created_at).toLocaleDateString().toLowerCase().includes(searchTerm) ||
        (user._count?.posts?.toString() || '0').includes(searchTerm) ||
        (user._count?.comments?.toString() || '0').includes(searchTerm) ||
        (user._count?.userChallenges?.toString() || '0').includes(searchTerm) ||
        (user.profile?.points?.toString() || '0').includes(searchTerm);
      
      const matchesRole = roleFilter === 'all' || user.role === roleFilter;
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && user.is_active) ||
        (statusFilter === 'banned' && !user.is_active);
      
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, globalFilter, roleFilter, statusFilter]);

  // Create table instance with client-side pagination
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
      pagination,
    },
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  // Export handlers
  const handleExportPDF = async () => {
    try {
      // Use the actual user data directly without transformation
      exportToPDF(filteredData, 'users-report', {
        title: 'Users Management'
      });
      
      toast({
        title: "PDF Exported",
        description: "User data has been exported as PDF successfully.",
      });
    } catch (error: any) {
      console.error('PDF export failed:', error);
      toast({
        title: "Export Failed",
        description: error.message || "Failed to export PDF. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleExportExcel = () => {
    const exportData = filteredData.map(user => ({
      Username: user.username,
      Email: user.email,
      Role: user.role,
      Status: user.is_active ? 'Active' : 'Banned',
      'Email Verified': user.is_email_verified ? 'Yes' : 'No',
      'Joined Date': new Date(user.created_at).toLocaleDateString(),
      Posts: user._count?.posts || 0,
      Comments: user._count?.comments || 0,
      Challenges: user._count?.userChallenges || 0,
      Points: user.profile?.points || 0,
    }));

    exportToExcel(exportData, 'users-report');
    
    toast({
      title: "Excel Exported",
      description: "Users report has been exported as Excel successfully.",
    });
  };

  // Handlers
  const handleViewDetails = (user: User) => {
    setSelectedUser(user);
    setDetailsOpen(true);
  };

  const handleOpenBanDialog = (user: User) => {
    setSelectedUser(user);
    setBanDialogOpen(true);
  };

  const handleOpenRoleDialog = (user: User) => {
    setSelectedUser(user);
    setRoleDialogOpen(true);
  };

  const handleOpenDeleteDialog = (user: User) => {
    setSelectedUser(user);
    setDeleteDialogOpen(true);
  };

  const handleConfirmToggleStatus = async () => {
    if (!selectedUser) return;
    
    try {
      await toggleStatus(selectedUser.user_id);
      toast({
        title: "Success",
        description: `${selectedUser.username} has been ${selectedUser.is_active ? 'banned' : 'unbanned'} successfully.`,
      });
      setBanDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user status.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmRoleChange = async () => {
    if (!selectedUser) return;
    
    const newRole = selectedUser.role === 'admin' ? 'user' : 'admin';
    
    try {
      await updateRole({ userId: selectedUser.user_id, role: newRole });
      toast({
        title: "Success",
        description: `${selectedUser.username}'s role has been changed to ${newRole}.`,
      });
      setRoleDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to update user role.",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedUser) return;
    
    try {
      await deleteUser(selectedUser.user_id);
      toast({
        title: "User Deleted",
        description: `${selectedUser.username} has been permanently deleted.`,
      });
      setDeleteDialogOpen(false);
      setSelectedUser(null);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to delete user.",
        variant: "destructive",
      });
    }
  };

  // Stats
  const stats = useMemo(() => ({
    total: users.length,
    active: users.filter(u => u.is_active).length,
    banned: users.filter(u => !u.is_active).length,
    admins: users.filter(u => u.role === 'admin').length,
    verified: users.filter(u => u.is_email_verified).length,
  }), [users]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73]" />
          <p className="text-[#2B4A2F] font-poppins">Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-4 sm:p-6">
      <div className="max-w-7xl mx-auto flex flex-col gap-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
              <Users className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2B4A2F] font-poppins">User Management</h1>
              <p className="text-gray-600 text-sm font-nunito">Manage platform users and permissions</p>
            </div>
          </div>
          
          {/* Export Buttons */}
          <div className="flex gap-2">
            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
            >
              <FileTextIcon className="w-4 h-4 mr-2" />
              Export PDF
            </Button>
            <Button
              onClick={handleExportExcel}
              variant="outline"
              className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
            >
              <Table className="w-4 h-4 mr-2" />
              Export Excel
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-800">
              Error loading users: {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            label="Total Users" 
            value={stats.total} 
            icon={<Users className="w-5 h-5" />}
            color="text-[#2B4A2F]"
          />
          <StatCard 
            label="Active" 
            value={stats.active} 
            icon={<Unlock className="w-5 h-5" />}
            color="text-green-600"
          />
          <StatCard 
            label="Banned" 
            value={stats.banned} 
            icon={<Ban className="w-5 h-5" />}
            color="text-red-600"
          />
          <StatCard 
            label="Admins" 
            value={stats.admins} 
            icon={<Shield className="w-5 h-5" />}
            color="text-purple-600"
          />
          <StatCard 
            label="Verified" 
            value={stats.verified} 
            icon={<CheckCircle className="w-5 h-5" />}
            color="text-blue-600"
          />
        </div>

        {/* Filters Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Filters & Search</CardTitle>
            <CardDescription className="font-nunito">
              Search across all user data including username, email, role, status, dates, and activity statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search users, emails, roles, status, dates, posts, comments..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73]"
                />
              </div>
              
              <Select value={roleFilter} onValueChange={setRoleFilter}>
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73]">
                  <SelectValue placeholder="All Roles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Roles</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>

              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="banned">Banned</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Users Table Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
              All Users ({filteredData.length})
            </CardTitle>
            
            {/* Page Size Selector */}
            <div className="flex items-center gap-4">
              <Select
                value={String(table.getState().pagination.pageSize)}
                onValueChange={(value) => {
                  table.setPageSize(Number(value));
                }}
              >
                <SelectTrigger className="w-32 border-[#6CAC73]/20">
                  <SelectValue placeholder="Page size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="5">5 per page</SelectItem>
                  <SelectItem value="10">10 per page</SelectItem>
                  <SelectItem value="20">20 per page</SelectItem>
                  <SelectItem value="50">50 per page</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <div className="rounded-lg border border-[#6CAC73]/20 overflow-hidden">
              <table className="w-full">
                <thead>
                  {table.getHeaderGroups().map(headerGroup => (
                    <tr key={headerGroup.id} className="border-b border-[#6CAC73]/20 bg-gray-50/50">
                      {headerGroup.headers.map(header => (
                        <th key={header.id} className="text-left p-4 font-semibold text-[#2B4A2F] font-poppins">
                          {flexRender(header.column.columnDef.header, header.getContext())}
                        </th>
                      ))}
                    </tr>
                  ))}
                </thead>
                <tbody>
                  {table.getRowModel().rows.length === 0 ? (
                    <tr>
                      <td colSpan={columns.length} className="p-8 text-center">
                        <div className="flex flex-col items-center gap-3">
                          <Users className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium font-poppins">No users found</p>
                          <p className="text-gray-400 text-sm font-nunito">Try adjusting your search or filters</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    table.getRowModel().rows.map(row => (
                      <tr 
                        key={row.id} 
                        className="border-b border-[#6CAC73]/10 hover:bg-gray-50/50 transition-colors last:border-0"
                      >
                        {row.getVisibleCells().map(cell => (
                          <td key={cell.id} className="p-4">
                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Enhanced Pagination */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#6CAC73]/20">
              {/* Showing range */}
              <div className="text-sm text-gray-500 font-nunito">
                Showing{' '}
                <span className="font-semibold text-[#2B4A2F]">
                  {table.getRowModel().rows.length > 0 
                    ? (table.getState().pagination.pageIndex * table.getState().pagination.pageSize) + 1 
                    : 0
                  }
                </span>{' '}
                to{' '}
                <span className="font-semibold text-[#2B4A2F]">
                  {Math.min(
                    (table.getState().pagination.pageIndex + 1) * table.getState().pagination.pageSize,
                    filteredData.length
                  )}
                </span>{' '}
                of <span className="font-semibold text-[#2B4A2F]">{filteredData.length}</span> users
              </div>

              {/* Pagination Controls */}
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                  Page <span className="font-semibold text-[#2B4A2F]">{table.getState().pagination.pageIndex + 1}</span>{' '}
                  of <span className="font-semibold text-[#2B4A2F]">{table.getPageCount()}</span>
                </div>
                
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.previousPage()}
                    disabled={!table.getCanPreviousPage()}
                    className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  
                  {/* Page Numbers */}
                  <div className="flex gap-1">
                    {Array.from({ length: Math.min(5, table.getPageCount()) }, (_, i) => {
                      // Show pages around current page
                      let pageIndex;
                      if (table.getPageCount() <= 5) {
                        pageIndex = i;
                      } else {
                        const startPage = Math.max(0, Math.min(table.getPageCount() - 5, table.getState().pagination.pageIndex - 2));
                        pageIndex = startPage + i;
                      }
                      
                      return (
                        <Button
                          key={pageIndex}
                          variant={table.getState().pagination.pageIndex === pageIndex ? "default" : "outline"}
                          size="sm"
                          onClick={() => table.setPageIndex(pageIndex)}
                          className={`min-w-9 h-9 p-0 ${
                            table.getState().pagination.pageIndex === pageIndex
                              ? 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] text-white border-0'
                              : 'border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10'
                          }`}
                        >
                          {pageIndex + 1}
                        </Button>
                      );
                    })}
                  </div>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => table.nextPage()}
                    disabled={!table.getCanNextPage()}
                    className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Modals */}
        <UserDetailsModal 
          user={selectedUser}
          open={detailsOpen}
          onOpenChange={setDetailsOpen}
        />

        <BanUserModal
          user={selectedUser}
          open={banDialogOpen}
          onOpenChange={setBanDialogOpen}
          onConfirm={handleConfirmToggleStatus}
          loading={isToggling}
        />

        <RoleChangeModal
          user={selectedUser}
          open={roleDialogOpen}
          onOpenChange={setRoleDialogOpen}
          onConfirm={handleConfirmRoleChange}
          loading={isUpdating}
        />

        <DeleteUserModal
          user={selectedUser}
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          loading={isDeleting}
        />
      </div>
      <Toaster />
    </div>
  );
}

// Stat Card Component
interface StatCardProps {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
}

function StatCard({ label, value, icon, color }: StatCardProps) {
  return (
    <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-1">
            <p className="text-sm text-gray-500 font-nunito">{label}</p>
            <p className={`text-2xl font-bold ${color} font-poppins`}>{value}</p>
          </div>
          <div className={`p-2 rounded-lg bg-gradient-to-br from-[#6CAC73]/10 to-[#2B4A2F]/10 ${color}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// User Details Modal
interface UserDetailsModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function UserDetailsModal({ user, open, onOpenChange }: UserDetailsModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
              <User className="w-5 h-5" />
              User Details
            </DialogTitle>
            <DialogDescription className="font-nunito">
              Complete information about {user.username}
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-6">
          {/* User Profile */}
          <div className="flex items-center gap-4 p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10">
            <div className="w-16 h-16 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-full flex items-center justify-center text-white font-semibold text-xl">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <div className="flex items-center gap-2">
                <h3 className="text-xl font-bold text-[#2B4A2F] font-poppins">{user.username}</h3>
                {user.is_email_verified && (
                  <Badge className="bg-blue-100 text-blue-800 border-0">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Verified
                  </Badge>
                )}
              </div>
              <p className="text-gray-600 font-nunito flex items-center gap-2">
                <Mail className="w-4 h-4" />
                {user.email}
              </p>
            </div>
          </div>

          <Separator className="bg-[#6CAC73]/20" />

          {/* Account Information */}
          <div className="flex flex-col gap-4">
            <h4 className="font-semibold text-[#2B4A2F] font-poppins">Account Information</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 font-nunito">Role</p>
                <Badge className={
                  user.role === 'admin' 
                    ? 'bg-purple-100 text-purple-800 border-0' 
                    : 'bg-gray-100 text-gray-800 border-0'
                }>
                  {user.role === 'admin' && <Shield className="w-3 h-3 mr-1" />}
                  {user.role}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 font-nunito">Status</p>
                <Badge className={
                  user.is_active 
                    ? "bg-green-100 text-green-800 border-0" 
                    : "bg-red-100 text-red-800 border-0"
                }>
                  {user.is_active ? 'Active' : 'Banned'}
                </Badge>
              </div>
              <div className="flex flex-col gap-2">
                <p className="text-sm text-gray-500 font-nunito">Member Since</p>
                <p className="text-[#2B4A2F] font-nunito flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  {new Date(user.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>

          {/* Activity Statistics */}
          {user._count && (
            <>
              <Separator className="bg-[#6CAC73]/20" />
              <div className="flex flex-col gap-4">
                <h4 className="font-semibold text-[#2B4A2F] font-poppins">Activity Statistics</h4>
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10 text-center">
                    <FileText className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-nunito">Posts</p>
                    <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{user._count.posts || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10 text-center">
                    <MessageSquare className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-nunito">Comments</p>
                    <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{user._count.comments || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10 text-center">
                    <Trophy className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-nunito">Challenges</p>
                    <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{user._count.userChallenges || 0}</p>
                  </div>
                  <div className="p-4 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl border border-[#6CAC73]/10 text-center">
                    <Trophy className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                    <p className="text-sm text-gray-500 font-nunito">Points</p>
                    <p className="text-xl font-bold text-[#2B4A2F] font-poppins">{user.profile?.points || 0}</p>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}

// Ban User Modal
interface BanUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

function BanUserModal({ user, open, onOpenChange, onConfirm, loading }: BanUserModalProps) {
  if (!user) return null;

  const isBanning = user.is_active;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className={`font-poppins flex items-center gap-2 ${
              isBanning ? 'text-orange-600' : 'text-green-600'
            }`}>
              {isBanning ? <Ban className="w-5 h-5" /> : <Unlock className="w-5 h-5" />}
              {isBanning ? 'Ban User' : 'Unban User'}
            </DialogTitle>
            <DialogDescription className="font-nunito">
              {isBanning 
                ? 'This will prevent the user from accessing their account.'
                : 'This will restore the user\'s access to their account.'
              }
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Alert className={`backdrop-blur-sm ${
            isBanning 
              ? 'bg-orange-50/80 border-orange-200' 
              : 'bg-green-50/80 border-green-200'
          }`}>
            <AlertCircle className={`h-4 w-4 ${isBanning ? 'text-orange-600' : 'text-green-600'}`} />
            <AlertDescription className="font-nunito">
              You are about to {isBanning ? 'ban' : 'unban'}:{' '}
              <span className="font-bold text-[#2B4A2F]">{user.username}</span>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className={`border-0 ${
              isBanning 
                ? 'bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800' 
                : 'bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
            }`}
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : isBanning ? (
              <Ban className="w-4 h-4 mr-2" />
            ) : (
              <Unlock className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Processing...' : (isBanning ? 'Ban User' : 'Unban User')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Role Change Modal
interface RoleChangeModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

function RoleChangeModal({ user, open, onOpenChange, onConfirm, loading }: RoleChangeModalProps) {
  if (!user) return null;

  const newRole = user.role === 'admin' ? 'user' : 'admin';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-purple-600 font-poppins flex items-center gap-2">
              <UserCog className="w-5 h-5" />
              Change User Role
            </DialogTitle>
            <DialogDescription className="font-nunito">
              This will change the user's permissions and access level.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Alert className="bg-purple-50/80 border-purple-200 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-purple-600" />
            <AlertDescription className="font-nunito">
              <div className="flex flex-col gap-2">
                <p>You are about to change role for:</p>
                <p className="font-bold text-[#2B4A2F]">{user.username}</p>
                <div className="flex items-center gap-3 mt-2">
                  <Badge className="bg-gray-100 text-gray-800 border-0">
                    Current: {user.role}
                  </Badge>
                  <span className="text-gray-400">→</span>
                  <Badge className="bg-purple-100 text-purple-800 border-0">
                    New: {newRole}
                  </Badge>
                </div>
              </div>
            </AlertDescription>
          </Alert>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
          >
            Cancel
          </Button>
          <Button
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 border-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <UserCog className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Updating...' : `Change to ${newRole}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Delete User Modal
interface DeleteUserModalProps {
  user: User | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
  loading: boolean;
}

function DeleteUserModal({ user, open, onOpenChange, onConfirm, loading }: DeleteUserModalProps) {
  if (!user) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm">
        <DialogHeader>
          <div className="flex flex-col gap-2">
            <DialogTitle className="text-red-600 font-poppins flex items-center gap-2">
              <AlertCircle className="w-5 h-5" />
              Delete User
            </DialogTitle>
            <DialogDescription className="font-nunito">
              This action cannot be undone and will permanently delete the user account.
            </DialogDescription>
          </div>
        </DialogHeader>
        
        <div className="flex flex-col gap-4">
          <Alert className="bg-red-50/80 border-red-200 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800 font-nunito">
              <div className="flex flex-col gap-2">
                <p className="font-medium">You are about to delete:</p>
                <p className="font-bold">{user.username} ({user.email})</p>
              </div>
            </AlertDescription>
          </Alert>

          <div className="bg-gradient-to-br from-[#FFF9F0] to-white p-4 rounded-xl border border-[#6CAC73]/10 flex flex-col gap-2 text-sm font-nunito">
            <p className="font-medium text-[#2B4A2F]">This will permanently:</p>
            <ul className="list-disc list-inside flex flex-col gap-1 text-gray-600">
              <li>Remove all user data</li>
              <li>Delete all associated content</li>
              <li>Cannot be recovered</li>
            </ul>
          </div>
        </div>

        <DialogFooter className="gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
            className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={onConfirm}
            disabled={loading}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 border-0"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="w-4 h-4 mr-2" />
            )}
            {loading ? 'Deleting...' : 'Delete Permanently'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}