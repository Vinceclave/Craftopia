// apps/web/src/pages/admin/Announcements.tsx - ADMIN-FRIENDLY UI
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
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
  TrendingUp,
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useWebSocket } from '@/hooks/useWebSocket';
import { useToast } from '@/hooks/useToast';
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
  const { success, error: showError } = useToast();

  const [activeTab, setActiveTab] = useState<string>('active');
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

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createAnnouncement({
        title: formData.title,
        content: formData.content,
        expires_at: formData.expires_at ? new Date(formData.expires_at) : undefined,
      });
      success('Announcement created and published!');
      setCreateDialogOpen(false);
      setFormData({ title: '', content: '', expires_at: '' });
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
      setEditDialogOpen(false);
      setSelectedAnnouncement(null);
      setFormData({ title: '', content: '', expires_at: '' });
    } catch (err: any) {
      showError(err?.message || 'Failed to update announcement');
    }
  };

  const handleConfirmDelete = async () => {
    if (!selectedAnnouncement) return;

    try {
      await deleteAnnouncement(selectedAnnouncement.announcement_id);
      success('Announcement deleted successfully!');
      setDeleteDialogOpen(false);
      setSelectedAnnouncement(null);
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
      setToggleDialogOpen(false);
      setSelectedAnnouncement(null);
    } catch (err: any) {
      showError(err?.message || 'Failed to toggle status');
    }
  };

  // Filter announcements based on active tab
  const filteredAnnouncements = announcements.filter((a: Announcement) => {
    const isExpired = !!(a.expires_at && new Date(a.expires_at) < new Date());
    
    if (activeTab === 'active') {
      return a.is_active && !isExpired;
    } else if (activeTab === 'scheduled') {
      return a.is_active && a.expires_at && new Date(a.expires_at) > new Date();
    } else if (activeTab === 'expired') {
      return isExpired;
    } else if (activeTab === 'draft') {
      return !a.is_active;
    }
    return true;
  });

  const stats = {
    active: announcements.filter((a: Announcement) => 
      a.is_active && !(a.expires_at && new Date(a.expires_at) < new Date())
    ).length,
    draft: announcements.filter((a: Announcement) => !a.is_active).length,
    expired: announcements.filter((a: Announcement) => 
      a.expires_at && new Date(a.expires_at) < new Date()
    ).length,
    total: meta?.total || 0,
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
      <div className="min-h-screen bg-gradient-to-br from-[#FFF9F0] to-white p-6">
        <div className="max-w-7xl mx-auto">
          <Alert className="border-rose-200 bg-rose-50/80 backdrop-blur-sm">
            <AlertCircle className="h-5 w-5 text-rose-600" />
            <AlertDescription>
              <p className="font-semibold text-rose-900 font-poppins mb-1">Error loading announcements</p>
              <p className="text-rose-700 text-sm font-nunito">{(error as Error).message}</p>
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
                  Announcements
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
            <Button
              size="sm"
              onClick={handleOpenCreate}
              className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0 shadow-lg"
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Announcement
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Active Now</p>
                  <p className="text-3xl font-bold text-[#6CAC73] font-poppins">{stats.active}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#6CAC73]/20 to-[#2B4A2F]/10 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-[#6CAC73]" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Drafts</p>
                  <p className="text-3xl font-bold text-blue-600 font-poppins">{stats.draft}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-blue-500/20 to-blue-600/10 rounded-xl flex items-center justify-center">
                  <Edit2 className="w-6 h-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Expired</p>
                  <p className="text-3xl font-bold text-gray-600 font-poppins">{stats.expired}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-gray-500/20 to-gray-600/10 rounded-xl flex items-center justify-center">
                  <Archive className="w-6 h-6 text-gray-600" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-shadow">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600 mb-1 font-nunito">Total</p>
                  <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{stats.total}</p>
                </div>
                <div className="w-12 h-12 bg-gradient-to-br from-[#FFF9F0] to-white rounded-xl flex items-center justify-center border border-[#6CAC73]/10">
                  <TrendingUp className="w-6 h-6 text-[#2B4A2F]" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Active Announcements Preview */}
        {activeAnnouncements.length > 0 && (
          <Card className="mb-6 border border-blue-200/60 bg-gradient-to-br from-blue-50/80 to-white/80 backdrop-blur-sm shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-[#2B4A2F] font-poppins flex items-center gap-2">
                    <Bell className="w-5 h-5 text-blue-600 animate-pulse" />
                    Live Announcements
                  </CardTitle>
                  <CardDescription className="font-nunito">
                    Currently visible to all users
                  </CardDescription>
                </div>
                <Badge className="bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700 border-0 font-poppins">
                  <Send className="w-3 h-3 mr-1" />
                  {activeAnnouncements.length} Active
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {activeAnnouncements.slice(0, 3).map((announcement: Announcement) => (
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
              </div>
            </CardContent>
          </Card>
        )}

        {/* Tabs & List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <div className="flex items-center justify-between mb-4">
            <TabsList className="bg-white/80 border border-[#6CAC73]/20">
              <TabsTrigger 
                value="active" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-[#2B4A2F] data-[state=active]:to-[#6CAC73] data-[state=active]:text-white font-poppins"
              >
                <CheckCircle className="w-4 h-4 mr-2" />
                Active ({stats.active})
              </TabsTrigger>
              <TabsTrigger 
                value="draft" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-blue-500 data-[state=active]:to-blue-600 data-[state=active]:text-white font-poppins"
              >
                <Edit2 className="w-4 h-4 mr-2" />
                Drafts ({stats.draft})
              </TabsTrigger>
              <TabsTrigger 
                value="expired" 
                className="data-[state=active]:bg-gradient-to-br data-[state=active]:from-gray-500 data-[state=active]:to-gray-600 data-[state=active]:text-white font-poppins"
              >
                <Archive className="w-4 h-4 mr-2" />
                Expired ({stats.expired})
              </TabsTrigger>
            </TabsList>

            <Select
              value={String(params.limit)}
              onValueChange={(value) => setLimit(Number(value))}
            >
              <SelectTrigger className="w-32 border-[#6CAC73]/20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 per page</SelectItem>
                <SelectItem value="10">10 per page</SelectItem>
                <SelectItem value="20">20 per page</SelectItem>
                <SelectItem value="50">50 per page</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <TabsContent value={activeTab}>
            <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
              <CardContent className="p-6">
                {filteredAnnouncements.length === 0 ? (
                  <div className="text-center py-12">
                    <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 font-poppins">No {activeTab} announcements</p>
                    <p className="text-sm text-gray-400 mt-2 font-nunito">
                      {activeTab === 'active' && 'Create your first announcement to get started'}
                      {activeTab === 'draft' && 'All announcements are published'}
                      {activeTab === 'expired' && 'No expired announcements yet'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredAnnouncements.map((announcement: Announcement) => {
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
                                      : 'bg-gradient-to-r from-blue-500/20 to-blue-600/20 text-blue-700'
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
                                      <Edit2 className="w-3 h-3 mr-1" />
                                      Draft
                                    </>
                                  )}
                                </Badge>
                              </div>
                              <p className="text-sm text-gray-600 font-nunito mb-3">
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
                                  <span className="flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {isExpired ? 'Expired' : 'Expires'} {new Date(announcement.expires_at).toLocaleDateString()}
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={() => handleOpenToggle(announcement)}
                                disabled={isToggling}
                                className={`h-9 px-3 border-[#6CAC73]/20 ${
                                  announcement.is_active
                                    ? 'bg-white/80 hover:bg-orange-50 text-orange-600'
                                    : 'bg-white/80 hover:bg-[#6CAC73]/10 text-[#6CAC73]'
                                }`}
                                title={announcement.is_active ? 'Unpublish' : 'Publish'}
                              >
                                {announcement.is_active ? (
                                  <>
                                    <EyeOff className="w-4 h-4 mr-1" />
                                    Unpublish
                                  </>
                                ) : (
                                  <>
                                    <Send className="w-4 h-4 mr-1" />
                                    Publish
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenEdit(announcement)}
                                disabled={isUpdating}
                                className="h-9 w-9 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
                                title="Edit"
                              >
                                <Edit2 className="w-4 h-4" />
                              </Button>
                              <Button
                                size="sm"
                                onClick={() => handleOpenDelete(announcement)}
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

                {/* Pagination */}
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
          </TabsContent>
        </Tabs>

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