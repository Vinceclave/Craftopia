// apps/web/src/pages/admin/Announcements.tsx - SYNCED DESIGN
import { useState } from 'react';
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
  RefreshCw,
  Edit2,
  Trash2,
  Calendar,
  Eye,
  EyeOff,
  Wifi,
  Clock,
  CheckCircle,
  Megaphone,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Alert, AlertDescription } from '@/components/ui/alert';
import type { Announcement } from '@/lib/api';

export default function AdminAnnouncements() {
  const {
    announcements,
    activeAnnouncements,
    meta,
    isLoading,
    error,
    params,
    setParams,
    refetch,
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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [toggleDialogOpen, setToggleDialogOpen] = useState(false);
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<any>(null);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    expires_at: '',
  });

  const handleCreateOpen = () => {
    setFormData({ title: '', content: '', expires_at: '' });
    setCreateDialogOpen(true);
  };

  const handleEditOpen = (announcement: any) => {
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

  const handleDeleteOpen = (announcement: any) => {
    setSelectedAnnouncement(announcement);
    setDeleteDialogOpen(true);
  };

  const handleToggleOpen = (announcement: any) => {
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
      setCreateDialogOpen(false);
      setFormData({ title: '', content: '', expires_at: '' });
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to create announcement'));
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
      setEditDialogOpen(false);
      setSelectedAnnouncement(null);
      setFormData({ title: '', content: '', expires_at: '' });
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to update announcement'));
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;

    try {
      await deleteAnnouncement(selectedAnnouncement.announcement_id);
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to delete announcement'));
    }
  };

  const handleConfirmToggle = async () => {
    if (!selectedAnnouncement) return;

    try {
      await toggleStatus(selectedAnnouncement.announcement_id);
      setToggleDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to toggle status'));
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#FFF9F0] to-white">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin text-[#6CAC73] mx-auto mb-4" />
          <p className="text-[#2B4A2F] font-poppins">Loading announcements...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
        <div className="absolute inset-0 pointer-events-none">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
              style={{
                left: `${20 + i * 25}%`,
                top: `${15 + (i % 2) * 30}%`,
                animationDelay: `${i * 1.5}s`,
                animationDuration: '4s'
              }}
            />
          ))}
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          <Alert className="border-rose-200 bg-rose-50/80 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <AlertDescription>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="font-semibold text-rose-900 font-poppins mb-1">Error loading announcements</p>
                  <p className="text-rose-700 text-sm font-nunito">{(error as Error).message}</p>
                </div>
                <Button
                  size="sm"
                  onClick={() => refetch()}
                  className="bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Retry
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6 relative">
      {/* Background Floating Elements */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-[#6CAC73] rounded-full opacity-20 animate-float"
            style={{
              left: `${15 + i * 20}%`,
              top: `${10 + (i % 3) * 25}%`,
              animationDelay: `${i * 1.2}s`,
              animationDuration: '4s'
            }}
          />
        ))}
      </div>

      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-[#2B4A2F] font-poppins flex items-center gap-2">
                  Announcements Management
                  {isConnected && (
                    <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border border-[#6CAC73]/30 font-poppins animate-pulse">
                      <Wifi className="w-3 h-3 mr-1" />
                      Live
                    </Badge>
                  )}
                </h1>
                <p className="text-gray-600 mt-1 font-nunito">
                  Create and manage platform-wide announcements
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={() => refetch()}
                className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
              <Button
                size="sm"
                onClick={handleCreateOpen}
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
              >
                <Plus className="w-4 h-4 mr-2" />
                Create Announcement
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <Megaphone className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1 font-nunito">Total Announcements</p>
                <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{meta?.total || 0}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <CheckCircle className="w-6 h-6 text-[#6CAC73] mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1 font-nunito">Active</p>
                <p className="text-3xl font-bold text-[#6CAC73] font-poppins">
                  {announcements.filter((a: Announcement) => a.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="text-center">
                <Bell className="w-6 h-6 text-blue-600 mx-auto mb-2" />
                <p className="text-sm text-gray-600 mb-1 font-nunito">Currently Live</p>
                <p className="text-3xl font-bold text-blue-600 font-poppins">
                  {activeAnnouncements.length}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Announcements Card */}
        {activeAnnouncements.length > 0 && (
          <Card className="mb-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                    <Bell className="w-5 h-5 text-[#6CAC73]" />
                    Currently Live Announcements
                  </CardTitle>
                  <CardDescription className="font-nunito">
                    These announcements are currently visible to all users
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F] border-0 font-poppins">
                  {activeAnnouncements.length} Live
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAnnouncements.map((announcement: Announcement) => (
                  <div
                    key={announcement.announcement_id}
                    className="p-4 border border-blue-200 rounded-xl bg-blue-50/80 backdrop-blur-sm"
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
                          <span>By {announcement.admin?.username || 'Admin'}</span>
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Filter Card */}
        <Card className="mb-6 border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">Filters & Settings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="includeExpired"
                  checked={params.includeExpired}
                  onChange={(e) => setParams({ ...params, includeExpired: e.target.checked, page: 1 })}
                  className="w-4 h-4 rounded border-[#6CAC73]/30 text-[#6CAC73] focus:ring-[#6CAC73]/20"
                />
                <label htmlFor="includeExpired" className="text-sm text-[#2B4A2F] font-poppins cursor-pointer">
                  Include Expired Announcements
                </label>
              </div>

              <div className="flex items-center gap-2">
                <Label className="text-sm text-[#2B4A2F] font-poppins">Items per page:</Label>
                <Select
                  value={String(params.limit)}
                  onValueChange={(value) => setLimit(Number(value))}
                >
                  <SelectTrigger className="w-20 border-[#6CAC73]/20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="5">5</SelectItem>
                    <SelectItem value="10">10</SelectItem>
                    <SelectItem value="20">20</SelectItem>
                    <SelectItem value="50">50</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Announcements List Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-[#2B4A2F] font-poppins">
                  All Announcements
                </CardTitle>
                <CardDescription className="font-nunito">
                  {meta?.total ? `Showing ${announcements.length} of ${meta.total} announcements` : 'Manage all platform announcements'}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No announcements found</p>
                <p className="text-sm text-gray-400 mt-2 font-nunito">
                  {params.includeExpired 
                    ? 'Try adjusting your filters'
                    : 'Create your first announcement to get started'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement: Announcement) => {
                  const isExpired = !!(announcement.expires_at && new Date(announcement.expires_at) < new Date());
                  const isActive = announcement.is_active && !isExpired;

                  return (
                    <div
                      key={announcement.announcement_id}
                      className="p-4 border border-[#6CAC73]/20 rounded-xl bg-white/60 backdrop-blur-sm hover:bg-white/80 hover:shadow-md transition-all duration-300"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h3 className="font-semibold text-[#2B4A2F] font-poppins">
                              {announcement.title}
                            </h3>
                            <Badge
                              className={`font-poppins border-0 ${
                                isActive
                                  ? 'bg-gradient-to-r from-[#6CAC73]/20 to-[#2B4A2F]/10 text-[#2B4A2F]'
                                  : isExpired
                                  ? 'bg-gradient-to-r from-gray-500/20 to-gray-600/20 text-gray-700'
                                  : 'bg-gradient-to-r from-orange-500/20 to-orange-600/20 text-orange-700'
                              }`}
                            >
                              {isActive ? (
                                <>
                                  <CheckCircle className="w-3 h-3 mr-1" />
                                  Active
                                </>
                              ) : isExpired ? (
                                <>
                                  <Clock className="w-3 h-3 mr-1" />
                                  Expired
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3 h-3 mr-1" />
                                  Inactive
                                </>
                              )}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-600 font-nunito mb-3">
                            {announcement.content}
                          </p>
                          <div className="flex items-center gap-3 text-xs text-gray-500 font-nunito">
                            <span>By {announcement.admin?.username || 'Admin'}</span>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3" />
                              {new Date(announcement.created_at).toLocaleDateString()}
                            </span>
                            {announcement.expires_at && (
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                Expires {new Date(announcement.expires_at).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            size="sm"
                            onClick={() => handleToggleOpen(announcement)}
                            disabled={isToggling}
                            className={`h-9 w-9 p-0 border-[#6CAC73]/20 ${
                              announcement.is_active
                                ? 'bg-white/80 hover:bg-orange-50 text-orange-600'
                                : 'bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]'
                            }`}
                            title={announcement.is_active ? 'Deactivate' : 'Activate'}
                          >
                            {announcement.is_active ? (
                              <EyeOff className="w-4 h-4" />
                            ) : (
                              <Eye className="w-4 h-4" />
                            )}
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleEditOpen(announcement)}
                            disabled={isUpdating}
                            className="h-9 w-9 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDeleteOpen(announcement)}
                            disabled={isDeleting}
                            className="h-9 w-9 p-0 border-rose-200 bg-white/80 hover:bg-rose-50 text-rose-600"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Synced Pagination */}
            {meta && meta.lastPage > 1 && (
              <div className="flex items-center justify-between mt-6 pt-4 border-t border-[#6CAC73]/20">
                <p className="text-sm text-gray-600 font-nunito">
                  Showing {((meta.page - 1) * meta.limit) + 1} to {Math.min(meta.page * meta.limit, meta.total)} of {meta.total}
                </p>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    onClick={prevPage}
                    disabled={!meta.hasPrevPage}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </Button>
                  <span className="text-sm text-[#2B4A2F] font-poppins min-w-[100px] text-center flex items-center">
                    Page {meta.page} of {meta.lastPage}
                  </span>
                  <Button
                    size="sm"
                    onClick={nextPage}
                    disabled={!meta.hasNextPage}
                    className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            )}
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
              <div className="space-y-4 py-4">
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                <div className="space-y-2">
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
                      <CheckCircle className="w-4 h-4 mr-2" />
                      {editDialogOpen ? 'Update Announcement' : 'Create Announcement'}
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
              <AlertDialogTitle className="text-rose-600 font-poppins">
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
                className="bg-gradient-to-br from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 text-white border-0"
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
                selectedAnnouncement?.is_active ? 'text-orange-600' : 'text-[#6CAC73]'
              }`}>
                {selectedAnnouncement?.is_active ? (
                  <>
                    <EyeOff className="w-5 h-5 inline mr-2" />
                    Deactivate Announcement?
                  </>
                ) : (
                  <>
                    <Eye className="w-5 h-5 inline mr-2" />
                    Activate Announcement?
                  </>
                )}
              </AlertDialogTitle>
              <AlertDialogDescription className="font-nunito">
                {selectedAnnouncement?.is_active
                  ? 'This will hide the announcement from all users.'
                  : 'This will make the announcement visible to all users.'}
              </AlertDialogDescription>
            </AlertDialogHeader>
            
            {selectedAnnouncement && (
              <Alert className="bg-gradient-to-br from-[#FFF9F0] to-white border-[#6CAC73]/20">
                <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
                <AlertDescription className="font-nunito">
                  <p className="font-medium mb-2 text-[#2B4A2F]">
                    {selectedAnnouncement.is_active ? 'Deactivating:' : 'Activating:'}
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
                    : 'bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90'
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
                    Deactivate
                  </>
                ) : (
                  <>
                    <Eye className="w-4 h-4 mr-2" />
                    Activate
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