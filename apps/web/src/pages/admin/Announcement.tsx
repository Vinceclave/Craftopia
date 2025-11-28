// apps/web/src/pages/admin/Announcements.tsx - FIXED VERSION
import { useState, useMemo, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  AlertCircle,
  Bell,
  Plus,
  Loader2,
  Edit2,
  Trash2,
  Calendar,
  EyeOff,
  Wifi,
  Clock,
  CheckCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  X,
  User,
  Archive,
  Send,
  Search,
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
  useReactTable,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  type ColumnDef,
  flexRender,
} from '@tanstack/react-table';
import type { Announcement } from '@/lib/api';

export default function AdminAnnouncements() {
  const {
    announcements,
    meta,
    isLoading,
    error,
    params,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleStatus,
    nextPage,
    prevPage,
    setLimit,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  } = useAnnouncements();

  const { isConnected } = useWebSocket();
  const { toast } = useToast();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expires_at: '',
  });

  // Calculate stats correctly
  const stats = useMemo(() => {
    const total = meta?.total || 0;
    const active = announcements.filter((a: Announcement) => 
      a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date())
    ).length;
    const draft = announcements.filter((a: Announcement) => !a.is_active).length;
    const expired = announcements.filter((a: Announcement) => 
      a.expires_at && new Date(a.expires_at) < new Date()
    ).length;
    const scheduled = announcements.filter((a: Announcement) => 
      a.is_active && a.expires_at && new Date(a.expires_at) > new Date()
    ).length;

    return {
      total,
      active,
      draft,
      expired,
      scheduled,
    };
  }, [announcements, meta]);

  // Enhanced search function - CLIENT SIDE ONLY
  const filteredData = useMemo(() => {
    return announcements.filter((announcement: Announcement) => {
      // Search across multiple fields
      const searchTerm = globalFilter.toLowerCase();
      const matchesSearch = !globalFilter || 
        announcement.title.toLowerCase().includes(searchTerm) ||
        announcement.content.toLowerCase().includes(searchTerm) ||
        (announcement.admin?.username || 'Admin').toLowerCase().includes(searchTerm) ||
        new Date(announcement.created_at).toLocaleDateString().toLowerCase().includes(searchTerm) ||
        (announcement.expires_at ? new Date(announcement.expires_at).toLocaleDateString().toLowerCase().includes(searchTerm) : false) ||
        (announcement.is_active ? 'active published' : 'draft').includes(searchTerm);
      
      const matchesStatus = statusFilter === 'all' || 
        (statusFilter === 'active' && announcement.is_active && (!announcement.expires_at || new Date(announcement.expires_at) > new Date())) ||
        (statusFilter === 'draft' && !announcement.is_active) ||
        (statusFilter === 'expired' && announcement.expires_at && new Date(announcement.expires_at) < new Date()) ||
        (statusFilter === 'scheduled' && announcement.is_active && announcement.expires_at && new Date(announcement.expires_at) > new Date());
      
      return matchesSearch && matchesStatus;
    });
  }, [announcements, globalFilter, statusFilter]);

  // Define columns for TanStack Table
  const columns = useMemo<ColumnDef<Announcement>[]>(
    () => [
      {
        accessorKey: 'title',
        header: 'Announcement',
        cell: ({ row }) => (
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
              <Megaphone className="w-5 h-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-[#2B4A2F] font-poppins truncate">
                {row.original.title}
              </p>
              <p className="text-sm text-gray-500 font-nunito truncate">
                {row.original.content}
              </p>
            </div>
          </div>
        ),
      },
      {
        accessorKey: 'admin',
        header: 'Author',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-gray-600 font-nunito">
            <User className="w-4 h-4" />
            {row.original.admin?.username || 'Admin'}
          </div>
        ),
      },
      {
        accessorKey: 'is_active',
        header: 'Status',
        cell: ({ row }) => {
          const announcement = row.original;
          const isExpired = !!(announcement.expires_at && new Date(announcement.expires_at) < new Date());
          const isActive = announcement.is_active && !isExpired;
          const isScheduled = announcement.is_active && announcement.expires_at && new Date(announcement.expires_at) > new Date();

          return (
            <Badge className={
              isActive
                ? "bg-green-100 text-green-800 border-0"
                : isExpired
                ? "bg-gray-100 text-gray-800 border-0"
                : isScheduled
                ? "bg-blue-100 text-blue-800 border-0"
                : "bg-orange-100 text-orange-800 border-0"
            }>
              {isActive ? (
                <>
                  <CheckCircle className="w-3 h-3 mr-1" />
                  Active
                </>
              ) : isExpired ? (
                <>
                  <Archive className="w-3 h-3 mr-1" />
                  Expired
                </>
              ) : isScheduled ? (
                <>
                  <Clock className="w-3 h-3 mr-1" />
                  Scheduled
                </>
              ) : (
                <>
                  <Edit2 className="w-3 h-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
          );
        },
      },
      {
        accessorKey: 'created_at',
        header: 'Created',
        cell: ({ row }) => (
          <div className="flex items-center gap-2 text-sm text-gray-500 font-nunito">
            <Calendar className="w-4 h-4" />
            {new Date(row.original.created_at).toLocaleDateString()}
          </div>
        ),
      },
      {
        accessorKey: 'expires_at',
        header: 'Expires',
        cell: ({ row }) => {
          const expiresAt = row.original.expires_at;
          if (!expiresAt) return <span className="text-gray-400 text-sm">Never</span>;
          
          const isExpired = new Date(expiresAt) < new Date();
          return (
            <div className={`flex items-center gap-2 text-sm font-nunito ${
              isExpired ? 'text-orange-600' : 'text-gray-500'
            }`}>
              <Clock className="w-4 h-4" />
              {isExpired ? 'Expired' : 'Expires'} {new Date(expiresAt).toLocaleDateString()}
            </div>
          );
        },
      },
      {
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const announcement = row.original;
          const isExpired = !!(announcement.expires_at && new Date(announcement.expires_at) < new Date());
          const isActive = announcement.is_active && !isExpired;

          return (
            <div className="flex gap-2">
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenToggle(announcement)}
                disabled={isToggling}
                className={`h-9 w-9 p-0 border-[#6CAC73]/20 ${
                  isActive 
                    ? 'text-orange-600 hover:bg-orange-50' 
                    : 'text-green-600 hover:bg-green-50'
                }`}
                title={isActive ? 'Unpublish' : 'Publish'}
              >
                {isActive ? <EyeOff className="w-4 h-4" /> : <Send className="w-4 h-4" />}
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenEdit(announcement)}
                disabled={isUpdating}
                className="h-9 w-9 p-0 border-[#6CAC73]/20 text-blue-600 hover:bg-blue-50"
                title="Edit"
              >
                <Edit2 className="w-4 h-4" />
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleOpenDelete(announcement)}
                disabled={isDeleting}
                className="h-9 w-9 p-0 border-[#6CAC73]/20 text-red-600 hover:bg-red-50"
                title="Delete"
              >
                <Trash2 className="w-4 h-4" />
              </Button>
            </div>
          );
        },
      },
    ],
    [isToggling, isUpdating, isDeleting]
  );

  // Create table instance with CLIENT-SIDE pagination only
  const table = useReactTable({
    data: filteredData,
    columns,
    state: {
      globalFilter,
    },
    getCoreRowModel: getCoreRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onGlobalFilterChange: setGlobalFilter,
  });

  const handleOpenCreate = () => {
    setFormData({ title: '', content: '', expires_at: '' });
    setCreateDialogOpen(true);
  };

  const handleOpenEdit = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      expires_at: announcement.expires_at
        ? new Date(announcement.expires_at).toISOString().slice(0, 16)
        : '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenDelete = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleOpenToggle = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setToggleDialogOpen(true);
  };

  // FIXED: Proper modal close after successful operations
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        expires_at: formData.expires_at ? new Date(formData.expires_at) : undefined,
      });
      toast({
        title: "Success",
        description: "Announcement created and published!",
      });
      // Reset form and close modal
      setFormData({ title: '', content: '', expires_at: '' });
      setCreateDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to create announcement",
        variant: "destructive",
      });
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAnnouncement) return;

    try {
      await updateAnnouncement({
        announcementId: selectedAnnouncement.announcement_id,
        data: {
          title: formData.title,
          content: formData.content,
          expires_at: formData.expires_at ? new Date(formData.expires_at) : null,
        },
      });
      toast({
        title: "Success",
        description: "Announcement updated successfully!",
      });
      // Reset and close modal
      setFormData({ title: '', content: '', expires_at: '' });
      setSelectedAnnouncement(null);
      setEditDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to update announcement",
        variant: "destructive",
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;

    try {
      await deleteAnnouncement(selectedAnnouncement.announcement_id);
      toast({
        title: "Success",
        description: "Announcement deleted successfully!",
      });
      // Close modal after successful deletion
      setSelectedAnnouncement(null);
      setDeleteDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to delete announcement",
        variant: "destructive",
      });
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedAnnouncement) return;

    try {
      await toggleStatus(selectedAnnouncement.announcement_id);
      const newStatus = !selectedAnnouncement.is_active;
      toast({
        title: "Success",
        description: newStatus ? "Announcement published!" : "Announcement unpublished",
      });
      // Close modal after successful toggle
      setSelectedAnnouncement(null);
      setToggleDialogOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message || "Failed to toggle status",
        variant: "destructive",
      });
    }
  };

  const handleLimitChange = (value: string) => {
    const newLimit = Number(value);
    setLimit(newLimit);
    // Reset to first page when changing limit
    table.setPageIndex(0);
  };

  // Server-side pagination handlers
  const handleNextPage = () => {
    nextPage();
  };

  const handlePrevPage = () => {
    prevPage();
  };

  // Calculate display range for server-side pagination
  const displayRange = useMemo(() => {
    if (!meta) return { from: 0, to: 0, total: 0 };
    
    const from = ((meta.page - 1) * meta.limit) + 1;
    const to = Math.min(meta.page * meta.limit, meta.total);
    return { from, to, total: meta.total };
  }, [meta]);

  if (isLoading && announcements.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73]" />
          <p className="text-[#2B4A2F] font-poppins">Loading announcements...</p>
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
              <Megaphone className="w-6 h-6 text-white" />
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-2xl sm:text-3xl font-bold text-[#2B4A2F] font-poppins flex items-center gap-2">
                Announcements
                {isConnected && (
                  <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                    <Wifi className="w-3 h-3 mr-1" />
                    Live
                  </Badge>
                )}
              </h1>
              <p className="text-gray-600 text-sm font-nunito">Create and manage platform-wide announcements</p>
            </div>
          </div>
          <Button
            size="sm"
            onClick={handleOpenCreate}
            className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
          >
            <Plus className="w-4 h-4 mr-2" />
            Create Announcement
          </Button>
        </div>

        {/* Error Alert */}
        {error && (
          <Alert className="border-red-200 bg-red-50">
            <AlertCircle className="h-5 w-5 text-red-500" />
            <AlertDescription className="text-red-800">
              Error loading announcements: {(error as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard 
            label="Total" 
            value={stats.total} 
            icon={<Megaphone className="w-5 h-5" />}
            color="text-[#2B4A2F]"
          />
          <StatCard 
            label="Active" 
            value={stats.active} 
            icon={<CheckCircle className="w-5 h-5" />}
            color="text-green-600"
          />
          <StatCard 
            label="Drafts" 
            value={stats.draft} 
            icon={<Edit2 className="w-5 h-5" />}
            color="text-orange-600"
          />
          <StatCard 
            label="Expired" 
            value={stats.expired} 
            icon={<Archive className="w-5 h-5" />}
            color="text-gray-600"
          />
          <StatCard 
            label="Scheduled" 
            value={stats.scheduled} 
            icon={<Clock className="w-5 h-5" />}
            color="text-blue-600"
          />
        </div>

        {/* Filters Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col gap-2">
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">Filters & Search</CardTitle>
            <CardDescription className="font-nunito">
              Search across all announcement data including titles, content, authors, and dates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="relative md:col-span-2">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Search titles, content, authors, dates..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 border-[#6CAC73]/20 focus:border-[#6CAC73]"
                />
              </div>
              
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73]">
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="expired">Expired</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={String(params.limit || 10)}
                onValueChange={handleLimitChange}
                disabled={isLoading}
              >
                <SelectTrigger className="border-[#6CAC73]/20 focus:border-[#6CAC73]">
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
          </CardContent>
        </Card>

        {/* Active Announcements Preview */}
        {stats.active > 0 && (
          <Card className="border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
                    Live Announcements
                  </CardTitle>
                  <CardDescription className="font-nunito">
                    Currently visible to all users ({stats.active} total)
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                  <Send className="w-3 h-3 mr-1" />
                  {stats.active} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-3">
                {announcements
                  .filter((a: Announcement) => a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date()))
                  .slice(0, 3)
                  .map((announcement: Announcement) => (
                  <div
                    key={announcement.announcement_id}
                    className="p-4 border border-blue-200 rounded-xl bg-white/60 backdrop-blur-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h3 className="font-semibold text-[#2B4A2F] font-poppins mb-1">
                          {announcement.title}
                        </h3>
                        <p className="text-sm text-gray-600 font-nunito mb-2">
                          {announcement.content}
                        </p>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-nunito">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {announcement.admin?.username || 'Admin'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {new Date(announcement.created_at).toLocaleDateString()}
                          </span>
                          {announcement.expires_at && (
                            <span className="flex items-center gap-1 text-orange-600">
                              <Clock className="w-3 h-3" />
                              Expires {new Date(announcement.expires_at).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {stats.active > 3 && (
                  <div className="text-center pt-2">
                    <p className="text-sm text-gray-500 font-nunito">
                      + {stats.active - 3} more active announcements
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Announcements Table Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
          <CardHeader className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-[#2B4A2F] font-poppins">
              All Announcements ({filteredData.length})
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
                          <Megaphone className="w-12 h-12 text-gray-300" />
                          <p className="text-gray-500 font-medium font-poppins">No announcements found</p>
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
              {/* Server-side pagination info */}
              {meta && (
                <div className="text-sm text-gray-500 font-nunito">
                  Showing {displayRange.from} to {displayRange.to} of {displayRange.total} entries
                </div>
              )}

              <div className="flex items-center gap-6">
                {/* Client-side table pagination */}
                {table.getPageCount() > 1 && (
                  <div className="flex items-center gap-4">
                    <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                      Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.previousPage()}
                        disabled={!table.getCanPreviousPage()}
                        className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => table.nextPage()}
                        disabled={!table.getCanNextPage()}
                        className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}

                {/* Server-side pagination - ONLY show if we have server pagination data */}
                {meta && meta.lastPage > 1 && (
                  <div className="flex items-center gap-4 border-l border-[#6CAC73]/20 pl-4">
                    <div className="text-sm text-gray-500 font-nunito hidden sm:block">
                      Server Page {meta.page} of {meta.lastPage}
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handlePrevPage}
                        disabled={!meta.hasPrevPage || isLoading}
                        className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                      >
                        <ChevronLeft className="w-4 h-4 mr-1" />
                        Prev
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleNextPage}
                        disabled={!meta.hasNextPage || isLoading}
                        className="border-[#6CAC73]/20 text-[#2B4A2F] hover:bg-[#6CAC73]/10"
                      >
                        Next
                        <ChevronRight className="w-4 h-4 ml-1" />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Create/Edit Dialog */}
        <Dialog
          open={createDialogOpen || editDialogOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCreateDialogOpen(false);
              setEditDialogOpen(false);
              setSelectedAnnouncement(null);
              setFormData({ title: '', content: '', expires_at: '' });
            }
          }}
        >
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins text-xl">
                {editDialogOpen ? 'Edit Announcement' : 'Create New Announcement'}
              </DialogTitle>
              <DialogDescription className="font-nunito">
                {editDialogOpen
                  ? 'Update announcement details. Changes will be reflected immediately.'
                  : 'Create a new announcement for all platform users.'}
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={editDialogOpen ? handleUpdate : handleCreate}>
              <div className="flex flex-col gap-4 py-4">
                <div className="flex flex-col gap-2">
                  <Label htmlFor="title" className="text-[#2B4A2F] font-poppins">
                    Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Important Update"
                    required
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="content" className="text-[#2B4A2F] font-poppins">
                    Content <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement details..."
                    rows={4}
                    required
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                </div>
                <div className="flex flex-col gap-2">
                  <Label htmlFor="expires_at" className="text-[#2B4A2F] font-poppins">
                    Expiration Date (Optional)
                  </Label>
                  <Input
                    id="expires_at"
                    type="datetime-local"
                    value={formData.expires_at}
                    onChange={(e) => setFormData({ ...formData, expires_at: e.target.value })}
                    min={new Date().toISOString().slice(0, 16)}
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                  <p className="text-xs text-gray-500 font-nunito">
                    Leave empty for no expiration
                  </p>
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    setCreateDialogOpen(false);
                    setEditDialogOpen(false);
                    setSelectedAnnouncement(null);
                    setFormData({ title: '', content: '', expires_at: '' });
                  }}
                  disabled={isCreating || isUpdating}
                  className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating || isUpdating}
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  {isCreating || isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      {editDialogOpen ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      {editDialogOpen ? <CheckCircle className="w-4 h-4 mr-2" /> : <Send className="w-4 h-4 mr-2" />}
                      {editDialogOpen ? 'Update Announcement' : 'Create & Publish'}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Delete Confirmation AlertDialog */}
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className="text-red-600 font-poppins">
                <Trash2 className="w-5 h-5 inline mr-2" />
                Delete Announcement?
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                This action cannot be undone. This will permanently delete the announcement.
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedAnnouncement && (
              <Alert className="bg-gradient-to-br from-[#FFF9F0] to-white border-[#6CAC73]/20">
                <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
                <AlertDescription className="font-nunito">
                  <p className="font-medium mb-2 text-[#2B4A2F]">You are about to delete:</p>
                  <p className="font-bold text-[#2B4A2F]">"{selectedAnnouncement.title}"</p>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setDeleteDialogOpen(false);
                  setSelectedAnnouncement(null);
                }}
                className="border-[#6CAC73]/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="bg-gradient-to-br from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white border-0"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Announcement
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        {/* Toggle Status AlertDialog */}
        <AlertDialog open={toggleDialogOpen} onOpenChange={setToggleDialogOpen}>
          <AlertDialogContent className="border-[#6CAC73]/20 bg-white/95 backdrop-blur-sm">
            <AlertDialogHeader>
              <AlertDialogTitle className={`font-poppins ${
                selectedAnnouncement?.is_active ? 'text-orange-600' : 'text-green-600'
              }`}>
                {selectedAnnouncement?.is_active ? (
                  <>
                    <EyeOff className="w-5 h-5 inline mr-2" />
                    Unpublish Announcement?
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 inline mr-2" />
                    Publish Announcement?
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                {selectedAnnouncement?.is_active
                  ? 'This will hide the announcement from all users.'
                  : 'This will make the announcement visible to all users immediately.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedAnnouncement && (
              <Alert className="bg-gradient-to-br from-[#FFF9F0] to-white border-[#6CAC73]/20">
                <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
                <AlertDescription className="font-nunito">
                  <p className="font-medium mb-2 text-[#2B4A2F]">
                    {selectedAnnouncement.is_active ? 'Unpublishing:' : 'Publishing:'}
                  </p>
                  <p className="font-bold text-[#2B4A2F]">"{selectedAnnouncement.title}"</p>
                </AlertDescription>
              </Alert>
            )}

            <AlertDialogFooter>
              <AlertDialogCancel
                onClick={() => {
                  setToggleDialogOpen(false);
                  setSelectedAnnouncement(null);
                }}
                className="border-[#6CAC73]/20"
              >
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleConfirmToggle}
                disabled={isToggling}
                className={`border-0 ${
                  selectedAnnouncement?.is_active
                    ? 'bg-gradient-to-br from-orange-600 to-orange-700 hover:from-orange-700 hover:to-orange-800'
                    : 'bg-gradient-to-br from-green-600 to-green-700 hover:from-green-700 hover:to-green-800'
                } text-white`}
              >
                {isToggling ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Processing...
                  </>
                ) : selectedAnnouncement?.is_active ? (
                  <>
                    <EyeOff className="w-4 h-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Publish Now
                  </>
                )}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
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