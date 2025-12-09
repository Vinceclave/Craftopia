// apps/web/src/pages/admin/Announcements.tsx - WITH CONTENT TRUNCATION
import { useState, useMemo, useEffect } from 'react';
import { ColumnDef } from '@tanstack/react-table';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  Megaphone,
  Plus,
  Loader2,
  Edit2,
  EyeOff,
  CheckCircle,
  User,
  Calendar,
  Clock,
  Archive,
  Send,
  X,
  Bell,
  Wifi,
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
import type { Announcement } from '@/lib/api';
import {
  DataTable,
  FilterOption,
  ConfirmDialog,
  StatsGrid,
  PageHeader,
  LoadingState,
  ErrorState,
  PageContainer,
  ActionButtons,
  ActionButton,
  ExportButtons,
} from '@/components/shared';
import { generateGenericPDF, type ExportConfig } from '@/utils/exportToPDF';
import { generateGenericExcel, type ExcelSheetConfig } from '@/utils/exportToExcel';

// 🔥 NEW: Utility function to truncate text
const truncateText = (text: string, maxLength: number = 100): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export default function AdminAnnouncements() {
  const {
    announcements,
    allAnnouncements,
    isLoading,
    error,
    createAnnouncement,
    updateAnnouncement,
    deleteAnnouncement,
    toggleStatus,
    setStatus,
    setSearch,
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
    isStatsLoading,
  } = useAnnouncements();

  const { isConnected } = useWebSocket();
  const { success, error: showError } = useToast();

  // State
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null);
  const [globalFilter, setGlobalFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expires_at: '',
  });

  // Handle search with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(globalFilter);
    }, 500);
    return () => clearTimeout(timer);
  }, [globalFilter, setSearch]);

  // Handle status filter
  useEffect(() => {
    setStatus(statusFilter);
  }, [statusFilter, setStatus]);

  // Stats - Use allAnnouncements for accurate counts
  const stats = useMemo(() => {
    const total = allAnnouncements?.length || 0;
    const active = allAnnouncements?.filter((a: Announcement) =>
      a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date())
    ).length || 0;
    const draft = allAnnouncements?.filter((a: Announcement) => !a.is_active).length || 0;
    const expired = allAnnouncements?.filter((a: Announcement) =>
      a.expires_at && new Date(a.expires_at) < new Date()
    ).length || 0;
    const scheduled = allAnnouncements?.filter((a: Announcement) =>
      a.is_active && a.expires_at && new Date(a.expires_at) > new Date()
    ).length || 0;

    return [
      {
        label: 'Total',
        value: total,
        icon: <Megaphone className="w-5 h-5" />,
        color: 'text-[#2B4A2F]',
      },
      {
        label: 'Active',
        value: active,
        icon: <CheckCircle className="w-5 h-5" />,
        color: 'text-green-600',
      },
      {
        label: 'Drafts',
        value: draft,
        icon: <Edit2 className="w-5 h-5" />,
        color: 'text-orange-600',
      },
      {
        label: 'Expired',
        value: expired,
        icon: <Archive className="w-5 h-5" />,
        color: 'text-gray-600',
      },
      {
        label: 'Scheduled',
        value: scheduled,
        icon: <Clock className="w-5 h-5" />,
        color: 'text-blue-600',
      },
    ];
  }, [allAnnouncements]);

  // Filters
  const filters: FilterOption[] = [
    {
      label: 'All Status',
      value: statusFilter,
      options: [
        { label: 'All Status', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Draft', value: 'draft' },
        { label: 'Expired', value: 'expired' },
        { label: 'Scheduled', value: 'scheduled' },
      ],
      onChange: setStatusFilter,
    },
  ];

  // Columns - 🔥 UPDATED: Truncate content in table
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
              {/* 🔥 UPDATED: Truncate content to 80 characters */}
              <p className="text-sm text-gray-500 font-nunito truncate" title={row.original.content}>
                {truncateText(row.original.content, 80)}
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
          const isExpired = !!(
            announcement.expires_at && new Date(announcement.expires_at) < new Date()
          );
          const isActive = announcement.is_active && !isExpired;
          const isScheduled =
            announcement.is_active &&
            announcement.expires_at &&
            new Date(announcement.expires_at) > new Date();

          return (
            <Badge
              className={
                isActive
                  ? 'bg-green-100 text-green-800 border-0'
                  : isExpired
                    ? 'bg-gray-100 text-gray-800 border-0'
                    : isScheduled
                      ? 'bg-blue-100 text-blue-800 border-0'
                      : 'bg-orange-100 text-orange-800 border-0'
              }
            >
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
            <div
              className={`flex items-center gap-2 text-sm font-nunito ${isExpired ? 'text-orange-600' : 'text-gray-500'
                }`}
            >
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
          const isExpired = !!(
            announcement.expires_at && new Date(announcement.expires_at) < new Date()
          );
          const isActive = announcement.is_active && !isExpired;

          const actions: ActionButton[] = [
            {
              icon: isActive ? <EyeOff className="w-4 h-4" /> : <Send className="w-4 h-4" />,
              label: isActive ? 'Unpublish' : 'Publish',
              onClick: () => handleOpenToggle(announcement),
              variant: isActive ? 'warning' : 'success',
            },
            {
              icon: <Edit2 className="w-4 h-4" />,
              label: 'Edit',
              onClick: () => handleOpenEdit(announcement),
              variant: 'default',
            },
            {
              icon: <X className="w-4 h-4" />,
              label: 'Delete',
              onClick: () => handleOpenDelete(announcement),
              variant: 'danger',
            },
          ];

          return <ActionButtons actions={actions} />;
        },
      },
    ],
    []
  );

  // Handlers
  const handleOpenEdit = (announcement: Announcement) => {
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

  const handleOpenDelete = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleOpenToggle = (announcement: Announcement) => {
    setSelectedAnnouncement(announcement);
    setToggleDialogOpen(true);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        expires_at: formData.expires_at ? new Date(formData.expires_at) : undefined,
      });
      success('Announcement created and published!');
      setFormData({ title: '', content: '', expires_at: '' });
      setCreateDialogOpen(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to create announcement');
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
      success('Announcement updated successfully!');
      setFormData({ title: '', content: '', expires_at: '' });
      setSelectedAnnouncement(null);
      setEditDialogOpen(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to update announcement');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;

    try {
      await deleteAnnouncement(selectedAnnouncement.announcement_id);
      success('Announcement deleted successfully!');
      setSelectedAnnouncement(null);
      setDeleteDialogOpen(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to delete announcement');
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedAnnouncement) return;

    try {
      await toggleStatus(selectedAnnouncement.announcement_id);
      const newStatus = !selectedAnnouncement.is_active;
      success(newStatus ? 'Announcement published!' : 'Announcement unpublished');
      setSelectedAnnouncement(null);
      setToggleDialogOpen(false);
    } catch (err: any) {
      showError(err?.message || 'Failed to toggle status');
    }
  };

  if (isLoading && (!announcements || announcements.length === 0)) {
    return <LoadingState message="Loading announcements..." />;
  }

  // Export handlers
  const handleExportPDF = () => {
    const config: ExportConfig = {
      title: 'Announcements Report',
      subtitle: 'Platform announcements and notifications',
      stats: [
        { label: 'Total Announcements', value: allAnnouncements?.length || 0 },
        { label: 'Active', value: stats[1].value },
        { label: 'Drafts', value: stats[2].value },
        { label: 'Expired', value: stats[3].value },
      ],
      columns: [
        { header: 'Title', dataKey: 'title' },
        { header: 'Content', dataKey: 'content' },
        { header: 'Author', dataKey: 'admin', formatter: (val) => val?.username || 'Admin' },
        {
          header: 'Status', dataKey: 'is_active', formatter: (val, row) => {
            const isExpired = row.expires_at && new Date(row.expires_at) < new Date();
            return val && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Draft';
          }
        },
        { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString() },
        { header: 'Expires', dataKey: 'expires_at', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Never' },
      ],
      data: allAnnouncements || [],
      filename: 'announcements-report',
    };
    generateGenericPDF(config);
  };

  const handleExportExcel = () => {
    const sheets: ExcelSheetConfig[] = [{
      sheetName: 'Announcements',
      columns: [
        { header: 'Title', dataKey: 'title', width: 30 },
        { header: 'Content', dataKey: 'content', width: 50 },
        { header: 'Author', dataKey: 'admin', formatter: (val) => val?.username || 'Admin', width: 20 },
        {
          header: 'Status', dataKey: 'is_active', formatter: (val, row) => {
            const isExpired = row.expires_at && new Date(row.expires_at) < new Date();
            return val && !isExpired ? 'Active' : isExpired ? 'Expired' : 'Draft';
          }, width: 15
        },
        { header: 'Created', dataKey: 'created_at', formatter: (val) => new Date(val).toLocaleDateString(), width: 20 },
        { header: 'Expires', dataKey: 'expires_at', formatter: (val) => val ? new Date(val).toLocaleDateString() : 'Never', width: 20 },
      ],
      data: allAnnouncements || [],
    }];
    generateGenericExcel({ sheets, filename: 'announcements-report' });
  };

  return (
    <PageContainer>
      {/* Header */}
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            Announcements
            {isConnected && (
              <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                <Wifi className="w-3 h-3 mr-1" />
                Live
              </Badge>
            )}
          </div>
        }
        description="Create and manage platform-wide announcements"
        icon={<Megaphone className="w-6 h-6 text-white" />}
        actions={
          <div className="flex gap-2">
            <ExportButtons onExportPDF={handleExportPDF} onExportExcel={handleExportExcel} />
            <Button
              size="sm"
              onClick={() => setCreateDialogOpen(true)}
              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        }
      />

      {/* Error Alert */}
      {error && <ErrorState error={error} title="Error loading announcements" />}

      {/* Stats Grid */}
      {isStatsLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-24 bg-gray-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : (
        <StatsGrid stats={stats} />
      )}

      {/* Active Announcements Preview - 🔥 UPDATED: Truncate content */}
      {stats[1].value > 0 && (
        <Card className="border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                  <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
                  Live Announcements
                </CardTitle>
                <CardDescription className="font-nunito">
                  Currently visible to all users ({stats[1].value} total)
                </CardDescription>
              </div>
              <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                <Send className="w-3 h-3 mr-1" />
                {stats[1].value} Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-3">
              {allAnnouncements
                ?.filter(
                  (a: Announcement) => a.is_active && (!a.expires_at || new Date(a.expires_at) > new Date())
                )
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
                        {/* 🔥 UPDATED: Truncate content to 150 characters with tooltip */}
                        <p 
                          className="text-sm text-gray-600 font-nunito mb-2" 
                          title={announcement.content}
                        >
                          {truncateText(announcement.content, 150)}
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
              {stats[1].value > 3 && (
                <div className="text-center pt-2">
                  <p className="text-sm text-gray-500 font-nunito">
                    + {stats[1].value - 3} more active announcements
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Data Table */}
      <DataTable
        data={announcements || []}
        columns={columns}
        searchPlaceholder="Search titles, content, authors, dates..."
        onSearchChange={setGlobalFilter}
        filters={filters}
        title="All Announcements"
        emptyState={{
          icon: <Megaphone className="w-12 h-12 text-gray-300" />,
          title: 'No announcements found',
          description: 'Try adjusting your search or filters',
        }}
      />

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
                  className="border-[#6CAC73]/20 focus:border-[#6CAC73]"
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
                  className="border-[#6CAC73]/20 focus:border-[#6CAC73]"
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
                  className="border-[#6CAC73]/20 focus:border-[#6CAC73]"
                />
                <p className="text-xs text-gray-500 font-nunito">Leave empty for no expiration</p>
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
                    {editDialogOpen ? (
                      <CheckCircle className="w-4 h-4 mr-2" />
                    ) : (
                      <Send className="w-4 h-4 mr-2" />
                    )}
                    {editDialogOpen ? 'Update Announcement' : 'Create & Publish'}
                  </>
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      {selectedAnnouncement && (
        <ConfirmDialog
          open={deleteDialogOpen}
          onOpenChange={setDeleteDialogOpen}
          onConfirm={handleConfirmDelete}
          title="Delete Announcement?"
          description="This action cannot be undone. This will permanently delete the announcement."
          confirmText="Delete Announcement"
          loading={isDeleting}
          variant="danger"
          icon={<X className="w-5 h-5" />}
          alertMessage={
            <>
              <p className="font-medium mb-2 text-[#2B4A2F]">You are about to delete:</p>
              <p className="font-bold text-[#2B4A2F]">"{selectedAnnouncement.title}"</p>
            </>
          }
        />
      )}

      {/* Toggle Status Dialog */}
      {selectedAnnouncement && (
        <ConfirmDialog
          open={toggleDialogOpen}
          onOpenChange={setToggleDialogOpen}
          onConfirm={handleConfirmToggle}
          title={selectedAnnouncement.is_active ? 'Unpublish Announcement?' : 'Publish Announcement?'}
          description={
            selectedAnnouncement.is_active
              ? 'This will hide the announcement from all users.'
              : 'This will make the announcement visible to all users immediately.'
          }
          confirmText={selectedAnnouncement.is_active ? 'Unpublish' : 'Publish Now'}
          loading={isToggling}
          variant={selectedAnnouncement.is_active ? 'warning' : 'success'}
          icon={
            selectedAnnouncement.is_active ? (
              <EyeOff className="w-5 h-5" />
            ) : (
              <Send className="w-5 h-5" />
            )
          }
          alertMessage={
            <>
              <p className="font-medium mb-2 text-[#2B4A2F]">
                {selectedAnnouncement.is_active ? 'Unpublishing:' : 'Publishing:'}
              </p>
              <p className="font-bold text-[#2B4A2F]">"{selectedAnnouncement.title}"</p>
            </>
          }
        />
      )}
    </PageContainer>
  );
}