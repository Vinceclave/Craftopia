// apps/web/src/pages/admin/Announcements.tsx
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
} from 'lucide-react';
import { useAnnouncements } from '@/hooks/useAnnouncements';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
    isCreating,
    isUpdating,
    isDeleting,
    isToggling,
  } = useAnnouncements();

  console.log(announcements)

  const { isConnected } = useWebSocket();

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
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

  const handleDelete = async (announcementId: number) => {
    if (!window.confirm('Are you sure you want to delete this announcement?')) return;

    try {
      await deleteAnnouncement(announcementId);
    } catch (err: any) {
      alert('Error: ' + (err?.message || 'Failed to delete announcement'));
    }
  };

  const handleToggleStatus = async (announcementId: number) => {
    try {
      await toggleStatus(announcementId);
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
          <Alert className="border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm">
            <AlertCircle className="h-4 w-4 text-[#6CAC73]" />
            <AlertDescription className="flex items-center justify-between gap-4">
              <span className="text-[#2B4A2F] font-nunito">
                Error loading announcements: {(error as Error).message}
              </span>
              <Button
                size="sm"
                onClick={() => refetch()}
                className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Retry
              </Button>
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
              <div className="w-8 h-8 bg-gradient-to-br from-[#6CAC73] to-[#2B4A2F] rounded-xl flex items-center justify-center shadow-lg">
                <Megaphone className="w-5 h-5 text-white" />
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
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1 font-nunito">Total Announcements</p>
                <p className="text-3xl font-bold text-[#2B4A2F] font-poppins">{announcements.length}</p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600 mb-1 font-nunito">Active</p>
                <p className="text-3xl font-bold text-[#6CAC73] font-poppins">
                  {announcements.filter((a) => a.is_active).length}
                </p>
              </div>
            </CardContent>
          </Card>
          <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
            <CardContent className="pt-6">
              <div className="text-center">
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
                {activeAnnouncements.map((announcement) => (
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
            <CardTitle className="text-[#2B4A2F] font-poppins">Filters</CardTitle>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        {/* Announcements List Card */}
        <Card className="border border-[#6CAC73]/20 bg-white/80 backdrop-blur-sm shadow-lg">
          <CardHeader>
            <CardTitle className="text-[#2B4A2F] font-poppins">
              All Announcements ({announcements.length})
            </CardTitle>
            <CardDescription className="font-nunito">
              Manage all platform announcements
            </CardDescription>
          </CardHeader>
          <CardContent>
            {announcements.length === 0 ? (
              <div className="text-center py-12">
                <Megaphone className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500 font-poppins">No announcements found</p>
                <p className="text-sm text-gray-400 mt-2 font-nunito">
                  Create your first announcement to get started
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {announcements.map((announcement) => {
                  const isExpired = announcement.expires_at && new Date(announcement.expires_at) < new Date();
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
                            onClick={() => handleToggleStatus(announcement.announcement_id)}
                            disabled={isToggling || isExpired}
                            className={`h-8 w-8 p-0 border-[#6CAC73]/20 ${
                              announcement.is_active
                                ? 'bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]'
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
                            className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-blue-50 text-blue-600"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleDelete(announcement.announcement_id)}
                            disabled={isDeleting}
                            className="h-8 w-8 p-0 border-[#6CAC73]/20 bg-white/80 hover:bg-rose-50 text-rose-600"
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
          </CardContent>
        </Card>

        {/* Create Dialog */}
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">
                Create Announcement
              </DialogTitle>
              <DialogDescription className="font-nunito">
                Create a new announcement for all platform users
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleCreate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="title" className="text-[#2B4A2F] font-poppins">
                    Title
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
                    Content
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
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setCreateDialogOpen(false)}
                  disabled={isCreating}
                  className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isCreating}
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating...
                    </>
                  ) : (
                    'Create Announcement'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>

        {/* Edit Dialog */}
        <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
          <DialogContent className="border-[#6CAC73]/20 bg-white/90 backdrop-blur-sm max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-[#2B4A2F] font-poppins">
                Edit Announcement
              </DialogTitle>
              <DialogDescription className="font-nunito">
                Update the announcement details
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleUpdate}>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title" className="text-[#2B4A2F] font-poppins">
                    Title
                  </Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    placeholder="Important Update"
                    required
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-content" className="text-[#2B4A2F] font-poppins">
                    Content
                  </Label>
                  <Textarea
                    id="edit-content"
                    value={formData.content}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    placeholder="Announcement details..."
                    rows={4}
                    required
                    className="border-[#6CAC73]/20 focus:border-[#6CAC73] focus:ring-[#6CAC73]/10"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-expires_at" className="text-[#2B4A2F] font-poppins">
                    Expiration Date (Optional)
                  </Label>
                  <Input
                    id="edit-expires_at"
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
              <DialogFooter>
                <Button
                  type="button"
                  onClick={() => setEditDialogOpen(false)}
                  disabled={isUpdating}
                  className="border-[#6CAC73]/20 bg-white/80 hover:bg-[#6CAC73]/10 text-[#2B4A2F]"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={isUpdating}
                  className="bg-gradient-to-br from-[#2B4A2F] to-[#6CAC73] hover:from-[#2B4A2F]/90 hover:to-[#6CAC73]/90 text-white border-0"
                >
                  {isUpdating ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    'Update Announcement'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}